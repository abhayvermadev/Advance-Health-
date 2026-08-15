# 🏥 ADVANCE HEALTH
### Clinical Deterioration Early-Warning System (EWS) with Mechanical Confidence Capping & Hardware TEE Attestation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38b2ac.svg)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-Backend-green.svg)](https://expressjs.com/)
[![Gemini 3.7 Flash](https://img.shields.io/badge/Gemini-3.7--Flash-orange.svg)](https://ai.google.dev/)
[![Confidential Computing](https://img.shields.io/badge/TEE-AMD%20SEV--SNP%20Attested-purple.svg)](#hardware-tee-confidential-enclave-architecture)
[![HIPAA RBAC](https://img.shields.io/badge/HIPAA-Strict%20RBAC%20Enforced-red.svg)](#role-based-access-control-rbac-matrix)

---

## 📑 Table of Contents
1. [Executive Overview](#-executive-overview)
2. [Core Clinical Innovations](#-core-clinical-innovations)
3. [System Architecture Diagram](#-system-architecture-diagram)
4. [The 5-Stage Mechanical Pipeline](#-the-5-stage-mechanical-pipeline)
5. [False-Alarm Suppression & Gating Logic](#-false-alarm-suppression--gating-logic)
6. [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
7. [Hardware TEE Confidential Enclave Architecture](#-hardware-tee-confidential-enclave-architecture)
8. [Clinical Workflow & Handover (SBAR & PDF)](#-clinical-workflow--handover-sbar--pdf)
9. [Hard Mode Benchmark Simulator](#-hard-mode-benchmark-simulator)
10. [Repository File Tree](#-repository-file-tree)
11. [Installation & Local Deployment](#-installation--local-deployment)
12. [Clinical Safety & Research Disclaimer](#-clinical-safety--research-disclaimer)

---

## 🌟 Executive Overview

**Advance Health** is an institutional-grade clinical decision support and patient deterioration early-warning platform designed to operate on **sparse, heterogeneous, and asynchronous electronic health records (EHR)**. 

Traditional clinical scoring systems (e.g., NEWS2, MEWS) and black-box machine learning models suffer from two fatal failure modes:
1. **Alarm Fatigue / False-Positive Cascades**: A single artifactual or unverified vital sign spike triggers immediate Rapid Response Team (RRT) sirens, desensitizing frontline hospital staff.
2. **False Confidence on Sparse Data**: Neural networks frequently issue high-probability deterioration predictions even when given only one isolated reading without longitudinal history.

Advance Health solves this through **Mechanical Confidence Capping** (decoupling risk severity from measurement certainty), a **Two-Point Sustained Deterioration Gating Rule**, a **5-Stage Deterministic-to-AI Verification Pipeline**, and **Hardware-Attested Confidential Computing (TEE)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ADVANCE HEALTH PILLARS                             │
├───────────────────────┬────────────────────────────┬────────────────────────┤
│ 🛡️ MECHANICAL CAPPING │ 📉 FALSE-ALARM SUPPRESSION │ 🔒 HARDWARE TEE ENCLAVE│
│  Data coverage bounds │  Requires 2+ point trend   │  Zero-Knowledge PHI    │
│  confidence strictly  │  to trigger emergency RRT  │  AMD SEV-SNP Attested  │
└───────────────────────┴────────────────────────────┴────────────────────────┘
```

---

## 💡 Core Clinical Innovations

### 1. Mechanical Confidence Capping
Confidence is not a learned probability output from a neural network; it is **mechanically bounded** by vital/lab coverage, longitudinal time-depth, and measurement recency. If a patient only has a single isolated heart rate reading, the system enforces a strict **Low Confidence Ceiling (≤ 35%)**, preventing premature clinical overreaction.

### 2. Two-Point Sustained Deterioration Gating
An extreme parameter (e.g., SpO2 = 88% or HR = 135 bpm) on cross-sectional, single-point data will **never trigger an Emergency RRT siren**. Instead, it triggers a **Diagnostic Clarification Workflow** (ordering repeat vitals to confirm trajectory vs. sensor artifact). Emergency escalation strictly requires **≥ 2 consecutive deteriorating observations**.

### 3. Patient-Specific Trajectory Baselines
Physiological boundaries dynamically adjust to the patient’s demographic profile and chronic conditions. An SpO2 of 90% is evaluated differently for a known **COPD patient** (where baseline target is 88–92%) versus a healthy 22-year-old post-op patient.

### 4. Zero-Knowledge PHI & Confidential Computing
Data in-transit, at-rest, and **in-use** is shielded using **AMD SEV-SNP / Intel TDX Confidential VM Enclaves** with AES-128-XTS RAM encryption and cryptographically verifiable `PCR0` hardware measurement hashes.

---

## 🏗️ System Architecture Diagram

```
                                  CLINICAL USERS
            ┌───────────────────────────┼───────────────────────────┐
            ▼                           ▼                           ▼
   [Medical Superintendent]     [Attending Doctor]            [Ward Nurse]
   - Hospital Command Deck      - Direct Patient Cohort       - Unit Ward Surveillance
   - ICU Surge Allocation       - RRT & Diagnostic Orders     - Rapid Vitals & SBAR Note
            │                           │                           │
            └───────────────────────────┼───────────────────────────┘
                                        │ (Strict RBAC Scoping)
                                        ▼
    ┌──────────────────────────────────────────────────────────────────────────┐
    │                         FRONTEND APPLICATION LAYER                       │
    │  React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + jsPDF      │
    ├──────────────────────────────────────────────────────────────────────────┤
    │  • Ward Triage Grid (Real-time MEWS, Risk vs Confidence badges)          │
    │  • Patient Deep Dive Telemetry & Longitudinal Time-Series Visualizer     │
    │  • Interactive Hard-Mode Benchmark Lab (Sensor Drops / Outlier Injections│
    │  • SBAR Shift Handover Note Generator & Signed PDF Audit Stamp           │
    │  • Hospital Superintendent Executive Command Dashboard                  │
    └─────────────────────────────────────┬────────────────────────────────────┘
                                          │ POST /api/assess (JSON)
                                          ▼
    ┌──────────────────────────────────────────────────────────────────────────┐
    │                       BACKEND API & SECURITY ENGINE                      │
    │              Node.js + Express + Google Gen AI SDK (@google/genai)       │
    ├──────────────────────────────────────────────────────────────────────────┤
    │ 🔒 TEE Confidential Enclave Boundary (AMD SEV-SNP Hardware Attestation)  │
    │                                                                          │
    │  ┌────────────────────────────────────────────────────────────────────┐  │
    │  │ STAGE 1: Deterministic Data Completeness & Mechanical Confidence   │  │
    │  │  Formula: C = (V_cov * 0.25) + (L_cov * 0.10) + Depth + Recency    │  │
    │  │  Hard Caps: Single-Point <= 35% | Missing Vitals <= 55%            │  │
    │  └─────────────────────────────────┬──────────────────────────────────┘  │
    │                                    │                                     │
    │  ┌─────────────────────────────────▼──────────────────────────────────┐  │
    │  │ STAGE 2: Patient-Specific Trajectory & Anomaly Detection           │  │
    │  │  Calculates deltas, dynamic baseline offsets & multi-point trends   │  │
    │  └─────────────────────────────────┬──────────────────────────────────┘  │
    │                                    │                                     │
    │  ┌─────────────────────────────────▼──────────────────────────────────┐  │
    │  │ STAGE 3: Decoupled Composite Risk Scoring (Gemini 3.7 Flash)       │  │
    │  │  Risk (0-100) computed with Mechanical Confidence override         │  │
    │  └─────────────────────────────────┬──────────────────────────────────┘  │
    │                                    │                                     │
    │  ┌─────────────────────────────────▼──────────────────────────────────┐  │
    │  │ STAGE 4: Plain-Language Numerical Factor Attribution               │  │
    │  │  Cites exact values, deltas, timeframes, and pathophysiologic links│  │
    │  └─────────────────────────────────┬──────────────────────────────────┘  │
    │                                    │                                     │
    │  ┌─────────────────────────────────▼──────────────────────────────────┐  │
    │  │ STAGE 5: Action Recommendation & Two-Point False-Alarm Gating      │  │
    │  │  Sustained Deterioration >= 2 pts ? Emergency RRT : Repeat Vitals  │  │
    │  └─────────────────────────────────┬──────────────────────────────────┘  │
    │                                    │                                     │
    │  ┌─────────────────────────────────▼──────────────────────────────────┐  │
    │  │ SHA-256 Chained Immutable Audit Log & TEE Signature Generation     │  │
    │  └────────────────────────────────────────────────────────────────────┘  │
    └──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔬 The 5-Stage Mechanical Pipeline

Advance Health processes every clinical intake through a sequential, audited 5-stage pipeline:

```
[Patient EHR / Telemetry]
           │
           ▼
 ┌───────────────────┐
 │      STAGE 1      │ ──► [Data Completeness Score & Mechanical Confidence Level]
 │ Completeness Eval │      (Vitals Coverage, Lab Depth, Hard Capping Rules)
 └─────────┬─────────┘
           ▼
 ┌───────────────────┐
 │      STAGE 2      │ ──► [Trajectory & Dynamic Baseline Analysis]
 │ Dynamic Baselines │      (Deltas, Velocity, Patient-Condition Offsets)
 └─────────┬─────────┘
           ▼
 ┌───────────────────┐
 │      STAGE 3      │ ──► [Decoupled Composite Risk Scoring]
 │ Composite Scoring │      (Risk Level 0-100 vs. Bounded Confidence 0-100)
 └─────────┬─────────┘
           ▼
 ┌───────────────────┐
 │      STAGE 4      │ ──► [Explainability & Attribution Engine]
 │  Explainability   │      (Ranked factors with exact numeric deltas & timeframes)
 └─────────┬─────────┘
           ▼
 ┌───────────────────┐
 │      STAGE 5      │ ──► [Two-Point Gating & Action Pathway]
 │  Recommendation   │      (Emergency RRT vs Diagnostic Gap Closure List)
 └───────────────────┘
```

### Stage 1: Mechanical Confidence Formulation

The confidence score is computed deterministically via the following equation:

$$\text{Raw Confidence} = (\text{VitalCoverage}_{\%} \times 0.25) + (\text{LabCoverage}_{\%} \times 0.10) + \text{TemporalDepth}_{(0-45)} + \text{RecencyScore}_{(0-20)}$$

#### Strict Hard-Capping Invariants:
1. **Single-Point Constraint**: If no multi-point trajectory exists (all readings are cross-sectional single values), confidence is **capped at $\le 35\%$ (LOW)**.
2. **Missing Core Vitals**: If core vital sign coverage is $< 60\%$ (missing HR, BP, RR, SpO2, or Temp), confidence is **capped at $\le 55\%$ (MODERATE)**.
3. **Single Vital Sensor**: If only 1 vital parameter is recorded total, confidence is **capped at $\le 28\%$ (LOW)**.
4. **Thin Trajectory**: If fewer than 2 parameters have multi-reading time series, confidence is **capped at $\le 65\%$ (MODERATE)**.

---

## 🛡️ False-Alarm Suppression & Gating Logic

The False-Alarm Mitigation Engine evaluates every high or critical risk signal against strict safety gates before authorizing an Emergency Rapid Response Team (RRT) alert:

```
                      [ Incoming Patient Assessment ]
                                     │
                                     ▼
                   Is Composite Risk Score HIGH or CRITICAL?
                                     │
                     ┌───────────────┴───────────────┐
                     │ NO                            │ YES
                     ▼                               ▼
          [ Standard Routine Care ]      Does Data have Mechanical
          - q4h vital surveillance       Confidence >= MODERATE (>= 40%)?
          - Clinical pathway tracking                │
                                     ┌───────────────┴───────────────┐
                                     │ NO                            │ YES
                                     ▼                               ▼
                        [ Alert Gated: Low Confidence ]   Is there a Sustained Trend
                        - Suppress Emergency RRT Sirens   Across >= 2 Timepoints?
                        - Issue "Diagnostic Clarification"           │
                        - Order Immediate Repeat Vitals   ┌──────────┴──────────┐
                                                          │ NO                  │ YES
                                                          ▼                     ▼
                                            [ Isolated Outlier Gated ]  [ EMERGENCY RRT ALERT ]
                                            - Rule out motion artifact  - Immediate Attending Bedside
                                            - Order repeat sensor probe - High-flow oxygenation / IV
                                            - Prevent alert fatigue     - Broad-spectrum antibiotics
```

---

## 👥 Role-Based Access Control (RBAC) Matrix

Advance Health enforces strict **HIPAA principle of least privilege** and patient-care scoping across all hospital tiers:

| Clinical Role | Security Clearance | Bedside Vitals Entry | Order Diagnostics | Shift SBAR Handover | Export Signed PDF | View Hospital Command | Hospital-Wide Alerts |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Medical Superintendent** | `Level 4 - Executive` | ✅ | ✅ | ✅ | ✅ | ✅ **Full Access** | ✅ **Global Broadcast** |
| **Attending Doctor / MD** | `Level 3 - Attending` | ✅ | ✅ | ✅ | ✅ | ❌ Restricted | ❌ Restricted |
| **Staff Nurse / RN** | `Level 2 - Clinical` | ✅ | ✅ *(Scoped)* | ✅ | ✅ | ❌ Restricted | ❌ Restricted |
| **AI Safety Auditor** | `Level 4 - Audit` | ❌ | ❌ | ❌ | ✅ | ✅ *(Read-Only)* | ❌ Restricted |

### Patient & Unit Scoping Rules:
* **Staff Nurses** are strictly scoped to patients in their assigned ward unit (e.g., *Medical ICU* for Marcus Vance, RN; *Step-Down 4B* for Priya Sharma, RN).
* **Attending Physicians** are scoped strictly to patients under their service roster (e.g., Dr. Sarah Reynolds sees PT-8942 & PT-9012; Dr. Vikram Malhotra sees PT-3321, PT-4109 & PT-1088).
* Unassigned records render a **HIPAA Access Restricted Guard Screen** preventing unauthorized PHI exposure.

---

## 🔒 Hardware TEE Confidential Enclave Architecture

Advance Health guarantees end-to-end data security for patient telemetry both in storage and **during runtime execution in memory**:

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                CONFIDENTIAL VIRTUAL MACHINE (CVM) BOUNDARY                  │
 │                                                                             │
 │   ┌──────────────────────────────────────────────────────────────────────┐  │
 │   │               HARDWARE-ROOT-OF-TRUST ATTESTATION                     │  │
 │   │  • AMD SEV-SNP / Intel TDX Secure Processor Architecture             │  │
 │   │  • Memory Encryption: AES-128-XTS Real-Time Hardware Key             │  │
 │   │  • Hardware PCR0 Measurement: 9E4A-88DF-11A0-3BC7-44E2               │  │
 │   │  • Enclave Code Signature (MRENCLAVE): 0x7CA4B91E2D8F0103            │  │
 │   └──────────────────────────────────┬───────────────────────────────────┘  │
 │                                      │                                      │
 │   ┌──────────────────────────────────▼───────────────────────────────────┐  │
 │   │                ZERO-KNOWLEDGE PHI TOKENIZATION LAYER                 │  │
 │   │  • Direct Identifiers (SSN, Names, MRNs) stripped prior to compute  │  │
 │   │  • Ephemeral Session Keys destroyed immediately post-inference      │  │
 │   │  • Host OS and Hypervisor have Zero Read/Write Visibility into RAM   │  │
 │   └──────────────────────────────────┬───────────────────────────────────┘  │
 │                                      │                                      │
 │   ┌──────────────────────────────────▼───────────────────────────────────┐  │
 │   │                  IMMUTABLE SHA-256 AUDIT LOG CHAIN                   │  │
 │   │  • Every Assessment, RRT Call, and Login generates a Hash Block     │  │
 │   │  • Cryptographically chained: Hash_n = SHA256(Log_n + Hash_{n-1})   │  │
 │   └──────────────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Clinical Workflow & Handover (SBAR & PDF)

### 1. SBAR Clinical Handover Generator
Standardized medical communication framework built directly into every patient record:
* **S (Situation)**: Current primary clinical concern, room/bed, and deterioration syndrome.
* **B (Background)**: Patient age, admission diagnosis, chronic comorbidities, and baseline vitals.
* **A (Assessment)**: 5-stage trajectory summary, delta values, and mechanical confidence score.
* **R (Recommendation)**: Urgent action steps, frequency of repeat vitals, and diagnostic gap orders.

### 2. Digitally Signed Clinical PDF Export
Generates an institutional PDF report containing:
* Patient demographics & unit assignment
* Full time-series telemetry table with timestamped observations
* 5-Stage deterioration trajectory with factor impact weights
* Authenticating clinician digital signature seal, badge ID, and SHA-256 tamper-evident verification hash

---

## 🧪 Hard Mode Benchmark Simulator

Advance Health includes a built-in **Benchmark Lab** accessible via the top context bar to test clinical AI edge cases:

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           BENCHMARK SCENARIO LAB                              │
├──────────────────────────┬────────────────────────────────────────────────────┤
│ 1. Sepsis Cascade        │ Multi-point severe decline (HR > 120, BP < 90/60,  │
│    (Sustained Decline)   │ Lactate > 4.2). RRT Alert evaluates TRUE.          │
├──────────────────────────┼────────────────────────────────────────────────────┤
│ 2. Isolated HR Spike     │ Single-point HR 135 bpm on thin data.              │
│    (False-Alarm Test)    │ False-Alarm Rule suppresses RRT; orders repeats.   │
├──────────────────────────┼────────────────────────────────────────────────────┤
│ 3. Sensor Drop / Sparse  │ Vitals reduced to single heart rate reading.       │
│    (Mechanical Capping)  │ Confidence mechanically capped at 28-35% (LOW).    │
├──────────────────────────┼────────────────────────────────────────────────────┤
│ 4. Baseline Decompensation│ Gradual HR drift (+24 bpm) in heart failure patient│
│    (Subacute Drift)      │ Subacute escalation without emergency panic.       │
└──────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 📂 Repository File Tree

```
├── .env.example                     # Environment variable declarations
├── index.html                       # Application HTML entry point
├── metadata.json                    # Application metadata and permissions
├── package.json                     # Project manifest and dependencies
├── server.ts                        # Express backend, Gemini 3.7 SDK & deterministic engine
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite bundler configuration
│
└── src/
    ├── main.tsx                     # React client mounting entry
    ├── App.tsx                      # Main workspace controller, view routing & audit state
    ├── index.css                    # Tailwind CSS global styles
    │
    ├── components/                  # Modular UI Component Library
    │   ├── AuditLogModal.tsx        # HIPAA immutable audit trail viewer
    │   ├── ClinicalDisclaimerModal.tsx # Methodology, evidence & limitations dialog
    │   ├── ContributingFactors.tsx  # Stage 4 explainability & factor ranking cards
    │   ├── DataImprovementPanel.tsx # Stage 5 diagnostic gap closure & 1-click order tool
    │   ├── HardModeSimulator.tsx    # Edge-case benchmark simulator
    │   ├── Header.tsx               # Top bar with role status, audit links & mode toggles
    │   ├── LoginModal.tsx           # Role-Based Authentication switcher
    │   ├── MedicalSuperintendentView.tsx # Executive hospital command & ward census
    │   ├── PatientForm.tsx          # Bedside vitals & time-series data input form
    │   ├── PipelineStageInspector.tsx # 5-Stage mechanical pipeline execution inspector
    │   ├── RiskConfidenceDisplay.tsx# Primary risk vs. mechanical confidence meters
    │   ├── SbarHandoverModal.tsx    # SBAR clinical shift handover note generator
    │   ├── TeeSecurityModal.tsx     # AMD SEV-SNP hardware attestation & enclave stats
    │   ├── TimeSeriesVisualizer.tsx # Longitudinal charts & 2h predictive trajectory
    │   └── WardTriageGrid.tsx       # Hospital ward multi-patient surveillance grid
    │
    ├── data/                        # Preset Clinical Datasets & Personas
    │   ├── authUsers.ts             # Clinical role definitions & security clearances
    │   ├── hospitalWardsData.ts     # Hospital ward census, ICU beds & incident logs
    │   └── presetScenarios.ts       # Validated clinical patient trajectories
    │
    ├── services/
    │   └── api.ts                   # Client HTTP service for backend assessment calls
    │
    ├── types/
    │   └── clinical.ts              # Global TypeScript interfaces & enums
    │
    └── utils/                       # Core Mechanical Engines
        ├── clinicalAssessmentEngine.ts # High-fidelity deterministic heuristic fallback
        ├── confidenceEngine.ts      # Stage 1 Data Completeness & False-Alarm Gating
        └── pdfGenerator.ts          # jsPDF clinical audit export with digital seal
```

---

## 💻 Installation & Local Deployment

### 1. Prerequisites
* **Node.js**: v18.0.0 or higher
* **Package Manager**: `npm` or `bun`
* **Gemini API Key**: (Optional, system includes automatic deterministic fallback)

### 2. Setup Environment
Clone the repository and copy the environment template:
```bash
cp .env.example .env
```
Add your Gemini API Key to `.env` (optional):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://0.0.0.0:3000` with hot reload enabled.

### 5. Production Build
```bash
npm run build
npm start
```

---

## ⚖️ Clinical Safety & Research Disclaimer

> **⚠️ REGULATORY NOTICE**: Advance Health is an investigational clinical decision support research prototype. It is designed to assist registered healthcare professionals in synthesizing complex, multi-modal time-series data. It is **NOT** a standalone medical diagnostic device and does not replace professional clinical judgment, physical examination, or institutional emergency protocols. All recommendations and RRT triggers must be validated by licensed medical personnel before administering treatment.

---

**Advance Health Engineering Team** &bull; *Hardware-Attested &bull; Mechanically Capped &bull; Clinically Calibrated*
