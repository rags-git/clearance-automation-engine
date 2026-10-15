# Punjab Engineering College (PEC Chandigarh)
## Academic Grievance, No-Dues & Clearance Automation Engine
### Software Engineering Capstone Coursework Documentation Package
**Institution:** Punjab Engineering College (Deemed to be University), Sector 12, Chandigarh - 160012  
**Administrative Authority:** Office of the Dean Academic Affairs (DAA)  
**Baseline Version:** 3.0.0 (FROZEN ARCHITECTURAL BASELINE)  
**Status:** RATIFIED & FROZEN FOR ACADEMIC EVALUATION  

---

## 🏛️ Executive Overview
This branch contains the **official, frozen software engineering specifications, architectural models, and static code quality reports** for the Academic Grievance, No-Dues & Clearance Automation Engine at Punjab Engineering College, Sector 12, Chandigarh.

All system boundaries, mathematical formulations, data schemas, and UML interaction sequences in this package are **permanently frozen** and available in both **Markdown format** and **publication-ready vector PDF format**.

---

## 📚 Complete Documentation Deliverables (PDF & Markdown)

| Deliverable | Standard / Formal Framework | Description | PDF Document | Markdown Source |
| :--- | :---: | :--- | :---: | :---: |
| **1. Software Requirements Specification (SRS)** | **IEEE Std 830-1998** | Requirements specification covering PEC 8-digit SIDs (`YYBBBRRR`), positional roles, INR (`₹`) currency, 3-gate pipeline, and SLA grievance escalation. Includes the 8 IEEE 830 quality attributes compliance matrix. | [📥 `docs/SRS.pdf`](./docs/SRS.pdf) | [`docs/SRS.md`](./docs/SRS.md) |
| **2. Data Flow Diagrams (DFD) & Data Dictionary** | **Yourdon & DeMarco / Gane & Sarson SSAD** | Multi-level data transformations: Context Level 0 Diagram, Level 1 Decomposition, Level 2 Functional DFDs (Clearance Gating, SLA Redressal, Certificate Minting), and comprehensive Data Dictionary (`DS-1` to `DS-6`). | [📥 `docs/DFD.pdf`](./docs/DFD.pdf) | [`docs/DFD.md`](./docs/DFD.md) |
| **3. Unified Modeling Language (UML) Models** | **OMG UML 2.5 Specification** | Full suite of structural and behavioral models: Use Case Diagram with `<<include>>`/`<<extend>>`, Domain Class Diagram with GoF CoR classes, Activity Diagram with parallel forks/joins, Sequence Diagrams (Clearance, SLA Escalation, DAA Override), State Machine, and 3-Tier Component Diagram. | [📥 `docs/UML_DIAGRAMS.pdf`](./docs/UML_DIAGRAMS.pdf) | [`docs/UML_DIAGRAMS.md`](./docs/UML_DIAGRAMS.md) |
| **4. Chain of Responsibility (CoR) Design Pattern** | **GoF Behavioral Pattern Standard** | Technical report documenting the multi-department approval chain, parallel Gate 1 execution, sequential Gate 2/3 barriers, cryptographic HMAC-SHA256 seals, and administrative overrides. | [📥 `docs/DESIGN_PATTERNS.pdf`](./docs/DESIGN_PATTERNS.pdf) | [`docs/DESIGN_PATTERNS.md`](./docs/DESIGN_PATTERNS.md) |
| **5. Static Code Quality & Refactoring Analysis** | **PEP 8 / Flake8 / SonarQube Metrics** | Static analysis report verifying 0 PEP 8 violations, cyclomatic complexity control, maintainability index, and Coursework Units 5 & 6 compliance. | [📥 `docs/STATIC_CODE_QUALITY.pdf`](./docs/STATIC_CODE_QUALITY.pdf) | [`docs/STATIC_CODE_QUALITY.md`](./docs/STATIC_CODE_QUALITY.md) |

---

## 🏛️ PEC Institutional Conventions Observed
1. **Student Identification:** Strict 8-digit PEC SID format (`YYBBBRRR`, e.g., `22103042`).
2. **Permanent Positional Titles:** Staff roles are administrative designations (*Dean Academic Affairs*, *Chief Warden*, *Librarian*, *President Gymkhana*, *HOD Labs*, *Accounts Officer*) that do not change during annual faculty rotations.
3. **Monetary Unit:** Strictly in Indian Rupees (`₹` / INR) with institutional Caution Money security deposit refunds (`₹10,000.00`).
4. **SLA Tiers:** Priority-based resolution windows:
   - `CRITICAL`: 4 Hours
   - `HIGH`: 12 Hours
   - `MEDIUM`: 24 Hours
   - `LOW`: 48 Hours
   - *Breach:* Automatic escalation to the Dean Academic Affairs (`is_escalated = True`).
5. **Cryptographic Validation:** Department sign-offs sealed with HMAC-SHA256; degree clearance certificates minted with SHA-256 integrity digests for unauthenticated public verification.

---

## 🔗 Related Branches on GitHub
- **[`code` Branch](https://github.com/rags-git/pec-clearance-automation-engine/tree/code):** Contains the complete full-stack web application source code (FastAPI + React 19 + Tailwind v4 + SQLite).
- **[`docs` Branch (This Branch)](https://github.com/rags-git/pec-clearance-automation-engine/tree/docs):** Contains strictly the coursework documentation deliverables, UML models, and static analysis reports.
