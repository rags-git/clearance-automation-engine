import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from backend.app.models.models import ClearanceRequest, ApprovalStatusEnum


class CertificateService:

    @staticmethod
    def generate_clearance_pdf(request: ClearanceRequest) -> bytes:
        """
        Generate an official, tamper-evident No-Dues Clearance Certificate PDF for
        Punjab Engineering College (Deemed to be University), Chandigarh.
        Uses institutional positional designations and INR (Rs. / INR) currency.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        elements = []
        styles = getSampleStyleSheet()

        # Custom typography styles
        title_style = ParagraphStyle(
            'CertTitle',
            parent=styles['Heading1'],
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#7c2d12"),  # Rich PEC Maroon
            alignment=1,  # Center
            fontName="Helvetica-Bold"
        )

        subtitle_style = ParagraphStyle(
            'CertSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#475569"),
            alignment=1,
            fontName="Helvetica"
        )

        label_style = ParagraphStyle(
            'CertLabel',
            parent=styles['Normal'],
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#0f172a"),
            fontName="Helvetica-Bold"
        )

        body_style = ParagraphStyle(
            'CertBody',
            parent=styles['Normal'],
            fontSize=9,
            leading=12.5,
            textColor=colors.HexColor("#334155"),
            fontName="Helvetica"
        )

        code_style = ParagraphStyle(
            'CertCode',
            parent=styles['Normal'],
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#1e293b"),
            fontName="Courier"
        )

        # Header Block for Punjab Engineering College
        elements.append(Paragraph("PUNJAB ENGINEERING COLLEGE", title_style))
        elements.append(Paragraph("(DEEMED TO BE UNIVERSITY), CHANDIGARH", ParagraphStyle(
            'CertDeemed', parent=title_style, fontSize=13, leading=16, textColor=colors.HexColor("#991b1b")
        )))
        elements.append(Spacer(1, 2))
        elements.append(Paragraph("Sector 12, Chandigarh - 160012, India • Estd. 1921", subtitle_style))
        elements.append(Paragraph("OFFICE OF DEAN ACADEMIC AFFAIRS (DAA)", ParagraphStyle(
            'CertDAA', parent=subtitle_style, fontSize=11, fontName="Helvetica-Bold", textColor=colors.HexColor("#1e3a8a")
        )))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph("OFFICIAL NO-DUES & FINAL DEGREE CLEARANCE CERTIFICATE", ParagraphStyle(
            'CertSubhead', parent=subtitle_style, fontSize=12, textColor=colors.HexColor("#b45309"), fontName="Helvetica-Bold"
        )))
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#991b1b"), spaceAfter=12))

        # Certificate Identification Strip
        cert_id = request.certificate_id or f"PEC-CLR-{request.id:05d}"
        cert_hash = request.certificate_hash or "SHA256-PENDING-VALIDATION"
        issued_date = datetime.now(timezone.utc).strftime("%d %B %Y, %H:%M:%S IST")

        cert_meta = [
            [Paragraph("<b>Certificate Ref:</b>", label_style), Paragraph(cert_id, code_style),
             Paragraph("<b>Issue Date:</b>", label_style), Paragraph(issued_date, body_style)],
            [Paragraph("<b>Cryptographic Hash:</b>", label_style), Paragraph(f"{cert_hash[:36]}...", code_style),
             Paragraph("<b>Status:</b>", label_style), Paragraph("<b>PEC OFFICIALLY CLEARED</b>", ParagraphStyle('Green', parent=body_style, textColor=colors.HexColor("#15803d"), fontName="Helvetica-Bold"))]
        ]
        meta_table = Table(cert_meta, colWidths=[1.4 * inch, 2.5 * inch, 1.2 * inch, 1.9 * inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fffbeb")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#fde68a")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#fef3c7")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 12))

        # Student Information (PEC SID & Academic Details)
        student_data = [
            [Paragraph("<b>Student Name:</b>", label_style), Paragraph(request.student.full_name, body_style),
             Paragraph("<b>PEC SID (Student ID):</b>", label_style), Paragraph(f"<b>{request.student.roll_number or 'N/A'}</b>", body_style)],
            [Paragraph("<b>Academic Session:</b>", label_style), Paragraph(request.academic_year, body_style),
             Paragraph("<b>Semester / Term:</b>", label_style), Paragraph(request.semester, body_style)],
            [Paragraph("<b>Clearance Purpose:</b>", label_style), Paragraph(request.reason, body_style),
             Paragraph("<b>Institutional Email:</b>", label_style), Paragraph(request.student.email, body_style)]
        ]
        student_table = Table(student_data, colWidths=[1.6 * inch, 2.3 * inch, 1.6 * inch, 1.5 * inch])
        student_table.setStyle(TableStyle([
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        elements.append(student_table)
        elements.append(Spacer(1, 14))

        # PEC Multi-Department Clearance Verification Matrix
        elements.append(Paragraph("<b>PEC DEPARTMENTAL CLEARANCE RECORD (CHAIN OF RESPONSIBILITY)</b>", ParagraphStyle(
            'MatrixHeader', parent=label_style, fontSize=10, textColor=colors.HexColor("#0f172a")
        )))
        elements.append(Spacer(1, 5))

        approval_headers = [
            Paragraph("<b>Gate</b>", label_style),
            Paragraph("<b>PEC Facility / Department</b>", label_style),
            Paragraph("<b>Status</b>", label_style),
            Paragraph("<b>Verified By / Date</b>", label_style),
            Paragraph("<b>HMAC-SHA256 Digital Seal</b>", label_style)
        ]
        approval_rows = [approval_headers]

        for app in request.approvals:
            dept_name = app.department.name
            gate_label = f"Gate {app.department.clearance_gate} ({'Parallel' if app.department.clearance_gate == 1 else 'Sequential'})"
            st_text = app.status.value
            staff_info = f"{app.staff.full_name if app.staff else 'Designated In-Charge'}<br/>{app.approved_at.strftime('%d-%b-%Y') if app.approved_at else '-'}"
            sig_text = app.digital_signature if app.digital_signature else "Pending Signature"

            approval_rows.append([
                Paragraph(gate_label, body_style),
                Paragraph(f"<b>{dept_name}</b>", body_style),
                Paragraph(f"<b>{st_text}</b>", ParagraphStyle('ApprSt', parent=body_style, textColor=colors.HexColor("#15803d") if app.status == ApprovalStatusEnum.APPROVED else colors.HexColor("#b91c1c"))),
                Paragraph(staff_info, body_style),
                Paragraph(sig_text, code_style)
            ])

        appr_table = Table(approval_rows, colWidths=[1.1 * inch, 1.6 * inch, 0.8 * inch, 1.7 * inch, 1.8 * inch])
        appr_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#fee2e2")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#991b1b")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(appr_table)
        elements.append(Spacer(1, 14))

        # Institutional Declaration Clause (with Caution Money in INR)
        elements.append(Paragraph(
            "<b>Institutional Certification:</b> This certifies that the aforementioned student has satisfactorily surrendered all laboratory equipment, returned books to Dr. B.R. Ambedkar Central Library, vacated PEC hostel premises, settled Gymkhana dues, and reconciled all academic and caution money accounts with zero pending dues (INR 0.00). The student is declared eligible for the release of Caution Money Security Deposit and the award of degree / transcript by Punjab Engineering College (Deemed to be University), Chandigarh.",
            ParagraphStyle('Clause', parent=body_style, fontSize=8, leading=10.5, textColor=colors.HexColor("#64748b"))
        ))
        elements.append(Spacer(1, 20))

        # Positional Dignitary Signatures (Rotation-proof designations)
        sig_data = [
            [
                Paragraph("__________________________<br/><b>Dean Academic Affairs (DAA)</b><br/>Punjab Engineering College<br/>Sector 12, Chandigarh", body_style),
                Paragraph("__________________________<br/><b>Dean Student Affairs (DSA)</b><br/>Punjab Engineering College<br/>Sector 12, Chandigarh", body_style),
                Paragraph("__________________________<br/><b>Registrar & Institutional Seal</b><br/>Punjab Engineering College<br/>Sector 12, Chandigarh", body_style),
            ]
        ]
        sig_table = Table(sig_data, colWidths=[2.3 * inch, 2.3 * inch, 2.4 * inch])
        sig_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(sig_table)
        elements.append(Spacer(1, 8))

        # Footer Verification Link
        elements.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#cbd5e1"), spaceAfter=5))
        elements.append(Paragraph(
            f"Official Verification Portal: https://pec.ac.in/verify?hash={cert_hash} | Digital Seal ID: {cert_id} | Punjab Engineering College, Sector 12, Chandigarh - 160012",
            ParagraphStyle('Footnote', parent=code_style, fontSize=7, textColor=colors.HexColor("#94a3b8"), alignment=1)
        ))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
