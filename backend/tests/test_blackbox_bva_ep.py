"""
Black-Box Testing: Equivalence Partitioning (EP) & Boundary Value Analysis (BVA)
Academic Grievance, No-Dues & Clearance Automation Engine
Punjab Engineering College (Deemed to be University), Chandigarh
"""

import pytest
from pydantic import ValidationError
from backend.app.schemas.schemas import (
    UserRegister,
    ApprovalDecisionRequest,
    GrievanceCreate
)
from backend.app.models.models import (
    RoleEnum,
    GrievancePriorityEnum,
    ApprovalStatusEnum
)


# ---------------------------------------------------------------------------
# 1. Equivalence Partitioning: Student ID / Roll Number Format
# Valid partition: 8-digit numeric string (e.g. "22103042")
# Invalid partitions: <8 digits, >8 digits, non-numeric strings, empty
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("sid,is_valid", [
    ("22103042", True),    # Valid 8-digit PEC SID
    ("22104001", True),    # Valid 8-digit PEC SID
    ("22105099", True),    # Valid 8-digit PEC SID
    ("10000000", True),    # Valid 8-digit boundary
    ("99999999", True),    # Valid 8-digit boundary
])
def test_valid_sid_equivalence_partition(sid, is_valid):
    user = UserRegister(
        email=f"{sid}@pec.edu.in",
        password="password123",
        full_name="PEC Student",
        role=RoleEnum.STUDENT,
        roll_number=sid
    )
    assert user.roll_number == sid


# ---------------------------------------------------------------------------
# 2. Boundary Value Analysis: Dues Amount (INR)
# Valid partition: Non-negative real numbers >= 0.0
# Boundaries:
#   - Min boundary: 0.00 (Zero dues / clean clearance)
#   - Just above min: 0.01 (Minimal fine, e.g. 1 paisa / nominal)
#   - Nominal: 500.00 (Standard library overdue fee)
#   - High boundary: 10000.00 (Standard PEC Caution Money deposit)
#   - Extreme high: 250000.00 (Major damage / replacement liability)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("amount", [
    0.0,        # Exact minimum boundary
    0.01,       # Just above minimum
    150.50,     # Nominal floating fee with paise
    10000.00,   # Exact caution money deposit
    50000.00,   # High value liability
])
def test_dues_amount_boundary_values(amount):
    req = ApprovalDecisionRequest(
        decision=ApprovalStatusEnum.APPROVED if amount == 0.0 else ApprovalStatusEnum.REJECTED,
        remarks=f"Tested dues boundary: {amount}",
        due_amount=amount
    )
    assert req.due_amount == amount


# ---------------------------------------------------------------------------
# 3. Equivalence Partitioning: Grievance Priority & SLA Mappings
# Valid partitions: CRITICAL (4h), HIGH (12h), MEDIUM (24h), LOW (48h)
# Invalid partitions: strings like "URGENT", "IMMEDIATE", "NONE"
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("priority_val", [
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "LOW"
])
def test_grievance_priority_valid_equivalence_classes(priority_val):
    g = GrievanceCreate(
        department_id=1,
        subject="Priority Partition Test",
        description="Testing valid priority class",
        priority=GrievancePriorityEnum(priority_val)
    )
    assert g.priority.value == priority_val


@pytest.mark.parametrize("invalid_priority", [
    "URGENT",
    "IMMEDIATE",
    "BLOCKER",
    "NORMAL",
    "",
    "123"
])
def test_grievance_priority_invalid_partitions_rejection(invalid_priority):
    with pytest.raises((ValueError, ValidationError)):
        GrievanceCreate(
            department_id=1,
            subject="Invalid Priority",
            description="Testing invalid priority",
            priority=invalid_priority
        )


# ---------------------------------------------------------------------------
# 4. Equivalence Partitioning: Email Format Validation
# Valid partition: standard RFC 5322 email syntax
# Invalid partitions: missing @, missing domain, spaces, malformed
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("valid_email", [
    "student@pec.edu.in",
    "alice.sharma@alumni.pec.edu.in",
    "admin.daa@pec.ac.in"
])
def test_valid_email_partition(valid_email):
    reg = UserRegister(
        email=valid_email,
        password="password123",
        full_name="Valid Email User"
    )
    assert reg.email == valid_email


@pytest.mark.parametrize("invalid_email", [
    "notanemail",
    "student@",
    "@pec.edu.in",
    "student name@pec.edu.in",
    "student@.com"
])
def test_invalid_email_partition(invalid_email):
    with pytest.raises(ValidationError):
        UserRegister(
            email=invalid_email,
            password="password123",
            full_name="Invalid Email User"
        )
