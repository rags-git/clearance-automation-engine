# Unified Modeling Language (UML) Structural & Behavioral Models
## Academic Grievance, No-Dues & Clearance Automation Engine
**Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh**  
**Submitted by:** Raghav Bhardwaj & Karan Jain  
**Submitted to:** Dr. Rajesh Bhatia (Course: Software Engineering)  

---

## 1. Use Case Model & Diagram

### 1.1 Actors & Role Boundaries
- **Student Actor:** Registered PEC student identified by an 8-digit SID (e.g., `22103042`).
- **Positional Staff Actor:** Departmental authority operating under permanent institutional designations (*Librarian*, *Chief Warden*, *Gymkhana President*, *HOD Labs*, *Accounts Officer*).
- **Dean Academic Affairs (DAA / Admin Actor):** Executive authority holding override privileges and institutional audit oversight.
- **Public Certificate Verifier Actor:** External unauthenticated party validating clearance credentials.

### 1.2 Use Case Diagram
```mermaid
flowchart LR
    %% Actors
    subgraph Actors ["Institutional Actors"]
        Student((PEC Student\nSID: YYBBBRRR))
        Staff((Positional Staff\nDept In-Charge))
        Admin((Dean Academic\nAffairs - DAA))
        Verifier((Public Certificate\nVerifier))
    end

    %% System Boundary
    subgraph System ["PEC Academic Clearance & Grievance Engine"]
        UC1([UC-1: Authenticate with PEC Credentials])
        UC2([UC-2: Apply for Institutional Clearance])
        UC3([UC-3: Track Real-time Gate Pipeline & INR Liabilities])
        UC4([UC-4: File Departmental Grievance])
        UC5([UC-5: Download Verifiable PDF Clearance Certificate])
        
        UC6([UC-6: Review Student Asset Records & Dues])
        UC7([UC-7: Sign Clearance with HMAC-SHA256 Seal])
        UC8([UC-8: Arbitrate Grievance & Adjust Dues])
        
        UC9([UC-9: Execute Administrative Override])
        UC10([UC-10: Monitor Institutional Bottlenecks & SLA Breaches])
        UC11([UC-11: Inspect Immutable Audit Logs])

        UC12([UC-12: Verify Public Certificate Hash & Authenticity])
    end

    %% Student Relationships
    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5

    %% Staff Relationships
    Staff --> UC1
    Staff --> UC6
    Staff --> UC7
    Staff --> UC8

    %% Admin Relationships
    Admin --> UC1
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11

    %% Verifier Relationships
    Verifier --> UC12

    %% Includes & Extends
    UC2 -. "<<include>>" .-> UC1
    UC7 -. "<<include>>" .-> UC6
    UC9 -. "<<extend>>" .-> UC7
    UC5 -. "<<include>>" .-> UC12
```

---

## 2. Static Structural Model: Class Diagram

The static structural architecture of the system is divided into two focused, high-contrast class diagrams to ensure maximum visual clarity and readability:
1. **Core Domain Entity Model** (relational data models, attributes, methods, associations, and multiplicities)
2. **Behavioral Chain of Responsibility & Services Model** (handler hierarchy, gate verification, and service orchestration)

### 2.1 Core Domain Entity Class Diagram

```mermaid
classDiagram
    direction TB

    class User {
        +int id
        +string email
        +string full_name
        +string role
        +string sid
        +string department_code
        +bool is_active
        +datetime created_at
        +verify_password(plain: string) bool
    }

    class Department {
        +int id
        +string code
        +string name
        +string head_title
        +int gate_number
        +datetime created_at
    }

    class ClearanceRequest {
        +int id
        +int student_id
        +string academic_year
        +int semester
        +string status
        +string certificate_id
        +string certificate_hash
        +datetime completion_date
        +datetime created_at
    }

    class DepartmentApproval {
        +int id
        +int request_id
        +int department_id
        +string status
        +float due_amount
        +string remarks
        +string digital_signature
        +datetime signed_at
    }

    class Grievance {
        +int id
        +int student_id
        +int department_id
        +int clearance_request_id
        +string subject
        +string priority
        +float disputed_amount
        +string status
        +datetime sla_deadline
        +bool is_escalated
        +datetime resolved_at
    }

    class AuditLog {
        +int id
        +int user_id
        +string action
        +string entity_type
        +int entity_id
        +string details
        +datetime timestamp
    }

    %% Entity Relationships & Multiplicities
    User "1" --> "0..*" ClearanceRequest : submits
    User "1" --> "0..*" DepartmentApproval : signs
    User "1" --> "0..*" Grievance : files
    User "1" --> "0..*" AuditLog : triggers

    ClearanceRequest "1" *-- "5" DepartmentApproval : contains
    ClearanceRequest "1" o-- "0..*" Grievance : associates
    Department "1" --> "0..*" DepartmentApproval : governs
    Department "1" --> "0..*" Grievance : receives
```

### 2.2 Behavioral Chain of Responsibility & Service Orchestration Diagram

```mermaid
classDiagram
    direction TB

    class DepartmentHandler {
        <<abstract>>
        #DepartmentHandler _next_handler
        +set_next(handler) DepartmentHandler
        +handle(request, dept, user, action, remarks, dues)*
        #verify_prerequisites(request, db)* bool
        #generate_signature(staff_id, dept_code, req_id) string
    }

    class LibraryHandler {
        +gate_number = 1
        #verify_prerequisites(request, db) bool
    }

    class HostelHandler {
        +gate_number = 1
        #verify_prerequisites(request, db) bool
    }

    class SportsComplexHandler {
        +gate_number = 1
        #verify_prerequisites(request, db) bool
    }

    class DepartmentLabsHandler {
        +gate_number = 2
        #verify_prerequisites(request, db) bool
    }

    class AccountsHandler {
        +gate_number = 3
        #verify_prerequisites(request, db) bool
    }

    class ClearanceChainBuilder {
        +build_chain() DepartmentHandler
        +refresh_pipeline_gates(request, db) void
    }

    class CertificateService {
        +generate_certificate_hash(cert_id, sid, year, date) string
        +generate_clearance_pdf(request, db) bytes
    }

    class GrievanceService {
        +calculate_sla_deadline(priority) datetime
        +check_and_escalate_sla(db) list
        +resolve_grievance(id, notes, db) Grievance
    }

    %% Inheritance Structure
    DepartmentHandler <|-- LibraryHandler
    DepartmentHandler <|-- HostelHandler
    DepartmentHandler <|-- SportsComplexHandler
    DepartmentHandler <|-- DepartmentLabsHandler
    DepartmentHandler <|-- AccountsHandler

    %% Service & Chain Dependencies
    ClearanceChainBuilder ..> DepartmentHandler : constructs & links
    ClearanceChainBuilder ..> ClearanceRequest : evaluates prerequisites
    CertificateService ..> ClearanceRequest : mints HMAC certificate
    GrievanceService ..> Grievance : arbitrates & escalates SLA
```

---

## 3. Dynamic Behavioral Model: Activity Diagram

This activity diagram models the end-to-end dynamic workflow of a PEC clearance request, illustrating parallel concurrency forks, barrier joins, and sequential dependency gates:

```mermaid
flowchart TD
    %% Styling Definitions
    classDef startEnd fill:#d1fae5,stroke:#047857,stroke-width:2.5px,color:#064e3b,font-weight:bold
    classDef action fill:#f3f4f6,stroke:#4b5563,stroke-width:1.5px,color:#111827
    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f,font-weight:bold
    classDef forkJoin fill:#374151,stroke:#111827,stroke-width:3px,color:#ffffff,font-weight:bold
    classDef pass fill:#e0f2fe,stroke:#0284c7,stroke-width:1.5px,color:#0369a1
    classDef reject fill:#fee2e2,stroke:#dc2626,stroke-width:1.5px,color:#991b1b
    classDef milestone fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#5b21b6,font-weight:bold

    Start([Start: Student Submits Clearance]):::startEnd --> Init[Initialize 5 Department Approval Records]:::action
    Init --> ForkG1((FORK: Gate 1 Parallel Review)):::forkJoin

    subgraph SG_Gate1 ["Gate 1: Concurrent Central Facilities (Parallel Reviews)"]
        direction TB
        ForkG1 --> LibCheck{Library Books / Dues Clear?}:::decision
        LibCheck -- "Clear" --> LibSign[Approved: Sign HMAC Library]:::pass
        LibCheck -- "Dues" --> LibRej[Rejected: Overdue Books / Fine]:::reject

        ForkG1 --> HostCheck{Hostel Room & Mess Clear?}:::decision
        HostCheck -- "Clear" --> HostSign[Approved: Sign HMAC Hostel]:::pass
        HostCheck -- "Dues" --> HostRej[Rejected: Mess Dues Liability]:::reject

        ForkG1 --> SportCheck{Sports Equipment Clear?}:::decision
        SportCheck -- "Clear" --> SportSign[Approved: Sign HMAC Sports]:::pass
        SportCheck -- "Dues" --> SportRej[Rejected: Equipment Penalty]:::reject
    end

    LibSign --> JoinG1((JOIN: Gate 1 Barrier)):::forkJoin
    HostSign --> JoinG1
    SportSign --> JoinG1

    JoinG1 --> G1Barrier{All 3 Gate 1 Facilities Approved?}:::decision

    LibRej --> G1Hold[Gate 1 Blocked: Resolve Dues or Appeal]:::reject
    HostRej --> G1Hold
    SportRej --> G1Hold

    G1Hold --> DAAOverride1{DAA Override / Dues Settled?}:::decision
    DAAOverride1 -- "Resolved / Overridden" --> UnlockG2[Unlock Gate 2: Advance Labs to PENDING]:::milestone
    DAAOverride1 -- "Unresolved" --> StopWait[Halt Progress: Await Resolution]:::reject

    G1Barrier -- "Yes" --> UnlockG2
    G1Barrier -- "No" --> G1Hold

    subgraph SG_Gate2 ["Gate 2: Department Computing & Hardware Labs"]
        direction TB
        UnlockG2 --> LabCheck{Lab Kits & Workstation Clear?}:::decision
        LabCheck -- "Clear" --> LabSign[Approved: Sign HMAC Labs]:::pass
        LabCheck -- "Missing" --> LabRej[Rejected: Hardware Liability]:::reject
    end

    LabRej --> G2Hold[Gate 2 Blocked: Return Assets or DAA Override]:::reject
    G2Hold --> DAAOverride2{DAA Override / Assets Returned?}:::decision
    DAAOverride2 -- "Resolved" --> UnlockG3[Unlock Gate 3: Advance Accounts to PENDING]:::milestone
    DAAOverride2 -- "Unresolved" --> StopWait

    LabSign --> UnlockG3

    subgraph SG_Gate3 ["Gate 3: Institutional Accounts & Finance Branch"]
        direction TB
        UnlockG3 --> AccCheck{Semester Tuition & Fees Clear?}:::decision
        AccCheck -- "Clear" --> AccSign[Approved: Sign HMAC Accounts]:::pass
        AccCheck -- "Dues" --> AccRej[Rejected: Unpaid Balance]:::reject
    end

    AccRej --> AccHold[Gate 3 Blocked: Hold Caution Money Escrow]:::reject
    AccHold --> DAAOverride3{Fee Payment / DAA Waiver?}:::decision
    DAAOverride3 -- "Settled" --> AccSign
    DAAOverride3 -- "Unsettled" --> StopWait

    AccSign --> Mint[Validate All 5 Seals & Authorize ₹10,000 Caution Money Refund]:::milestone
    Mint --> Cert[Mint Certificate ID & Compute SHA-256 Digest]:::milestone
    Cert --> GenPDF[Generate Verifiable PDF Certificate]:::milestone
    GenPDF --> End([End: Clearance Issued]):::startEnd
```

---

## 4. Interaction Models: Sequence Diagrams

### 4.1 Sequence Diagram 1: Multi-Gate Approval & Cryptographic Minting
```mermaid
sequenceDiagram
    autonumber
    actor Student as PEC Student (SID: 22103042)
    actor LibraryStaff as Librarian (Gate 1)
    actor LabStaff as HOD Labs (Gate 2)
    actor AccountsStaff as Accounts Officer (Gate 3)
    participant API as Clearance API Gateway
    participant CoR as Chain of Responsibility Engine
    participant DB as System Database
    participant Cert as Certificate Service

    Student->>API: POST /api/v1/clearance/apply
    API->>DB: INSERT ClearanceRequest & 5 Department Approvals
    DB-->>Student: 201 Created (Gate 1: PENDING, Gates 2-3: WAITING)

    LibraryStaff->>API: POST /api/v1/clearance/staff/decision/{approval_id} (APPROVED)
    API->>CoR: handle(request, "LIBRARY", staff, APPROVED)
    CoR->>CoR: verify_prerequisites() -> PASS (Gate 1 has no prerequisites)
    CoR->>CoR: generate_digital_signature(staff_id, "LIBRARY")
    CoR->>DB: UPDATE Approval SET status=APPROVED, signature=HMAC
    CoR->>CoR: refresh_pipeline_gates()
    DB-->>LibraryStaff: 200 OK (Signed & Sealed)

    Note over LibraryStaff, LabStaff: Hostel and Sports sign off concurrently...

    LabStaff->>API: POST /api/v1/clearance/staff/decision/{approval_id} (APPROVED)
    API->>CoR: handle(request, "LABS", staff, APPROVED)
    CoR->>CoR: verify_prerequisites() -> Check Gate 1
    alt Gate 1 Incomplete
        CoR-->>API: 400 Bad Request ("Prerequisite unmet: Prior clearance required")
    else Gate 1 All Approved
        CoR->>CoR: generate_digital_signature(staff_id, "LABS")
        CoR->>DB: UPDATE Approval SET status=APPROVED, signature=HMAC
        CoR->>CoR: refresh_pipeline_gates() -> Unlocks Gate 3
        DB-->>LabStaff: 200 OK (Labs Approved)
    end

    AccountsStaff->>API: POST /api/v1/clearance/staff/decision/{approval_id} (APPROVED)
    API->>CoR: handle(request, "ACCOUNTS", staff, APPROVED)
    CoR->>CoR: verify_prerequisites() -> Check Gates 1 & 2 Approved
    CoR->>DB: UPDATE ClearanceRequest SET status=APPROVED, cert_id="PEC-CLR-YYYY-XXXXX"
    CoR->>Cert: generate_certificate_hash(cert_id, sid, year, timestamp)
    Cert-->>DB: Save SHA-256 Digest
    DB-->>AccountsStaff: 200 OK (Clearance Completed & Caution Money Released)

    Student->>API: GET /api/v1/certificate/download/{request_id}
    API->>Cert: generate_clearance_pdf(request)
    Cert-->>Student: Stream Downloadable Vector PDF
```

### 4.2 Sequence Diagram 2: Grievance Lifecycle & Automated DAA Escalation
```mermaid
sequenceDiagram
    autonumber
    actor Student as PEC Student (SID: 22105029)
    participant API as Grievance API Gateway
    participant SLA as SLA Escalation Engine
    actor Warden as Chief Warden (Hostel)
    actor DAA as Dean Academic Affairs (DAA)
    participant DB as System Database

    Student->>API: POST /api/v1/grievance (Priority=HIGH, Dept=HOSTEL, Due=₹3,500)
    API->>SLA: calculate_sla_deadline(priority=HIGH) -> now + 12 Hours
    API->>DB: INSERT Grievance (status=OPEN, is_escalated=False)
    DB-->>Student: 201 Grievance Registered (Deadline Assigned)

    Note over SLA, DB: 12 Hours elapse without staff resolution...

    loop Periodic SLA Audit Scan
        SLA->>DB: SELECT * FROM grievances WHERE now > sla_deadline AND status='OPEN'
        DB-->>SLA: Returns breached ticket
        SLA->>DB: UPDATE Grievance SET is_escalated=True, status='ESCALATED'
        SLA->>DB: INSERT AuditLog ("SLA_BREACH_ESCALATED", DAA_ALERT)
    end

    DAA->>API: GET /api/v1/admin/analytics
    API-->>DAA: Returns breached grievance metrics & department alert

    Warden->>API: POST /api/v1/grievance/{id}/resolve (Resolution Notes, Waive Due)
    API->>DB: UPDATE Grievance SET status=RESOLVED, resolved_at=now
    API->>DB: UPDATE DepartmentApproval SET due_amount=0.0
    DB-->>Warden: 200 OK (Grievance Resolved & Due Cleared)
```

### 4.3 Sequence Diagram 3: Administrative Override & Concurrency Race Prevention
```mermaid
sequenceDiagram
    autonumber
    actor DAA as Dean Academic Affairs (Admin)
    actor Staff as Positional Staff
    participant API as Administration API
    participant CoR as Chain of Responsibility Engine
    participant DB as System Database (Serialized Transaction)

    Staff->>API: POST /api/v1/clearance/staff/decision (Mark REJECTED, ₹500 Due)
    API->>DB: UPDATE DepartmentApproval SET status='REJECTED', due_amount=500.0
    DB-->>Staff: 200 OK (Gate Blocked)

    Note over DAA, DB: Student petitions DAA; DAA authorizes immediate override

    DAA->>API: POST /api/v1/admin/override/{approval_id} (Reason="Approved by DAA Council")
    API->>DB: BEGIN TRANSACTION (SERIALIZABLE)
    API->>DB: UPDATE DepartmentApproval SET status='APPROVED', due_amount=0.0
    API->>CoR: generate_digital_signature(admin_id, dept_code)
    API->>DB: UPDATE DepartmentApproval SET digital_signature=HMAC
    API->>CoR: refresh_pipeline_gates(request, db)
    CoR->>DB: Unblock downstream dependent gates
    API->>DB: INSERT AuditLog ("ADMIN_OVERRIDE", admin_id, metadata)
    API->>DB: COMMIT TRANSACTION
    DB-->>DAA: 200 OK (Department Overridden & Downstream Gates Unlocked)
```

---

## 5. Behavioral State Machine Diagram

This state machine models the discrete status lifecycles of both the master clearance request and individual department approval gates:

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Student Initiates Application

    state ClearanceRequestLifecycle {
        DRAFT --> SUBMITTED : Form Validated (SID, Milestone)
        SUBMITTED --> GATE1_EVALUATION : Gate 1 Approvals Initialized
        
        state GATE1_EVALUATION {
            [*] --> G1_PENDING
            G1_PENDING --> G1_PARTIAL : Any Gate 1 Facility Signs
            G1_PARTIAL --> G1_ALL_APPROVED : Lib, Host, Sports All Approved
            G1_PENDING --> G1_BLOCKED : Any Facility Rejects / Assesses Dues
            G1_BLOCKED --> G1_ALL_APPROVED : Dues Paid OR Admin Override
        }

        GATE1_EVALUATION --> GATE2_EVALUATION : Gate 1 Complete (Barrier Unlocked)

        state GATE2_EVALUATION {
            [*] --> G2_PENDING
            G2_PENDING --> G2_APPROVED : Dept Labs Signs with HMAC
            G2_PENDING --> G2_BLOCKED : Equipment Loss Recorded
            G2_BLOCKED --> G2_APPROVED : Reconciled OR Admin Override
        }

        GATE2_EVALUATION --> GATE3_EVALUATION : Gate 2 Complete (Accounts Unlocked)

        state GATE3_EVALUATION {
            [*] --> G3_PENDING
            G3_PENDING --> G3_APPROVED : Accounts Signs & Releases Caution Money
            G3_PENDING --> G3_BLOCKED : Outstanding Tuition Balance
            G3_BLOCKED --> G3_APPROVED : Reconciled OR Admin Override
        }

        GATE3_EVALUATION --> APPROVED : Terminal Sign-off Achieved
        APPROVED --> CERTIFICATE_ISSUED : SHA-256 Digest Minted & PDF Available
    }

    CERTIFICATE_ISSUED --> [*]
```

---

## 6. System Architecture & Component Deployment Diagram

The component diagram defines the physical and logical boundaries of the system, verifying complete separation between presentation, application services, and persistent storage:

```mermaid
flowchart TB
    subgraph ClientTier ["Presentation Tier (React 19 SPA)"]
        UI_Nav["Navbar & Persona Switcher"]
        UI_Pipe["ClearancePipeline (3 Gates)"]
        UI_Griev["GrievanceModal (SLA Calculator)"]
        UI_Cert["CertificateModal (Vector PDF Preview)"]
        UI_Admin["AdminDashboard (Analytics & Overrides)"]
        UI_Verify["VerifyCertificate (Public Portal)"]
    end

    subgraph APITier ["Application Service Tier (FastAPI Gateway)"]
        Router_Auth["/api/v1/auth (JWT Bcrypt)"]
        Router_Clear["/api/v1/clearance (Workflow)"]
        Router_Griev["/api/v1/grievance (SLA Engine)"]
        Router_Admin["/api/v1/admin (DAA Analytics)"]
        Router_Cert["/api/v1/certificate (PDF & Public Hash)"]
    end

    subgraph EngineTier ["Domain Logic & Behavioral Patterns"]
        CoR_Engine["Chain of Responsibility Engine\n(Gate 1 -> Gate 2 -> Gate 3)"]
        Crypto_Engine["Cryptographic Engine\n(HMAC-SHA256 & SHA-256 Digits)"]
        SLA_Engine["SLA Breach & Auto-Escalation Timer"]
        PDF_Engine["ReportLab Vector PDF Renderer\n(PEC Crest, DAA & DSA Signatures)"]
    end

    subgraph DataTier ["Persistence Tier (Relational Store)"]
        DB_Users[("users")]
        DB_Depts[("departments")]
        DB_Clear[("clearance_requests")]
        DB_Appr[("department_approvals")]
        DB_Griev[("grievances")]
        DB_Audit[("audit_logs")]
    end

    %% Tier Connectors
    ClientTier -- "REST API (HTTP/JSON with JWT Bearer)" --> APITier
    APITier --> EngineTier
    EngineTier --> DataTier
```
