from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.models import (
    ClearanceRequest,
    DepartmentApproval,
    Department,
    User,
    RoleEnum
)
from backend.app.schemas.schemas import (
    ClearanceRequestCreate,
    ClearanceRequestResponse,
    DepartmentApprovalResponse,
    ApprovalDecisionRequest,
    DepartmentResponse
)
from backend.app.routers.auth import get_current_user
from backend.app.services.clearance_service import ClearanceService

router = APIRouter(prefix="/clearance", tags=["Clearance Engine"])


def enrich_clearance_response(req: ClearanceRequest) -> ClearanceRequestResponse:
    appr_list = []
    for a in req.approvals:
        appr_list.append(DepartmentApprovalResponse(
            id=a.id,
            request_id=a.request_id,
            department_id=a.department_id,
            department_name=a.department.name,
            department_code=a.department.code,
            clearance_gate=a.department.clearance_gate,
            status=a.status,
            staff_name=a.staff.full_name if a.staff else None,
            approved_at=a.approved_at,
            remarks=a.remarks,
            due_amount=a.due_amount,
            digital_signature=a.digital_signature
        ))

    # sort by clearance_gate
    appr_list.sort(key=lambda x: (x.clearance_gate, x.department_name))

    return ClearanceRequestResponse(
        id=req.id,
        student_id=req.student_id,
        student_name=req.student.full_name,
        student_roll_no=req.student.roll_number,
        student_email=req.student.email,
        academic_year=req.academic_year,
        semester=req.semester,
        reason=req.reason,
        overall_status=req.overall_status,
        certificate_id=req.certificate_id,
        certificate_hash=req.certificate_hash,
        created_at=req.created_at,
        updated_at=req.updated_at,
        approvals=appr_list
    )


@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    return db.query(Department).order_by(Department.clearance_gate).all()


@router.post("/apply", response_model=ClearanceRequestResponse)
def apply_clearance(
    data: ClearanceRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != RoleEnum.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can apply for clearance."
        )

    req = ClearanceService.create_request(
        student=current_user,
        academic_year=data.academic_year,
        semester=data.semester,
        reason=data.reason,
        db=db
    )
    return enrich_clearance_response(req)


@router.get("/my-requests", response_model=List[ClearanceRequestResponse])
def get_my_clearance_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    requests = db.query(ClearanceRequest).filter(
        ClearanceRequest.student_id == current_user.id
    ).order_by(ClearanceRequest.created_at.desc()).all()

    return [enrich_clearance_response(r) for r in requests]


@router.get("/{request_id}", response_model=ClearanceRequestResponse)
def get_clearance_detail(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clearance request not found")

    # If student, verify it is their own
    if current_user.role == RoleEnum.STUDENT and req.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return enrich_clearance_response(req)


@router.get("/staff/queue", response_model=List[DepartmentApprovalResponse])
def get_staff_approval_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the pending clearance approvals for staff's department or all if Admin."""
    query = db.query(DepartmentApproval).join(ClearanceRequest)

    if current_user.role == RoleEnum.STAFF:
        if not current_user.department_id:
            return []
        query = query.filter(DepartmentApproval.department_id == current_user.department_id)

    approvals = query.order_by(DepartmentApproval.id.desc()).all()

    results = []
    for a in approvals:
        results.append(DepartmentApprovalResponse(
            id=a.id,
            request_id=a.request_id,
            department_id=a.department_id,
            department_name=a.department.name,
            department_code=a.department.code,
            clearance_gate=a.department.clearance_gate,
            status=a.status,
            staff_name=a.staff.full_name if a.staff else None,
            approved_at=a.approved_at,
            remarks=a.remarks,
            due_amount=a.due_amount,
            digital_signature=a.digital_signature
        ))
    return results


@router.post("/staff/decision/{approval_id}", response_model=DepartmentApprovalResponse)
def make_department_decision(
    approval_id: int,
    body: ApprovalDecisionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [RoleEnum.STAFF, RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff or administrators can make clearance decisions."
        )

    approval = db.query(DepartmentApproval).filter(DepartmentApproval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Approval record not found")

    dept_code = approval.department.code
    updated_approval = ClearanceService.process_department_decision(
        request_id=approval.request_id,
        dept_code=dept_code,
        staff_user=current_user,
        decision=body.decision,
        remarks=body.remarks or "Processed by department official",
        due_amount=body.due_amount or 0.0,
        db=db
    )

    return DepartmentApprovalResponse(
        id=updated_approval.id,
        request_id=updated_approval.request_id,
        department_id=updated_approval.department_id,
        department_name=updated_approval.department.name,
        department_code=updated_approval.department.code,
        clearance_gate=updated_approval.department.clearance_gate,
        status=updated_approval.status,
        staff_name=updated_approval.staff.full_name if updated_approval.staff else None,
        approved_at=updated_approval.approved_at,
        remarks=updated_approval.remarks,
        due_amount=updated_approval.due_amount,
        digital_signature=updated_approval.digital_signature
    )
