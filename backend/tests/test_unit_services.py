"""
Unit Tests for Service Layer (Clearance, Grievance, Certificate)
Academic Grievance, No-Dues & Clearance Automation Engine
Punjab Engineering College (Deemed to be University), Chandigarh
"""

import pytest
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.models.models import (
    Base, User, Department, DepartmentApproval,
    RoleEnum, ClearanceStatusEnum, ApprovalStatusEnum,
    GrievancePriorityEnum, GrievanceStatusEnum
)
from backend.app.services.clearance_service import ClearanceService
from backend.app.services.grievance_service import GrievanceService
from backend.app.services.certificate_service import CertificateService


@pytest.fixture
def service_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create 5 departments
    dept_specs = [
        ("Central Library", "LIBRARY", 1),
        ("Student Hostel", "HOSTEL", 1),
        ("Sports Complex", "SPORTS", 1),
        ("Department Labs", "LABS", 2),
        ("Accounts Office", "ACCOUNTS", 3),
    ]
    depts = {}
    for name, code, gate in dept_specs:
        d = Department(name=name, code=code, clearance_gate=gate)
        session.add(d)
        session.flush()
        depts[code] = d

    # Create student
    student = User(
        email="student.test@pec.edu.in",
        full_name="PEC Test Student",
        role=RoleEnum.STUDENT,
        roll_number="22103099",
        hashed_password="pw"
    )
    session.add(student)

    # Create staff
    staff_lib = User(
        email="lib.staff@pec.edu.in",
        full_name="Library Officer",
        role=RoleEnum.STAFF,
        department_id=depts["LIBRARY"].id,
        hashed_password="pw"
    )
    session.add(staff_lib)

    session.commit()
    yield {
        "db": session,
        "student": student,
        "staff_lib": staff_lib,
        "depts": depts
    }
    session.close()


def test_clearance_service_create_request(service_db):
    db = service_db["db"]
    student = service_db["student"]

    req = ClearanceService.create_request(
        student=student,
        academic_year="2025-2026",
        semester="Semester 8",
        reason="Graduation",
        db=db
    )

    assert req.id is not None
    assert req.student_id == student.id
    assert req.overall_status == ClearanceStatusEnum.IN_PROGRESS

    # Check that all 5 departments were initialized
    approvals = db.query(DepartmentApproval).filter_by(request_id=req.id).all()
    assert len(approvals) == 5

    # Check Gate 1 is PENDING, Gate 2 & 3 are WAITING_PREREQUISITE
    for appr in approvals:
        if appr.department.clearance_gate == 1:
            assert appr.status == ApprovalStatusEnum.PENDING
        else:
            assert appr.status == ApprovalStatusEnum.WAITING_PREREQUISITE


def test_clearance_service_duplicate_request_rejection(service_db):
    db = service_db["db"]
    student = service_db["student"]

    # First request
    ClearanceService.create_request(student, "2025-2026", "Semester 8", "Graduation", db)

    # Second active request attempt must raise HTTPException 400
    with pytest.raises(HTTPException) as excinfo:
        ClearanceService.create_request(student, "2025-2026", "Semester 8", "Graduation", db)
    assert excinfo.value.status_code == 400
    assert "already have an active clearance request" in excinfo.value.detail


def test_grievance_service_sla_calculation(service_db):
    db = service_db["db"]
    student = service_db["student"]
    lib_dept = service_db["depts"]["LIBRARY"]

    before = datetime.now(timezone.utc)
    g = GrievanceService.file_grievance(
        student=student,
        department_id=lib_dept.id,
        subject="Disputed Book Fine",
        description="Book was returned on 12th April.",
        priority=GrievancePriorityEnum.CRITICAL,
        clearance_request_id=None,
        db=db
    )
    after = datetime.now(timezone.utc)

    assert g.id is not None
    assert g.sla_hours == 4
    assert g.status == GrievanceStatusEnum.OPEN
    assert g.is_escalated is False

    # Deadline should be roughly 4 hours ahead
    deadline = g.sla_deadline
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    assert deadline >= before + timedelta(hours=3, minutes=59)
    assert deadline <= after + timedelta(hours=4, minutes=1)


def test_grievance_service_sla_auto_escalation(service_db):
    db = service_db["db"]
    student = service_db["student"]
    lib_dept = service_db["depts"]["LIBRARY"]

    # File grievance
    g = GrievanceService.file_grievance(
        student=student,
        department_id=lib_dept.id,
        subject="Overdue test",
        description="Ticket should escalate",
        priority=GrievancePriorityEnum.HIGH,
        clearance_request_id=None,
        db=db
    )

    # Artificially set deadline to 1 hour in the past
    g.sla_deadline = datetime.now(timezone.utc) - timedelta(hours=1)
    db.commit()

    # Run SLA scanner
    escalated_count = GrievanceService.check_and_escalate_sla(db)
    assert escalated_count >= 1

    db.refresh(g)
    assert g.is_escalated is True
    assert g.status == GrievanceStatusEnum.ESCALATED


def test_grievance_service_resolution(service_db):
    db = service_db["db"]
    student = service_db["student"]
    staff_lib = service_db["staff_lib"]
    lib_dept = service_db["depts"]["LIBRARY"]

    g = GrievanceService.file_grievance(
        student=student,
        department_id=lib_dept.id,
        subject="Book replacement dispute",
        description="Replacement copy submitted to library counter.",
        priority=GrievancePriorityEnum.MEDIUM,
        clearance_request_id=None,
        db=db
    )

    resolved_g = GrievanceService.resolve_grievance(
        grievance_id=g.id,
        staff_user=staff_lib,
        staff_response="Replacement accessioned into catalogue. Dues zeroed.",
        new_status=GrievanceStatusEnum.RESOLVED,
        db=db
    )

    assert resolved_g.status == GrievanceStatusEnum.RESOLVED
    assert resolved_g.staff_response.startswith("Replacement")
    assert resolved_g.resolved_at is not None


def test_certificate_service_pdf_generation(service_db):
    db = service_db["db"]
    student = service_db["student"]

    req = ClearanceService.create_request(student, "2025-2026", "Semester 8", "Graduation", db)
    req.certificate_id = "PEC-CLR-2026-TEST1"
    req.certificate_hash = "f34088db6418898129384729182374981729384"
    db.commit()

    # Generate PDF bytes
    pdf_bytes = CertificateService.generate_clearance_pdf(req)

    assert pdf_bytes is not None
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    # PDF magic byte signature
    assert pdf_bytes.startswith(b"%PDF-")
