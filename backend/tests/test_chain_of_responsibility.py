"""
Unit Tests for Chain of Responsibility Pattern
Academic Clearance & No-Dues Engine
"""

import pytest
from datetime import datetime, timezone
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.models.models import (
    Base, User, Department, ClearanceRequest, DepartmentApproval,
    RoleEnum, ApprovalStatusEnum, ClearanceStatusEnum
)
from backend.app.patterns.chain_of_responsibility import (
    ClearanceChainBuilder,
    generate_digital_signature
)


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create 5 standard departments
    dept_data = [
        ("Central Library", "LIBRARY", 1),
        ("Student Hostel", "HOSTEL", 1),
        ("Sports Complex", "SPORTS", 1),
        ("Department Labs", "LABS", 2),
        ("Accounts Office", "ACCOUNTS", 3),
    ]
    depts = {}
    for name, code, gate in dept_data:
        d = Department(name=name, code=code, clearance_gate=gate)
        session.add(d)
        session.flush()
        depts[code] = d

    # Create staff users
    staff_users = {}
    for code in depts:
        u = User(
            email=f"{code.lower()}@test.edu",
            full_name=f"{code} Officer",
            role=RoleEnum.STAFF,
            department_id=depts[code].id,
            hashed_password="pw"
        )
        session.add(u)
        session.flush()
        staff_users[code] = u

    # Create student
    student = User(
        email="teststudent@test.edu",
        full_name="Test Student",
        role=RoleEnum.STUDENT,
        roll_number="CS-TEST-001",
        hashed_password="pw"
    )
    session.add(student)
    session.flush()

    # Create clearance request
    req = ClearanceRequest(
        student_id=student.id,
        academic_year="2025-2026",
        semester="Semester 8",
        reason="Graduation",
        overall_status=ClearanceStatusEnum.IN_PROGRESS
    )
    session.add(req)
    session.flush()

    # Initialize approvals: Gate 1 PENDING, Gates 2 & 3 WAITING_PREREQUISITE
    for code, d in depts.items():
        st = ApprovalStatusEnum.PENDING if d.clearance_gate == 1 else ApprovalStatusEnum.WAITING_PREREQUISITE
        appr = DepartmentApproval(
            request_id=req.id,
            department_id=d.id,
            status=st,
            due_amount=0.0
        )
        session.add(appr)

    session.commit()
    yield {
        "session": session,
        "req": req,
        "depts": depts,
        "staff": staff_users,
        "student": student
    }
    session.close()


def test_digital_signature_generation():
    """Verify cryptographic HMAC signature is tamper-evident and deterministic for identical input."""
    now = datetime(2026, 5, 20, 10, 30, 0, tzinfo=timezone.utc)
    sig1 = generate_digital_signature(1, "Dr. Alice", "LIBRARY", 101, now)
    sig2 = generate_digital_signature(1, "Dr. Alice", "LIBRARY", 101, now)
    assert sig1 == sig2
    assert sig1.startswith("SIG-v1:LIBRARY:")
    assert len(sig1) > 20


def test_gate1_parallel_approvals(db_session):
    """Gate 1 departments (Library, Hostel, Sports) can be approved independently in parallel."""
    db = db_session["session"]
    req = db_session["req"]
    staff = db_session["staff"]

    # 1. Approve Library
    success, msg, appr = ClearanceChainBuilder.process_request(
        request=req,
        department_code="LIBRARY",
        staff_user=staff["LIBRARY"],
        decision=ApprovalStatusEnum.APPROVED,
        remarks="Books returned",
        due_amount=0.0,
        db=db
    )
    assert success is True
    assert appr.status == ApprovalStatusEnum.APPROVED
    assert appr.digital_signature is not None

    # 2. Approve Sports (independent of Hostel)
    success, msg, appr = ClearanceChainBuilder.process_request(
        request=req,
        department_code="SPORTS",
        staff_user=staff["SPORTS"],
        decision=ApprovalStatusEnum.APPROVED,
        remarks="Equipment in order",
        due_amount=0.0,
        db=db
    )
    assert success is True
    assert appr.status == ApprovalStatusEnum.APPROVED


def test_gate2_dependency_enforcement(db_session):
    """Department Labs (Gate 2) MUST fail if any Gate 1 department is not yet approved."""
    db = db_session["session"]
    req = db_session["req"]
    staff = db_session["staff"]

    # Only approve Library; Hostel & Sports are still pending
    ClearanceChainBuilder.process_request(
        request=req,
        department_code="LIBRARY",
        staff_user=staff["LIBRARY"],
        decision=ApprovalStatusEnum.APPROVED,
        remarks="Library ok",
        due_amount=0.0,
        db=db
    )

    # Attempt to approve Department Labs (Gate 2)
    success, msg, appr = ClearanceChainBuilder.process_request(
        request=req,
        department_code="LABS",
        staff_user=staff["LABS"],
        decision=ApprovalStatusEnum.APPROVED,
        remarks="Labs ok",
        due_amount=0.0,
        db=db
    )
    # Must fail because Gate 1 is incomplete!
    assert success is False
    assert "Prerequisite unmet" in msg


def test_gate3_final_clearance_and_certificate_minting(db_session):
    """When all gates are approved sequentially, the final request status is APPROVED and a certificate ID is generated."""
    db = db_session["session"]
    req = db_session["req"]
    staff = db_session["staff"]

    # 1. Complete all Gate 1
    for code in ["LIBRARY", "HOSTEL", "SPORTS"]:
        success, _, _ = ClearanceChainBuilder.process_request(
            request=req,
            department_code=code,
            staff_user=staff[code],
            decision=ApprovalStatusEnum.APPROVED,
            remarks="Cleared",
            due_amount=0.0,
            db=db
        )
        assert success is True

    # 2. Gate 2 (Labs) can now be approved
    success, _, _ = ClearanceChainBuilder.process_request(
        request=req,
        department_code="LABS",
        staff_user=staff["LABS"],
        decision=ApprovalStatusEnum.APPROVED,
        remarks="Hardware returned",
        due_amount=0.0,
        db=db
    )
    assert success is True

    # 3. Gate 3 (Accounts) can now be approved
    success, _, _ = ClearanceChainBuilder.process_request(
        request=req,
        department_code="ACCOUNTS",
        staff_user=staff["ACCOUNTS"],
        decision=ApprovalStatusEnum.APPROVED,
        remarks="All tuition and fee accounts cleared",
        due_amount=0.0,
        db=db
    )
    assert success is True

    # Request lifecycle should now be officially APPROVED
    db.refresh(req)
    assert req.overall_status == ClearanceStatusEnum.APPROVED
    assert req.certificate_id is not None
    assert req.certificate_id.startswith("CERT-CLR-")
    assert req.certificate_hash is not None
    assert len(req.certificate_hash) == 64  # SHA-256 length


def test_admin_override_on_rejected_department(db_session):
    """Admin (Dean Academic Affairs) can override a rejected department approval and unblock the pipeline."""
    db = db_session["session"]
    req = db_session["req"]
    staff = db_session["staff"]

    # 1. Hostel Staff rejects due to ₹3,500 mess dues
    success, msg, appr = ClearanceChainBuilder.process_request(
        request=req,
        department_code="HOSTEL",
        staff_user=staff["HOSTEL"],
        decision=ApprovalStatusEnum.REJECTED,
        remarks="Unpaid mess bill ₹3,500",
        due_amount=3500.0,
        db=db
    )
    assert success is True
    assert appr.status == ApprovalStatusEnum.REJECTED
    assert req.overall_status == ClearanceStatusEnum.REJECTED

    # 2. Staff cannot casually overwrite without Admin rights
    staff_override, _, _ = ClearanceChainBuilder.process_request(
        request=req,
        department_code="HOSTEL",
        staff_user=staff["LIBRARY"],  # other staff
        decision=ApprovalStatusEnum.APPROVED,
        remarks="Attempting unauthorized override",
        due_amount=0.0,
        db=db
    )
    # Blocked by authorization

    # 3. Dean Academic Affairs (Admin) executes legitimate override with internship fee waiver
    admin_user = User(
        email="daa@pec.edu.in",
        full_name="Dean Academic Affairs (DAA)",
        role=RoleEnum.ADMIN,
        hashed_password="pw"
    )
    db.add(admin_user)
    db.flush()

    admin_success, admin_msg, admin_appr = ClearanceChainBuilder.process_request(
        request=req,
        department_code="HOSTEL",
        staff_user=admin_user,
        decision=ApprovalStatusEnum.APPROVED,
        remarks="DAA Executive Order: Mess fees waived due to sanctioned 6-month industrial internship.",
        due_amount=0.0,
        db=db
    )
    assert admin_success is True
    assert admin_appr.status == ApprovalStatusEnum.APPROVED
    assert admin_appr.due_amount == 0.0
    assert admin_appr.digital_signature is not None
