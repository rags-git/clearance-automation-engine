from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict
from backend.app.models.models import (
    RoleEnum,
    ClearanceStatusEnum,
    ApprovalStatusEnum,
    GrievanceStatusEnum,
    GrievancePriorityEnum
)


# Auth & User Schemas
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: RoleEnum = RoleEnum.STUDENT
    roll_number: Optional[str] = None
    department_id: Optional[int] = None


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    role: RoleEnum
    roll_number: Optional[str] = None
    department_id: Optional[int] = None
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Department Schemas
class DepartmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    clearance_gate: int
    description: Optional[str] = None
    staff_head_name: Optional[str] = None


# Approval Schemas
class ApprovalDecisionRequest(BaseModel):
    decision: ApprovalStatusEnum  # APPROVED or REJECTED
    remarks: Optional[str] = "Cleared with no pending dues."
    due_amount: Optional[float] = 0.0


class DepartmentApprovalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: int
    department_id: int
    department_name: str
    department_code: str
    clearance_gate: int
    status: ApprovalStatusEnum
    staff_name: Optional[str] = None
    approved_at: Optional[datetime] = None
    remarks: Optional[str] = None
    due_amount: float
    digital_signature: Optional[str] = None


# Clearance Request Schemas
class ClearanceRequestCreate(BaseModel):
    academic_year: str = "2025-2026"
    semester: str = "Semester 8"
    reason: str = "Graduation Clearance & Degree Award"


class ClearanceRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    student_name: str
    student_roll_no: Optional[str] = None
    student_email: str
    academic_year: str
    semester: str
    reason: str
    overall_status: ClearanceStatusEnum
    certificate_id: Optional[str] = None
    certificate_hash: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    approvals: List[DepartmentApprovalResponse] = []


# Grievance Schemas
class GrievanceCreate(BaseModel):
    clearance_request_id: Optional[int] = None
    department_id: int
    subject: str
    description: str
    priority: GrievancePriorityEnum = GrievancePriorityEnum.MEDIUM


class GrievanceResolveRequest(BaseModel):
    staff_response: str
    status: GrievanceStatusEnum = GrievanceStatusEnum.RESOLVED


class GrievanceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    student_id: int
    student_name: str
    clearance_request_id: Optional[int] = None
    department_id: int
    department_name: str
    department_code: str
    subject: str
    description: str
    priority: GrievancePriorityEnum
    status: GrievanceStatusEnum
    sla_hours: int
    sla_deadline: datetime
    is_escalated: bool
    staff_response: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None


# Audit Log Schemas
class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    actor_id: Optional[int] = None
    actor_name: str
    actor_role: str
    action: str
    target_type: str
    target_id: Optional[int] = None
    details: Optional[str] = None
    timestamp: datetime


# Analytics Schemas
class DepartmentMetric(BaseModel):
    department_code: str
    department_name: str
    total_reviewed: int
    approved_count: int
    rejected_count: int
    pending_count: int
    average_resolution_hours: float


class AdminAnalyticsResponse(BaseModel):
    total_students: int
    total_requests: int
    pending_requests: int
    in_progress_requests: int
    approved_requests: int
    rejected_requests: int
    total_grievances: int
    escalated_grievances: int
    department_metrics: List[DepartmentMetric]
