# Data Flow Diagrams (DFD) & Data Dictionary
## Academic Grievance, No-Dues & Clearance Automation Engine
**Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh**  
**Submitted by:** Raghav Bhardwaj & Karan Jain (B.Tech Computer Science & Engineering)  
**Submitted to:** Dr. Rajesh Bhatia (Course: Software Engineering)  

---

## 1. Notational Conventions & Symbol Guide

| Symbol Element | Gane & Sarson / Yourdon Notation | Mermaid Representation | Semantic Meaning |
| :--- | :---: | :---: | :--- |
| **External Entity** | Double Square / Rectangle | `Entity["External Entity"]` | Source or destination of data outside system boundaries (e.g., Student, Staff). |
| **Process** | Rounded Rectangle / Circle | `Process(("ID: Process Name"))` | Transforms incoming data flows into outgoing data flows. |
| **Data Store** | Open Rectangle / Parallel Lines | `Store[("DS-ID: Data Store")]` | Repository of persistent data at rest (e.g., relational tables). |
| **Data Flow** | Directed Vector Arrow | `A -- "Data Flow Name" --> B` | Pipeline carrying packetized data elements between entities, processes, and stores. |

### 1.1 Formal DFD Construction Rules & Quality Compliance
This specification adheres strictly to the classic **Yourdon & DeMarco** and **Gane & Sarson** structured systems analysis rules:

| Structured Analysis Rule | Rule Description & Formal Constraint | Compliance Verification in this DFD |
| :--- | :--- | :--- |
| **Rule 1: Conservation of Data** | A process cannot create data out of nothing ("Miracle") nor consume data without producing output ("Black Hole"). | Every process (`1.0` through `6.0` and `2.1`..`5.4`) transforms identifiable inputs into outputs. |
| **Rule 2: Entity-to-Entity Forbidden** | External entities cannot communicate directly within the DFD boundary without passing through a process. | Verified: All student, staff, and admin interactions pass through numbered processes. |
| **Rule 3: Store-to-Store Forbidden** | Data cannot move directly from one data store to another without process manipulation. | Verified: Table updates (e.g. `DS-4` to `DS-3`) are mediated by processes `3.0`, `5.1`, and `5.2`. |
| **Rule 4: Entity-to-Store Forbidden** | External entities cannot directly read or write to data stores without an intervening process. | Verified: All persistence calls are strictly routed through processes `1.0`, `2.0`, `3.0`, `4.0`. |
| **Rule 5: Balancing Rule (Horizontal & Vertical)** | Inputs and outputs of a parent process at Level $N$ must exactly match the aggregate boundary flows at Level $N+1$. | Verified: Level 0 external flows balance with Level 1, and Level 1 processes balance with Level 2. |
| **Rule 6: Unique Hierarchical Numbering** | Every process is uniquely identified using hierarchical decimal notation (`0.0` $\rightarrow$ `1.0`..`6.0` $\rightarrow$ `2.1`..`2.4`). | Verified: Clear hierarchical numbering applied across all levels. |

---

## 2. DFD Level 0: Context Analysis Diagram

The Level 0 Context Diagram establishes the highest-level operational boundary of the Clearance Engine within the Punjab Engineering College ecosystem. It identifies the four primary external entities interacting with the central clearance processing environment:

```mermaid
flowchart TD
    %% External Entities
    Student["PEC Student (SID: YYBBBRRR)"]
    Staff["PEC Positional Staff (Library, Hostel, Sports, Labs, Accounts)"]
    Admin["Dean Academic Affairs (DAA / Admin)"]
    Verifier["Public Certificate Verifier (Employer / University / Visa)"]

    %% Central Process
    System(("0.0: PEC Clearance, No-Dues & Grievance Engine"))

    %% Data Stores
    DB[("Institutional Database (Clearance, Approvals, Grievances, Logs)")]

    %% Student Data Flows
    Student -- "Clearance Application (SID, Milestone, Reason)" --> System
    Student -- "Grievance Filing (Dept, Priority, Disputed ₹)" --> System
    System -- "Live Pipeline Status & INR Dues Breakdown" --> Student
    System -- "Tamper-Proof PDF Clearance Certificate" --> Student

    %% Staff Data Flows
    Staff -- "Due Inspection & Sign-off Decision (APPROVED/REJECTED, ₹ Dues)" --> System
    Staff -- "Grievance Resolution & Notes" --> System
    System -- "Pending Clearance Review Queue" --> Staff
    System -- "Departmental Grievance Escalation Alerts" --> Staff

    %% Admin (DAA) Data Flows
    Admin -- "Executive Overrides (ADMIN_OVERRIDE, Reason)" --> System
    Admin -- "SLA & Bottleneck Threshold Configurations" --> System
    System -- "Institutional Performance Analytics & Overdue SLA Reports" --> Admin
    System -- "Cryptographic Tamper-Audit Trail" --> Admin

    %% Public Verifier Data Flows
    Verifier -- "Verification Query (Certificate ID / SHA-256 Hash)" --> System
    System -- "Authenticity Status, Student SID & Issue Timestamp" --> Verifier

    %% System to Store Flows
    System <--> DB
```

---

## 3. DFD Level 1: System Decomposition Diagram

The Level 1 DFD decomposes the top-level process `0.0` into six modular, cohesive functional processes governing authentication, clearance workflow, liability assessment, grievance arbitration, cryptographic certification, and audit synchronization:

```mermaid
flowchart TD
    %% External Entities
    Student["PEC Student"]
    Staff["Positional Staff"]
    Admin["Dean Academic Affairs"]
    Verifier["Public Verifier"]

    %% Data Stores
    DS1[("DS-1: Users & Personas")]
    DS2[("DS-2: Departments")]
    DS3[("DS-3: Clearance Requests")]
    DS4[("DS-4: Department Approvals & HMAC Seals")]
    DS5[("DS-5: Grievances & SLA Timers")]
    DS6[("DS-6: System Audit Log")]

    %% Sub-processes
    P1(("1.0: Authentication & Role Resolution"))
    P2(("2.0: Clearance Request & Workflow Initialization"))
    P3(("3.0: Departmental Liability Review & Digital Signing"))
    P4(("4.0: Grievance Redressal & SLA Escalation Monitoring"))
    P5(("5.0: Cryptographic Certificate Minting & Verification"))
    P6(("6.0: Audit Trail & Concurrency Synchronization"))

    %% Process 1.0 Flows
    Student -- "Credentials (@pec.edu.in)" --> P1
    Staff -- "Positional Credentials" --> P1
    Admin -- "Administrative Credentials" --> P1
    P1 <--> DS1
    P1 -- "Authenticated Bearer Token & Persona Scope" --> Student
    P1 -- "Authenticated Session" --> Staff
    P1 -- "Authenticated Session" --> Admin

    %% Process 2.0 Flows
    Student -- "Apply Clearance (SID, Milestone)" --> P2
    P2 --> DS3
    P2 --> DS4
    P2 -- "Initialize Gate 1 (Pending) & Gates 2-3 (Waiting)" --> DS4
    P2 --> P6

    %% Process 3.0 Flows
    Staff -- "Review Decision (Approve/Reject, INR Dues)" --> P3
    Admin -- "Executive Override Decision" --> P3
    P3 <--> DS4
    P3 <--> DS3
    P3 -- "Mint HMAC-SHA256 Digital Seal" --> DS4
    P3 --> P6

    %% Process 4.0 Flows
    Student -- "Submit Grievance (Priority, Dept, Disputed ₹)" --> P4
    Staff -- "Resolve Grievance (Waive/Update ₹)" --> P4
    P4 <--> DS5
    P4 -- "SLA Breach Notification" --> Admin
    P4 --> P6

    %% Process 5.0 Flows
    DS4 -- "All 5 Gates APPROVED" --> P5
    P5 --> DS3
    P5 -- "Store SHA-256 Hash & Cert ID" --> DS3
    P5 -- "Download Verifiable PDF" --> Student
    Verifier -- "Query Hash / ID" --> P5
    P5 -- "Authenticity Verification Result" --> Verifier

    %% Process 6.0 Flows
    P6 --> DS6
    Admin -- "Query Audit Logs & Analytics" --> P6
    P6 -- "Aggregated Metrics & Bottleneck Reports" --> Admin
```

---

## 4. DFD Level 2: Sub-Process Decompositions

### 4.1 Process 2.0 Decomposition: Clearance Gating & Chain of Responsibility
This diagram isolates how departmental clearance requests flow across the three sequential and parallel validation gates:

```mermaid
flowchart TD
    %% Input
    App["Student Clearance Application"]
    DS3[("DS-3: Clearance Requests")]
    DS4[("DS-4: Department Approvals")]
    DS6[("DS-6: System Audit Log")]

    %% Sub-processes
    P21(("2.1: Intake & Validation"))
    P22(("2.2: Gate 1 Parallel Dispatcher"))
    P23(("2.3: Gate 2 Prerequisite Barrier"))
    P24(("2.4: Gate 3 Financial & Caution Reconciler"))

    %% Data Flows
    App --> P21
    P21 -- "Validate SID & Active Request Check" --> DS3
    P21 -- "Spawn 5 Department Approvals" --> DS4
    P21 --> P22

    P22 -- "Dispatch Concurrent Gate 1: Library, Hostel, Sports" --> DS4
    
    DS4 -- "Check Gate 1 Approvals (Lib, Host, Sports == APPROVED?)" --> P23
    P23 -- "Prerequisites Satisfied -> Unlock Gate 2 (Dept Labs)" --> DS4
    P23 -- "Prerequisites Incomplete -> Hold Labs WAITING" --> DS4

    DS4 -- "Check Gates 1 & 2 Approvals == APPROVED?" --> P24
    P24 -- "Prerequisites Satisfied -> Unlock Gate 3 (Accounts)" --> DS4
    P24 -- "Release Caution Money (₹10,000) & Authorize Certificate" --> DS3
    P24 --> DS6
```

### 4.2 Process 4.0 Decomposition: Grievance Redressal & SLA Escalation Engine
This diagram details the priority-based SLA calculation, automatic timer evaluation, and DAA escalation workflow:

```mermaid
flowchart TD
    %% Inputs & Entities
    GrievanceForm["Grievance Submission"]
    StaffAction["Positional Staff Resolution"]
    DAAAction["DAA Intervention"]
    Clock["System Timer / Cron Tick"]

    %% Data Stores
    DS5[("DS-5: Grievances")]
    DS4[("DS-4: Department Approvals")]
    DS6[("DS-6: Audit Log")]

    %% Sub-processes
    P41(("4.1: Grievance Intake & Priority SLA Tagging"))
    P42(("4.2: Real-time SLA Timer & Breach Detector"))
    P43(("4.3: Dispute Arbitration & Dues Settlement"))

    %% Flows
    GrievanceForm --> P41
    P41 -- "Compute Deadline (Submission + SLA Hours)" --> DS5
    
    Clock --> P42
    DS5 -- "Evaluate: now > deadline && status == OPEN" --> P42
    P42 -- "Update: is_escalated = True, status = ESCALATED" --> DS5
    P42 -- "Log SLA Breach Event" --> DS6
    P42 -- "Push Alert to DAA Dashboard" --> DAAAction

    StaffAction --> P43
    DAAAction --> P43
    P43 -- "Update Grievance Status: RESOLVED" --> DS5
    P43 -- "Adjust / Waive Department Dues in INR" --> DS4
    P43 -- "Append Resolution Audit Entry" --> DS6
```

### 4.3 Process 5.0 Decomposition: Cryptographic Certificate Minting & Public Verification
This diagram details the generation of HMAC digital signatures, SHA-256 certificate hashing, and unauthenticated public verification:

```mermaid
flowchart TD
    %% Inputs & Entities
    DS4[("DS-4: Department Approvals")]
    DS3[("DS-3: Clearance Requests")]
    Verifier["Public Verifier"]
    Student["Student"]

    %% Sub-processes
    P51(("5.1: HMAC-SHA256 Digital Seal Aggregator"))
    P52(("5.2: SHA-256 Digest Minting Engine"))
    P53(("5.3: ReportLab Vector PDF Renderer"))
    P54(("5.4: Public Tokenless Verification Engine"))

    %% Flows
    DS4 -- "Read 5 Department Seals & Timestamps" --> P51
    P51 -- "Verify Cryptographic Seal Chain" --> P52
    P52 -- "Compute SHA-256(Cert_ID || SID || Timestamp)" --> DS3
    
    DS3 -- "Fetch Validated Clearance Record" --> P53
    P53 -- "Render Official PDF with DAA & DSA Seals" --> Student

    Verifier -- "Submit Certificate Hash or ID" --> P54
    P54 <--> DS3
    P54 -- "Return Validity, SID, Name & Clearance Date" --> Verifier
```

---

## 5. Comprehensive Data Dictionary

### 5.1 Data Store Schemas (Data at Rest)

#### `DS-1`: Users & Personas (`users` table)
| Field Name | Type | Key | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer | PK | Unique user record surrogate key | `1` |
| `email` | String(120) | Unique | Institutional PEC email address | `alice@pec.edu.in` |
| `full_name` | String(120) | - | Student or Positional Staff Name | `Alice Sharma` / `Chief Warden (Hostels)` |
| `role` | String(20) | - | Role scope (`STUDENT`, `STAFF`, `ADMIN`) | `STUDENT` |
| `sid` | String(20) | Nullable | 8-digit PEC Student Identification Number | `22103042` |
| `department_code` | String(20) | Nullable | Assigned department for staff | `HOSTEL` |
| `is_active` | Boolean | - | Account active status flag | `True` |

#### `DS-2`: Departments (`departments` table)
| Field Name | Type | Key | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer | PK | Department record identifier | `2` |
| `code` | String(20) | Unique | Institutional department code | `HOSTEL` |
| `name` | String(120) | - | Official facility designation | `PEC Hostels (Shivalik/Kurukshetra/etc.)` |
| `head_title` | String(120) | - | Permanent administrative title | `Chief Warden (Hostels)` |
| `gate_number` | Integer | - | Pipeline gate assignment (`1`, `2`, or `3`) | `1` |

#### `DS-3`: Clearance Requests (`clearance_requests` table)
| Field Name | Type | Key | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer | PK | Clearance request identifier | `1` |
| `student_id` | Integer | FK | References `users.id` | `1` |
| `academic_year` | String(20) | - | Academic session | `Final Academic Session` |
| `semester` | Integer | - | Current enrolled semester | `8` |
| `reason` | String(120) | - | Clearance justification | `B.Tech Final Degree Graduation` |
| `status` | String(30) | - | Overall status (`PENDING`, `APPROVED`, `REJECTED`) | `APPROVED` |
| `certificate_id` | String(50) | Unique | Minted institutional certificate number | `PEC-CLR-YYYY-XXXXX` |
| `certificate_hash`| String(64) | Unique | Cryptographic SHA-256 certificate digest | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

#### `DS-4`: Department Approvals (`department_approvals` table)
| Field Name | Type | Key | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer | PK | Approval gate record key | `1` |
| `request_id` | Integer | FK | References `clearance_requests.id` | `1` |
| `department_id` | Integer | FK | References `departments.id` | `2` |
| `status` | String(30) | - | `WAITING_PREREQUISITE`, `PENDING`, `APPROVED`, `REJECTED` | `APPROVED` |
| `due_amount` | Float | - | Outstanding department liability in INR (`₹`) | `3500.0` |
| `remarks` | Text | - | Positional reviewer notes | `Shivalik Mess Dues Reconciled` |
| `digital_signature`| String(128)| - | Cryptographic HMAC-SHA256 signature seal | `a8f9c1d2e3b4a5...` |
| `signed_at` | DateTime | - | Timestamp of cryptographic signing | `[Verification Timestamp]` |

#### `DS-5`: Grievances (`grievances` table)
| Field Name | Type | Key | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer | PK | Grievance ticket identifier | `1` |
| `student_id` | Integer | FK | References `users.id` | `1` |
| `department_id` | Integer | FK | References `departments.id` | `2` |
| `subject` | String(200) | - | Concise grievance description | `Incorrect Mess Dues for Internship Term` |
| `priority` | String(20) | - | SLA Priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) | `HIGH` |
| `disputed_amount`| Float | - | Contested liability in INR (`₹`) | `3500.0` |
| `status` | String(20) | - | `OPEN`, `RESOLVED`, `REJECTED`, `ESCALATED` | `ESCALATED` |
| `sla_deadline` | DateTime | - | Dynamic computed resolution deadline | `[Calculated SLA Deadline]` |
| `is_escalated` | Boolean | - | Flag indicating DAA SLA breach escalation | `True` |

#### `DS-6`: Audit Log (`audit_logs` table)
| Field Name | Type | Key | Description | Example |
| :--- | :--- | :---: | :--- | :--- |
| `id` | Integer | PK | Sequential audit event identifier | `101` |
| `user_id` | Integer | FK | Actor responsible for the state mutation | `4` |
| `action` | String(50) | - | Standard action verb | `APPROVAL_SIGNED`, `ADMIN_OVERRIDE` |
| `entity_type` | String(50) | - | Target domain entity | `ClearanceRequest`, `Grievance` |
| `details` | Text | - | JSON-encoded mutation metadata | `{"dept": "HOSTEL", "status": "APPROVED"}` |
| `timestamp` | DateTime | - | UTC/IST creation timestamp | `[Transaction Timestamp]` |

---

### 5.2 Core Data Element Dictionary (Data in Motion)

1. **`SID` (Student Identification Number):**
   - **Type:** String (8 characters alphanumeric).
   - **Format:** `YYBBBRRR` where `YY` is enrollment year, `BBB` is academic branch code (`103` = CSE), and `RRR` is roll index.
   - **Scope:** Immutable institutional identifier.
2. **`due_amount_inr` (Financial Liability):**
   - **Type:** Floating Point (formatted as Indian numbering `en-IN` in user interface).
   - **Currency:** Indian Rupee (`₹`).
   - **Allowable Range:** `0.00` to `500,000.00`.
3. **`digital_signature` (HMAC Seal):**
   - **Type:** Hexadecimal string (64 characters).
   - **Algorithm:** `HMAC-SHA256(Institutional_Key, staff_id + dept_code + request_id + timestamp)`
4. **`certificate_hash` (Verification Digest):**
   - **Type:** Hexadecimal string (64 characters).
   - **Algorithm:** `SHA-256(cert_id + student_sid + academic_session + completion_timestamp)`
5. **`sla_priority`:**
   - **Type:** Enumeration (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
   - **Turnaround Window:** `CRITICAL` -> 4 Hours, `HIGH` -> 12 Hours, `MEDIUM` -> 24 Hours, `LOW` -> 48 Hours.
