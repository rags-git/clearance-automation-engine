# Software Requirements Specification (SRS)
## Academic Grievance, No-Dues & Clearance Automation Engine
**Institution:** Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh - 160012  
**Document Identifier:** PEC-SE-SRS-2026-FROZEN  
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
This document establishes the official and complete software requirements specification for the **Academic Grievance, No-Dues & Clearance Automation Engine** deployed at **Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh**. 

The system replaces manual paper-based clearance circulars with an automated, workflow-driven, cryptographically secured clearance engine governing student clearance across central campus facilities, departmental academic laboratories, and the finance branch.

### 1.2 Scope of the System
The system encompasses the following functional domains:
1. **Identity & Positional Authority Resolution:** Authentication of PEC students via immutable 8-digit Student Identification Numbers (SIDs, e.g., `22103042`) and department officials via permanent administrative designations (e.g., *Dean Academic Affairs*, *Chief Warden Hostels*, *Librarian*, *President Gymkhana*, *HOD Computing & Labs*, *Accounts Officer*).
2. **Multi-Gate Clearance Workflow Engine:** Enforcement of a 3-tier clearance pipeline using the Chain of Responsibility design pattern:
   - **Gate 1 (Concurrent / Parallel):** Dr. B.R. Ambedkar Central Library, PEC Hostels (Shivalik, Kurukshetra, Himalaya, Aravali, Vindhya, Kalpana Chawla), and Gymkhana & Sports Complex.
   - **Gate 2 (Sequential / Prerequisite-Enforced):** Departmental Computing and Research Laboratories (CSE, ECE, Mechanical, Electrical, Civil, Aerospace, Metallurgy, Production).
   - **Gate 3 (Terminal Settlement & Refund Release):** Accounts & Finance Branch for tuition reconciliation and refundable Caution Money release.
3. **Cryptographic Integrity & Digital Seals:** Departmental approvals sealed with Keyed-Hash Message Authentication Codes ($\text{HMAC-SHA256}$); issued certificates sealed with cryptographic digest hashes ($\text{SHA-256}$).
4. **SLA-Driven Grievance Arbitration:** Dynamic service level agreement calculation with priority queues and automated escalation to the Dean Academic Affairs upon deadline breach.
5. **Public Verification & Tamper Evidence:** Public, unauthenticated verification gateway for employers, higher education institutions, and visa authorities to validate certificate authenticity.

### 1.3 Definitions, Acronyms, and Abbreviations
- **PEC:** Punjab Engineering College (Deemed to be University), Chandigarh.
- **SID:** Student Identification Number (8-digit institutional alphanumeric code, format: `YYBBBRRR`, e.g., `22103042`).
- **DAA:** Dean Academic Affairs, Punjab Engineering College.
- **DSA:** Dean Student Affairs, Punjab Engineering College.
- **Central Library:** Dr. B.R. Ambedkar Central Library, PEC Sector 12 campus.
- **Hostel Council:** Administrative body governing PEC residences (Shivalik, Kurukshetra, Himalaya, Aravali, Vindhya, KCH).
- **Gymkhana:** PEC Sports Complex, Gymnasium, Grounds, and Swimming Pool facility.
- **Caution Money:** Refundable institutional deposit collected upon admission, reconciled and released at Gate 3.
- **CoR:** Chain of Responsibility Behavioral Design Pattern.
- **SLA:** Service Level Agreement governing grievance dispute resolution timelines.
- **HMAC:** Keyed-Hash Message Authentication Code (RFC 2104).
- **INR / ₹:** Indian Rupee, the sole monetary currency of the institution.

### 1.4 References
- IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
- FIPS PUB 180-4: *Secure Hash Standard (SHS)*, National Institute of Standards and Technology.
- RFC 2104: *HMAC: Keyed-Hashing for Message Authentication*.
- PEC Academic Ordinances & Regulations for B.Tech., M.Tech., and Ph.D. Degree Programs (2022-2026).
- UGC / AICTE Guidelines on Transparent Digital Grievance Redressal in Higher Educational Institutions.

### 1.5 IEEE Std 830-1998 Quality & Compliance Matrix
This document conforms strictly to the **IEEE Std 830-1998** standard requirements for well-formed software specifications:

| IEEE 830 Quality Attribute | Specification Fulfillment | Section Reference |
| :--- | :--- | :--- |
| **1. Correctness** | Every stated requirement corresponds directly to institutional regulations of Punjab Engineering College (Sector 12, Chandigarh). | Sections 1.2, 3.2 |
| **2. Unambiguity** | Every functional requirement possesses an explicit, unique identifier (`FR-X.Y`) with quantifiable inputs, outputs, and mathematical formulas. | Section 3.2 |
| **3. Completeness** | Covers all institutional clearance departments, fee reconciliation, SLA grievance tracking, and cryptographic certificate minting. | Sections 2.1, 3.2 |
| **4. Consistency** | Gate progression constraints, actor permissions, and state transitions are mathematically non-contradictory across all modules. | Sections 3.2, 5 |
| **5. Ranked for Importance / Stability** | Core 3-gate pipeline and cryptographic seals are designated as **Essential & Frozen Invariants**; analytics and export tools are supportive. | Section 5 |
| **6. Verifiability** | Every functional and non-functional requirement is objectively testable via automated unit tests, static analysis, or end-to-end API calls. | Section 4, Test Suite |
| **7. Modifiability** | Organized hierarchically into decoupled modules, allowing implementation adjustments without altering requirements contracts. | Sections 3.1 - 3.2 |
| **8. Traceability** | Forward and backward traceability maintained from user personas $\rightarrow$ functional requirements $\rightarrow$ DFD processes $\rightarrow$ UML classes. | Sections 2.2, 3.2 |

---

## 2. Overall Description

### 2.1 Product Perspective & Context
The system serves as the institutional clearance and no-dues operating core. It integrates student records, departmental liability registries, and financial reconciliation ledgers into an event-driven workflow engine:

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

### 2.2 User Personas & Characteristics
1. **Student Persona:**
   - Possesses a valid 8-digit PEC SID (`22103042`) and `@pec.edu.in` credentials.
   - Capable of creating a single active clearance request per academic milestone.
   - Views live gate status, outstanding departmental liabilities in INR (`₹`), and signs off on fee settlements.
   - May file priority-ranked grievances contesting erroneous dues.
2. **Department Positional In-Charge Persona:**
   - Permanent administrative designation (not tied to transient personal names).
   - Responsible for verifying physical asset returns and financial dues within their department.
   - Executes cryptographic digital signing upon clearance approval.
   - Possesses authority to record outstanding dues in INR (`₹`) or resolve contested grievances.
3. **Dean Academic Affairs (DAA / Admin Persona):**
   - Highest academic administrative authority at PEC Chandigarh.
   - Possesses read-write visibility across all departments and students.
   - Authorized to execute administrative overrides (`ADMIN_OVERRIDE`) to unblock disputed approvals with mandatory audit logging.
   - Monitors SLA escalation dashboards and institutional performance analytics.
4. **Public Verifier Persona:**
   - External entities (employers, university admissions offices, verification agencies).
   - Requires zero login credentials.
   - Validates official certificates using the immutable SHA-256 digital certificate hash.

### 2.3 General Constraints
1. **Institution-Specific Data Constraints:**
   - Student IDs strictly follow the 8-digit PEC format: `YYBBBRRR` (e.g., `22` = Batch 2022, `103` = Computer Science, `042` = Roll index).
   - Institutional currency is strictly Indian Rupees (`₹` / INR).
   - Staff accounts represent institutional designations, ensuring multi-year stability regardless of faculty rotation.
2. **Regulatory & Architectural Constraints:**
   - Gate 2 (Department Labs) cannot unlock until all Gate 1 departments are `APPROVED`.
   - Gate 3 (Accounts) cannot unlock until Gates 1 and 2 are fully `APPROVED`.
   - A clearance certificate can only be minted if all 5 constituent department gates are `APPROVED`.
   - Every approval must contain an HMAC-SHA256 digital signature seal generated with an institutional server secret.

## 3. Specific Requirements

### 3.1 External Interface Requirements

#### 3.1.1 User Interfaces
- **Student Dashboard:** Responsive Single Page Application (SPA) displaying live gate progression across Gate 1 (Library, Hostels, Sports), Gate 2 (Labs), and Gate 3 (Accounts), itemized liabilities in INR (`₹`), and grievance filing modals.
- **Department Staff Console:** Department-filtered review queue enabling liability verification, dues input in INR (`₹`), resolution notes, and one-click cryptographic HMAC signing.
- **Dean Academic Affairs (DAA) Portal:** Executive analytics dashboard displaying institutional bottleneck metrics, overdue SLA breach alerts, student rosters, and administrative override controls.
- **Public Certificate Verification Interface:** Tokenless, unauthenticated web form accepting a certificate ID or SHA-256 hash and rendering instant verification credentials.

#### 3.1.2 Hardware Interfaces
- **Server Tier:** Architecture-neutral x86-64 / ARM64 execution environment (minimum 1 vCPU, 512 MB RAM).
- **Client Tier:** Standard computing workstation or mobile browser supporting ECMAScript 2022+ and HTML5 Canvas.

#### 3.1.3 Software Interfaces
- **Operating System:** Platform independent (macOS, Linux / POSIX, Windows).
- **Application Server Gateway:** ASGI-compliant HTTP server (Uvicorn / FastAPI).
- **Database Engine Interface:** SQL-standard Relational Database Management System (SQLite3 embedded / PostgreSQL 14+) interfaced via SQLAlchemy Object-Relational Mapping (ORM).
- **Cryptographic Subsystem:** Cryptographic hashing libraries providing FIPS-compliant SHA-256 and HMAC-SHA256 primitives.
- **Document Rendering Subsystem:** ReportLab vector graphics engine for PDF generation.

#### 3.1.4 Communications Interfaces
- **Network Protocol:** HTTP/1.1 and HTTP/2 over TLS 1.3 (HTTPS).
- **Data Exchange Format:** JavaScript Object Notation (JSON, RFC 8259) with UTF-8 character encoding.
- **Authorization Header:** HTTP `Authorization: Bearer <JWT_TOKEN>` standard header for stateless session validation.

---

### 3.2 Functional Requirements (System Features)

#### Module 1: Authentication & Identity Management
- **FR-1.1 [Institutional Credential Verification]:** The system shall authenticate users using secure credentials. Passwords shall be hashed using salted one-way hashing algorithms (Bcrypt).
- **FR-1.2 [Role & Scope Enforcement]:** The system shall enforce role-based access control (RBAC) across three principal scopes: `STUDENT`, `STAFF`, and `ADMIN`.
- **FR-1.3 [Positional Designation Binding]:** Staff profiles shall be bound to institutional department codes (`LIBRARY`, `HOSTEL`, `SPORTS`, `LABS`, `ACCOUNTS`) and positional titles rather than personal identities.

### Module 2: Clearance Request Lifecycle
- **FR-2.1 [Single Active Clearance Constraint]:** A student may have at most one clearance request in `PENDING` status at any given time.
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

### Module 3: Chain of Responsibility (CoR) Approval Gating
- **FR-3.1 [Gate 1 Concurrent Evaluation]:** The Library, Hostel, and Sports Complex handlers shall evaluate and update clearance statuses concurrently and independently.
- **FR-3.2 [Gate 2 Prerequisite Enforcement]:** The Departmental Labs handler shall reject approval attempts if any Gate 1 department status is not `APPROVED`, unless an explicit `ADMIN_OVERRIDE` has been executed by the DAA.
- **FR-3.3 [Gate 3 Financial & Caution Money Settlement]:** The Accounts handler shall reject approval attempts if Gate 1 or Gate 2 is incomplete. Upon approval, Accounts reconciles institutional fees and authorizes the release of the student's Caution Money deposit.
- **FR-3.4 [Digital Signature Generation]:** Upon approving any gate, the handler shall compute a keyed digital signature seal:
  $$\text{Seal} = \text{HMAC-SHA256}\Big(K_{\text{secret}}, \;\text{staff\_id} \parallel \text{dept\_code} \parallel \text{request\_id} \parallel \text{timestamp}\Big)$$
- **FR-3.5 [Terminal Status Propagation]:** When Gate 3 reaches `APPROVED`, the master clearance request status shall transition to `APPROVED`, and the system shall automatically mint a unique Certificate ID (`PEC-CLR-YYYY-XXXXX`) and an immutable SHA-256 certificate hash.

### Module 4: Administrative Authority & Concurrency Control
- **FR-4.1 [Executive Override Authority]:** The Dean Academic Affairs (Admin) shall have authority to override any departmental rejection, transitioning the gate to `APPROVED` with an audit flag `ADMIN_OVERRIDE`.
- **FR-4.2 [Atomic Gate Recalculation]:** All prerequisite checks and gate unlocking transitions shall execute within serialized database transactions to prevent race conditions during concurrent staff reviews.
- **FR-4.3 [Audit Trail Immutability]:** Every approval, rejection, due modification, grievance resolution, and override shall append an immutable record to the institutional audit log containing timestamp, actor ID, action type, and JSON metadata.

### Module 5: Grievance Arbitration & SLA Escalation
- **FR-5.1 [Grievance Filing]:** A student may lodge a formal grievance against any department reporting outstanding dues, specifying subject, description, priority, and disputed amount in INR (`₹`).
- **FR-5.2 [Dynamic SLA Computation]:** The system shall compute an exact resolution deadline upon grievance registration based on priority:
  $$\text{Deadline} = \text{Timestamp}_{\text{submission}} + \Delta t_{\text{priority}}$$
  - `CRITICAL`: $\Delta t = 4 \text{ hours}$
  - `HIGH`: $\Delta t = 12 \text{ hours}$
  - `MEDIUM`: $\Delta t = 24 \text{ hours}$
  - `LOW`: $\Delta t = 48 \text{ hours}$
- **FR-5.3 [Automated DAA Escalation Engine]:** The system shall evaluate pending grievances against the current timestamp. Any grievance where $\text{Current Time} > \text{Deadline}$ with status `OPEN` shall transition to `ESCALATED`, setting `is_escalated = True` and notifying the Dean Academic Affairs dashboard.
- **FR-5.4 [Grievance Resolution]:** The concerned department in-charge or DAA may resolve a grievance with resolution notes, optionally updating or waiving the associated dues.

### Module 6: Certificate Generation & Public Verification
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

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance Requirements
- **NFR-1.1 [API Latency]:** Under normal operating load (100 concurrent requests), 95% of read queries shall respond within $\le 150 \text{ ms}$, and 95% of state modification transactions shall complete within $\le 300 \text{ ms}$.
- **NFR-1.2 [Certificate Rendering Throughput]:** Dynamic vector PDF generation shall complete in $\le 1.5 \text{ seconds}$.
- **NFR-1.3 [SLA Evaluation Execution]:** The automated SLA escalation scan shall complete evaluation across all active tickets in $\le 500 \text{ ms}$.

### 4.2 Security & Integrity Requirements
- **NFR-2.1 [Token-Based Authentication]:** API communication shall be authenticated via cryptographically signed JWT bearer tokens with expiration limits.
- **NFR-2.2 [Cryptographic Signatures]:** Departmental seals must use HMAC-SHA256 with a private institutional server key. Any tampering with stored approval records shall invalidate the digital signature.
- **NFR-2.3 [Input Sanitization & Injection Prevention]:** All database operations must be executed through parameterized ORM statements to eliminate SQL injection vulnerabilities.

### 4.3 Concurrency & Idempotency Requirements
- **NFR-3.1 [Concurrent Approval Consistency]:** Concurrent approvals by Gate 1 departments (Hostel, Library, Sports) shall execute idempotently without deadlocks or lost updates.
- **NFR-3.2 [Client-Side Synchronization]:** Client dashboards shall synchronize with the server state within an interval of $\le 10 \text{ seconds}$ to reflect cross-user updates.

### 4.4 Reliability & Maintainability
- **NFR-4.1 [Fault Isolation]:** Failure in one departmental workflow (e.g., temporary unavailability of Sports staff) shall not block independent operations in other Gate 1 departments.
- **NFR-4.2 [Implementation Independence]:** Architectural contracts between frontend clients, workflow handlers, and data stores shall be decoupled via RESTful interfaces, allowing database engine swapping (SQLite $\rightarrow$ PostgreSQL) with zero changes to business logic.

---

## 5. Architectural & System Boundaries (Frozen Invariants)

The following architectural invariants are **strictly frozen** and shall remain unchanged across any code refactoring or feature additions:
1. **Three-Gate Structural Topology:** The 3-gate progression ($\text{Gate 1 [Parallel]} \rightarrow \text{Gate 2 [Labs]} \rightarrow \text{Gate 3 [Accounts]}$) is invariant.
2. **Positional Staff Designations:** System roles shall remain role-based and positional (DAA, Chief Warden, Librarian, Gymkhana President, HOD Labs, Accounts Officer).
3. **Monetary Unit of Account:** The system's base currency is Indian Rupees (`₹` / INR).
4. **Institutional Identifier:** Student identification is bound to the 8-digit PEC SID format (`YYBBBRRR`).
5. **Cryptographic Validation Contract:** Certificate verification relies on SHA-256 digest comparison against immutable stored approval records.
