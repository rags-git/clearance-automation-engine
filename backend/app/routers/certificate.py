from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.core.database import get_db
from backend.app.models.models import ClearanceRequest, ClearanceStatusEnum, User, RoleEnum
from backend.app.services.certificate_service import CertificateService
from backend.app.routers.auth import get_current_user

router = APIRouter(prefix="/certificate", tags=["Certificate & Public Verification"])


@router.get("/download/{request_id}")
def download_certificate(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    request = db.query(ClearanceRequest).filter(ClearanceRequest.id == request_id).first()
    if not request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Clearance request not found")

    if current_user.role == RoleEnum.STUDENT and request.student_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if request.overall_status != ClearanceStatusEnum.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Certificate cannot be generated. Clearance request is not fully approved."
        )

    pdf_bytes = CertificateService.generate_clearance_pdf(request)
    filename = f"Clearance_Certificate_{request.student.roll_number or request.student_id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/verify")
def verify_certificate_public(
    cert_id: Optional[str] = Query(None, description="Official Certificate ID"),
    cert_hash: Optional[str] = Query(None, description="Cryptographic SHA-256 Hash"),
    db: Session = Depends(get_db)
):
    """
    Public verification endpoint allowing prospective employers, universities,
    or verifying authorities to confirm authentic institutional clearance.
    """
    if not cert_id and not cert_hash:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provide cert_id or cert_hash to verify.")

    query = db.query(ClearanceRequest).filter(ClearanceRequest.overall_status == ClearanceStatusEnum.APPROVED)
    if cert_id:
        query = query.filter(ClearanceRequest.certificate_id == cert_id)
    if cert_hash:
        query = query.filter(ClearanceRequest.certificate_hash == cert_hash)

    request = query.first()
    if not request:
        return {
            "valid": False,
            "message": "Certificate record not found or clearance was not officially granted.",
            "verification_status": "UNVERIFIED"
        }

    signatures = []
    for a in request.approvals:
        signatures.append({
            "department": a.department.name,
            "department_code": a.department.code,
            "gate": a.department.clearance_gate,
            "status": a.status.value,
            "signatory": a.staff.full_name if a.staff else "System Administrator",
            "signed_at": a.approved_at.isoformat() if a.approved_at else None,
            "digital_signature_seal": a.digital_signature
        })

    return {
        "valid": True,
        "verification_status": "LEGITIMATE_AND_AUTHENTIC",
        "certificate_id": request.certificate_id,
        "cryptographic_hash": request.certificate_hash,
        "student": {
            "name": request.student.full_name,
            "roll_number": request.student.roll_number,
            "email": request.student.email
        },
        "clearance_details": {
            "academic_year": request.academic_year,
            "semester": request.semester,
            "purpose": request.reason,
            "completed_at": request.updated_at.isoformat()
        },
        "department_signatures": signatures
    }
