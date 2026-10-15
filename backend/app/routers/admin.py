from typing import List
from datetime import timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.models import (
    ClearanceRequest,
    DepartmentApproval,
    Department,
    Grievance,
    User,
    RoleEnum,
    ClearanceStatusEnum,
    ApprovalStatusEnum,
    AuditLog
)
from backend.app.schemas.schemas import (
    AdminAnalyticsResponse,
    DepartmentMetric,
    AuditLogResponse,
    ClearanceRequestResponse
)
from backend.app.routers.auth import get_current_user
from backend.app.routers.clearance import enrich_clearance_response

router = APIRouter(prefix="/admin", tags=["Admin & Analytics"])


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_admin_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.STAFF]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    total_students = db.query(User).filter(User.role == RoleEnum.STUDENT).count()
    total_requests = db.query(ClearanceRequest).count()
    pending_requests = db.query(ClearanceRequest).filter(ClearanceRequest.overall_status == ClearanceStatusEnum.PENDING).count()
    in_prog_requests = db.query(ClearanceRequest).filter(ClearanceRequest.overall_status == ClearanceStatusEnum.IN_PROGRESS).count()
    approved_requests = db.query(ClearanceRequest).filter(ClearanceRequest.overall_status == ClearanceStatusEnum.APPROVED).count()
    rejected_requests = db.query(ClearanceRequest).filter(ClearanceRequest.overall_status == ClearanceStatusEnum.REJECTED).count()

    total_grievances = db.query(Grievance).count()
    escalated_grievances = db.query(Grievance).filter(Grievance.is_escalated == True).count()  # noqa: E712

    # Department Metrics
    departments = db.query(Department).all()
    dept_metrics: List[DepartmentMetric] = []

    for d in departments:
        approvals = db.query(DepartmentApproval).filter(DepartmentApproval.department_id == d.id).all()
        appr_count = sum(1 for a in approvals if a.status == ApprovalStatusEnum.APPROVED)
        rej_count = sum(1 for a in approvals if a.status == ApprovalStatusEnum.REJECTED)
        pend_count = sum(1 for a in approvals if a.status in [ApprovalStatusEnum.PENDING, ApprovalStatusEnum.WAITING_PREREQUISITE])
        total_rev = appr_count + rej_count

        # Compute average resolution time
        durations = []
        for a in approvals:
            if a.approved_at and a.clearance_request:
                diff = (a.approved_at.replace(tzinfo=timezone.utc) - a.clearance_request.created_at.replace(tzinfo=timezone.utc)).total_seconds() / 3600.0
                if diff >= 0:
                    durations.append(diff)

        avg_hours = round(sum(durations) / len(durations), 1) if durations else 0.0

        dept_metrics.append(DepartmentMetric(
            department_code=d.code,
            department_name=d.name,
            total_reviewed=total_rev,
            approved_count=appr_count,
            rejected_count=rej_count,
            pending_count=pend_count,
            average_resolution_hours=avg_hours
        ))

    return AdminAnalyticsResponse(
        total_students=total_students,
        total_requests=total_requests,
        pending_requests=pending_requests,
        in_progress_requests=in_prog_requests,
        approved_requests=approved_requests,
        rejected_requests=rejected_requests,
        total_grievances=total_grievances,
        escalated_grievances=escalated_grievances,
        department_metrics=dept_metrics
    )


@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs


@router.get("/all-requests", response_model=List[ClearanceRequestResponse])
def get_all_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [RoleEnum.ADMIN, RoleEnum.STAFF]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    requests = db.query(ClearanceRequest).order_by(ClearanceRequest.created_at.desc()).all()
    return [enrich_clearance_response(r) for r in requests]
