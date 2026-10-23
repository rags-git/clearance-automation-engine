"""
System-Level End-to-End SDLC Lifecycle & User Acceptance Tests (UAT)
Academic Grievance, No-Dues & Clearance Automation Engine
Punjab Engineering College (Deemed to be University), Chandigarh
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.seed import seed_database


@pytest.fixture(scope="module")
def client():
    seed_database()
    with TestClient(app) as test_client:
        yield test_client


def login(client, email, password="password123"):
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]


def test_full_clearance_and_sdlc_lifecycle(client):
    """
    Simulates the entire multi-department student clearance lifecycle:
    1. Student initiates new clearance request.
    2. Gate 1 (Library, Hostels, Sports) parallel reviews with 1 dispute.
    3. Student files grievance for disputed dues; staff resolves grievance.
    4. Gate 1 all APPROVED -> Gate 2 (Labs) unlocked automatically.
    5. Gate 2 (Labs) APPROVED -> Gate 3 (Accounts) unlocked automatically.
    6. Gate 3 (Accounts) reconciles fees, releases ₹10,000 Caution Money deposit.
    7. Master Clearance transitions to APPROVED; Certificate ID minted.
    8. Verifiable vector PDF certificate generated and checked.
    9. Unauthenticated public verifier validates certificate hash and ID.
    10. Audit log verifies unbroken, immutable audit trail.
    """
    # ---------------------------------------------------------
    # Phase 1: Fresh Student Registers & Initiates Clearance
    # ---------------------------------------------------------
    import uuid
    uniq = uuid.uuid4().hex[:6]
    student_email = f"student_{uniq}@pec.edu.in"
    student_roll = f"22{uniq}"

    reg_resp = client.post("/api/v1/auth/register", json={
        "email": student_email,
        "password": "password123",
        "full_name": f"Lifecycle E2E Student {uniq}",
        "roll_number": student_roll
    })
    assert reg_resp.status_code == 200, reg_resp.text
    student_token = reg_resp.json()["access_token"]

    init_resp = client.post(
        "/api/v1/clearance/apply",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "academic_year": "2025-2026",
            "semester": "Semester 8",
            "reason": "B.Tech Degree Clearance"
        }
    )
    assert init_resp.status_code == 200, init_resp.text
    clearance_data = init_resp.json()
    req_id = clearance_data["id"]
    assert clearance_data["overall_status"] == "IN_PROGRESS"
    assert len(clearance_data["approvals"]) == 5

    # Map department codes to approval IDs
    appr_map = {a["department_code"]: a["id"] for a in clearance_data["approvals"]}

    # Check Gate 1 is PENDING, Gate 2 & 3 are WAITING_PREREQUISITE
    for appr in clearance_data["approvals"]:
        if appr["clearance_gate"] == 1:
            assert appr["status"] == "PENDING"
        else:
            assert appr["status"] == "WAITING_PREREQUISITE"

    # ---------------------------------------------------------
    # Phase 2: Gate 1 Parallel Approvals
    # ---------------------------------------------------------
    # 2a. Library staff approves
    lib_token = login(client, "library@pec.edu.in")
    appr_lib = client.post(
        f"/api/v1/clearance/staff/decision/{appr_map['LIBRARY']}",
        headers={"Authorization": f"Bearer {lib_token}"},
        json={"decision": "APPROVED", "remarks": "No pending books.", "due_amount": 0.0}
    )
    assert appr_lib.status_code == 200
    assert appr_lib.json()["status"] == "APPROVED"
    assert appr_lib.json()["digital_signature"].startswith("SIG-v1:LIBRARY:")

    # 2b. Hostel staff approves
    hostel_token = login(client, "hostel@pec.edu.in")
    appr_hostel = client.post(
        f"/api/v1/clearance/staff/decision/{appr_map['HOSTEL']}",
        headers={"Authorization": f"Bearer {hostel_token}"},
        json={"decision": "APPROVED", "remarks": "Room keys surrendered.", "due_amount": 0.0}
    )
    assert appr_hostel.status_code == 200
    assert appr_hostel.json()["status"] == "APPROVED"

    # Verify Gate 2 is STILL blocked because Sports has not approved yet
    labs_token = login(client, "labs@pec.edu.in")
    early_lab = client.post(
        f"/api/v1/clearance/staff/decision/{appr_map['LABS']}",
        headers={"Authorization": f"Bearer {labs_token}"},
        json={"decision": "APPROVED", "remarks": "Premature attempt.", "due_amount": 0.0}
    )
    assert early_lab.status_code == 400
    assert "Prerequisite Gate Error" in early_lab.json()["detail"]

    # 2c. Sports staff rejects with fine
    sports_token = login(client, "sports@pec.edu.in")
    appr_sports = client.post(
        f"/api/v1/clearance/staff/decision/{appr_map['SPORTS']}",
        headers={"Authorization": f"Bearer {sports_token}"},
        json={"decision": "REJECTED", "remarks": "Badminton racquet fine Rs. 350 unpaid.", "due_amount": 350.0}
    )
    assert appr_sports.status_code == 200
    assert appr_sports.json()["status"] == "REJECTED"

    # ---------------------------------------------------------
    # Phase 3: Student Grievance & SLA Resolution
    # ---------------------------------------------------------
    # Student files grievance
    grievance_resp = client.post(
        "/api/v1/grievance",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "department_id": 3,  # Sports
            "clearance_request_id": req_id,
            "subject": "Dispute on Badminton racquet fine",
            "description": "Equipment was returned to coach on May 2nd.",
            "priority": "CRITICAL"
        }
    )
    assert grievance_resp.status_code == 200
    g_id = grievance_resp.json()["id"]
    assert grievance_resp.json()["sla_hours"] == 4

    # Sports officer verifies and resolves grievance
    resolve_resp = client.post(
        f"/api/v1/grievance/{g_id}/resolve",
        headers={"Authorization": f"Bearer {sports_token}"},
        json={"staff_response": "Verified with coach register. Fine waived.", "status": "RESOLVED"}
    )
    assert resolve_resp.status_code == 200

    # Sports staff re-reviews and approves Gate 1
    appr_sports_ok = client.post(
        f"/api/v1/clearance/staff/decision/{appr_map['SPORTS']}",
        headers={"Authorization": f"Bearer {sports_token}"},
        json={"decision": "APPROVED", "remarks": "Clearance granted post-grievance.", "due_amount": 0.0}
    )
    assert appr_sports_ok.status_code == 200
    assert appr_sports_ok.json()["status"] == "APPROVED"

    # ---------------------------------------------------------
    # Phase 4: Gate 2 (Department Labs) Unlocked & Approved
    # ---------------------------------------------------------
    appr_labs = client.post(
        f"/api/v1/clearance/staff/decision/{appr_map['LABS']}",
        headers={"Authorization": f"Bearer {labs_token}"},
        json={"decision": "APPROVED", "remarks": "Hardware kits verified.", "due_amount": 0.0}
    )
    assert appr_labs.status_code == 200
    assert appr_labs.json()["status"] == "APPROVED"
    assert appr_labs.json()["digital_signature"].startswith("SIG-v1:LABS:")

    # ---------------------------------------------------------
    # Phase 5: Gate 3 (Accounts Branch) Caution Money Reconciliation
    # ---------------------------------------------------------
    accounts_token = login(client, "accounts@pec.edu.in")
    appr_accounts = client.post(
        f"/api/v1/clearance/staff/decision/{appr_map['ACCOUNTS']}",
        headers={"Authorization": f"Bearer {accounts_token}"},
        json={
            "decision": "APPROVED",
            "remarks": "Caution Money Rs. 10000 authorized for bank refund release.",
            "due_amount": 0.0
        }
    )
    assert appr_accounts.status_code == 200
    assert appr_accounts.json()["status"] == "APPROVED"

    # ---------------------------------------------------------
    # Phase 6: Verify Certificate Minting & Overall Status
    # ---------------------------------------------------------
    check_req = client.get(
        "/api/v1/clearance/my-requests",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert check_req.status_code == 200
    reqs = check_req.json()
    completed_req = next((r for r in reqs if r["id"] == req_id), None)
    assert completed_req is not None
    assert completed_req["overall_status"] == "APPROVED"
    assert completed_req["certificate_id"] is not None
    assert completed_req["certificate_hash"] is not None
    cert_id = completed_req["certificate_id"]

    # ---------------------------------------------------------
    # Phase 7: Download and Verify Official PDF Certificate
    # ---------------------------------------------------------
    pdf_resp = client.get(
        f"/api/v1/certificate/download/{req_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert pdf_resp.status_code == 200
    assert pdf_resp.headers["content-type"] == "application/pdf"
    assert len(pdf_resp.content) > 1000
    assert pdf_resp.content.startswith(b"%PDF-")

    # ---------------------------------------------------------
    # Phase 8: Public Online Verification (Unauthenticated)
    # ---------------------------------------------------------
    public_verify = client.get(f"/api/v1/certificate/verify?cert_id={cert_id}")
    assert public_verify.status_code == 200
    ver_data = public_verify.json()
    assert ver_data["valid"] is True
    assert ver_data["student"]["email"] == student_email
    assert len(ver_data["department_signatures"]) == 5

    # ---------------------------------------------------------
    # Phase 9: Admin Audit Log Verification
    # ---------------------------------------------------------
    admin_token = login(client, "admin@pec.edu.in")
    audit_resp = client.get(
        "/api/v1/admin/audit-logs",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert audit_resp.status_code == 200
    logs = audit_resp.json()
    assert len(logs) >= 5
    actions = [log["action"] for log in logs]
    assert "INITIATE_CLEARANCE" in actions
    assert "FILE_GRIEVANCE" in actions
    assert "RESOLVE_GRIEVANCE" in actions
    assert "ACCOUNTS_APPROVED" in actions
    assert "LABS_APPROVED" in actions
    assert "LIBRARY_APPROVED" in actions
