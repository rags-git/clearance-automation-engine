"""
Security & Role-Based Access Control (RBAC) Tests
Academic Grievance, No-Dues & Clearance Automation Engine
Punjab Engineering College (Deemed to be University), Chandigarh
"""

import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.seed import seed_database
from backend.app.patterns.chain_of_responsibility import generate_digital_signature


@pytest.fixture(scope="module")
def api_client():
    seed_database()
    with TestClient(app) as client:
        yield client


def get_token(client, email, password="password123"):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]


def test_unauthenticated_request_blocked(api_client):
    # Attempt to access student clearances without token
    resp = api_client.get("/api/v1/clearance/my-requests")
    assert resp.status_code == 401

    # Attempt to access admin audit logs without token
    resp = api_client.get("/api/v1/admin/audit-logs")
    assert resp.status_code == 401


def test_student_forbidden_from_staff_department_approval(api_client):
    # Student Alice Sharma
    student_token = get_token(api_client, "alice@pec.edu.in")

    # Attempt to call staff decision endpoint on approval 1
    resp = api_client.post(
        "/api/v1/clearance/staff/decision/1",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "decision": "APPROVED",
            "remarks": "Malicious student attempt to approve self.",
            "due_amount": 0.0
        }
    )
    assert resp.status_code == 403
    assert "Only staff or administrators" in resp.json()["detail"]


def test_student_forbidden_from_admin_analytics_and_audit(api_client):
    student_token = get_token(api_client, "student@pec.edu.in")

    # Student accessing admin analytics -> 403 Forbidden
    resp = api_client.get(
        "/api/v1/admin/analytics",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 403
    assert "Access denied" in resp.json()["detail"]

    # Student accessing admin audit logs -> 403 Forbidden
    resp_audit = api_client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp_audit.status_code == 403
    assert "Admin privileges required" in resp_audit.json()["detail"]


def test_staff_forbidden_from_admin_audit_logs(api_client):
    # Library staff
    staff_token = get_token(api_client, "library@pec.edu.in")

    # Staff accessing admin audit logs (requires ADMIN role) -> 403 Forbidden
    resp = api_client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {staff_token}"}
    )
    assert resp.status_code == 403
    assert "Admin privileges required" in resp.json()["detail"]


def test_clearance_queue_only_returns_actionable_department_items(api_client):
    import uuid
    suffix = uuid.uuid4().hex[:8]
    student_response = api_client.post("/api/v1/auth/register", json={
        "email": f"queue_{suffix}@pec.edu.in",
        "password": "password123",
        "full_name": "Queue Test Student",
        "roll_number": f"9{suffix[:7]}"
    })
    assert student_response.status_code == 200
    student_token = student_response.json()["access_token"]
    apply_response = api_client.post(
        "/api/v1/clearance/apply",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"academic_year": "2025-2026", "semester": "Semester 8", "reason": "Queue test"}
    )
    assert apply_response.status_code == 200

    library_token = get_token(api_client, "library@pec.edu.in")
    admin_token = get_token(api_client, "admin@pec.edu.in")

    library_queue = api_client.get(
        "/api/v1/clearance/staff/queue",
        headers={"Authorization": f"Bearer {library_token}"}
    )
    admin_queue = api_client.get(
        "/api/v1/clearance/staff/queue",
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert library_queue.status_code == 200
    assert admin_queue.status_code == 200
    library_items = library_queue.json()
    admin_items = admin_queue.json()
    assert library_items
    assert all(item["department_code"] == "LIBRARY" for item in library_items)
    assert all(item["status"] == "PENDING" for item in library_items + admin_items)
    assert len(admin_items) >= len(library_items)
    assert {item["department_code"] for item in admin_items}.issuperset(
        {item["department_code"] for item in library_items}
    )


def test_staff_queue_excludes_completed_and_locked_items(api_client):
    admin_token = get_token(api_client, "admin@pec.edu.in")
    response = api_client.get(
        "/api/v1/clearance/staff/queue",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert all(item["status"] == "PENDING" for item in response.json())


def test_staff_cross_department_signoff_forbidden(api_client):
    # Library staff tries to sign off for Sports department
    lib_token = get_token(api_client, "library@pec.edu.in")

    # Seed creates approvals: request 2 has approvals
    # We find an approval belonging to Sports (department_id=3)
    admin_token = get_token(api_client, "admin@pec.edu.in")
    queue_resp = api_client.get(
        "/api/v1/clearance/staff/queue",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    sports_appr = next((a for a in queue_resp.json() if a["department_code"] == "SPORTS"), None)
    assert sports_appr is not None, "Sports approval must exist in queue"

    resp = api_client.post(
        f"/api/v1/clearance/staff/decision/{sports_appr['id']}",
        headers={"Authorization": f"Bearer {lib_token}"},
        json={
            "decision": "APPROVED",
            "remarks": "Unauthorized cross-department signoff attempt.",
            "due_amount": 0.0
        }
    )
    assert resp.status_code == 403
    assert "not authorized" in resp.json()["detail"].lower()


def test_cryptographic_tamper_detection_on_signature():
    now = datetime(2026, 5, 1, 12, 0, 0, tzinfo=timezone.utc)
    original_sig = generate_digital_signature(
        staff_id=2,
        staff_name="Librarian",
        dept_code="LIBRARY",
        request_id=1,
        timestamp=now
    )

    # An attacker attempts to forge the seal by replacing request_id or staff_id
    forged_sig = generate_digital_signature(
        staff_id=99,
        staff_name="Attacker",
        dept_code="LIBRARY",
        request_id=1,
        timestamp=now
    )

    assert original_sig != forged_sig
