from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from backend.app.models.models import (
    Grievance,
    Department,
    User,
    RoleEnum,
    GrievanceStatusEnum,
    GrievancePriorityEnum,
    AuditLog
)

SLA_HOURS_MAP = {
    GrievancePriorityEnum.CRITICAL: 4,
    GrievancePriorityEnum.HIGH: 12,
    GrievancePriorityEnum.MEDIUM: 24,
    GrievancePriorityEnum.LOW: 48
}


class GrievanceService:

    @staticmethod
    def file_grievance(
        student: User,
        department_id: int,
        subject: str,
        description: str,
        priority: GrievancePriorityEnum,
        clearance_request_id: Optional[int],
        db: Session
    ) -> Grievance:
        dept = db.query(Department).filter(Department.id == department_id).first()
        if not dept:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target department not found.")

        sla_hours = SLA_HOURS_MAP.get(priority, 24)
        sla_deadline = datetime.now(timezone.utc) + timedelta(hours=sla_hours)

        grievance = Grievance(
            student_id=student.id,
            clearance_request_id=clearance_request_id,
            department_id=department_id,
            subject=subject,
            description=description,
            priority=priority,
            status=GrievanceStatusEnum.OPEN,
            sla_hours=sla_hours,
            sla_deadline=sla_deadline,
            is_escalated=False
        )
        db.add(grievance)

        audit = AuditLog(
            actor_id=student.id,
            actor_name=student.full_name,
            actor_role=RoleEnum.STUDENT.value,
            action="FILE_GRIEVANCE",
            target_type="GRIEVANCE",
            details=f"Filed {priority.value} priority grievance to {dept.name}: '{subject}'. SLA: {sla_hours}h"
        )
        db.add(audit)
        db.commit()
        db.refresh(grievance)
        return grievance

    @staticmethod
    def check_and_escalate_sla(db: Session) -> int:
        """
        Background/On-demand SLA check. Escalate tickets whose SLA has lapsed.
        Returns the number of escalated tickets.
        """
        now = datetime.now(timezone.utc)
        open_grievances = db.query(Grievance).filter(
            Grievance.status.in_([GrievanceStatusEnum.OPEN, GrievanceStatusEnum.IN_REVIEW]),
            Grievance.is_escalated == False,  # noqa: E712
            Grievance.sla_deadline < now
        ).all()

        escalated_count = 0
        for g in open_grievances:
            g.is_escalated = True
            g.status = GrievanceStatusEnum.ESCALATED
            escalated_count += 1

            audit = AuditLog(
                actor_id=None,
                actor_name="SLA_ENGINE",
                actor_role="SYSTEM",
                action="SLA_BREACH_ESCALATED",
                target_type="GRIEVANCE",
                target_id=g.id,
                details=f"Grievance #{g.id} breached SLA deadline ({g.sla_deadline.isoformat()}). Auto-escalated to Dean/Admin."
            )
            db.add(audit)

        if escalated_count > 0:
            db.commit()

        return escalated_count

    @staticmethod
    def resolve_grievance(
        grievance_id: int,
        staff_user: User,
        staff_response: str,
        new_status: GrievanceStatusEnum,
        db: Session
    ) -> Grievance:
        grievance = db.query(Grievance).filter(Grievance.id == grievance_id).first()
        if not grievance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grievance not found.")

        # Ensure staff belongs to the department or is Admin
        if staff_user.role != RoleEnum.ADMIN:
            if staff_user.department_id != grievance.department_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You are not authorized to respond to this department's grievance."
                )

        grievance.staff_response = staff_response
        grievance.status = new_status
        if new_status == GrievanceStatusEnum.RESOLVED:
            grievance.resolved_at = datetime.now(timezone.utc)

        audit = AuditLog(
            actor_id=staff_user.id,
            actor_name=staff_user.full_name,
            actor_role=staff_user.role.value,
            action="RESOLVE_GRIEVANCE",
            target_type="GRIEVANCE",
            target_id=grievance.id,
            details=f"Updated status to {new_status.value}. Response: {staff_response[:80]}..."
        )
        db.add(audit)
        db.commit()
        db.refresh(grievance)
        return grievance
