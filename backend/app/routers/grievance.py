from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.models import (
    Grievance,
    User,
    RoleEnum
)
from backend.app.schemas.schemas import (
    GrievanceCreate,
    GrievanceResolveRequest,
    GrievanceResponse
)
from backend.app.routers.auth import get_current_user
from backend.app.services.grievance_service import GrievanceService

router = APIRouter(prefix="/grievance", tags=["Grievance & SLA Engine"])


def map_grievance_response(g: Grievance) -> GrievanceResponse:
    return GrievanceResponse(
        id=g.id,
        student_id=g.student_id,
        student_name=g.student.full_name,
        clearance_request_id=g.clearance_request_id,
        department_id=g.department_id,
        department_name=g.department.name,
        department_code=g.department.code,
        subject=g.subject,
        description=g.description,
        priority=g.priority,
        status=g.status,
        sla_hours=g.sla_hours,
        sla_deadline=g.sla_deadline,
        is_escalated=g.is_escalated,
        staff_response=g.staff_response,
        created_at=g.created_at,
        resolved_at=g.resolved_at
    )


@router.post("", response_model=GrievanceResponse)
def file_grievance(
    data: GrievanceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != RoleEnum.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can file grievances."
        )

    g = GrievanceService.file_grievance(
        student=current_user,
        department_id=data.department_id,
        subject=data.subject,
        description=data.description,
        priority=data.priority,
        clearance_request_id=data.clearance_request_id,
        db=db
    )
    return map_grievance_response(g)


@router.get("/my-grievances", response_model=List[GrievanceResponse])
def get_my_grievances(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Run SLA escalation check first so up-to-date
    GrievanceService.check_and_escalate_sla(db)

    grievances = db.query(Grievance).filter(
        Grievance.student_id == current_user.id
    ).order_by(Grievance.created_at.desc()).all()

    return [map_grievance_response(g) for g in grievances]


@router.get("/queue", response_model=List[GrievanceResponse])
def get_grievance_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Run SLA escalation check first
    GrievanceService.check_and_escalate_sla(db)

    query = db.query(Grievance)
    if current_user.role == RoleEnum.STAFF:
        if not current_user.department_id:
            return []
        query = query.filter(Grievance.department_id == current_user.department_id)

    grievances = query.order_by(Grievance.is_escalated.desc(), Grievance.sla_deadline.asc()).all()
    return [map_grievance_response(g) for g in grievances]


@router.post("/{grievance_id}/resolve", response_model=GrievanceResponse)
def resolve_grievance(
    grievance_id: int,
    body: GrievanceResolveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [RoleEnum.STAFF, RoleEnum.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only staff or administrators can resolve grievances."
        )

    updated = GrievanceService.resolve_grievance(
        grievance_id=grievance_id,
        staff_user=current_user,
        staff_response=body.staff_response,
        new_status=body.status,
        db=db
    )
    return map_grievance_response(updated)


@router.post("/trigger-sla-check")
def trigger_sla_check(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows admin/staff to trigger the SLA engine evaluation cycle."""
    escalated_count = GrievanceService.check_and_escalate_sla(db)
    return {"message": "SLA check completed", "escalated_tickets": escalated_count}
