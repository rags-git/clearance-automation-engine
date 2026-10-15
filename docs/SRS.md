# Software Requirements Specification (SRS)
## Academic Grievance, No-Dues & Clearance Automation Engine
**Institution:** Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh - 160012  
**Document Identifier:** PEC-SE-SRS-FROZEN  
**Standard Compliance:** IEEE Std 830-1998 (Recommended Practice for Software Requirements Specifications)  
**Baseline Version:** 3.0.0 (FROZEN ARCHITECTURAL BASELINE)  
**Administrative Authority:** Office of the Dean Academic Affairs (DAA), PEC Chandigarh  
**Classification:** Institutional Standard Specification  
**Status:** FROZEN & RATIFIED (Implementation-Agnostic Baseline)  

---

### Baseline Freeze Declaration & Change Control Policy
> **NOTICE OF BASELINE FREEZE:**  
> This specification defines the immutable architectural, functional, data, and behavioral contracts for the PEC Academic Grievance, No-Dues & Clearance Automation Engine. All functional boundaries, mathematical formulas, state transitions, security constraints, and data definitions in this document are **FROZEN**.  
>  
> Any future implementation-level modifications—including UI component updates, styling alterations, backend database driver migrations (e.g., SQLite to PostgreSQL), or API transport optimizations—are explicitly encapsulated within the interface abstractions defined herein and **shall not invalidate or alter this SRS, the system DFDs, or the UML structural and behavioral models**.

---

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) is to establish the formal, complete, and verifiable requirements for the **Academic Grievance, No-Dues & Clearance Automation Engine** deployed at **Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh**.

This document serves as the contractual baseline between institutional stakeholders (Students, Department In-Charges, Dean Academic Affairs, and Finance Branch) and the software engineering team, governing the digital transformation of institutional clearance workflows.

### 1.2 Scope of the System
The system automates the multi-department no-dues clearance and grievance arbitration workflows across the Sector 12 campus:
1. **Identity & Positional Authority Resolution:** Authentication of PEC students using unique 8-digit Student Identification Numbers (SIDs, e.g., `22103042`) and department authorities via permanent administrative titles (*Dean Academic Affairs*, *Chief Warden Hostels*, *Librarian*, *President Gymkhana*, *HOD Computing & Labs*, *Accounts Officer*).
2. **Multi-Gate Approval Pipeline (Chain of Responsibility):**
   - **Gate 1 (Concurrent / Parallel):** Dr. B.R. Ambedkar Central Library, PEC Hostels (Shivalik, Kurukshetra, Himalaya, Aravali, Vindhya, Kalpana Chawla), and Gymkhana & Sports Complex.
   - **Gate 2 (Sequential / Prerequisite Barrier):** Departmental Academic and Research Laboratories (CSE, ECE, Mechanical, Electrical, Civil, Aerospace, Metallurgy, Production).
   - **Gate 3 (Terminal Financial Settlement):** Accounts & Finance Branch for semester fee reconciliation and Caution Money security deposit refund release.
3. **Cryptographic Validation & Digital Seals:** Keyed-Hash Message Authentication Code ($\text{HMAC-SHA256}$) seals per departmental sign-off and SHA-256 integrity digests for issued clearance certificates.
4. **SLA-Driven Grievance Arbitration:** Formal dispute submission with priority tiers (Critical, High, Medium, Low) and automated escalation to the Dean Academic Affairs upon SLA deadline breach.
5. **Public Verification Gateway:** Unauthenticated public portal enabling employers, universities, and visa authorities to independently verify certificate authenticity.

### 1.3 Definitions, Acronyms, and Abbreviations
- **PEC:** Punjab Engineering College (Deemed to be University), Chandigarh.
- **SID:** Student Identification Number (8-digit unique institutional identifier, format: `YYBBBRRR`, e.g., `22103042`).
- **DAA:** Dean Academic Affairs, Punjab Engineering College.
- **DSA:** Dean Student Affairs, Punjab Engineering College.
- **Central Library:** Dr. B.R. Ambedkar Central Library, PEC Sector 12 campus.
- **Hostel Council:** Administrative body governing PEC student residences (Shivalik, Kurukshetra, Himalaya, Aravali, Vindhya, KCH).
- **Gymkhana:** PEC Sports Complex, Gymnasium, Grounds, and Swimming Pool facility.
- **Caution Money:** Refundable institutional security deposit collected at admission and reimbursed at Gate 3.
- **CoR:** Chain of Responsibility Behavioral Design Pattern (GoF).
- **SLA:** Service Level Agreement governing maximum turnaround times for student grievance disputes.
- **HMAC:** Keyed-Hash Message Authentication Code (RFC 2104 / FIPS PUB 198-1).
- **INR / ₹:** Indian Rupee, the official monetary unit of the institution.

### 1.4 References
- IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
- FIPS PUB 180-4: *Secure Hash Standard (SHS)*, National Institute of Standards and Technology.
- RFC 2104: *HMAC: Keyed-Hashing for Message Authentication*.
- RFC 7519: *JSON Web Token (JWT)*.
- PEC Academic Ordinances & Regulations for B.Tech., M.Tech., and Ph.D. Degree Programs.
- UGC / AICTE Guidelines on Transparent Digital Grievance Redressal in Higher Educational Institutions.

### 1.5 Overview of the Document
The remainder of this document is organized according to the IEEE Std 830-1998 standard structure:
- **Section 2 (Overall Description):** Presents product perspective, context diagrams, major system functions, user personas, institutional constraints, and operational dependencies.
- **Section 3 (Specific Requirements):** Formally specifies external interface requirements, functional requirements organized into six discrete modules (`FR-1.1` to `FR-6.3`), performance benchmarks, design constraints, software quality attributes, and architectural invariants.
- **Section 4 (Appendix):** Provides the formal IEEE Std 830-1998 Quality and Verification Matrix.

---

## 2. Overall Description

### 2.1 Product Perspective
The Clearance Automation Engine serves as the core operational platform mediating between graduating students, academic departments, and the Dean Academic Affairs (DAA) administration:

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

### 2.2 Product Functions (High-Level Summary)
The platform delivers six major functional capabilities:
1. **Role-Based Authentication & Session Scoping:** Validates institutional credentials and issues scoped JWT bearer tokens.
2. **Clearance Request Gating:** Instantiates multi-gate approval chains enforcing parallel and sequential dependencies.
3. **Cryptographic Sign-Off & Verification:** Generates HMAC-SHA256 seals per department review and SHA-256 certificate digests.
4. **Administrative Overrides:** Empowers the DAA to resolve department impasses with mandatory immutable audit logging.
5. **Grievance Redressal & SLA Escalation:** Tracks student appeals with automated timer expiration and escalation alerting.
6. **Certificate Minting & Verification:** Emits print-ready ReportLab vector PDFs and exposes unauthenticated public verification.

### 2.3 User Classes & Characteristics
1. **PEC Student Persona:**
   - Identified by an 8-digit PEC SID (`22103042`) and `@pec.edu.in` email.
   - Authorized to initiate one active clearance request per academic milestone.
   - Monitors live gate progress and departmental liabilities in INR (`₹`).
   - May submit formal priority-ranked grievances.
2. **Positional Staff Persona:**
   - Permanent administrative titles (*Librarian*, *Chief Warden*, *Gymkhana President*, *HOD Labs*, *Accounts Officer*).
   - Verifies physical asset returns, records departmental dues in INR (`₹`), and generates cryptographic digital seals.
   - Evaluates and settles student grievances.
3. **Dean Academic Affairs (DAA / Admin Persona):**
   - Executive institutional authority with full read-write oversight across all departments.
   - Authorized to execute administrative overrides (`ADMIN_OVERRIDE`) to unblock disputed approvals.
   - Monitors SLA compliance analytics and department bottlenecks.
4. **Public Verifier Persona:**
   - Third-party entities (employers, foreign universities, background check agencies).
   - Requires zero authentication credentials to validate certificate integrity via SHA-256 digests.

### 2.4 General Constraints
1. **Institutional Data Rules:**
   - Student IDs must adhere strictly to the 8-digit alphanumeric PEC format: `YYBBBRRR`.
   - All financial dues, fees, and caution deposit refunds must be denominated in Indian Rupees (`₹` / INR).
   - Staff credentials map to institutional positional titles rather than personal faculty names.
2. **Pipeline Ordering Invariants:**
   - Gate 2 (Department Labs) cannot unlock until all Gate 1 departments are `APPROVED`.
   - Gate 3 (Accounts) cannot unlock until Gates 1 and 2 are fully `APPROVED`.
   - Degree clearance certificates cannot be issued unless all 5 departmental gates reach `APPROVED` status.

### 2.5 Assumptions & Dependencies
1. **Institutional Network Availability:** The system operates over standard TCP/IP networking with HTTPS/TLS 1.3 connectivity.
2. **Server Time Synchronization:** System servers maintain Network Time Protocol (NTP) synchronization to ensure accurate SLA deadline computations.
3. **Client Capability:** Client browsers support ECMAScript 2022+ and modern HTML5 canvas/SVG rendering.

---

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces
- **Student Dashboard:** Responsive Single Page Application (SPA) displaying the 3-gate visual pipeline, itemized liabilities in INR (`₹`), grievance dispute forms, and clearance certificate downloads.
- **Department Staff Console:** Department-filtered review queue enabling liability verification, dues input in INR (`₹`), resolution notes, and one-click cryptographic HMAC signing.
- **Dean Academic Affairs (DAA) Portal:** Executive analytics dashboard displaying institutional bottleneck metrics, overdue SLA breach alerts, student rosters, and administrative override controls.
- **Public Certificate Verification Interface:** Tokenless, unauthenticated web form accepting a certificate ID or SHA-256 hash and rendering instant verification credentials.

#### 3.1.2 Hardware Interfaces
- **Server Tier:** Architecture-neutral x86-64 / ARM64 execution environment (minimum 1 vCPU, 512 MB RAM).
- **Client Tier:** Standard desktop workstation or mobile device browser with display resolution $\ge 375\times 667 \text{ px}$.

#### 3.1.3 Software Interfaces
- **Operating System:** Platform independent (macOS, Linux / POSIX, Windows).
- **Application Server Gateway:** ASGI-compliant HTTP server (Uvicorn / FastAPI).
- **Database Engine Interface:** SQL-standard Relational Database Management System (SQLite3 embedded / PostgreSQL 14+) interfaced via SQLAlchemy Object-Relational Mapping (ORM).
- **Cryptographic Subsystem:** FIPS-compliant SHA-256 and HMAC-SHA256 hashing primitives.
- **Document Rendering Subsystem:** ReportLab vector graphics engine for high-resolution PDF certificate generation.

#### 3.1.4 Communications Interfaces
- **Network Protocol:** HTTP/1.1 and HTTP/2 over TLS 1.3 (HTTPS).
- **Data Exchange Format:** JavaScript Object Notation (JSON, RFC 8259) with UTF-8 character encoding.
- **Authorization Header:** Standard HTTP `Authorization: Bearer <JWT_TOKEN>` for stateless session validation.

---

### 3.2 Functional Requirements (System Features)

#### 3.2.1 Module 1: Authentication & Identity Management
- **FR-1.1 [Institutional Credential Verification]:** The system shall authenticate users using institutional credentials. Passwords shall be hashed using salted one-way hashing algorithms (Bcrypt).
- **FR-1.2 [Role & Scope Enforcement]:** The system shall enforce role-based access control (RBAC) across three principal scopes: `STUDENT`, `STAFF`, and `ADMIN`.
- **FR-1.3 [Positional Designation Binding]:** Staff profiles shall be bound to institutional department codes (`LIBRARY`, `HOSTEL`, `SPORTS`, `LABS`, `ACCOUNTS`) and permanent positional titles rather than personal identities.

#### 3.2.2 Module 2: Clearance Request Lifecycle
- **FR-2.1 [Single Active Clearance Constraint]:** A student may possess at most one active clearance request in `PENDING` status at any given time.
- **FR-2.2 [Milestone Justification Recording]:** The clearance request must record the academic milestone:
  - B.Tech Final Degree Graduation
  - Mandatory 6-Month Industrial Training / Internship (Semester 7/8)
  - M.Tech / Ph.D. Thesis Submission
  - Program Withdrawal / Caution Money Settlement
- **FR-2.3 [Automated Approval Gate Spawning]:** Upon creation of a clearance request, the system shall instantiate exactly five departmental clearance records:
  - `LIBRARY` (Gate 1, initialized to `PENDING`)
  - `HOSTEL` (Gate 1, initialized to `PENDING`)
  - `SPORTS` (Gate 1, initialized to `PENDING`)
  - `LABS` (Gate 2, initialized to `WAITING_PREREQUISITE`)
  - `ACCOUNTS` (Gate 3, initialized to `WAITING_PREREQUISITE`)

#### 3.2.3 Module 3: Chain of Responsibility (CoR) Approval Gating
- **FR-3.1 [Gate 1 Concurrent Evaluation]:** The Library, Hostel, and Sports Complex handlers shall evaluate and update clearance statuses concurrently and independently.
- **FR-3.2 [Gate 2 Prerequisite Enforcement]:** The Departmental Labs handler shall reject approval attempts if any Gate 1 department status is not `APPROVED`, unless an explicit `ADMIN_OVERRIDE` has been executed by the DAA.
- **FR-3.3 [Gate 3 Financial & Caution Money Settlement]:** The Accounts handler shall reject approval attempts if Gate 1 or Gate 2 is incomplete. Upon approval, Accounts reconciles institutional fees and authorizes the release of the student's Caution Money deposit.
- **FR-3.4 [Digital Signature Generation]:** Upon approving any gate, the handler shall compute a keyed digital signature seal:
  $$\text{Seal} = \text{HMAC-SHA256}\Big(K_{\text{secret}}, \;\text{staff\_id} \parallel \text{dept\_code} \parallel \text{request\_id} \parallel \text{timestamp}\Big)$$
- **FR-3.5 [Terminal Status Propagation]:** When Gate 3 reaches `APPROVED`, the master clearance request status shall transition to `APPROVED`, and the system shall automatically mint a unique Certificate ID (`PEC-CLR-YYYY-XXXXX`) and an immutable SHA-256 certificate hash.

#### 3.2.4 Module 4: Administrative Authority & Concurrency Control
- **FR-4.1 [Executive Override Authority]:** The Dean Academic Affairs (Admin) shall have authority to override any departmental rejection, transitioning the gate to `APPROVED` with an audit flag `ADMIN_OVERRIDE`.
- **FR-4.2 [Atomic Gate Recalculation]:** All prerequisite checks and gate unlocking transitions shall execute within serialized database transactions to prevent race conditions during concurrent staff reviews.
- **FR-4.3 [Audit Trail Immutability]:** Every approval, rejection, due modification, grievance resolution, and override shall append an immutable record to the institutional audit log containing timestamp, actor ID, action type, and JSON metadata.

#### 3.2.5 Module 5: Grievance Arbitration & Dynamic SLA Escalation
- **FR-5.1 [Grievance Filing]:** A student may lodge a formal grievance against any department reporting outstanding dues, specifying subject, description, priority, and disputed amount in INR (`₹`).
- **FR-5.2 [Dynamic SLA Computation]:** The system shall compute an exact resolution deadline upon grievance registration based on priority:
  $$\text{Deadline} = \text{Timestamp}_{\text{submission}} + \Delta t_{\text{priority}}$$
  - `CRITICAL`: $\Delta t = 4 \text{ hours}$
  - `HIGH`: $\Delta t = 12 \text{ hours}$
  - `MEDIUM`: $\Delta t = 24 \text{ hours}$
  - `LOW`: $\Delta t = 48 \text{ hours}$
- **FR-5.3 [Automated DAA Escalation Engine]:** The system shall evaluate pending grievances against the current timestamp. Any grievance where $\text{Current Time} > \text{Deadline}$ with status `OPEN` shall transition to `ESCALATED`, setting `is_escalated = True` and notifying the Dean Academic Affairs dashboard.
- **FR-5.4 [Grievance Resolution]:** The concerned department in-charge or DAA may resolve a grievance with resolution notes, optionally updating or waiving the associated dues.

#### 3.2.6 Module 6: Certificate Generation & Public Verification
- **FR-6.1 [Cryptographic Hash Calculation]:** The certificate hash shall be computed as:
  $$\text{Hash}_{\text{cert}} = \text{SHA-256}\Big(\text{cert\_id} \parallel \text{student\_sid} \parallel \text{academic\_year} \parallel \text{completion\_timestamp}\Big)$$
- **FR-6.2 [Official PDF Certificate Rendering]:** The system shall dynamically generate a print-ready vector PDF document bearing:
  - Official Punjab Engineering College header, crest, and Sector 12 address.
  - Student details (Full Name, 8-digit SID, Academic Program, Branch).
  - Departmental clearance breakdown with timestamps and positional titles.
  - Caution Money refund confirmation in INR (`₹`).
  - Cryptographic verification SHA-256 hash.
  - Signature blocks for Dean Academic Affairs (DAA) and Dean Student Affairs (DSA).
- **FR-6.3 [Public Hash Verification]:** The system shall provide a public REST endpoint `/api/v1/certificate/verify` accepting `certificate_id` or `certificate_hash`. It shall return verification status, student name, SID, issuance date, and validity confirmation without requiring user authentication.

---

### 3.3 Performance Requirements
- **NFR-1.1 [API Latency]:** Under normal operating load (100 concurrent requests), 95% of read queries shall respond within $\le 150 \text{ ms}$, and 95% of state modification transactions shall complete within $\le 300 \text{ ms}$.
- **NFR-1.2 [Certificate Rendering Throughput]:** Dynamic vector PDF generation shall complete in $\le 1.5 \text{ seconds}$.
- **NFR-1.3 [SLA Evaluation Execution]:** The automated SLA escalation scan shall complete evaluation across all active tickets in $\le 500 \text{ ms}$.

### 3.4 Design Constraints
- **NFR-2.1 [Database Agnosticism]:** Persistence logic must use SQLAlchemy ORM abstractions without raw dialect-specific SQL, allowing transparent switching between SQLite3 and PostgreSQL.
- **NFR-2.2 [Zero External Authentication Dependencies]:** The system shall maintain self-contained JWT authentication without external SSO dependencies.
- **NFR-2.3 [Input Sanitization & Injection Prevention]:** All database operations must be executed through parameterized ORM statements to eliminate SQL injection vulnerabilities.

### 3.5 Software System Attributes

#### 3.5.1 Security Requirements
- **NFR-3.1 [Token-Based Authentication]:** API communication shall be authenticated via cryptographically signed JWT bearer tokens with expiration limits.
- **NFR-3.2 [Cryptographic Signatures]:** Departmental seals must use HMAC-SHA256 with a private institutional server key. Any tampering with stored approval records shall invalidate the digital signature.
- **NFR-3.3 [Role-Based Access Isolation]:** Students cannot query or mutate records belonging to other students; staff members can only review approvals matching their assigned department.

#### 3.5.2 Concurrency & Idempotency Requirements
- **NFR-4.1 [Concurrent Approval Consistency]:** Concurrent approvals by Gate 1 departments (Hostel, Library, Sports) shall execute idempotently without deadlocks or lost updates.
- **NFR-4.2 [Client-Side Synchronization]:** Client dashboards shall synchronize with the server state within an interval of $\le 10 \text{ seconds}$ to reflect cross-user updates.

#### 3.5.3 Reliability & Availability
- **NFR-5.1 [Fault Isolation]:** Failure in one departmental workflow (e.g., temporary unavailability of Sports staff) shall not block independent operations in other Gate 1 departments.
- **NFR-5.2 [Transactional Integrity]:** Clearance request status updates and gate prerequisite unlocks shall be atomic (all-or-nothing transactions).

#### 3.5.4 Maintainability & Extensibility
- **NFR-6.1 [Design Pattern Enforcement]:** The approval pipeline must adhere to the Chain of Responsibility pattern, allowing new approval gates to be inserted by extending `DepartmentHandler`.
- **NFR-6.2 [Static Code Quality Standards]:** The backend codebase shall maintain 0 violations under PEP 8 / Flake8 static analysis.

---

### 3.6 Architectural & System Invariants (Frozen Boundaries)

The following architectural invariants are **strictly frozen** and shall remain unchanged across any code refactoring or feature additions:
1. **Three-Gate Structural Topology:** The 3-gate progression ($\text{Gate 1 [Parallel]} \rightarrow \text{Gate 2 [Labs]} \rightarrow \text{Gate 3 [Accounts]}$) is invariant.
2. **Positional Staff Designations:** System roles shall remain role-based and positional (DAA, Chief Warden, Librarian, Gymkhana President, HOD Labs, Accounts Officer).
3. **Monetary Unit of Account:** The system's base currency is Indian Rupees (`₹` / INR).
4. **Institutional Identifier:** Student identification is bound to the 8-digit PEC SID format (`YYBBBRRR`).
5. **Cryptographic Validation Contract:** Certificate verification relies on SHA-256 digest comparison against immutable stored approval records.

---

## 4. Appendix: IEEE Std 830-1998 Quality & Verification Matrix

This specification conforms strictly to the **IEEE Std 830-1998** standard quality requirements for well-formed software specifications:

| IEEE 830 Quality Attribute | Specification Fulfillment | Section Reference | Verification Method |
| :--- | :--- | :--- | :--- |
| **1. Correctness** | Every stated requirement corresponds directly to institutional regulations of Punjab Engineering College (Sector 12, Chandigarh). | Sections 1.2, 3.2 | Stakeholder Review |
| **2. Unambiguity** | Every functional requirement possesses an explicit, unique identifier (`FR-X.Y`) with quantifiable inputs, outputs, and mathematical formulas. | Section 3.2 | Traceability Matrix |
| **3. Completeness** | Covers all institutional clearance departments, fee reconciliation, SLA grievance tracking, and cryptographic certificate minting. | Sections 2.1, 3.2 | Requirement Coverage |
| **4. Consistency** | Gate progression constraints, actor permissions, and state transitions are mathematically non-contradictory across all modules. | Sections 3.2, 3.6 | Formal Model / UML State |
| **5. Ranked for Importance / Stability** | Core 3-gate pipeline and cryptographic seals are designated as **Essential & Frozen Invariants**; analytics and export tools are supportive. | Section 3.6 | Priority Classification |
| **6. Verifiability** | Every functional and non-functional requirement is objectively testable via automated unit tests, static analysis, or end-to-end API calls. | Sections 3.2, 3.3 | Automated Test Suite (11/11 Passed) |
| **7. Modifiability** | Organized hierarchically into decoupled modules, allowing implementation adjustments without altering requirements contracts. | Sections 3.1 - 3.2 | Modular Structure |
| **8. Traceability** | Forward and backward traceability maintained from user personas $\rightarrow$ functional requirements $\rightarrow$ DFD processes $\rightarrow$ UML classes. | Sections 2.3, 3.2 | Traceability Matrix |
