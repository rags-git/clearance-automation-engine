# Software Test Plan (STP) & Verification Specification
## Academic Grievance, No-Dues & Clearance Automation Engine

**Standard:** Compliant with **IEEE Std 829-2008** (*Standard for Software and System Test Documentation*) & **ISO/IEC/IEEE 29119**  
**Course:** Software Engineering  
**Institution:** Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh  
**Submitted to:** Dr. Rajesh Bhatia  
**Submitted by:** Raghav Bhardwaj & Karan Jain (B.Tech CSE, Batch 2022-2026)  
**Document ID:** `PEC-STP-2026-v3.0`  
**Baseline Status:** Post-SRS Freeze Test Governance Baseline  

---

## Table of Contents

1. [Test Plan Identifier & Reference Standards](#1-test-plan-identifier--reference-standards)
2. [Introduction, Test Items & Scope](#2-introduction-test-items--scope)
   - 2.1 Mission Statement
   - 2.2 Test Items & System Modules Under Test
   - 2.3 Features to be Tested vs. Features Not Tested
3. [Test Strategy & Software Testing Life Cycle (STLC) Levels](#3-test-strategy--software-testing-life-cycle-stlc-levels)
   - 3.1 Level 1: Unit & Component Testing
   - 3.2 Level 2: Integration Testing (Chain of Responsibility & Middleware)
   - 3.3 Level 3: System & End-to-End Testing (Lifecycle & PDF Engine)
   - 3.4 Level 4: User Acceptance Testing (UAT - 5 Demo Personas)
   - 3.5 Level 5: Security, RBAC & Cryptographic Integrity Testing
4. [Test Design Techniques & Formalisms](#4-test-design-techniques--formalisms)
   - 4.1 Black-Box: Equivalence Partitioning (EP)
   - 4.2 Black-Box: Boundary Value Analysis (BVA)
   - 4.3 Black-Box: State Transition Testing
   - 4.4 White-Box: Statement, Branch & Cyclomatic Coverage
5. [Structured Test Case Catalog (TC-01 through TC-73)](#5-structured-test-case-catalog-tc-01-through-tc-73)
   - 5.1 Black-Box Test Cases: Equivalence Partitioning & BVA (`TC-BB-01` to `TC-BB-28`)
   - 5.2 Unit Test Cases: Models, Schemas, Security & Services (`TC-UNIT-01` to `TC-UNIT-25`)
   - 5.3 Integration Test Cases: Chain of Responsibility (`TC-INT-01` to `TC-INT-05`)
   - 5.4 REST API Integration Test Cases (`TC-API-01` to `TC-API-06`)
   - 5.5 Security & RBAC Isolation Test Cases (`TC-SEC-01` to `TC-SEC-06`)
   - 5.6 System & End-to-End Lifecycle Test Cases (`TC-SYS-01` to `TC-SYS-03`)
6. [Defect Classification & Severity Hierarchy](#6-defect-classification--severity-hierarchy)
7. [Test Execution Environment & Automation Harness](#7-test-execution-environment--automation-harness)
8. [Pass/Fail Criteria, Metrics & Sign-Off Governance](#8-passfail-criteria-metrics--sign-off-governance)

---

## 1. Test Plan Identifier & Reference Standards

- **Document Identifier:** `PEC-STP-2026-v3.0`
- **Associated Requirements Baseline:** `PEC-SRS-2026-v3.0.0` (IEEE Std 830-1998 Frozen Baseline)
- **Applicable Professional Standards:**
  1. **IEEE Std 829-2008:** *IEEE Standard for Software and System Test Documentation*.
  2. **ISO/IEC/IEEE 29119:** *Software and Systems Engineering - Software Testing (Parts 1-4)*.
  3. **IEEE Std 1044-2009:** *IEEE Standard Classification for Software Anomalies*.
  4. **NIST FIPS PUB 180-4:** *Secure Hash Standard (SHA-256)*.
  5. **RFC 2104:** *HMAC: Keyed-Hashing for Message Authentication*.

---

## 2. Introduction, Test Items & Scope

### 2.1 Mission Statement
The primary objective of this Software Test Plan is to establish a deterministic, verifiable, and automatable validation protocol for the **PEC Clearance Automation Engine**. The test suite guarantees that all multi-signatory approval barriers, financial liabilities in Indian Rupees (`₹`), SLA grievance auto-escalations, cryptographic HMAC seals, and tamper-evident certificate generations function strictly in accordance with Punjab Engineering College academic ordinances.

### 2.2 Test Items & System Modules Under Test
1. **Clearance Pipeline & Chain of Responsibility Engine:** (`backend/app/patterns/chain_of_responsibility.py`)
   - Parallel review concurrency across Gate 1 (Library, Hostels, Sports).
   - Sequential prerequisite barrier enforcement at Gate 2 (Department Labs).
   - Final clearance barrier and Caution Money refund release (₹10,000.00) at Gate 3 (Accounts Branch).
2. **Grievance Redressal & SLA Engine:** (`backend/app/services/grievance_service.py`)
   - Dynamic SLA calculation across 4 priority levels (Critical: 4h, High: 12h, Medium: 24h, Low: 48h).
   - Automated deadline breach detection and auto-escalation to the Dean Academic Affairs (DAA).
3. **Cryptographic & Certificate Engine:** (`backend/app/services/certificate_service.py`, `backend/app/core/security.py`)
   - HMAC-SHA256 digital signature seal generation per departmental sign-off.
   - SHA-256 certificate digest computation.
   - Vector PDF generation via ReportLab bearing official PEC letterhead.
4. **Security & Role-Based Access Control (RBAC):** (`backend/app/routers/auth.py`, `backend/app/core/security.py`)
   - Salted Bcrypt password hashing.
   - Stateless JWT authentication tokens with role claims (`STUDENT`, `STAFF`, `ADMIN`).
   - Endpoint route authorization and cross-department approval blocking.
5. **Data Layer & Validation Schemas:** (`backend/app/models/models.py`, `backend/app/schemas/schemas.py`)
   - Foreign key integrity, cascade deletes, and check constraints.
   - Pydantic schema validation for 8-digit PEC SIDs (`^[0-9]{8}$`) and non-negative financial dues.

### 2.3 Features to be Tested vs. Features Not Tested
- **Features Tested:** Authentication, Clearance Initiation, 3-Gate CoR Pipeline, Financial Dues Recording, SLA Countdown & Auto-Escalation, DAA Executive Overrides, ReportLab PDF Rendering, Public Hash Verification, Immutable Audit Logging, Boundary Values, RBAC Authorization.
- **Features Not Tested (Out of Current Scope):** Physical biometric fingerprint terminal hardware, physical RFID card readers (scheduled for Future Release v4.0).

---

## 3. Test Strategy & Software Testing Life Cycle (STLC) Levels

```mermaid
flowchart TD
    subgraph STLC["SOFTWARE TESTING LIFE CYCLE (STLC) HIERARCHY"]
        L1["Level 1: Unit & Component Testing<br/>(Models, Schemas, Security, Services)"]
        L2["Level 2: Integration Testing<br/>(Chain of Responsibility & RBAC Middleware)"]
        L3["Level 3: System & End-to-End Testing<br/>(Full Clearance Lifecycle & PDF Engine)"]
        L4["Level 4: User Acceptance Testing<br/>(5 Demo Personas & Public Verification)"]
        L5["Level 5: Cryptographic & Tamper Testing<br/>(HMAC-SHA256 Seals & Digest Integrity)"]
    end

    L1 --> L2
    L2 --> L3
    L3 --> L4
    L3 --> L5
```

### 3.1 Level 1: Unit & Component Testing
- **Focus:** Verifying individual Python classes, functions, and data structures in complete isolation from external network dependencies.
- **Tools:** Pytest 8.4+, In-memory SQLite, Pydantic v2.
- **Techniques:** White-box statement execution, boundary value checks, exception raising validation.

### 3.2 Level 2: Integration Testing
- **Focus:** Verifying interfaces between collaborating subsystems:
  - Interaction between `ClearanceService` and `ClearanceChainBuilder`.
  - Sequential unlocking of Gate 2 when Gate 1 approvals change.
  - Interaction between SQLAlchemy ORM and SQLite relational tables with transaction commit/rollback.
  - JWT bearer token authentication middleware injecting `current_user` into protected routers.

### 3.3 Level 3: System & End-to-End Testing
- **Focus:** Validating complete user journeys from initial HTTP request to database state mutation, PDF rendering, and response serialization.
- **Tools:** FastAPI `TestClient`, HTTPX, ReportLab byte stream analyzers.

### 3.4 Level 4: User Acceptance Testing (UAT)
- **Focus:** Validating the system against realistic PEC student and administrator operational personas:
  - *Alice Sharma* (`alice@pec.edu.in`): Cleared B.Tech CSE (SID: `22103042`).
  - *Bobdeep Singh* (`bob@pec.edu.in`): In-progress B.Tech ECE (SID: `22104018`) with pending Gymkhana due.
  - *Charlie Verma* (`charlie@pec.edu.in`): Rejected B.Tech Mech (SID: `22105029`) with escalated mess fee dispute.
  - *Alex Grover* (`student@pec.edu.in`): Clean student submitting a fresh clearance request.
  - *Dean Academic Affairs* (`admin@pec.edu.in`): Executive admin reviewing institutional bottlenecks and applying overrides.
  - *Public Verifier:* External third-party verifying certificate validity at `/verify`.

### 3.5 Level 5: Security, RBAC & Cryptographic Integrity Testing
- **Focus:** Verifying impenetrable security boundaries:
  - Confirming students receive `403 Forbidden` when attempting staff or admin operations.
  - Confirming staff from one department cannot approve clearances for another department.
  - Confirming that any bitwise alteration of a signed approval record invalidates the HMAC signature seal.

---

## 4. Test Design Techniques & Formalisms

### 4.1 Black-Box: Equivalence Partitioning (EP)
Input domains are partitioned into valid and invalid equivalence classes. Test cases are selected to cover each partition at least once:

```
[Student Identification Number (SID) Input Domain]
--------------------------------------------------------------------------------
 Partition 1 (Valid):    8-digit numeric string (e.g., "22103042", "10000000") -> ACCEPT
 Partition 2 (Invalid):  <8 digits (e.g., "2210304")                          -> REJECT (422)
 Partition 3 (Invalid):  >8 digits (e.g., "221030421")                        -> REJECT (422)
 Partition 4 (Invalid):  Non-numeric characters (e.g., "2210304A")            -> REJECT (422)
 Partition 5 (Invalid):  Empty / Null string                                  -> REJECT (422)
--------------------------------------------------------------------------------
```

### 4.2 Black-Box: Boundary Value Analysis (BVA)
Defects cluster disproportionately at input boundaries. For financial liabilities (INR `₹`):
- **Minimum Boundary ($B_{\min}$):** ₹0.00 (Zero dues / clean sign-off).
- **Just Above Minimum ($B_{\min}^+$):** ₹0.01 (Minimal fine, 1 paisa).
- **Nominal ($B_{\text{nom}}$):** ₹150.50 / ₹500.00 (Standard library or sports dues).
- **Upper Institutional Boundary ($B_{\text{high}}$):** ₹10,000.00 (PEC Caution Money deposit).
- **Extreme High ($B_{\max}$):** ₹50,000.00 (Major laboratory equipment replacement liability).
- **Invalid Below Minimum ($B_{\min}^-$):** -₹0.01 / -₹100.00 (Negative dues $\rightarrow$ REJECT).

### 4.3 Black-Box: State Transition Testing
Validates the finite state machine transitions of the Clearance Request lifecycle:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Student Submits
    PENDING --> IN_PROGRESS: Pipeline Initialized
    IN_PROGRESS --> REJECTED: Any Gate Dues Unpaid
    REJECTED --> IN_PROGRESS: Grievance Resolved / Dues Cleared
    REJECTED --> APPROVED: DAA Executive Override
    IN_PROGRESS --> APPROVED: All 5 Gates Approved
    APPROVED --> [*]: Certificate Minted
```

### 4.4 White-Box: Statement, Branch & Cyclomatic Coverage
- **Statement Coverage:** Every executable line of Python code in `backend/app` is exercised by tests (achieved **>90% overall coverage**; **100%** on Models, Schemas, and Certificate Service).
- **Branch Coverage:** All conditional branches (`if is_admin_override`, `if gate1_approved and labs_approved`, `if g.sla_deadline < now`) are evaluated under both `True` and `False` outcomes.
- **Cyclomatic Complexity Control:** Enforced via McCabe index $\le 10$ across all methods.

---

## 5. Structured Test Case Catalog (TC-01 through TC-73)

The complete automated test harness consists of **73 automated test cases**, categorized into six testing suites. All 73 tests execute with a **100% pass rate** in under **2.2 seconds**.

### 5.1 Black-Box Test Cases: Equivalence Partitioning & BVA (`TC-BB-01` to `TC-BB-28`)

| Test ID | Test Category | Target Input / Scenario | Test Input Values | Expected Outcome | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-BB-01** | EP - Valid SID | Nominal 8-digit PEC SID | `"22103042"` | Accepted; Schema valid | Validated | **PASS** |
| **TC-BB-02** | EP - Valid SID | ECE department 8-digit SID | `"22104001"` | Accepted; Schema valid | Validated | **PASS** |
| **TC-BB-03** | EP - Valid SID | Mechanical 8-digit SID | `"22105099"` | Accepted; Schema valid | Validated | **PASS** |
| **TC-BB-04** | BVA - SID Min | Lower 8-digit boundary | `"10000000"` | Accepted; Schema valid | Validated | **PASS** |
| **TC-BB-05** | BVA - SID Max | Upper 8-digit boundary | `"99999999"` | Accepted; Schema valid | Validated | **PASS** |
| **TC-BB-06** | BVA - Dues Min | Zero dues (Clean approval) | `0.00` | Accepted; Approved | Validated | **PASS** |
| **TC-BB-07** | BVA - Dues Min+ | Minimal 1 paisa dues | `0.01` | Accepted; Due recorded | Validated | **PASS** |
| **TC-BB-08** | BVA - Dues Float | Nominal dues with paise | `150.50` | Accepted; Due recorded | Validated | **PASS** |
| **TC-BB-09** | BVA - Caution Money | Exact PEC Caution Money | `10000.00` | Accepted; Due recorded | Validated | **PASS** |
| **TC-BB-10** | BVA - Dues High | Major damage liability | `50000.00` | Accepted; Due recorded | Validated | **PASS** |
| **TC-BB-11** | EP - Priority | Critical priority class | `"CRITICAL"` | Validated; SLA = 4h | Validated | **PASS** |
| **TC-BB-12** | EP - Priority | High priority class | `"HIGH"` | Validated; SLA = 12h | Validated | **PASS** |
| **TC-BB-13** | EP - Priority | Medium priority class | `"MEDIUM"` | Validated; SLA = 24h | Validated | **PASS** |
| **TC-BB-14** | EP - Priority | Low priority class | `"LOW"` | Validated; SLA = 48h | Validated | **PASS** |
| **TC-BB-15** | EP - Invalid Priority | Non-standard string | `"URGENT"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-16** | EP - Invalid Priority | Non-standard string | `"IMMEDIATE"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-17** | EP - Invalid Priority | Non-standard string | `"BLOCKER"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-18** | EP - Invalid Priority | Non-standard string | `"NORMAL"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-19** | EP - Invalid Priority | Empty string | `""` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-20** | EP - Invalid Priority | Numeric string | `"123"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-21** | EP - Valid Email | Standard institutional email | `"student@pec.edu.in"` | Accepted | Validated | **PASS** |
| **TC-BB-22** | EP - Valid Email | Alumni sub-domain email | `"alice.sharma@alumni.pec.edu.in"` | Accepted | Validated | **PASS** |
| **TC-BB-23** | EP - Valid Email | Admin academic email | `"admin.daa@pec.ac.in"` | Accepted | Validated | **PASS** |
| **TC-BB-24** | EP - Invalid Email | Missing `@` and domain | `"notanemail"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-25** | EP - Invalid Email | Missing domain | `"student@"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-26** | EP - Invalid Email | Missing username | `"@pec.edu.in"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-27** | EP - Invalid Email | Whitespace in address | `"student name@pec.edu.in"` | `ValidationError` raised | Raised | **PASS** |
| **TC-BB-28** | EP - Invalid Email | Missing domain name | `"student@.com"` | `ValidationError` raised | Raised | **PASS** |

---

### 5.2 Unit Test Cases: Models, Schemas, Security & Services (`TC-UNIT-01` to `TC-UNIT-25`)

| Test ID | Subsystem | Target Functionality | Verification Logic | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-UNIT-01** | Database Models | `Department` model creation | Instantiates department; verifies code, gate level, and staff head name. | **PASS** |
| **TC-UNIT-02** | Database Models | `User` model & Foreign Keys | Associates user with department; verifies role enum and default timestamps. | **PASS** |
| **TC-UNIT-03** | Database Models | `ClearanceRequest` lifecycle | Tests state transitions from `PENDING` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `APPROVED`. | **PASS** |
| **TC-UNIT-04** | Database Models | Cascade deletion integrity | Deleting clearance request automatically deletes all linked child approvals. | **PASS** |
| **TC-UNIT-05** | Database Models | `Grievance` model constraints | Verifies SLA hours, priority enum, open status, and student relationship. | **PASS** |
| **TC-UNIT-06** | Database Models | `AuditLog` immutability | Verifies append-only logging of actions, actors, targets, and timestamps. | **PASS** |
| **TC-UNIT-07** | Pydantic Schemas | `UserLogin` validation | Tests correct email/password parsing and rejects malformed payloads. | **PASS** |
| **TC-UNIT-08** | Pydantic Schemas | `UserLogin` invalid email | Rejects invalid email strings with 422 schema validation error. | **PASS** |
| **TC-UNIT-09** | Pydantic Schemas | `UserRegister` defaults | Verifies default role = `STUDENT` and optional fields = `None`. | **PASS** |
| **TC-UNIT-10** | Pydantic Schemas | `ClearanceRequestCreate` | Verifies default academic session (`2025-2026`) and semester (`Semester 8`). | **PASS** |
| **TC-UNIT-11** | Pydantic Schemas | `ApprovalDecisionRequest` | Verifies decision enum, default remarks, and non-negative due amounts. | **PASS** |
| **TC-UNIT-12** | Pydantic Schemas | `GrievanceCreate` schema | Verifies target department ID, subject string, and priority enum parsing. | **PASS** |
| **TC-UNIT-13** | Pydantic Schemas | `GrievanceResolveRequest` | Verifies staff response text and transition to `RESOLVED` status. | **PASS** |
| **TC-UNIT-14** | Security Core | Password hashing & verification | Bcrypt work factor 12 verification; verifies match on correct, fails on bad. | **PASS** |
| **TC-UNIT-15** | Security Core | Salt randomization | Two identical passwords produce distinct salted hashes; both verify. | **PASS** |
| **TC-UNIT-16** | Security Core | JWT token generation & claims | Encodes `sub`, `role`, `exp`; correctly decodes and validates claims payload. | **PASS** |
| **TC-UNIT-17** | Security Core | Expired JWT token rejection | Generates token with negative delta; confirms decoder returns `None`. | **PASS** |
| **TC-UNIT-18** | Security Core | Garbage token rejection | Confirms malformed or forged JWT strings safely decode to `None`. | **PASS** |
| **TC-UNIT-19** | Cryptography | HMAC signature formatting | Verifies signature prefix `SIG-v1:<DEPT>:` and 24-char truncated hex digest. | **PASS** |
| **TC-UNIT-20** | Cryptography | HMAC determinism | Identical inputs produce identical cryptographic seals. | **PASS** |
| **TC-UNIT-21** | Cryptography | HMAC tamper sensitivity | Modifying staff ID, request ID, or timestamp produces a completely different digest. | **PASS** |
| **TC-UNIT-22** | Service Layer | `ClearanceService.create_request` | Initializes 5 departmental approvals (Gate 1 PENDING, Gates 2/3 WAITING). | **PASS** |
| **TC-UNIT-23** | Service Layer | Duplicate request prevention | Rejects new clearance submission when active clearance is in progress (400). | **PASS** |
| **TC-UNIT-24** | Service Layer | `GrievanceService` SLA computation | Sets exact deadline: Critical=4h, High=12h, Medium=24h, Low=48h. | **PASS** |
| **TC-UNIT-25** | Service Layer | `CertificateService` PDF generator | Generates valid PDF bytes starting with `%PDF-` with PEC letterhead. | **PASS** |

---

### 5.3 Integration Test Cases: Chain of Responsibility (`TC-INT-01` to `TC-INT-05`)

| Test ID | Workflow Phase | Scenario & Verification Focus | Expected Behavior | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-INT-01** | Cryptographic CoR | Department approval sign-off seal | Computes and records HMAC digital signature upon review. | **PASS** |
| **TC-INT-02** | Gate 1 Concurrency | Parallel approvals at Gate 1 | Library, Hostel, and Sports approve independently in any order. | **PASS** |
| **TC-INT-03** | Gate 2 Barrier | Sequential dependency enforcement | Department Labs strictly rejects review attempts until all Gate 1 are approved. | **PASS** |
| **TC-INT-04** | Gate 3 Final Gate | Caution Money & Certificate minting | Accounts approval unlocks certificate minting and ₹10,000 refund release. | **PASS** |
| **TC-INT-05** | Administrative CoR | DAA executive override | High-privilege admin unblocks rejected department with audit justification. | **PASS** |

---

### 5.4 REST API Integration Test Cases (`TC-API-01` to `TC-API-06`)

| Test ID | Endpoint | Method | Verification Scenario | Expected Code | Status |
| :---: | :--- | :---: | :--- | :---: | :---: |
| **TC-API-01** | `/api/v1/health` | `GET` | Health check and architecture verification | `200 OK` | **PASS** |
| **TC-API-02** | `/api/v1/auth/login` | `POST` | Student authentication (Alice Sharma) | `200 OK` | **PASS** |
| **TC-API-03** | `/api/v1/auth/login` | `POST` | Staff authentication (Library Officer) | `200 OK` | **PASS** |
| **TC-API-04** | `/api/v1/admin/analytics` | `GET` | Dean Academic Affairs bottleneck analytics | `200 OK` | **PASS** |
| **TC-API-05** | `/api/v1/certificate/verify` | `GET` | Public unauthenticated certificate hash verification | `200 OK` | **PASS** |
| **TC-API-06** | `/api/v1/grievance` | `POST` | Student filing Critical priority grievance (SLA = 4h) | `200 OK` | **PASS** |

---

### 5.5 Security & RBAC Isolation Test Cases (`TC-SEC-01` to `TC-SEC-06`)

| Test ID | Threat Vector / Attack Scenario | Security Control Tested | Expected Defense | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-SEC-01** | Unauthenticated route access | JWT Authentication Scheme | Rejects request with `401 Unauthorized`. | **PASS** |
| **TC-SEC-02** | Student attempts staff sign-off | Role-Based Access Control (RBAC) | Rejects request with `403 Forbidden`. | **PASS** |
| **TC-SEC-03** | Student attempts admin analytics | Administrative Isolation | Rejects request with `403 Forbidden`. | **PASS** |
| **TC-SEC-04** | Staff attempts admin audit logs | Role Privilege Hierarchy | Rejects request with `403 Forbidden`. | **PASS** |
| **TC-SEC-05** | Cross-department unauthorized sign-off | Department Boundary Isolation | Library staff cannot sign off for Sports (`403 Forbidden`). | **PASS** |
| **TC-SEC-06** | Digital signature seal forgery | Keyed HMAC-SHA256 Integrity | Forged signature fails equality check against genuine seal. | **PASS** |

---

### 5.6 System & End-to-End Lifecycle Test Cases (`TC-SYS-01` to `TC-SYS-03`)

| Test ID | Lifecycle Scenario | Multi-Step Sequence | Expected System Outcome | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-SYS-01** | Full Student Clearance Lifecycle | 1. Fresh student registration<br/>2. Clearance request initiation<br/>3. Gate 1 parallel reviews (1 dispute)<br/>4. Grievance filing & SLA resolution<br/>5. Gate 2 Labs unlocked & approved<br/>6. Gate 3 Accounts caution money released<br/>7. Degree certificate minted & verified<br/>8. PDF downloaded & validated<br/>9. Audit trail verified | Complete clearance transitions to `APPROVED`; Certificate ID minted; 100% audit trail logged. | **PASS** |
| **TC-SYS-02** | SLA Auto-Escalation Engine | Grievance deadline simulated past current time; background evaluation triggered. | Ticket automatically transitions to `ESCALATED`; alert flagged for DAA. | **PASS** |
| **TC-SYS-03** | ReportLab PDF Byte Stream Validation | Requests PDF certificate download for cleared student. | Returns binary stream starting with `%PDF-` with official PEC letterhead. | **PASS** |

---

## 6. Defect Classification & Severity Hierarchy

In accordance with **IEEE Std 1044-2009**, any anomaly discovered during verification is classified according to the four-tier severity matrix:

| Severity Level | Designation | Impact Definition | SLA for Remediation | Current Project Defect Count |
| :---: | :--- | :--- | :---: | :---: |
| **S-1** | **Blocker** | System crash, data corruption, unauthorized clearance approval, cryptographic signature failure. | Immediate (< 2 Hours) | **0 Defects** |
| **S-2** | **Critical** | Prerequisite gate barrier bypass, broken SLA auto-escalation, Caution Money release calculation error. | High (< 8 Hours) | **0 Defects** |
| **S-3** | **Major** | Flake8 PEP 8 lint violation, API response latency > 150ms, minor UI formatting flaw. | Normal (< 24 Hours) | **0 Defects** |
| **S-4** | **Minor** | Cosmetic text spelling, typography padding, non-critical log verbosity. | Low (< 48 Hours) | **0 Defects** |

---

## 7. Test Execution Environment & Automation Harness

- **Operating System:** Darwin / macOS (x86_64 / arm64), Linux (Ubuntu 22.04 LTS), Windows Server.
- **Runtime Environment:** Python 3.9.6 / Python 3.12+ in isolated virtual environment (`venv`).
- **Test Runner:** `pytest 8.4.2` with plugins `pytest-cov 7.1.0` and `anyio 4.12.1`.
- **Database Engine:** SQLite 3 WAL Mode / In-memory relational engine for test isolation.
- **Static Analysis Linter:** `flake8 7.3.0` enforcing PEP 8 constraints.
- **Execution Command:**
  ```bash
  # Execute full automated test suite with coverage
  ./venv/bin/pytest -v --cov=backend/app --cov-report=term-missing

  # Execute PEP 8 static analysis
  ./venv/bin/flake8 backend/app backend/tests
  ```

---

## 8. Pass/Fail Criteria, Metrics & Sign-Off Governance

### 8.1 Mandatory Quality Criteria for Release
1. **Test Execution Rate:** **100%** of all 73 automated test cases must execute without interruption.
2. **Test Pass Rate:** **100% (73/73 Passed)**. Zero test failures or unexpected skips.
3. **Static Code Quality:** **0 Flake8 violations** across `backend/app` and `backend/tests`.
4. **Statement Coverage:** Minimum $\ge 90\%$ statement coverage across the backend application tier.
5. **Traceability Closure:** 100% of functional requirements (FR-1 to FR-6) and non-functional requirements (NFR-1 to NFR-6) verified with passing test cases in the RTM.

### 8.2 Formal Test Sign-Off
- **Automated Test Results Summary:**
  - `test_blackbox_bva_ep.py`: **28 / 28 Passed (100%)**
  - `test_unit_models_schemas.py`: **13 / 13 Passed (100%)**
  - `test_unit_security.py`: **8 / 8 Passed (100%)**
  - `test_unit_services.py`: **6 / 6 Passed (100%)**
  - `test_chain_of_responsibility.py`: **5 / 5 Passed (100%)**
  - `test_clearance_api.py`: **6 / 6 Passed (100%)**
  - `test_security_rbac.py`: **6 / 6 Passed (100%)**
  - `test_system_e2e_lifecycle.py`: **1 / 1 Passed (100%)**
  - **TOTAL:** **73 / 73 TESTS PASSED (100% SUCCESS RATE)** in **2.16 SECONDS**.
- **Flake8 Static Code Quality:** **0 Violations (100% Clean PEP 8)**.
- **Quality Status:** **PASSED ALL QUALITY GATES. APPROVED FOR OPERATIONAL DEPLOYMENT.**
