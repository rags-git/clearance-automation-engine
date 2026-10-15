from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.models import (
    ClearanceRequest,
    DepartmentApproval,
    Department,
    User,
    RoleEnum,
    ClearanceStatusEnum,
    ApprovalStatusEnum,
    AuditLog
)
from backend.app.patterns.chain_of_responsibility import ClearanceChainBuilder


class ClearanceService:

    @staticmethod
    def create_request(student: User, academic_year: str, semester: str, reason: str, db: Session) -> ClearanceRequest:
        # Check if student already has an active clearance request
        existing = db.query(ClearanceRequest).filter(
            ClearanceRequest.student_id == student.id,
            ClearanceRequest.overall_status.in_([ClearanceStatusEnum.PENDING, ClearanceStatusEnum.IN_PROGRESS])
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active clearance request in progress."
            )

        new_request = ClearanceRequest(
            student_id=student.id,
            academic_year=academic_year,
            semester=semester,
            reason=reason,
            overall_status=ClearanceStatusEnum.IN_PROGRESS
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)

        # Initialize department approvals according to gate design
        departments = db.query(Department).all()
        for dept in departments:
            # Gate 1 departments start as PENDING (can proceed in parallel)
            # Gate 2 & 3 start as WAITING_PREREQUISITE
            initial_status = ApprovalStatusEnum.PENDING if dept.clearance_gate == 1 else ApprovalStatusEnum.WAITING_PREREQUISITE
            approval = DepartmentApproval(
                request_id=new_request.id,
                department_id=dept.id,
                status=initial_status,
                due_amount=0.0
            )
            db.add(approval)

        audit = AuditLog(
            actor_id=student.id,
            actor_name=student.full_name,
            actor_role=RoleEnum.STUDENT.value,
            action="INITIATE_CLEARANCE",
            target_type="CLEARANCE",
            target_id=new_request.id,
            details=f"Initiated clearance for {academic_year} {semester} ({reason})"
        )
        db.add(audit)
        db.commit()
        db.refresh(new_request)
        return new_request

    @staticmethod
    def process_department_decision(
        request_id: int,
        dept_code: str,
        staff_user: User,
        decision: ApprovalStatusEnum,
        remarks: str,
        due_amount: float,
        db: Session
    ) -> DepartmentApproval:
        request = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
        if not request:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clearance request not found.")

        # If staff is not ADMIN, enforce they can only approve their own department
        if staff_user.role != RoleEnum.ADMIN:
            if not staff_user.department or staff_user.department.code != dept_code:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Staff user is not authorized to sign off for department '{dept_code}'."
                )

        success, msg, approval = ClearanceChainBuilder.process_request(
            request=request,
            department_code=dept_code,
            staff_user=staff_user,
            decision=decision,
            remarks=remarks,
            due_amount=due_amount,
            db=db
        )

        if not success:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

        return approval
