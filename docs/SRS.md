# Software Requirements Specification
## Academic Grievance, No-Dues & Clearance Automation Engine

**Project Title:** Academic Grievance, No-Dues & Clearance Automation Engine  
**Course:** Software Engineering  
**Submitted to:** Dr. Rajesh Bhatia  
**Submitted by:** Raghav Bhardwaj & Karan Jain  
**Standard Template:** Karl E. Wiegers SRS Template (Compliant with IEEE Std 830-1998)  

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **Academic Grievance, No-Dues & Clearance Automation Engine** for **Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh**.

The system automates the multi-department student no-dues clearance workflow. It replaces manual paper clearance slips, provides real-time progress visibility, handles student grievances with automated deadline escalation, and generates tamper-evident digital clearance certificates.

### 1.2 Document Conventions
- **Requirement Identifiers:** Detailed functional requirements use unique sequence tags formatted as `[REQ-1]`, `[REQ-2]`, etc.
- **Priority Ratings:** System features are assigned priority levels: High, Medium, or Low.
- **Financial Format:** All monetary amounts are denominated in Indian Rupees (`₹` / INR) using the Indian numbering system.
- **Student Identification:** All student records are indexed by an 8-digit PEC Student ID (SID, format: `YYBBBRRR`).
- **Mathematical & Security Formulas:** Formulas are written in clear, standard text and code blocks rather than raw LaTeX to ensure universal compatibility.

### 1.3 Intended Audience and Reading Suggestions
This document is prepared for:
1. **Academic Evaluator / Course Instructor (Dr. Rajesh Bhatia):** Review Section 1 (Scope), Section 2 (Functions & Constraints), Section 4 (System Features), and Section 5 (Business Rules & Quality Attributes).
2. **Software Developers & System Architects:** Review Section 3 (Interfaces), Section 4 (Detailed Functional Requirements), and Section 6 (Database & Persistence).
3. **Quality Assurance & Testers:** Review Section 4 for acceptance criteria and Section 5 for performance and security benchmarks.
4. **Institutional Administrators (Dean Academic Affairs):** Review Section 2.2, Section 4.5 (Grievances), and Section 4.6 (Administrative Overrides).

### 1.4 Product Scope
At Punjab Engineering College, graduating students and students proceeding to 6-month industrial internships must obtain clearance from multiple departments (Library, Hostels, Sports Complex, Department Laboratories, and Accounts Branch).

Previously, this required students to physically walk between campus buildings in Sector 12, standing in lines with paper circulars. This manual process suffered from misplaced forms, delayed approvals, and zero visibility into fee discrepancies.

The new system provides:
- A single online web portal where students apply once and track live progress.
- Role-based portals for departmental heads with one-click review and cryptographic HMAC signing.
- An automated 3-gate pipeline enforcing parallel and sequential prerequisites.
- An SLA-governed grievance mechanism with automatic escalation to the Dean Academic Affairs upon deadline breach.
- Instant generation of an official, downloadable vector PDF clearance certificate with public online hash verification.

### 1.5 References
1. IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
2. Wiegers, Karl E., and Joy Beatty: *Software Requirements (3rd Edition)*, Microsoft Press.
3. FIPS PUB 180-4: *Secure Hash Standard (SHA-256)*, National Institute of Standards and Technology.
4. RFC 2104: *HMAC: Keyed-Hashing for Message Authentication*.
5. Punjab Engineering College Academic Ordinances for B.Tech., M.Tech., and Ph.D. Degree Programs.

---

## 2. Overall Description

### 2.1 Product Perspective
The Clearance Automation Engine is a centralized, web-based platform. It connects students across all academic branches (CSE, ECE, Mechanical, Electrical, Civil, Aerospace, Metallurgy, Production) with institutional authorities:

```
+-----------------------------------------------------------------------------------------+
|                  PUNJAB ENGINEERING COLLEGE (SECTOR 12, CHANDIGARH)                     |
|                   ACADEMIC CLEARANCE & GRIEVANCE AUTOMATION ENGINE                      |
+-----------------------------------------------------------------------------------------+
       |                                       |                                    |
  [PEC Students]                      [Positional Staff]                    [Office of DAA]
  - 8-digit SID                       - Permanent Roles                     - Executive Admin
  - Clearance Submissions             - Liability Inspection                - Override Authority
  - Grievance Filing                  - Digital Signing (HMAC)              - SLA Audit Monitor
       |                                       |                                    |
       +---------------------------------------+------------------------------------+
                                               |
                                     [REST API Gateway]
                                 (JSON / Bearer Token Auth)
                                               |
                      +------------------------+------------------------+
                      |                                                 |
         [Clearance Workflow Engine]                        [Grievance SLA Engine]
      (Chain of Responsibility Pipeline)                    (Deadline Breach Monitor)
      - Gate 1: Parallel (Lib/Host/Sports)                  - Critical: 4h | High: 12h
      - Gate 2: Sequential (Dept Labs)                      - Medium: 24h  | Low: 48h
      - Gate 3: Final (Accounts & Refund)                   - Auto-Escalation to DAA
                      |                                                 |
                      +------------------------+------------------------+
                                               |
                               [Cryptographic Signature Engine]
                           (HMAC-SHA256 Seals & SHA-256 Digest)
                                               |
                               [ReportLab Certificate Engine]
                           (Official PEC Letterhead & Signatures)
                                               |
                               [Relational Data Store (RDBMS)]
                      (Users, Clearances, Approvals, Grievances, Logs)
```

### 2.2 Product Functions
1. **User Authentication & Session Management:** Secure login for students, department staff, and administrators with role-specific navigation.
2. **Clearance Request Initiation:** Form submission with academic milestone selection (Graduation, 6-Month Internship, Thesis Submission).
3. **Three-Gate Clearance Pipeline:** Automated routing through Gate 1 (Parallel), Gate 2 (Sequential Labs), and Gate 3 (Accounts).
4. **Cryptographic Sign-Off:** Digital signing of departmental approvals using HMAC-SHA256 private keys.
5. **Grievance Arbitration & Auto-Escalation:** Student dispute registration with dynamic SLA timers and automatic escalation to the DAA upon breach.
6. **Executive Administrative Overrides:** Authority for the DAA to unblock approvals with mandatory audit logging.
7. **Certificate Minting & PDF Generation:** Emission of official tamper-proof PDF clearance certificates and public online hash verification.

### 2.3 User Classes and Characteristics
1. **PEC Student:**
   - Identified by an 8-digit PEC SID (e.g., `22103042`).
   - Uses the portal to apply for clearance, view itemized dues in INR (`₹`), file grievances, and download issued certificates.
2. **Department Staff (Positional Roles):**
   - Accounts represent permanent administrative designations: *Librarian* (Dr. B.R. Ambedkar Library), *Chief Warden* (Hostels), *President Gymkhana* (Sports), *HOD Labs* (Department Labs), and *Accounts Officer* (Finance).
   - Staff review student asset returns, enter outstanding dues in INR (`₹`), resolve grievances, and sign off digitally.
3. **Dean Academic Affairs (DAA / Admin):**
   - High-privilege administrative user overseeing campus-wide clearance operations.
   - Monitors institutional clearance bottlenecks, views escalated grievance tickets, and applies administrative overrides.
4. **Public Verifier:**
   - External employers, foreign university admissions offices, and background checking agencies.
   - Requires no login credentials; can verify certificate validity using the Certificate ID or SHA-256 hash.

### 2.4 Operating Environment
- **Server Platform:** Linux / macOS / Windows server environment running Python 3.12+.
- **Database:** SQLite 3 for local development and demonstration; PostgreSQL 14+ for institutional deployment.
- **Web Browser Support:** Compatible with modern standards-compliant browsers (Google Chrome 110+, Mozilla Firefox 110+, Apple Safari 16+, Microsoft Edge 110+).
- **Responsive Layout:** Optimized for desktop monitors (1920x1080, 1366x768) and mobile viewports (375px minimum width).

### 2.5 Design and Implementation Constraints
1. **Institutional Rules:**
   - Student IDs strictly adhere to the 8-digit alphanumeric PEC format: `YYBBBRRR`.
   - All financial transactions and liabilities must be formatted in Indian Rupees (`₹` / INR).
   - Faculty rotation independence: Staff profiles map to positional titles rather than individual names.
2. **Architecture Pattern Constraint:**
   - The multi-stage approval workflow must implement the **Chain of Responsibility (CoR)** design pattern to enforce prerequisite gating.
3. **Security Constraints:**
   - Passwords must be hashed using salted Bcrypt.
   - All REST API endpoints must authenticate via stateless JSON Web Tokens (JWT).
   - Department signatures must be keyed HMAC-SHA256 seals.

### 2.6 User Documentation
- **In-App Quick Guide:** Built-in modal dialogs explaining gate prerequisites and SLA grievance resolution timelines.
- **Developer & Evaluator README:** Complete installation, configuration, and testing guide.
- **One-Click Persona Switcher:** Demonstration accounts pre-configured in the navigation bar for easy evaluator walkthrough.

### 2.7 Assumptions and Dependencies
1. **Network Connectivity:** Users have active HTTP/HTTPS connectivity to the institutional server.
2. **Server Clock:** The server clock is synchronized via NTP to ensure precise SLA expiration tracking.
3. **Single Active Clearance:** A student can submit only one active clearance request per academic milestone.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- **Student Dashboard:** Displays an interactive 3-gate progress visualizer, itemized department dues cards in INR (`₹`), real-time status badges, grievance filing buttons, and a PDF download button.
- **Staff Review Console:** Department-filtered review table displaying pending student requests, due amount input fields in INR (`₹`), remarks text area, and "Approve & Sign" / "Reject" action buttons.
- **DAA Admin Portal:** Summary metric cards (Total Requests, Cleared, Pending, Escalated Grievances), department bottleneck analysis charts, and one-click override action controls.
- **Public Verification Portal:** Clean, unauthenticated landing page with a search bar accepting Certificate ID or SHA-256 hash and displaying instant verification credentials.

### 3.2 Hardware Interfaces
- **Server Tier:** Standard 64-bit multi-core server (minimum 1 vCPU, 512 MB RAM, 10 GB disk).
- **Client Tier:** Standard desktop workstation, laptop, or mobile smartphone with internet access.

### 3.3 Software Interfaces
- **Backend Framework:** FastAPI (Python 3.12) exposing RESTful JSON endpoints.
- **Persistence Engine:** SQLAlchemy ORM interfacing with SQLite / PostgreSQL.
- **Frontend Framework:** React 19 Single Page Application styled with Tailwind CSS v4 and Lucide Icons.
- **Document Generator:** ReportLab vector graphics engine generating printable institutional PDF certificates.

### 3.4 Communications Interfaces
- **Network Protocol:** HTTP/1.1 and HTTP/2 over TLS 1.3 (HTTPS).
- **Message Format:** Standard JSON (RFC 8259) payload format with UTF-8 character encoding.
- **Authentication Header:** Standard HTTP header `Authorization: Bearer <TOKEN>`.

---

## 4. System Features

### 4.1 Clearance Application Submission (Student Portal)
#### 4.1.1 Description and Priority
Allows PEC students to initiate their digital clearance by selecting their academic milestone.  
**Priority:** High

#### 4.1.2 Stimulus/Response Sequences
1. Student logs in with their PEC credentials and navigates to the Clearance Dashboard.
2. Student selects the reason for clearance (e.g. B.Tech Graduation, 6-Month Industrial Training).
3. Student clicks "Submit Clearance Request".
4. The system validates that no active request exists, instantiates the clearance record with 5 departmental approval gates, and displays the 3-gate visual pipeline.

#### 4.1.3 Functional Requirements
- **[REQ-1]:** The system shall verify that the student has no existing clearance request in `PENDING` status before accepting a new submission.
- **[REQ-2]:** The system shall capture the student's 8-digit SID, current semester, academic session, and justification reason.
- **[REQ-3]:** Upon submission, the system shall automatically instantiate 5 department approval records:
  - Central Library (Gate 1, initialized to `PENDING`)
  - PEC Hostels (Gate 1, initialized to `PENDING`)
  - Gymkhana & Sports (Gate 1, initialized to `PENDING`)
  - Department Labs (Gate 2, initialized to `WAITING_PREREQUISITE`)
  - Accounts Branch (Gate 3, initialized to `WAITING_PREREQUISITE`)

---

### 4.2 Gate 1 Parallel Department Reviews (Library, Hostels, Sports)
#### 4.2.1 Description and Priority
Enables concurrent, non-blocking reviews by the three central campus facilities.  
**Priority:** High

#### 4.2.2 Stimulus/Response Sequences
1. Department staff log in and see student requests in their department review queue.
2. Staff verify physical equipment, books, or hostel room handover.
3. If dues exist, staff enter the due amount in INR (`₹`) and optional remarks, then click "Reject".
4. If records are clear, staff enter 0 dues and click "Approve & Sign".
5. The system signs the approval with an HMAC-SHA256 digital seal and updates the student's pipeline in real time.

#### 4.2.3 Functional Requirements
- **[REQ-4]:** Central Library, Hostels, and Gymkhana shall process approvals independently without waiting for each other.
- **[REQ-5]:** Upon clicking "Approve", the system shall compute an HMAC-SHA256 digital signature:
  ```text
  Digital Signature = HMAC-SHA256(Secret_Key, staff_id + dept_code + request_id + timestamp)
  ```
- **[REQ-6]:** When Library, Hostels, and Gymkhana are all marked `APPROVED`, the system shall automatically unlock Gate 2 (Department Labs) by updating its status from `WAITING_PREREQUISITE` to `PENDING`.

---

### 4.3 Gate 2 Sequential Department Labs Clearance
#### 4.3.1 Description and Priority
Enforces academic and research laboratory sign-off after central facilities have cleared the student.  
**Priority:** High

#### 4.3.2 Stimulus/Response Sequences
1. The Head of Department (HOD) or Lab In-Charge opens their review queue.
2. The system checks if all Gate 1 prerequisites are satisfied.
3. If Gate 1 is incomplete, the system keeps the action disabled with the notice: *"Prerequisite Unmet: Library, Hostel, and Sports must be cleared first."*
4. If Gate 1 is complete, the Lab In-Charge verifies project hardware/workstations and signs the approval.

#### 4.3.3 Functional Requirements
- **[REQ-7]:** The system shall block Gate 2 approvals if any Gate 1 department has not reached `APPROVED` status (unless overridden by the DAA).
- **[REQ-8]:** When Gate 2 is approved, the system shall generate an HMAC-SHA256 digital seal and automatically unlock Gate 3 (Accounts Branch).

---

### 4.4 Gate 3 Accounts Settlement & Caution Money Refund Release
#### 4.4.1 Description and Priority
Reconciles tuition accounts and authorizes the release of the student's refundable institutional Caution Money deposit.  
**Priority:** High

#### 4.4.2 Stimulus/Response Sequences
1. The Accounts Officer inspects student financial ledgers once Gates 1 and 2 are fully approved.
2. The Accounts Officer reconciles all fees, enters final clearance notes, and clicks "Approve & Release Caution Money".
3. The system transitions the overall clearance status to `APPROVED`, mints a Certificate ID, and authorizes the Caution Money refund (₹10,000.00).

#### 4.4.3 Functional Requirements
- **[REQ-9]:** The Accounts Branch handler shall reject approval attempts if Gate 1 or Gate 2 is incomplete.
- **[REQ-10]:** Upon Accounts approval, the system shall record authorization for the release of the student's refundable Caution Money deposit in INR (`₹10,000.00`).
- **[REQ-11]:** Upon Gate 3 approval, the system shall transition the master clearance request to `APPROVED` and generate a unique Certificate ID (`PEC-CLR-YYYY-XXXXX`).

---

### 4.5 Student Grievance Redressal & Dynamic SLA Auto-Escalation
#### 4.5.1 Description and Priority
Empowers students to dispute erroneous dues and automatically alerts the DAA if tickets are not resolved within SLA deadlines.  
**Priority:** High

#### 4.5.2 Stimulus/Response Sequences
1. A student with pending dues clicks "File Grievance" on their dashboard.
2. The student specifies the department, subject, description, priority, and disputed amount in INR (`₹`).
3. The system calculates an exact resolution deadline based on priority.
4. If the deadline passes without resolution, the system automatically marks the ticket as `ESCALATED` and alerts the Dean Academic Affairs.
5. The concerned staff or DAA resolves the ticket with remarks, optionally waiving the disputed dues.

#### 4.5.3 Functional Requirements
- **[REQ-12]:** The system shall compute the resolution deadline immediately upon grievance submission:
  ```text
  Resolution Deadline = Submission_Timestamp + SLA_Window
  - CRITICAL Priority: 4 Hours
  - HIGH Priority:     12 Hours
  - MEDIUM Priority:   24 Hours
  - LOW Priority:      48 Hours
  ```
- **[REQ-13]:** The system shall run an automated evaluation scan. Any ticket where `Current_Time > Resolution_Deadline` and `status == 'OPEN'` shall be marked `is_escalated = True` and status updated to `ESCALATED`.
- **[REQ-14]:** When a grievance is resolved, the resolving official may update the associated department dues, unblocking the clearance pipeline.

---

### 4.6 Dean Academic Affairs (DAA) Overrides & Analytics Dashboard
#### 4.6.1 Description and Priority
Provides high-level administrative oversight and executive override capability to resolve departmental impasses.  
**Priority:** Medium

#### 4.6.2 Stimulus/Response Sequences
1. The DAA logs in and views campus-wide metrics, average departmental turnaround times, and escalated grievances.
2. For students facing administrative deadlocks, the DAA clicks "Administrative Override".
3. The DAA enters an override justification reason.
4. The system overrides the rejection to `APPROVED`, unblocks downstream gates, and logs an `ADMIN_OVERRIDE` event.

#### 4.6.3 Functional Requirements
- **[REQ-15]:** The DAA portal shall display aggregated metrics: total applicants, cleared students, pending reviews, and overdue SLA breaches.
- **[REQ-16]:** The DAA shall have authority to execute an administrative override on any rejected department approval, marking `status = 'APPROVED'` and appending an immutable audit record.

---

### 4.7 Digital Certificate Generation & Public Online Verification
#### 4.7.1 Description and Priority
Emits a tamper-proof PDF clearance certificate and allows instant unauthenticated public verification.  
**Priority:** High

#### 4.7.2 Stimulus/Response Sequences
1. A student with all 5 gates approved clicks "Download Clearance Certificate".
2. The system generates and streams a high-resolution vector PDF bearing the PEC letterhead, student SID, department signatures, and SHA-256 hash.
3. An employer or university visits `/verify`, enters the certificate ID or hash, and views instant authenticity verification.

#### 4.7.3 Functional Requirements
- **[REQ-17]:** The certificate hash shall be computed using SHA-256:
  ```text
  Certificate Hash = SHA-256(cert_id + student_sid + academic_session + completion_timestamp)
  ```
- **[REQ-18]:** The PDF certificate shall display the PEC Chandigarh letterhead, student details, department sign-off table with timestamps, Caution Money refund release notice, and signature blocks for the DAA and DSA.
- **[REQ-19]:** The public endpoint `/api/v1/certificate/verify` shall validate the Certificate ID or hash without requiring user authentication.

---

## 5. Other Nonfunctional Requirements

### 5.1 Performance Requirements
- **[NFR-1]:** Under normal operating load (100 concurrent users), 95% of dashboard read requests shall respond in under 150 milliseconds.
- **[NFR-2]:** Vector PDF certificate generation via ReportLab shall complete in under 1.5 seconds.
- **[NFR-3]:** Automated SLA grievance escalation evaluation shall execute across all active records in under 500 milliseconds.

### 5.2 Safety Requirements
- **[NFR-4]:** All database state mutations (such as approval recording and prerequisite gate unlocking) must execute inside atomic transactions. If any error occurs, the transaction rolls back cleanly with zero data corruption.

### 5.3 Security Requirements
- **[NFR-5]:** User passwords must be hashed using salted Bcrypt (work factor 12) before database insertion.
- **[NFR-6]:** Department approvals must be sealed with HMAC-SHA256. Any manual alteration of database records invalidates the cryptographic signature.
- **[NFR-7]:** Role-based authorization shall prevent students from viewing other students' records or accessing staff review consoles.

### 5.4 Software Quality Attributes
- **Usability:** The web interface shall feature a visual 3-gate progress bar and clear color-coded badges (Green for Approved, Red for Rejected, Yellow for Pending, Grey for Waiting).
- **Reliability:** The system shall maintain 99.5% uptime during semester-end clearance periods.
- **Maintainability:** The backend codebase shall strictly adhere to PEP 8 standards with 0 Flake8 lint violations.
- **Portability:** The application runs seamlessly across macOS, Linux, and Windows platforms.

### 5.5 Business Rules
- **Rule 1 (Prerequisite Order):** Gate 1 (Library, Hostels, Sports) must be fully approved before Gate 2 (Labs) can be reviewed. Gate 2 must be approved before Gate 3 (Accounts) can release clearance.
- **Rule 2 (Caution Money Refund):** Caution Money (₹10,000) can only be released upon final Gate 3 sign-off.
- **Rule 3 (SLA Auto-Escalation):** Any grievance exceeding its priority time window without resolution is automatically escalated to the Dean Academic Affairs.

---

## 6. Other Requirements

### 6.1 Database & Persistence Requirements
- The database schema must maintain referential integrity with foreign key relationships between `users`, `departments`, `clearance_requests`, `department_approvals`, `grievances`, and `audit_logs`.
- All database queries must use parameterized ORM statements to prevent SQL injection vulnerabilities.

### 6.2 Audit Trail Logging
- The system must record an immutable audit log entry for every state-changing transaction, capturing:
  - Unique Log ID
  - User ID of the actor
  - Action performed (e.g. `APPROVAL_SIGNED`, `GRIEVANCE_FILED`, `ADMIN_OVERRIDE`)
  - Target entity type and ID
  - Detailed metadata in JSON format
  - Exact event timestamp

---

## Appendix A: Glossary
- **Approval Gate:** A verification checkpoint corresponding to an institutional campus department.
- **Caution Money:** Refundable security deposit (₹10,000) paid by students at the time of admission to PEC.
- **Chain of Responsibility (CoR):** A behavioral software design pattern where a request is passed along a chain of handlers, each verifying prerequisite conditions.
- **HMAC-SHA256:** Keyed-Hash Message Authentication Code using the SHA-256 hash function.
- **SLA (Service Level Agreement):** The maximum committed timeframe within which an academic grievance must be resolved.
- **Student Identification Number (SID):** An 8-digit unique alphanumeric code assigned to every student enrolled at Punjab Engineering College (e.g., `22103042`).

---

## Appendix B: Analysis Models

### B.1 Three-Gate Clearance Pipeline Flow
```
[Student Submits SID]
         │
         ▼
┌────────────────────────────────────────────────────────┐
│ Gate 1: Concurrent Parallel Reviews                    │
│ ├─ Dr. B.R. Ambedkar Central Library (Books/Fines)     │
│ ├─ PEC Hostels (Shivalik/Kurukshetra/etc. Mess Bills)  │
│ └─ Gymkhana & Sports Complex (Equipment Dues)          │
└────────────────────────────────────────────────────────┘
         │
         ▼ (All Gate 1 Approved?)
┌────────────────────────────────────────────────────────┐
│ Gate 2: Sequential Lab Clearance                       │
│ └─ Departmental Labs (CSE/ECE/Mech Workstations)       │
└────────────────────────────────────────────────────────┘
         │
         ▼ (Gate 2 Approved?)
┌────────────────────────────────────────────────────────┐
│ Gate 3: Final Accounts & Caution Money Release         │
│ └─ Accounts Branch (Tuition Clear + ₹10,000 Refund)    │
└────────────────────────────────────────────────────────┘
         │
         ▼
[Mint Certificate ID + SHA-256 Hash + ReportLab PDF]
```
