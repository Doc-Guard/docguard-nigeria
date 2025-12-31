<div align="center">
  <img src="public/logo.png" alt="DocGuard Logo" width="120" height="120" />
  <h1>DocGuard Nigeria 🏦🇳🇬</h1>
  <h3>The Intelligent Loan Compliance & Origination Operating System</h3>
  <p><i>From Term Sheet to Perfection in Minutes. Automated. Compliant. Secure.</i></p>

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-demo-mode">Demo Mode</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-installation">Installation</a>
  </p>
</div>

---

## 💡 The Problem
In Nigeria's ₦15 trillion corporate lending market, **administrative friction kills deals**. 
*   **LMA Adaptation**: Manual conversion of English law templates to Nigerian context takes weeks.
*   **CAC Perfection**: Filing charges at the Corporate Affairs Commission is manual, opaque, and prone to "query" delays.
*   **Disconnected Data**: KYC, Legal, and Compliance teams work in silos, re-typing the same RC Numbers and TINs 10x.

## 🛡️ The Solution: DocGuard
**DocGuard** is an AI-powered desktop command center that automates the entire secured lending lifecycle. It unifies **Origination**, **Documentation**, **KYC**, and **Regulatory Filing** into a single, intelligent workflow.

## 🚀 Core Capabilities

### 1. 🧠 Cross-Module Intelligence (New)
*   **Unified Data Flow**: Enter borrower details *once* during origination. DocGuard automatically propagates **RC Number**, **TIN**, and **BVN** to KYC checks, Legal Docs, and CAC Filings.
*   **Context-Aware**: Linking a loan to any module instantly pre-fills forms, eliminating manual entry errors.

### 2. 📝 LMA Smart Document Builder
*   **AI Clause Analysis**: Gemini 2.0 Flash analyzes clauses for risk against Nigerian Evidence Act 2023.
*   **Magic Rewrite**: One-click adaptation of UK-style covenants to Nigerian customized clauses.
*   **Legal Precision**: Automatically injects full corporate descriptors (e.g., *"Dangote Industries (with Registration No. RC123456)"*) into definitions.

### 3. 🏛️ CAC Registry Bot (RPA)
*   **Automated Perfection**: Native Electron robot simulates interaction with the CAC portal.
*   **Screenshot Hub & Evidence Vault**: Captures and cryptographically timestamps proof of filing (Uploads/Screenshots) to a secure Supabase bucket.
*   **Smart Pre-fill**: Auto-populates Charge Forms based on the linked loan's facility type and amount.

### 4. 🕵️‍♂️ KYC Orchestrator
*   **Corporate Due Diligence**: Parallel verification of **CAC Status** and **FIRS Tax Compliance**.
*   **Identity**: Simulated **NIN** and **BVN** validation for directors.
*   **Liveness**: Integrated webcam biometrics.

### 5. ⏰ Deadline Guardian
*   **Active Monitoring**: Tracks the mandatory **90-day registration window** (CAMA 2020).
*   **Smart Alerts**: Native desktop notifications warn you when a filing is approaching the "Void" risk threshold.

### 6. 💼 Origination Pipeline
*   **Structured Capture**: Standardized intake for Term Facilities, Revolving Credit, and Project Finance.
*   **Pipeline Dashboard**: Kanban-style view of all deals from "Lead" to "Disbursed".
## 🎮 Demo Mode (Verification Guide)

The application includes sophisticated mock services to demonstrate the "Happy Path" without needing live government API keys.

| Service | Trigger Input | Behavior |
| :--- | :--- | :--- |
| **CAC Registry** | `RC...` (e.g., `RC123456`) | Returns a valid "Active" limited liability company. |
| **CAC Registry** | Other | Throws "Company Not Found" error. |
| **FIRS (Tax)** | `10-12 Digits` (e.g., `1000234567`) | Returns a valid "Tax Compliant" status. |
| **FIRS (Tax)** | Other | Throws "TIN Invalid" error. |

**Try this Flow:**
1.  **Originate**: Create a loan for "Lagos Tech Ltd" with RC Number `RC999999` and TIN `1112223334`.
2.  **KYC**: Go to KYC, link "Lagos Tech Ltd". Watch the Corporate Verification step **auto-pass** with green checks.
3.  **Registry**: Go to CAC Registry, link "Lagos Tech Ltd". Click "Create Charge". Watch the form **auto-fill** with the RC Number.
4.  **Docs**: Go to Doc Builder, link "Lagos Tech Ltd". See "The Borrower" replaced with **"Lagos Tech Ltd (with Registration No. RC999999)"**.

## 🏗️ Architecture & Tech Stack

### Frontend (The Shell)
*   **Framework**: React 19 (Latest)
*   **Language**: TypeScript 5.8
*   **Styling**: Tailwind CSS v4 (Oxidized)
*   **Bundler**: Vite 6.2 (Superfast HMR)
*   **Icons**: Lucide React

### Desktop Layer (Electron)
*   **Engine**: Electron 39
*   **Security**: Context Isolation, Preload Scripts, encrypted local secrets.
*   **Features**: Native File System Access (for saving PDFs), Native Notifications, Shell Integration.

### Backend & AI (The Brain)
*   **Database**: Supabase (PostgreSQL 15) with Row Level Security (RLS).
*   **Storage**: Supabase Storage (Evidence Buckets).
*   **AI**: Google Gemini 2.0 Flash (`@google/genai` SDK) for clause analysis and risk scoring.


## 📦 Installation & Setup

**Prerequisites**:
*   Node.js v18+ (v20 Recommended)
*   **Bun** (Highly recommended for speed) or npm
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/Doc-Guard/docguard-nigeria.git
cd docguard-nigeria
```

### 2. Install Dependencies
We use **Bun** for lightning-fast installs, but npm works too.
```bash
# Using Bun (Recommended)
bun install

# Using npm
npm install
```

### 3. Smart Configuration
The app uses a secure secret generation script. You don't need to manually create a `.env` file for local testing unless you want to override defaults.
*   **Defaults**: The app will auto-generate encryption keys on startup.
*   **Optional**: Copy `.env.example` to `.env` to supply your own Google Gemini API Key.
    ```bash
    cp .env.example .env
    ```

## 🏃‍♂️ How to Run

### Mode A: Desktop Application (Recommended)
Experience the full power of DocGuard with Native File System access and Screenshot Hub.
```bash
# Development Mode
bun run electron:dev

# Production Build (Preview)
bun run build:electron && electron-builder --dir
```

### Mode B: Web Platform
Useful for quick UI testing without Electron dependencies.
```bash
bun run dev
```

## 🏗️ Building for Release
To generate the distributable binaries (AppImage, Snap, Setup.exe):

```bash
# Build for your current OS (Linux)
bun run electron:build

# The output will be in the `release/` directory:
# - release/DocGuard-0.5.0.AppImage
```

## 🔧 Troubleshooting
*   **`esbuild` error**: If you encounter architecture errors, run `node node_modules/esbuild/install.js`.
*   **Blank Screen**: Ensure you are running `bun run electron:dev` and not just opening the HTML file.

## 🔐 Security Architecture

DocGuard is built with a "Zero-Trust" mindset suitable for financial data.

### 1. Application Security (AppSec)
*   **Context Isolation**: The Electron main process (Node.js) is strictly isolated from the Renderer (React). Access to file system or sensitive APIs is only possible via a securely bridged `window.electron` API.
*   **Credential Protection**: API keys and secrets are **AES-256-GCM encrypted** during the build process and decrypted only in memory at runtime, preventing static analysis attacks.

### 2. Data Security
*   **Row Level Security (RLS)**: Database policies enforce that users can strictly *only* access resources (loans, filings, documents) that belong to their `user_id`.
*   **Evidence Vault**: Uploaded screenshots and documents are stored in private Supabase Storage buckets with strict access policies.

### 3. Operational Integrity
*   **Immutable Logs**: The RPA activity logs provide a tamper-evident audit trail of every interaction with the CAC portal.
*   **Cryptographic Timestamping**: PDF exports are stamped with the exact generation time and signer ID.

---
*Built for the LMA Edge Hackathon 2025.*
