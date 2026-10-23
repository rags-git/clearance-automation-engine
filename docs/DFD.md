# Data Flow Diagrams (DFD)
## Academic Grievance, No-Dues & Clearance Automation Engine

**Institution:** Punjab Engineering College (Deemed to be University), Chandigarh  
**Course:** Software Engineering  
**Supervisor:** Dr. Rajesh Bhatia  
**Authors:** Raghav Bhardwaj & Karan Jain (B.Tech CSE, Batch 2022–2026)  
**Notation:** Yourdon / De Marco — Circles = Processes, Rectangles = External Entities, Open Boxes = Data Stores  

---

## 1. DFD Level 0 — Context Diagram

The Level 0 Context Diagram treats the entire system as a **single process bubble** and maps every interaction between the system and the four external entities on campus.

```mermaid
flowchart TD
    classDef entity fill:#dbeafe,stroke:#1e40af,stroke-width:2.5px,color:#1e3a5f,font-size:13px,font-weight:bold
    classDef system fill:#fef9c3,stroke:#92400e,stroke-width:3px,color:#78350f,font-size:14px,font-weight:bold

    STUDENT["STUDENT\n(PEC Degree Candidate)"]:::entity
    STAFF["POSITIONAL STAFF\n(Library · Hostels · Sports\nLabs · Accounts)"]:::entity
    DAA["DEAN ACADEMIC AFFAIRS\n(Executive Admin / DAA)"]:::entity
    VERIFIER["PUBLIC VERIFIER\n(Employer / University)"]:::entity

    SYS(("PEC CLEARANCE<br/>AUTOMATION<br/>ENGINE")):::system

    STUDENT -->|"Clearance Application\n+ Grievance Filing"| SYS
    SYS -->|"Pipeline Status\n+ PDF Certificate"| STUDENT

    STAFF -->|"Approval Sign-off\n+ Dues (₹) Recorded"| SYS
    SYS -->|"Department Review Queue\n+ Grievance Worklist"| STAFF

    DAA -->|"Executive Override\n+ SLA Triggers"| SYS
    SYS -->|"Analytics, SLA Alerts\n+ Audit Reports"| DAA

    VERIFIER -->|"Certificate ID / SHA-256 Hash"| SYS
    SYS -->|"Authenticity Record\n+ HMAC Seals"| VERIFIER
```

### Level 0 Explanation

| External Entity | Role | What It Sends In | What It Receives Out |
|:---|:---|:---|:---|
| **Student** | Final-year student seeking clearance | Login details, clearance application, grievance complaints | Live clearance status, official PDF certificate |
| **Positional Staff** | Officials from Library, Hostels, Sports, Labs, and Accounts | Department approvals/rejections and any pending fine amounts (₹) | List of students waiting for review, grievance tickets to resolve |
| **Dean Academic Affairs** | Head administrator overlooking campus clearances | Special approval override commands, grievance checks | Overall college clearance reports, alerts for delayed grievances |
| **Public Verifier** | Outside company, university, or background checker | Student Certificate ID or QR/Hash code | Instant online confirmation whether certificate is genuine |

---

## 2. DFD Level 1 — System Decomposition

The Level 1 DFD decomposes the single engine bubble into **six functional processes** connected by data flows and six persistent data stores.

```mermaid
flowchart LR
    classDef entity  fill:#dbeafe,stroke:#1e40af,stroke-width:2px,color:#1e3a5f,font-size:12px,font-weight:bold
    classDef process fill:#f3e8ff,stroke:#6d28d9,stroke-width:2px,color:#3b0764,font-size:11.5px,font-weight:bold
    classDef store   fill:#dcfce7,stroke:#166534,stroke-width:2px,color:#14532d,font-size:11.5px,font-weight:bold

    %% ── External Entities (left column)
    E_STU["STUDENT"]:::entity
    E_STA["POSITIONAL\nSTAFF"]:::entity
    E_DAA["DEAN ACADEMIC\nAFFAIRS"]:::entity
    E_VER["PUBLIC\nVERIFIER"]:::entity

    %% ── Processes (centre column)
    P1(("P1<br/>Authentication<br/>& RBAC")):::process
    P2(("P2<br/>Clearance<br/>Setup")):::process
    P3(("P3<br/>Multi-Gate<br/>Review & HMAC")):::process
    P4(("P4<br/>Grievance<br/>& SLA")):::process
    P5(("P5<br/>Certificate<br/>Minting")):::process
    P6(("P6<br/>Analytics<br/>& Audit")):::process

    %% ── Data Stores (right column)
    DS1[("DS-1\nUsers & Roles")]:::store
    DS2[("DS-2\nCampus Depts")]:::store
    DS3[("DS-3\nClearances")]:::store
    DS4[("DS-4\nApprovals & Dues")]:::store
    DS5[("DS-5\nGrievances & SLA")]:::store
    DS6[("DS-6\nAudit Logs")]:::store

    %% ── Entity → Process flows
    E_STU -->|"Credentials"| P1
    E_STU -->|"Apply for Clearance"| P2
    E_STU -->|"File Grievance"| P4
    E_STA -->|"Review Decision + Dues"| P3
    E_STA -->|"Resolve Ticket"| P4
    E_DAA -->|"Executive Override"| P3
    E_DAA -->|"Trigger SLA Scan"| P4
    E_VER -->|"Verify Query"| P5

    %% ── Process → Entity flows
    P1 -->|"JWT Token"| E_STU
    P5 -->|"PDF Certificate"| E_STU
    P3 -->|"Queue + Worklist"| E_STA
    P4 -->|"SLA Alerts"| E_DAA
    P6 -->|"Analytics & Logs"| E_DAA
    P5 -->|"Authenticity Record"| E_VER

    %% ── Process ↔ Data Store flows
    P1 <-->|"Verify Credentials"| DS1
    P2 <-->|"Read Dept Config"| DS2
    P2 -->|"Create Clearance Record"| DS3
    P2 -->|"Init 5 Gate Rows"| DS4
    P3 <-->|"Update Gate Status & HMAC"| DS4
    P3 <-->|"Update Master Status"| DS3
    P4 <-->|"Read/Write Tickets"| DS5
    P4 -->|"Adjust Dues"| DS4
    P5 <-->|"Check 5 HMAC Seals"| DS4
    P5 <-->|"Mint Certificate ID"| DS3
    P6 <-->|"Append Audit Events"| DS6
```

### Process Descriptions

| Process | Name | Description |
|:---:|:---|:---|
| **P1** | User Login & Access Control | Checks student and staff passwords securely; issues a secure digital login token with their role (Student, Staff, or Admin). |
| **P2** | Clearance Application Setup | Lets a student submit one active clearance application; creates the application record and sets up the 5 department checklist rows. |
| **P3** | Multi-Gate Department Review | Sends applications through Gate 1 (Library, Hostels, Sports), Gate 2 (Labs), and Gate 3 (Accounts) in order; saves digital signatures when approved. |
| **P4** | Grievance & Helpdesk Engine | Helps students file complaints if fines or rejections are wrong; sets a resolution deadline and alerts the Dean if delayed. |
| **P5** | Certificate Generation & Verification | Confirms all 5 departments approved; approves release of ₹10,000 caution money refund; generates the final downloadable PDF certificate. |
| **P6** | Reports & Activity Audit Log | Keeps a tamper-proof record of every action (approvals, logins, overrides) and calculates campus clearance statistics for the Dean. |

### Data Store Descriptions

| Store | Table | Description |
|:---:|:---|:---|
| **DS-1** | `users` | User accounts, encrypted passwords, roles (Student, Staff, Admin), and student roll numbers. |
| **DS-2** | `departments` | List of college departments (Library, Hostel, Sports, Labs, Accounts) and their gate order. |
| **DS-3** | `clearance_requests` | Master clearance records with overall status (Pending, Approved, Rejected) and certificate details. |
| **DS-4** | `department_approvals` | Approval status for each department, unpaid dues/fines in ₹, and digital approval seals. |
| **DS-5** | `grievances` | Student complaint tickets, priority levels, resolution deadlines, and staff responses. |
| **DS-6** | `audit_logs` | Security history log recording who did what action, to which record, and at what exact time. |

---

## 3. Core Decision Tree — Multi-Gate Clearance Pipeline

The Decision Tree traces the **deterministic gate-by-gate path** from a student's initial application to the final Clearance Certificate, capturing every branch condition enforced by the Chain of Responsibility engine.

```mermaid
flowchart TD
    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f,font-size:12px,font-weight:bold
    classDef action   fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#3b0764,font-size:12px
    classDef terminal fill:#d1fae5,stroke:#065f46,stroke-width:2.5px,color:#064e3b,font-size:12px,font-weight:bold
    classDef reject   fill:#fee2e2,stroke:#b91c1c,stroke-width:2px,color:#7f1d1d,font-size:12px

    START([" Student submits\nClearance Application "]):::terminal

    START --> INIT["P2 initialises clearance\nGate 1 → PENDING × 3\nGate 2 & Gate 3 → WAITING"]:::action

    INIT --> G1{"Gate 1 Complete?\nLibrary + Hostel + Sports"}:::decision

    G1 -->|"Any still\nPENDING"| WAIT1["Hold — await\nremaining sign-offs"]:::action
    WAIT1 --> G1

    G1 -->|"Any REJECTED\n(Dues > ₹0)"| DAA1{"DAA\nOverride?"}:::decision
    DAA1 -->|"No"| PAY1["Student pays dues\nor files Grievance → P4"]:::action
    PAY1 --> G1
    DAA1 -->|"Yes"| OVR1["DAA marks dept APPROVED\nAudit log: ADMIN_OVERRIDE"]:::action
    OVR1 --> G1

    G1 -->|"All 3 → APPROVED\nHMAC Seals Minted"| UNLOCK2["P3 auto-advances\nGate 2 Labs: WAITING → PENDING"]:::action

    UNLOCK2 --> G2{"Gate 2 Complete?\nDepartment Labs"}:::decision

    G2 -->|"Rejected — equipment\nmissing / undamaged"| DAA2{"DAA\nOverride?"}:::decision
    DAA2 -->|"No"| PAY2["Student replaces equipment\nor files Grievance → P4"]:::action
    PAY2 --> G2
    DAA2 -->|"Yes"| OVR2["DAA marks Labs APPROVED\nAudit log: ADMIN_OVERRIDE"]:::action
    OVR2 --> G2

    G2 -->|"Labs APPROVED\nHMAC Seal Minted"| UNLOCK3["P3 auto-advances\nGate 3 Accounts: WAITING → PENDING"]:::action

    UNLOCK3 --> G3{"Gate 3 Complete?\nAccounts Branch"}:::decision

    G3 -->|"Rejected — dues\nunpaid"| HOLD["₹10,000 Caution Money\nheld in escrow\nStudent settles or files Grievance"]:::reject
    HOLD --> G3

    G3 -->|"Accounts APPROVED\nHMAC Seal Minted"| CERT["P5 validates all 5 HMAC seals\nReleases ₹10,000 Caution Money\nMints Certificate ID: PEC-CLR-YYYY-XXXXX\nComputes SHA-256 Public Digest"]:::action

    CERT --> DONE([" Official Clearance\nCertificate Issued\n(PDF + Verification Hash) "]):::terminal
```

### Decision Tree Explanation

The three-gate pipeline enforces **strict sequential dependency barriers**:

- **Gate 1 — Parallel Departmental Stage:** Library, Hostels, and Sports departments operate concurrently. Any rejection blocks further pipeline advancement and routes the student to either pay dues or file a formal grievance (handled by Process 4). The Dean Academic Affairs (DAA) holds an executive override authority at every gate for cases of administrative error or approved waivers, with a mandatory audit trail entry recorded in DS-6.

- **Gate 2 — Academic Labs Stage:** Automatically unlocked only when all three Gate 1 facilities are `APPROVED`. The HOD of Department Labs verifies equipment returns; approval seals the record with an HMAC-SHA256 signature. Any rejection loops back unless overridden by the DAA.

- **Gate 3 — Accounts & Certification Stage:** Automatically unlocked only after Gate 2 is `APPROVED`. The Accounts Branch reconciles all outstanding institutional dues. Upon approval, the ₹10,000 Caution Money deposit is released, Process 5 validates all five HMAC seals, and the system generates the unique Certificate ID and public SHA-256 verification digest — producing the official, tamper-evident PDF clearance certificate.
