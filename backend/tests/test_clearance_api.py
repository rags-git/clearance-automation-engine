"""
Integration Tests for PEC Clearance Engine REST APIs
Punjab Engineering College (Deemed to be University), Chandigarh
"""

import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.seed import seed_database


@pytest.fixture(scope="module")
def client():
    # Ensure seeded database exists
    seed_database()
    with TestClient(app) as test_client:
        yield test_client


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Chain of Responsibility" in data["architecture"]


def test_student_login(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "alice@pec.edu.in",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "STUDENT"
    assert data["user"]["roll_number"] == "22103042"


def test_staff_login(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "library@pec.edu.in",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "STAFF"


def test_admin_analytics(client):
    # Admin login (Dean Academic Affairs)
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@pec.edu.in",
        "password": "password123"
    })
    token = admin_login.json()["access_token"]

    response = client.get(
        "/api/v1/admin/analytics",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_students"] >= 3
    assert len(data["department_metrics"]) == 5


def test_public_certificate_verification(client):
    # Verify Alice Sharma's PEC certificate
    response = client.get("/api/v1/certificate/verify?cert_id=PEC-CLR-2026-00042")
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["student"]["name"] == "Alice Sharma"
    assert data["student"]["roll_number"] == "22103042"
    assert len(data["department_signatures"]) == 5
    for sig in data["department_signatures"]:
        assert sig["status"] == "APPROVED"
        assert sig["digital_signature_seal"] is not None


def test_grievance_submission_and_sla(client):
    # Login as PEC demo student
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "student@pec.edu.in",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]

    # File a CRITICAL priority grievance (SLA = 4 hours)
    response = client.post(
        "/api/v1/grievance",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "department_id": 1,
            "subject": "Fine receipt acknowledgment for Dr. B.R. Ambedkar Library",
            "description": "Paid Rs. 150 fine via SBI Collect Ref #PEC-LIB-89412 but still reflecting in pending list.",
            "priority": "CRITICAL"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["priority"] == "CRITICAL"
    assert data["sla_hours"] == 4
    assert data["status"] == "OPEN"
