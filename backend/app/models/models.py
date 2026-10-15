import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base


class RoleEnum(str, enum.Enum):
    STUDENT = "STUDENT"
    STAFF = "STAFF"
    ADMIN = "ADMIN"


class ClearanceStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class ApprovalStatusEnum(str, enum.Enum):
    WAITING_PREREQUISITE = "WAITING_PREREQUISITE"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class GrievanceStatusEnum(str, enum.Enum):
    OPEN = "OPEN"
    IN_REVIEW = "IN_REVIEW"
    RESOLVED = "RESOLVED"
    ESCALATED = "ESCALATED"


class GrievancePriorityEnum(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)  # LIBRARY, HOSTEL, SPORTS, LABS, ACCOUNTS
    clearance_gate = Column(Integer, nullable=False, default=1)  # 1: Parallel Gate, 2: Sequential Lab, 3: Final Accounts
    description = Column(String(255), nullable=True)
    staff_head_name = Column(String(100), nullable=True)

    # Relationships
    staff_members = relationship("User", back_populates="department")
    approvals = relationship("DepartmentApproval", back_populates="department")
    grievances = relationship("Grievance", back_populates="department")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(120), unique=True, index=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.STUDENT)
    roll_number = Column(String(50), unique=True, nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    department = relationship("Department", back_populates="staff_members")
    clearance_requests = relationship("ClearanceRequest", back_populates="student")
    approvals_signed = relationship("DepartmentApproval", back_populates="staff")
    grievances_filed = relationship("Grievance", back_populates="student")


class ClearanceRequest(Base):
    __tablename__ = "clearance_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    academic_year = Column(String(20), nullable=False)
    semester = Column(String(20), nullable=False)
    reason = Column(String(100), nullable=False, default="Graduation Clearance")
    overall_status = Column(Enum(ClearanceStatusEnum), nullable=False, default=ClearanceStatusEnum.PENDING)
    certificate_id = Column(String(64), unique=True, nullable=True, index=True)
    certificate_hash = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    student = relationship("User", back_populates="clearance_requests")
    approvals = relationship("DepartmentApproval", back_populates="clearance_request", cascade="all, delete-orphan")
    grievances = relationship("Grievance", back_populates="clearance_request")


class DepartmentApproval(Base):
    __tablename__ = "department_approvals"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("clearance_requests.id"), nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    status = Column(Enum(ApprovalStatusEnum), nullable=False, default=ApprovalStatusEnum.PENDING)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    remarks = Column(Text, nullable=True)
    due_amount = Column(Float, default=0.0)
    digital_signature = Column(String(255), nullable=True)

    # Relationships
    clearance_request = relationship("ClearanceRequest", back_populates="approvals")
    department = relationship("Department", back_populates="approvals")
    staff = relationship("User", back_populates="approvals_signed")


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    clearance_request_id = Column(Integer, ForeignKey("clearance_requests.id"), nullable=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=False, index=True)
    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Enum(GrievancePriorityEnum), nullable=False, default=GrievancePriorityEnum.MEDIUM)
    status = Column(Enum(GrievanceStatusEnum), nullable=False, default=GrievanceStatusEnum.OPEN)
    sla_hours = Column(Integer, default=24)  # 24 hours SLA window
    sla_deadline = Column(DateTime, nullable=False)
    is_escalated = Column(Boolean, default=False)
    staff_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    student = relationship("User", back_populates="grievances_filed")
    clearance_request = relationship("ClearanceRequest", back_populates="grievances")
    department = relationship("Department", back_populates="grievances")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_name = Column(String(120), nullable=False)
    actor_role = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)  # APPROVE, REJECT, ESCALATE, INITIATE_CLEARANCE, CERTIFICATE_GENERATED
    target_type = Column(String(50), nullable=False)  # CLEARANCE, GRIEVANCE, DEPARTMENT
    target_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
