"""
Unit Tests for Security, JWT Authentication, and HMAC Digital Signatures
Academic Grievance, No-Dues & Clearance Automation Engine
Punjab Engineering College (Deemed to be University), Chandigarh
"""

from datetime import datetime, timezone, timedelta
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token
)
from backend.app.patterns.chain_of_responsibility import generate_digital_signature


def test_password_hashing_and_verification():
    raw_password = "SecurePassword@123"
    hashed = get_password_hash(raw_password)

    # Hash should not equal plain text
    assert hashed != raw_password

    # Correct password verifies
    assert verify_password(raw_password, hashed) is True

    # Incorrect password fails verification
    assert verify_password("WrongPassword@123", hashed) is False
    assert verify_password("", hashed) is False


def test_password_salting_uniqueness():
    raw_password = "IdenticalPassword"
    hash1 = get_password_hash(raw_password)
    hash2 = get_password_hash(raw_password)

    # Different salts must yield different hash strings
    assert hash1 != hash2
    assert verify_password(raw_password, hash1) is True
    assert verify_password(raw_password, hash2) is True


def test_jwt_access_token_creation_and_decoding():
    user_id = 42
    role = "STUDENT"

    token = create_access_token(subject=user_id, role=role)
    assert isinstance(token, str)
    assert len(token) > 20

    payload = decode_access_token(token)
    assert payload is not None
    assert payload.get("sub") == str(user_id)
    assert payload.get("role") == role
    assert "exp" in payload


def test_jwt_expired_token_handling():
    user_id = 99
    # Create token that expired 10 minutes ago
    expired_token = create_access_token(
        subject=user_id,
        role="STAFF",
        expires_delta=timedelta(minutes=-10)
    )

    payload = decode_access_token(expired_token)
    assert payload is None, "Expired JWT token must decode to None"


def test_jwt_invalid_or_garbage_token():
    assert decode_access_token("not-a-token") is None
    assert decode_access_token("") is None
    assert decode_access_token("header.payload.invalidsignature") is None


def test_digital_signature_generation_structure():
    now = datetime(2026, 5, 10, 10, 30, 0, tzinfo=timezone.utc)
    sig = generate_digital_signature(
        staff_id=5,
        staff_name="Dr. B.R. Ambedkar Librarian",
        dept_code="LIBRARY",
        request_id=101,
        timestamp=now
    )

    # Verify signature format: SIG-v1:<DEPT>:<HASH24>
    assert sig.startswith("SIG-v1:LIBRARY:")
    parts = sig.split(":")
    assert len(parts) == 3
    assert parts[0] == "SIG-v1"
    assert parts[1] == "LIBRARY"
    assert len(parts[2]) == 24


def test_digital_signature_deterministic_behavior():
    now = datetime(2026, 5, 10, 10, 30, 0, tzinfo=timezone.utc)
    sig1 = generate_digital_signature(1, "Staff A", "HOSTEL", 10, now)
    sig2 = generate_digital_signature(1, "Staff A", "HOSTEL", 10, now)

    # Identical parameters must produce identical HMAC digest
    assert sig1 == sig2


def test_digital_signature_tamper_sensitivity():
    now = datetime(2026, 5, 10, 10, 30, 0, tzinfo=timezone.utc)
    base_sig = generate_digital_signature(1, "Staff A", "HOSTEL", 10, now)

    # Change staff_id
    sig_diff_staff = generate_digital_signature(2, "Staff A", "HOSTEL", 10, now)
    assert base_sig != sig_diff_staff

    # Change request_id
    sig_diff_req = generate_digital_signature(1, "Staff A", "HOSTEL", 11, now)
    assert base_sig != sig_diff_req

    # Change timestamp
    later = now + timedelta(seconds=1)
    sig_diff_time = generate_digital_signature(1, "Staff A", "HOSTEL", 10, later)
    assert base_sig != sig_diff_time
