# Punjab Engineering College (PEC Chandigarh)
## Academic Grievance, No-Dues & Clearance Automation Engine
> **A Workflow-Driven Digital Clearance Platform for Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh**  
> *Software Engineering Capstone Project • Office of Dean Academic Affairs (DAA)*

[![Pytest Tests](https://img.shields.io/badge/Pytest-73%2F73%20Passed%20(100%25)-brightgreen)](https://github.com/rags-git/pec-clearance-automation-engine/tree/code)
[![Code Coverage](https://img.shields.io/badge/Coverage->90%25%20Statement%2FBranch-brightgreen)](https://github.com/rags-git/pec-clearance-automation-engine/tree/code)
[![Flake8](https://img.shields.io/badge/Flake8-0%20Violations%20(PEP%208)-brightgreen)](https://github.com/rags-git/pec-clearance-automation-engine/tree/code)
[![SDLC Model](https://img.shields.io/badge/SDLC-V--Model%20(V%26V)-blueviolet)](./docs/SDLC_PROCESS_MODEL.md)
[![Test Standard](https://img.shields.io/badge/Test%20Plan-IEEE%20Std%20829--2008-orange)](./docs/SOFTWARE_TEST_PLAN.md)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-009688)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61dafb)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38bdf8)](https://tailwindcss.com/)

**Submitted by:** Raghav Bhardwaj & Karan Jain (B.Tech CSE, Batch 2022-2026)  
**Submitted to:** Dr. Rajesh Bhatia (Course: Software Engineering)  
**Institution:** Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh  

---

## 🌟 Executive Overview
The **PEC Academic Grievance, No-Dues & Clearance Automation Engine** digitizes, automates, and cryptographically validates end-of-semester and graduation clearance workflows across all key facilities of **Punjab Engineering College, Sector 12, Chandigarh**:
- **Dr. B. R. Ambedkar Central Library** (Gate 1 - Parallel)
- **PEC Hostels** (Shivalik, Kurukshetra, Himalaya, Aravali, Vindhya, KCH) (Gate 1 - Parallel)
- **Gymkhana & Sports Complex** (Gate 1 - Parallel)
- **Departmental Research Labs** (CSE, ECE, Mechanical, Electrical, Aerospace, Civil, Metallurgy, Production) (Gate 2 - Sequential Dependency)
- **Accounts & Finance Branch** (Caution Money Reconciliation & Security Deposit Refund Release) (Gate 3 - Final Gate & Certificate Issuance)

By replacing physical paper circulars with **digital verification gates**, **HMAC-SHA256 digital signature seals**, and **automated SLA-based grievance escalation to the Dean Academic Affairs (DAA)**, this platform eliminates administrative friction, provides real-time status visibility to students, and generates tamper-evident, verifiable clearance certificates.

---

## 🏛️ System Architecture & Design Pattern

### Chain of Responsibility (CoR) Design Pattern
The core approval workflow is implemented strictly using the **Behavioral Chain of Responsibility Pattern** (`backend/app/patterns/chain_of_responsibility.py`):
- **Gate 1 (Parallel Gates):** Dr. B.R. Ambedkar Central Library, PEC Hostels, and Gymkhana review requests concurrently without blocking one another.
- **Gate 2 (Sequential Dependency):** Department Labs verify hardware/workstations only after **all Gate 1 departments are officially APPROVED**.
- **Gate 3 (Final Gate):** Accounts Branch performs the final fee reconciliation and caution money refund only after **Gate 1 and Gate 2 are fully APPROVED**.
- **Cryptographic Sign-off:** Each approval generates an irreversible HMAC-SHA256 digital signature seal:
  ```text
  Digital Signature = HMAC-SHA256(Secret_Key, staff_id + dept_code + request_id + timestamp)
  ```

```mermaid
flowchart LR
    Start([PEC Student SID]) --> Gate1Fork{Gate 1: Parallel}
    Gate1Fork --> Lib[Dr. B.R. Ambedkar Library]
    Gate1Fork --> Host[PEC Hostels]
    Gate1Fork --> Sport[Gymkhana]

    Lib --> Gate1Join{All Gate 1 Cleared?}
    Host --> Gate1Join
    Sport --> Gate1Join

    Gate1Join -- Yes --> Gate2[Gate 2: Department Labs CSE/ECE/Mech]
    Gate2 -- Approved --> Gate3[Gate 3: Accounts Caution Money]
    Gate3 -- Approved --> Cert([PEC Degree Clearance Certificate Minted])
```

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **PEC Role-Based Access Control** | Dedicated portals for **Students** (indexed by 8-digit PEC SID, e.g. `22103042`), **Department Staff** (positional designations), and **Dean Academic Affairs (DAA)**. |
| **Parallel & Sequential Gates** | Concurrency at Gate 1 with automated dependency unlocking at Gates 2 & 3. |
| **Tamper-Evident Signatures** | Cryptographic HMAC-SHA256 digital signature seals per department approval. |
| **Grievance SLA Engine** | Student appeals (e.g. disputed hostel mess dues) with priority-based SLA deadlines (Critical: 4h, High: 12h, Medium: 24h, Low: 48h) and auto-escalation to the DAA upon breach. |
| **Verifiable PEC PDF Certificates** | Downloadable institutional certificate generated via ReportLab bearing official PEC Chandigarh letterhead, DAA, and DSA signatures. |
| **Public Verification Portal** | Allows employers, verification agencies, or foreign universities to validate certificate authenticity via SHA-256 hash or Certificate ID. |
| **Bottleneck Analytics** | Identifies departmental clearance delays, average resolution hours, and pending backlogs across PEC facilities. |
| **Immutable Audit Trail** | Tamper-evident system log tracking every approval, rejection, and escalation event. |

---

## 👥 Demo Personas (One-Click Switcher Available in UI)

All demo accounts use password: `password123`

| Role | Persona Name | Email | Scenario & Purpose |
| :--- | :--- | :--- | :--- |
| **Student (Cleared)** | Alice Sharma | `alice@pec.edu.in` | B.Tech CSE (SID: `22103042`). All 5 gates approved. PEC certificate ready. |
| **Student (In-Progress)**| Bobdeep Singh | `bob@pec.edu.in` | B.Tech ECE (SID: `22104018`). Library & Kurukshetra Hostel approved; Gymkhana ₹500 pending. |
| **Student (Rejected)** | Charlie Verma | `charlie@pec.edu.in` | B.Tech Mech (SID: `22105029`). Shivalik mess fee (₹3,500) disputed; SLA escalated to DAA. |
| **Student (Demo Apply)**| Alex Grover | `student@pec.edu.in` | B.Tech CSE (SID: `22103001`). Clean student account ready to apply for a new clearance. |
| **Staff (Library)** | Librarian / Head, Central Library | `library@pec.edu.in` | Dr. B.R. Ambedkar Central Library (Gate 1). |
| **Staff (Hostels)** | Chief Warden (Hostels) | `hostel@pec.edu.in` | Shivalik, Kurukshetra, Himalaya, Aravali, KCH Hostels (Gate 1). |
| **Staff (Sports)** | President Gymkhana / Sports In-Charge | `sports@pec.edu.in` | PEC Gymkhana & Swimming Pool Complex (Gate 1). |
| **Staff (Labs)** | Head of Department (HOD) - Computing & Labs | `labs@pec.edu.in` | Departmental Research & Computing Labs (Gate 2 Dependency). |
| **Staff (Accounts)** | Accounts Officer (Caution Money Branch) | `accounts@pec.edu.in`| Caution Money Security Deposit Refund Release (Gate 3). |
| **Administrator** | Dean Academic Affairs (DAA) | `admin@pec.edu.in` | Academic Affairs & Institutional Roster Oversight (PEC Chandigarh). |

---

## ⚡ Quick Start Guide

### 1. Backend Setup & Run

```bash
# 1. Activate Python virtual environment
source venv/bin/activate

# 2. Run database seed (initializes PEC departments, officials, students & requests)
python3 -m backend.app.seed

# 3. Start FastAPI server
uvicorn backend.app.main:app --reload --port 8000
```
- Backend API Docs (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)
- API Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Frontend Setup & Run

```bash
# In a separate terminal:
cd frontend
npm run dev
```
- Frontend Web App: [http://localhost:5173](http://localhost:5173)

---

## 🧪 Testing & Code Quality Verification

### Run Pytest Suite (73 Automated Tests - 100% Pass Rate with Code Coverage)
```bash
./venv/bin/pytest -v --cov=backend/app --cov-report=term-missing
```

### Run Flake8 Static Analysis (0 Violations - PEP 8)
```bash
./venv/bin/flake8 backend/app backend/tests
```

---

## 📖 Software Engineering Coursework Deliverables (Frozen Baseline v3.0.0)

> The specifications below represent the **Frozen Architectural Baseline**. All system boundaries, data contracts, state lifecycles, and sequence models are permanently frozen to ensure decoupling from implementation details.

| Deliverable | Standard / Framework | Description | PDF Document | Markdown Source |
| :--- | :---: | :--- | :---: | :---: |
| **1. Software Requirements Specification (SRS)** | **IEEE Std 830-1998** | Full requirements covering PEC 8-digit SIDs, positional roles, INR (`₹`) currency, 3-gate pipeline, and SLA grievance escalation. | [📥 `SRS.pdf`](./docs/SRS.pdf) | [`SRS.md`](./docs/SRS.md) |
| **2. Data Flow Diagrams (DFD) & Data Dictionary** | **Yourdon / Gane & Sarson SSAD** | Context Level 0, Level 1 Decomposition, Level 2 Functional DFDs (Clearance Gating, SLA Redressal, Certificate Minting), and Data Dictionary (`DS-1` to `DS-6`). | [📥 `DFD.pdf`](./docs/DFD.pdf) | [`DFD.md`](./docs/DFD.md) |
| **3. Unified Modeling Language (UML) Models** | **OMG UML 2.5 Specification** | Full suite of models: Use Case with `<<include>>`/`<<extend>>`, Class Diagram, Activity Diagram, Sequence Diagrams (1-3), State Machine, and Component Diagram. | [📥 `UML_DIAGRAMS.pdf`](./docs/UML_DIAGRAMS.pdf) | [`UML_DIAGRAMS.md`](./docs/UML_DIAGRAMS.md) |
| **4. Chain of Responsibility (CoR) Design Pattern** | **GoF Behavioral Pattern** | Detailed technical report documenting the multi-department approval chain, parallel Gate 1, sequential Gate 2/3 barriers, HMAC seals, and Admin overrides. | [📥 `DESIGN_PATTERNS.pdf`](./docs/DESIGN_PATTERNS.pdf) | [`DESIGN_PATTERNS.md`](./docs/DESIGN_PATTERNS.md) |
| **5. Static Code Quality & Refactoring Analysis** | **PEP 8 / Flake8 / SonarQube** | Static analysis report verifying 0 PEP 8 violations, cyclomatic complexity control, maintainability index, and Coursework Units 5 & 6 compliance. | [📥 `STATIC_CODE_QUALITY.pdf`](./docs/STATIC_CODE_QUALITY.pdf) | [`STATIC_CODE_QUALITY.md`](./docs/STATIC_CODE_QUALITY.md) |
| **6. SDLC & Process Model Specification** | **ISO/IEC/IEEE 12207 / V-Model** | Rigorous evaluation of candidate models, formal justification of the **V-Model (V&V)** for frozen SRS baselines, MCDA scoring matrix, and bidirectional Requirements Traceability Matrix (RTM). | [📥 `SDLC_PROCESS_MODEL.pdf`](./docs/SDLC_PROCESS_MODEL.pdf) | [`SDLC_PROCESS_MODEL.md`](./docs/SDLC_PROCESS_MODEL.md) |
| **7. Software Test Plan (STP) & Verification Specification** | **IEEE Std 829-2008 & ISO 29119** | Industrial-grade Software Test Plan specifying all levels of testing, Black-Box BVA/EP partitions, White-Box statement/branch coverage, security RBAC testing, and 73-test catalog. | [📥 `SOFTWARE_TEST_PLAN.pdf`](./docs/SOFTWARE_TEST_PLAN.pdf) | [`SOFTWARE_TEST_PLAN.md`](./docs/SOFTWARE_TEST_PLAN.md) |

---

## 🌿 Repository Branch Structure
This repository maintains two dedicated branches on GitHub:
- **`code` Branch (Default):** Complete full-stack codebase with FastAPI backend, React 19 frontend, automated tests, and documentation.
- **[`docs` Branch](https://github.com/rags-git/pec-clearance-automation-engine/tree/docs):** Dedicated documentation branch containing strictly the frozen academic deliverables and vector PDF publications.
