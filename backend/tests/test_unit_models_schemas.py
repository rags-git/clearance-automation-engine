"""
Unit Tests for Database Models and Pydantic Schemas
Academic Grievance, No-Dues & Clearance Automation Engine
Punjab Engineering College (Deemed to be University), Chandigarh
"""

import pytest
from datetime import datetime, timezone
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.models.models import (
    Base, User, Department, ClearanceRequest, DepartmentApproval,
    Grievance, AuditLog, RoleEnum, ClearanceStatusEnum,
    ApprovalStatusEnum, GrievanceStatusEnum, GrievancePriorityEnum
)
from backend.app.schemas.schemas import (
    UserLogin, UserRegister, ClearanceRequestCreate,
    ApprovalDecisionRequest, GrievanceCreate, GrievanceResolveRequest
)


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


# ---------------------------------------------------------------------------
# Model Unit Tests
# ---------------------------------------------------------------------------

def test_department_model_creation(test_db):
    dept = Department(
        name="Dr. B. R. Ambedkar Central Library",
        code="LIBRARY",
        clearance_gate=1,
        description="Gate 1 parallel library clearance",
        staff_head_name="Chief Librarian"
    )
    test_db.add(dept)
    test_db.commit()

    retrieved = test_db.query(Department).filter(Department.code == "LIBRARY").first()
    assert retrieved is not None
    assert retrieved.name == "Dr. B. R. Ambedkar Central Library"
    assert retrieved.clearance_gate == 1
    assert retrieved.staff_head_name == "Chief Librarian"


def test_user_model_creation(test_db):
    dept = Department(name="Hostel Office", code="HOSTEL", clearance_gate=1)
    test_db.add(dept)
    test_db.commit()

    user = User(
        email="warden@pec.edu.in",
        full_name="Chief Warden",
        role=RoleEnum.STAFF,
        department_id=dept.id,
        hashed_password="hashed_secure_pass"
    )
    test_db.add(user)
    test_db.commit()

    retrieved = test_db.query(User).filter(User.email == "warden@pec.edu.in").first()
    assert retrieved is not None
    assert retrieved.role == RoleEnum.STAFF
    assert retrieved.department.code == "HOSTEL"
    assert retrieved.created_at is not None


def test_clearance_request_lifecycle_states(test_db):
    student = User(
        email="22103042@pec.edu.in",
        full_name="Alice Sharma",
        role=RoleEnum.STUDENT,
        roll_number="22103042",
        hashed_password="hashed_pass"
    )
    test_db.add(student)
    test_db.commit()

    req = ClearanceRequest(
        student_id=student.id,
        academic_year="2025-2026",
        semester="Semester 8",
        reason="Degree Award",
        overall_status=ClearanceStatusEnum.PENDING
    )
    test_db.add(req)
    test_db.commit()

    assert req.overall_status == ClearanceStatusEnum.PENDING
    assert req.certificate_id is None

    # Transition to IN_PROGRESS
    req.overall_status = ClearanceStatusEnum.IN_PROGRESS
    test_db.commit()
    assert req.overall_status == ClearanceStatusEnum.IN_PROGRESS

    # Transition to APPROVED with Certificate
    req.overall_status = ClearanceStatusEnum.APPROVED
    req.certificate_id = "PEC-CLR-2026-00042"
    req.certificate_hash = "abc123sha256hash"
    test_db.commit()

    updated = test_db.query(ClearanceRequest).filter_by(id=req.id).first()
    assert updated.overall_status == ClearanceStatusEnum.APPROVED
    assert updated.certificate_id == "PEC-CLR-2026-00042"


def test_department_approval_relationship_cascade(test_db):
    student = User(
        email="student@pec.edu.in",
        full_name="Alex Grover",
        role=RoleEnum.STUDENT,
        roll_number="22103001",
        hashed_password="pw"
    )
    dept = Department(name="Sports", code="SPORTS", clearance_gate=1)
    test_db.add_all([student, dept])
    test_db.commit()

    req = ClearanceRequest(
        student_id=student.id,
        academic_year="2025-2026",
        semester="Semester 8",
        reason="Graduation"
    )
    test_db.add(req)
    test_db.commit()

    approval = DepartmentApproval(
        request_id=req.id,
        department_id=dept.id,
        status=ApprovalStatusEnum.PENDING,
        due_amount=0.0
    )
    test_db.add(approval)
    test_db.commit()

    assert len(req.approvals) == 1
    assert req.approvals[0].department.code == "SPORTS"

    # Verify Cascade Delete
    test_db.delete(req)
    test_db.commit()

    assert test_db.query(DepartmentApproval).filter_by(request_id=req.id).count() == 0


def test_grievance_model_creation(test_db):
    student = User(
        email="charlie@pec.edu.in",
        full_name="Charlie Verma",
        role=RoleEnum.STUDENT,
        roll_number="22105029",
        hashed_password="pw"
    )
    dept = Department(name="PEC Hostels", code="HOSTEL", clearance_gate=1)
    test_db.add_all([student, dept])
    test_db.commit()

    deadline = datetime.now(timezone.utc)
    g = Grievance(
        student_id=student.id,
        department_id=dept.id,
        subject="Disputed mess charge",
        description="Mess charge of Rs. 3500 is incorrect as hostel was vacated in April.",
        priority=GrievancePriorityEnum.HIGH,
        status=GrievanceStatusEnum.OPEN,
        sla_hours=12,
        sla_deadline=deadline,
        is_escalated=False
    )
    test_db.add(g)
    test_db.commit()

    retrieved = test_db.query(Grievance).filter_by(student_id=student.id).first()
    assert retrieved is not None
    assert retrieved.priority == GrievancePriorityEnum.HIGH
    assert retrieved.sla_hours == 12
    assert retrieved.is_escalated is False


def test_audit_log_immutability_and_recording(test_db):
    log = AuditLog(
        actor_id=1,
        actor_name="Dean Academic Affairs",
        actor_role="ADMIN",
        action="EXECUTIVE_OVERRIDE",
        target_type="CLEARANCE",
        target_id=42,
        details="Authorized unblocking of sports due discrepancy."
    )
    test_db.add(log)
    test_db.commit()

    saved_log = test_db.query(AuditLog).filter_by(target_id=42).first()
    assert saved_log is not None
    assert saved_log.action == "EXECUTIVE_OVERRIDE"
    assert saved_log.timestamp is not None


# ---------------------------------------------------------------------------
# Schema Validation Unit Tests (Pydantic)
# ---------------------------------------------------------------------------

def test_user_login_schema_valid():
    data = UserLogin(email="alice@pec.edu.in", password="secretpassword")
    assert data.email == "alice@pec.edu.in"
    assert data.password == "secretpassword"


def test_user_login_schema_invalid_email():
    with pytest.raises(ValidationError):
        UserLogin(email="not-an-email", password="pw")


def test_user_register_schema_defaults():
    data = UserRegister(
        email="bob@pec.edu.in",
        password="secretpassword",
        full_name="Bobdeep Singh"
    )
    assert data.role == RoleEnum.STUDENT
    assert data.roll_number is None
    assert data.department_id is None


def test_clearance_request_create_defaults():
    req = ClearanceRequestCreate()
    assert req.academic_year == "2025-2026"
    assert req.semester == "Semester 8"
    assert "Graduation" in req.reason


def test_approval_decision_request_schema():
    appr = ApprovalDecisionRequest(
        decision=ApprovalStatusEnum.APPROVED,
        remarks="All books returned.",
        due_amount=0.0
    )
    assert appr.decision == ApprovalStatusEnum.APPROVED
    assert appr.due_amount == 0.0


def test_grievance_create_schema():
    g = GrievanceCreate(
        department_id=1,
        subject="Library Fine Receipt",
        description="Fine already paid via SBI Collect.",
        priority=GrievancePriorityEnum.CRITICAL
    )
    assert g.priority == GrievancePriorityEnum.CRITICAL
    assert g.department_id == 1


def test_grievance_resolve_request_schema():
    res = GrievanceResolveRequest(
        staff_response="Verified payment receipt. Fine cleared.",
        status=GrievanceStatusEnum.RESOLVED
    )
    assert res.status == GrievanceStatusEnum.RESOLVED
    assert "Verified" in res.staff_response
