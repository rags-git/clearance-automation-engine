"""
Database Seeding Script for Punjab Engineering College (PEC), Chandigarh
Academic Grievance, No-Dues & Clearance Automation Engine

Populates:
- PEC Central Facilities (Dr. B.R. Ambedkar Central Library, Hostels, Gymkhana, Dept Labs, Accounts Branch)
- Positional Staff & Faculty In-Charges (Yearly rotation-proof designations: DAA, Chief Warden, HOD, Accounts Officer)
- PEC Students with 8-digit Student Identification Numbers (SIDs) e.g., 22103042
- Currency strictly in INR (₹)
- Realistic clearance lifecycles, grievances, and audit logs.
"""

from datetime import datetime, timedelta, timezone
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models.models import (
    User,
    Department,
    ClearanceRequest,
    DepartmentApproval,
    Grievance,
    AuditLog,
    RoleEnum,
    ClearanceStatusEnum,
    ApprovalStatusEnum,
    GrievanceStatusEnum,
    GrievancePriorityEnum
)
from backend.app.patterns.chain_of_responsibility import generate_digital_signature


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Department).first():
            print("PEC Database already contains data. Skipping initial seeding.")
            return

        print("Seeding PEC Chandigarh departments...")
        departments_data = [
            {
                "name": "Dr. B. R. Ambedkar Central Library (PEC)",
                "code": "LIBRARY",
                "clearance_gate": 1,
                "description": "Book return verification, RFID clearance, institutional thesis repository submission, and overdue fine settlement.",
                "staff_head_name": "Librarian / Head, Central Library"
            },
            {
                "name": "PEC Hostels (Shivalik / Kurukshetra / Himalaya / Aravali / KCH)",
                "code": "HOSTEL",
                "clearance_gate": 1,
                "description": "Hostel room handover, mess bill reconciliation, furniture audit, and key surrender.",
                "staff_head_name": "Chief Warden (Hostels)"
            },
            {
                "name": "Gymkhana & Sports Complex (PEC)",
                "code": "SPORTS",
                "clearance_gate": 1,
                "description": "Athletic gear surrender, swimming pool & gymnasium dues reconciliation, Inter-NIT/Inter-IIT kit clearance.",
                "staff_head_name": "President Gymkhana / Sports In-Charge"
            },
            {
                "name": "Departmental Research & Computing Labs (CSE/ECE/Mech)",
                "code": "LABS",
                "clearance_gate": 2,
                "description": "Hardware lab workstation clearance, Capstone Project sign-off, GPU cluster access revocation, and software licenses surrender.",
                "staff_head_name": "Head of Department (HOD) - Computing & Research Labs"
            },
            {
                "name": "Accounts & Finance Branch (Caution Money)",
                "code": "ACCOUNTS",
                "clearance_gate": 3,
                "description": "Semester tuition fee reconciliation, scholarship audit, and caution money security deposit refund release.",
                "staff_head_name": "Accounts Officer (Finance & Caution Money Branch)"
            }
        ]

        dept_objs = {}
        for d in departments_data:
            dept = Department(**d)
            db.add(dept)
            db.flush()
            dept_objs[dept.code] = dept

        print("Seeding PEC positional officials...")
        default_pw = get_password_hash("password123")

        # Dean Academic Affairs (DAA - Admin)
        admin_user = User(
            email="admin@pec.edu.in",
            full_name="Dean Academic Affairs (DAA)",
            role=RoleEnum.ADMIN,
            hashed_password=default_pw
        )
        db.add(admin_user)
        db.flush()

        # Positional Department In-Charges (Rotation-proof designations)
        staff_users = {
            "LIBRARY": User(
                email="library@pec.edu.in",
                full_name="Librarian / Head, Central Library",
                role=RoleEnum.STAFF,
                department_id=dept_objs["LIBRARY"].id,
                hashed_password=default_pw
            ),
            "HOSTEL": User(
                email="hostel@pec.edu.in",
                full_name="Chief Warden (Hostels)",
                role=RoleEnum.STAFF,
                department_id=dept_objs["HOSTEL"].id,
                hashed_password=default_pw
            ),
            "SPORTS": User(
                email="sports@pec.edu.in",
                full_name="President Gymkhana / Sports In-Charge",
                role=RoleEnum.STAFF,
                department_id=dept_objs["SPORTS"].id,
                hashed_password=default_pw
            ),
            "LABS": User(
                email="labs@pec.edu.in",
                full_name="Head of Department (HOD) - Computing & Research Labs",
                role=RoleEnum.STAFF,
                department_id=dept_objs["LABS"].id,
                hashed_password=default_pw
            ),
            "ACCOUNTS": User(
                email="accounts@pec.edu.in",
                full_name="Accounts Officer (Finance & Caution Money Branch)",
                role=RoleEnum.STAFF,
                department_id=dept_objs["ACCOUNTS"].id,
                hashed_password=default_pw
            )
        }
        for u in staff_users.values():
            db.add(u)
        db.flush()

        # PEC Students with authentic 8-digit PEC SIDs (e.g. 22103042 -> 2022 batch, 103 CSE, roll 042)
        print("Seeding PEC engineering students...")
        alice = User(
            email="alice@pec.edu.in",
            full_name="Alice Sharma",
            role=RoleEnum.STUDENT,
            roll_number="22103042",  # B.Tech CSE 2022-26
            hashed_password=default_pw
        )
        bob = User(
            email="bob@pec.edu.in",
            full_name="Bobdeep Singh",
            role=RoleEnum.STUDENT,
            roll_number="22104018",  # B.Tech ECE 2022-26
            hashed_password=default_pw
        )
        charlie = User(
            email="charlie@pec.edu.in",
            full_name="Charlie Verma",
            role=RoleEnum.STUDENT,
            roll_number="22105029",  # B.Tech Mechanical 2022-26
            hashed_password=default_pw
        )
        demo_student = User(
            email="student@pec.edu.in",
            full_name="Alex Grover (PEC Demo Student)",
            role=RoleEnum.STUDENT,
            roll_number="22103001",  # B.Tech CSE 2022-26
            hashed_password=default_pw
        )
        for s in [alice, bob, charlie, demo_student]:
            db.add(s)
        db.flush()

        # 1. Alice: Fully Approved Clearance with PEC Certificate Generated
        print("Seeding PEC clearance requests...")
        now = datetime.now(timezone.utc)
        req_alice = ClearanceRequest(
            student_id=alice.id,
            academic_year="2025-2026",
            semester="Semester 8 (Final B.Tech)",
            reason="B.Tech Final Degree & Transcript Release (Batch 2022-26)",
            overall_status=ClearanceStatusEnum.APPROVED,
            certificate_id="PEC-CLR-2026-00042",
            certificate_hash="a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
            created_at=now - timedelta(days=5),
            updated_at=now - timedelta(days=1)
        )
        db.add(req_alice)
        db.flush()

        # All 5 departments approved for Alice with PEC digital signatures
        for code, staff in staff_users.items():
            dept = dept_objs[code]
            sig = generate_digital_signature(staff.id, staff.full_name, code, req_alice.id, now - timedelta(days=2))
            appr = DepartmentApproval(
                request_id=req_alice.id,
                department_id=dept.id,
                status=ApprovalStatusEnum.APPROVED,
                staff_id=staff.id,
                approved_at=now - timedelta(days=2),
                remarks=f"All assets surrendered and accounts reconciled with zero pending liability for {dept.name}.",
                due_amount=0.0,
                digital_signature=sig
            )
            db.add(appr)

        # 2. Bob: In Progress (Gate 1 partially cleared at PEC)
        req_bob = ClearanceRequest(
            student_id=bob.id,
            academic_year="2025-2026",
            semester="Semester 8 (Final B.Tech)",
            reason="Mandatory 6-Month Industrial Internship Clearance (Semester 8)",
            overall_status=ClearanceStatusEnum.IN_PROGRESS,
            created_at=now - timedelta(days=2),
            updated_at=now - timedelta(hours=3)
        )
        db.add(req_bob)
        db.flush()

        db.add(DepartmentApproval(
            request_id=req_bob.id,
            department_id=dept_objs["LIBRARY"].id,
            status=ApprovalStatusEnum.APPROVED,
            staff_id=staff_users["LIBRARY"].id,
            approved_at=now - timedelta(days=1),
            remarks="Dr. B.R. Ambedkar Central Library books returned. No fine overdue.",
            due_amount=0.0,
            digital_signature=generate_digital_signature(staff_users["LIBRARY"].id, staff_users["LIBRARY"].full_name, "LIBRARY", req_bob.id, now - timedelta(days=1))
        ))
        db.add(DepartmentApproval(
            request_id=req_bob.id,
            department_id=dept_objs["HOSTEL"].id,
            status=ApprovalStatusEnum.APPROVED,
            staff_id=staff_users["HOSTEL"].id,
            approved_at=now - timedelta(hours=5),
            remarks="Kurukshetra Hostel Room #142 vacated, keys surrendered, mess balance settled.",
            due_amount=0.0,
            digital_signature=generate_digital_signature(staff_users["HOSTEL"].id, staff_users["HOSTEL"].full_name, "HOSTEL", req_bob.id, now - timedelta(hours=5))
        ))
        db.add(DepartmentApproval(
            request_id=req_bob.id,
            department_id=dept_objs["SPORTS"].id,
            status=ApprovalStatusEnum.PENDING,
            remarks="Pending Gymkhana badminton racket and tournament jersey return.",
            due_amount=500.0  # INR (₹500)
        ))
        db.add(DepartmentApproval(
            request_id=req_bob.id,
            department_id=dept_objs["LABS"].id,
            status=ApprovalStatusEnum.WAITING_PREREQUISITE,
            remarks="Awaiting completion of Gate 1 parallel clearances (Gymkhana)."
        ))
        db.add(DepartmentApproval(
            request_id=req_bob.id,
            department_id=dept_objs["ACCOUNTS"].id,
            status=ApprovalStatusEnum.WAITING_PREREQUISITE,
            remarks="Awaiting all prior gates before releasing caution money security refund."
        ))

        # 3. Charlie: Rejected at Shivalik Hostel due & has filed an escalated grievance
        req_charlie = ClearanceRequest(
            student_id=charlie.id,
            academic_year="2025-2026",
            semester="Semester 8 (Final B.Tech)",
            reason="B.Tech Final Degree & Caution Money Refund",
            overall_status=ClearanceStatusEnum.REJECTED,
            created_at=now - timedelta(days=3),
            updated_at=now - timedelta(days=1)
        )
        db.add(req_charlie)
        db.flush()

        db.add(DepartmentApproval(
            request_id=req_charlie.id,
            department_id=dept_objs["LIBRARY"].id,
            status=ApprovalStatusEnum.APPROVED,
            staff_id=staff_users["LIBRARY"].id,
            approved_at=now - timedelta(days=2),
            remarks="All library books returned and RFID card cleared.",
            digital_signature=generate_digital_signature(staff_users["LIBRARY"].id, staff_users["LIBRARY"].full_name, "LIBRARY", req_charlie.id, now - timedelta(days=2))
        ))
        db.add(DepartmentApproval(
            request_id=req_charlie.id,
            department_id=dept_objs["HOSTEL"].id,
            status=ApprovalStatusEnum.REJECTED,
            staff_id=staff_users["HOSTEL"].id,
            approved_at=now - timedelta(days=1),
            remarks="Unpaid Shivalik Hostel mess bill of ₹3,500.00 for February.",
            due_amount=3500.0  # INR (₹3,500)
        ))
        db.add(DepartmentApproval(
            request_id=req_charlie.id,
            department_id=dept_objs["SPORTS"].id,
            status=ApprovalStatusEnum.PENDING,
            remarks="Pending Gymkhana clearance"
        ))
        db.add(DepartmentApproval(
            request_id=req_charlie.id,
            department_id=dept_objs["LABS"].id,
            status=ApprovalStatusEnum.WAITING_PREREQUISITE
        ))
        db.add(DepartmentApproval(
            request_id=req_charlie.id,
            department_id=dept_objs["ACCOUNTS"].id,
            status=ApprovalStatusEnum.WAITING_PREREQUISITE
        ))

        # Seed Grievances
        print("Seeding PEC grievances & SLA records...")
        g1 = Grievance(
            student_id=charlie.id,
            clearance_request_id=req_charlie.id,
            department_id=dept_objs["HOSTEL"].id,
            subject="Disputed Shivalik Hostel Mess Dues of ₹3,500 during 6-Month Internship",
            description="I was on a sanctioned 6-month industrial internship at a semiconductor R&D facility in Mohali during February. No mess meals were consumed. DAA sanction letter attached.",
            priority=GrievancePriorityEnum.HIGH,
            status=GrievanceStatusEnum.ESCALATED,
            sla_hours=12,
            sla_deadline=now - timedelta(hours=3),  # Breached SLA -> Escalated
            is_escalated=True,
            created_at=now - timedelta(hours=18)
        )
        g2 = Grievance(
            student_id=bob.id,
            clearance_request_id=req_bob.id,
            department_id=dept_objs["SPORTS"].id,
            subject="Gymkhana equipment returned to equipment storekeeper",
            description="I returned the badminton racket and tournament jersey to the Gymkhana equipment storekeeper last Thursday. Kindly verify page 42 of the Gymkhana stock register.",
            priority=GrievancePriorityEnum.MEDIUM,
            status=GrievanceStatusEnum.OPEN,
            sla_hours=24,
            sla_deadline=now + timedelta(hours=14),
            is_escalated=False,
            created_at=now - timedelta(hours=10)
        )
        db.add(g1)
        db.add(g2)

        # Seed Audit Logs
        print("Seeding PEC audit trail...")
        logs = [
            AuditLog(
                actor_id=admin_user.id,
                actor_name=admin_user.full_name,
                actor_role="ADMIN",
                action="SYSTEM_INIT",
                target_type="SYSTEM",
                details="PEC Clearance Automation Engine initialized for Punjab Engineering College, Sector 12, Chandigarh."
            ),
            AuditLog(
                actor_id=alice.id,
                actor_name=f"{alice.full_name} (SID: {alice.roll_number})",
                actor_role="STUDENT",
                action="INITIATE_CLEARANCE",
                target_type="CLEARANCE",
                target_id=req_alice.id,
                details="B.Tech graduation clearance request initiated."
            ),
            AuditLog(
                actor_id=staff_users["ACCOUNTS"].id,
                actor_name=staff_users["ACCOUNTS"].full_name,
                actor_role="STAFF",
                action="ACCOUNTS_APPROVED",
                target_type="CLEARANCE",
                target_id=req_alice.id,
                details="Final Gate 3 signed. Official certificate PEC-CLR-2026-00042 issued. Caution money security deposit of ₹10,000 reconciled and released."
            ),
            AuditLog(
                actor_id=None,
                actor_name="SLA_ENGINE",
                actor_role="SYSTEM",
                action="SLA_BREACH_ESCALATED",
                target_type="GRIEVANCE",
                target_id=1,
                details="Grievance #1 breached SLA deadline (12h). Auto-escalated to Dean Academic Affairs (DAA) PEC Chandigarh."
            )
        ]
        for log_entry in logs:
            db.add(log_entry)

        db.commit()
        print("PEC database seeded successfully with positional in-charges and INR currency!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding PEC database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
