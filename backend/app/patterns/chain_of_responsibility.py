"""
Chain of Responsibility Design Pattern Implementation
Academic Clearance & No-Dues Engine

This module defines the workflow routing and verification gates using the behavioral
Chain of Responsibility pattern. It supports both parallel clearance gates (Library, Hostel, Sports)
and sequential dependency gates (Labs, Accounts), enforcing multi-signatory digital signature
verification and prerequisite rules.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
import hashlib
import hmac
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.models.models import (
    ClearanceRequest,
    DepartmentApproval,
    Department,
    ApprovalStatusEnum,
    ClearanceStatusEnum,
    User,
    RoleEnum,
    AuditLog
)


def generate_digital_signature(staff_id: int, staff_name: str, dept_code: str, request_id: int, timestamp: datetime) -> str:
    """Generate tamper-proof cryptographic HMAC signature for department verification."""
    payload = f"{staff_id}:{staff_name}:{dept_code}:{request_id}:{timestamp.isoformat()}"
    signature = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return f"SIG-v1:{dept_code}:{signature[:24]}"


class DepartmentHandler(ABC):
    """
    Abstract Handler in the Chain of Responsibility.
    Defines interface for handling department clearances and chaining downstream handlers.
    """

    def __init__(self, department_code: str, gate_level: int):
        self.department_code = department_code
        self.gate_level = gate_level
        self._next_handler: Optional["DepartmentHandler"] = None

    def set_next(self, handler: "DepartmentHandler") -> "DepartmentHandler":
        """Chain the next handler and return it for fluent builder syntax."""
        self._next_handler = handler
        return handler

    @abstractmethod
    def verify_prerequisites(self, request: ClearanceRequest, db: Session) -> Tuple[bool, str]:
        """Verify if prerequisite clearance gates have been completed before this handler can execute."""
        pass

    def can_handle(self, dept_code: str) -> bool:
        return self.department_code == dept_code

    def handle(
        self,
        request: ClearanceRequest,
        target_dept_code: str,
        staff_user: User,
        decision: ApprovalStatusEnum,
        remarks: str,
        due_amount: float,
        db: Session
    ) -> Tuple[bool, str, Optional[DepartmentApproval]]:
        """
        Process the clearance request if this handler matches target_dept_code,
        otherwise delegate to the next handler in the chain.
        """
        if self.can_handle(target_dept_code):
            # 1. Check prerequisite dependencies
            allowed, reason = self.verify_prerequisites(request, db)
            if not allowed:
                return False, f"Prerequisite Gate Error: {reason}", None

            # 2. Find the department approval record
            dept = db.query(Department).filter(Department.code == self.department_code).first()
            if not dept:
                return False, f"Department '{self.department_code}' not found in database.", None

            approval = db.query(DepartmentApproval).filter(
                DepartmentApproval.request_id == request.id,
                DepartmentApproval.department_id == dept.id
            ).first()

            if not approval:
                return False, f"No approval record found for department {self.department_code}.", None

            if approval.status == ApprovalStatusEnum.APPROVED and staff_user.role != RoleEnum.ADMIN:
                return False, f"Department '{dept.name}' is already approved.", approval

            # 3. Apply Decision (Supports Admin Override of previous decisions)
            now = datetime.now(timezone.utc)
            is_admin_override = staff_user.role == RoleEnum.ADMIN and approval.status in [ApprovalStatusEnum.REJECTED, ApprovalStatusEnum.APPROVED]
            approval.status = decision
            approval.staff_id = staff_user.id
            approval.approved_at = now
            approval.remarks = remarks
            approval.due_amount = due_amount if decision == ApprovalStatusEnum.REJECTED else 0.0

            if decision == ApprovalStatusEnum.APPROVED:
                approval.digital_signature = generate_digital_signature(
                    staff_id=staff_user.id,
                    staff_name=staff_user.full_name,
                    dept_code=self.department_code,
                    request_id=request.id,
                    timestamp=now
                )
            else:
                approval.digital_signature = None

            # 4. Audit Log Entry with role accountability
            action_name = f"ADMIN_OVERRIDE_{self.department_code}_{decision.value}" if is_admin_override else f"{self.department_code}_{decision.value}"
            audit = AuditLog(
                actor_id=staff_user.id,
                actor_name=staff_user.full_name,
                actor_role=staff_user.role.value,
                action=action_name,
                target_type="CLEARANCE",
                target_id=request.id,
                details=f"Decision: {decision.value}. Remarks: {remarks}. Dues: ₹{due_amount:.2f}. Sig: {approval.digital_signature or 'N/A'}"
            )
            db.add(audit)
            db.commit()
            db.refresh(approval)

            # 5. Evaluate the downstream chain lifecycle
            self.refresh_pipeline_gates(request, db)

            return True, f"Clearance for {dept.name} successfully updated to {decision.value}.", approval

        # Delegate downstream
        if self._next_handler:
            return self._next_handler.handle(
                request=request,
                target_dept_code=target_dept_code,
                staff_user=staff_user,
                decision=decision,
                remarks=remarks,
                due_amount=due_amount,
                db=db
            )

        return False, f"No handler in chain could process department code: {target_dept_code}", None

    def refresh_pipeline_gates(self, request: ClearanceRequest, db: Session) -> None:
        """
        Evaluate all approvals in request and unlock next sequential gates
        (transitioning WAITING_PREREQUISITE -> PENDING) or completing the clearance.
        """
        approvals = db.query(DepartmentApproval).filter(
            DepartmentApproval.request_id == request.id
        ).all()
        dept_map = {a.department.code: a for a in approvals}

        # Gate 1 checks (Library, Hostel, Sports)
        gate1_codes = ["LIBRARY", "HOSTEL", "SPORTS"]
        gate1_approved = all(
            dept_map.get(code) and dept_map[code].status == ApprovalStatusEnum.APPROVED
            for code in gate1_codes
        )

        # Gate 2: Labs
        labs_approval = dept_map.get("LABS")
        if labs_approval and labs_approval.status == ApprovalStatusEnum.WAITING_PREREQUISITE and gate1_approved:
            labs_approval.status = ApprovalStatusEnum.PENDING

        labs_approved = labs_approval and labs_approval.status == ApprovalStatusEnum.APPROVED

        # Gate 3: Accounts
        accounts_approval = dept_map.get("ACCOUNTS")
        if accounts_approval and accounts_approval.status == ApprovalStatusEnum.WAITING_PREREQUISITE:
            if gate1_approved and labs_approved:
                accounts_approval.status = ApprovalStatusEnum.PENDING

        accounts_approved = accounts_approval and accounts_approval.status == ApprovalStatusEnum.APPROVED

        # Check any rejection
        any_rejected = any(a.status == ApprovalStatusEnum.REJECTED for a in approvals)
        if any_rejected:
            request.overall_status = ClearanceStatusEnum.REJECTED
        elif gate1_approved and labs_approved and accounts_approved:
            request.overall_status = ClearanceStatusEnum.APPROVED
            # Generate final certificate hash if not present
            if not request.certificate_id:
                cert_id = f"CERT-CLR-{request.id:05d}-{int(datetime.now(timezone.utc).timestamp())}"
                payload = f"{cert_id}:{request.student_id}:{request.academic_year}:{request.semester}"
                cert_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
                request.certificate_id = cert_id
                request.certificate_hash = cert_hash
        else:
            request.overall_status = ClearanceStatusEnum.IN_PROGRESS

        db.commit()
        db.refresh(request)


# Concrete Handlers: Gate 1 (Parallel verification)

class LibraryHandler(DepartmentHandler):
    def __init__(self):
        super().__init__(department_code="LIBRARY", gate_level=1)

    def verify_prerequisites(self, request: ClearanceRequest, db: Session) -> Tuple[bool, str]:
        # Gate 1 has no prior dependencies; students can get Library cleared immediately
        return True, "Gate 1: Parallel clearance open."


class HostelHandler(DepartmentHandler):
    def __init__(self):
        super().__init__(department_code="HOSTEL", gate_level=1)

    def verify_prerequisites(self, request: ClearanceRequest, db: Session) -> Tuple[bool, str]:
        return True, "Gate 1: Parallel clearance open."


class SportsComplexHandler(DepartmentHandler):
    def __init__(self):
        super().__init__(department_code="SPORTS", gate_level=1)

    def verify_prerequisites(self, request: ClearanceRequest, db: Session) -> Tuple[bool, str]:
        return True, "Gate 1: Parallel clearance open."


# Concrete Handler: Gate 2 (Sequential Lab Gate)

class DepartmentLabsHandler(DepartmentHandler):
    def __init__(self):
        super().__init__(department_code="LABS", gate_level=2)

    def verify_prerequisites(self, request: ClearanceRequest, db: Session) -> Tuple[bool, str]:
        # Gate 2 requires all Gate 1 parallel departments (Library, Hostel, Sports) to be APPROVED
        gate1_codes = ["LIBRARY", "HOSTEL", "SPORTS"]
        approvals = db.query(DepartmentApproval).filter(
            DepartmentApproval.request_id == request.id
        ).all()
        dept_statuses = {a.department.code: a.status for a in approvals}

        for code in gate1_codes:
            if dept_statuses.get(code) != ApprovalStatusEnum.APPROVED:
                return False, f"Prerequisite unmet: '{code}' clearance must be APPROVED before Department Labs can verify."

        return True, "Gate 2 prerequisites satisfied (Library, Hostel, Sports approved)."


# Concrete Handler: Gate 3 (Final Accounts Gate)

class AccountsHandler(DepartmentHandler):
    def __init__(self):
        super().__init__(department_code="ACCOUNTS", gate_level=3)

    def verify_prerequisites(self, request: ClearanceRequest, db: Session) -> Tuple[bool, str]:
        # Gate 3 requires Gate 1 AND Gate 2 to be APPROVED before Accounts can issue final sign-off
        required_codes = ["LIBRARY", "HOSTEL", "SPORTS", "LABS"]
        approvals = db.query(DepartmentApproval).filter(
            DepartmentApproval.request_id == request.id
        ).all()
        dept_statuses = {a.department.code: a.status for a in approvals}

        for code in required_codes:
            if dept_statuses.get(code) != ApprovalStatusEnum.APPROVED:
                return False, f"Prerequisite unmet: '{code}' clearance must be APPROVED before Final Accounts can verify."

        return True, "Gate 3 prerequisites satisfied (All prior departments approved)."


class ClearanceChainBuilder:
    """
    Builder & Orchestrator that constructs the Chain of Responsibility:
    Library -> Hostel -> SportsComplex -> DepartmentLabs -> Accounts
    """

    @staticmethod
    def build_chain() -> DepartmentHandler:
        library = LibraryHandler()
        hostel = HostelHandler()
        sports = SportsComplexHandler()
        labs = DepartmentLabsHandler()
        accounts = AccountsHandler()

        # Connect chain links
        library.set_next(hostel).set_next(sports).set_next(labs).set_next(accounts)
        return library

    @classmethod
    def process_request(
        cls,
        request: ClearanceRequest,
        department_code: str,
        staff_user: User,
        decision: ApprovalStatusEnum,
        remarks: str,
        due_amount: float,
        db: Session
    ) -> Tuple[bool, str, Optional[DepartmentApproval]]:
        chain = cls.build_chain()
        return chain.handle(
            request=request,
            target_dept_code=department_code,
            staff_user=staff_user,
            decision=decision,
            remarks=remarks,
            due_amount=due_amount,
            db=db
        )
