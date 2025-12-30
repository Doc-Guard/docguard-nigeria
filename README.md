<div align="center">
  <h1>DocGuard Nigeria 🏦🇳🇬</h1>
  <h3>The Automated Loan Compliance Fortress</h3>
  <p><i>Draft, Perfect, and Verify Loans in Hours, Not Weeks.</i></p>
</div>

---

## 💡 Inspiration
In Nigeria's ₦15 trillion corporate lending market, **time kills deals**. A single syndicated loan can involve 3+ weeks of LMA template adaptation and 21+ days of manual CAC registration.

**DocGuard** is an AI-powered desktop command center that automates this entire lifecycle, bridging the gap between international LMA standards and Nigerian regulatory requirements (CAMA 2020).

## 🚀 Features

### 1. LMA Smart Document Builder
*   **AI Clause Analysis**: Gemini-powered risk scoring for every clause.
*   **Magic Rewrite**: One-click adaptation to Nigerian legal context.
*   **Smart Variables**: Auto-detection and filling of `{{Borrower}}`, `{{Facility Amount}}`, etc.

### 2. CAC Registry Bot (RPA Simulation)
*   **Automated Filing**: Simulates the manual perfection process at the Corporate Affairs Commission.
*   **Real-time Logging**: Terminal-style visibility into every step.
*   **Native Notifications**: Desktop alerts when filings are perfected.

### 3. KYC Orchestrator
*   **Identity Verification**: Simulated NIN/BVN checks.
*   **Document Scanner**: AI-powered OCR and validity feedback.
*   **Liveness Detection**: Integrated camera interface.

### 4. Loan Origination Pipeline
*   **Centralized Facility Management**: Structure loans with specific types, durations, and currencies.
*   **Deep Context Linking**: Link documents, regulatory filings, and KYC checks directly to active facilities.
*   **Unified Dashboard**: Monitor the entire lifecycle of a loan from origination to perfection.

### 4. Loan Origination Pipeline
*   **Centralized Facility Management**: Create and track loans with specific types, durations, and currencies.
*   **Deep Context Linking**: Link documents, regulatory filings, and KYC checks directly to active facilities.
*   **Unified Dashboard**: Monitor the entire lifecycle of a loan from origination to perfection.

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + TypeScript + Tailwind CSS |
| **Desktop Shell** | Electron 39 (Secure IPC + Context Isolation) |
| **AI Engine** | Google Gemini API (`@google/genai`) |
| **Build System** | Vite + esbuild + electron-builder |
| **Database** | Supabase (PostgreSQL) |

## 📦 Installation
**Prerequisites**: Node.js v18+

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Doc-Guard/docguard-nigeria.git
    cd docguard-nigeria
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # Note: If esbuild binary is missing, run: npm install --save-dev esbuild
    ```

3.  **Configure Environment**
    Create `.env` based on `.env.example` and add your keys:
    ```env
    VITE_GEMINI_API_KEY=your_key_here
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    ```

## 🏃‍♂️ Running the App

### Development Mode
```bash
# Run web version
npm run dev

# Run Electron desktop version
npm run electron:dev
```

### Build for Production
To generate the Linux AppImage and Windows Portable Executable:
```bash
npm run build && npm run build:electron && npx electron-builder --linux --win
```
_Note: Windows installer generation requires Wine on Linux._

## 🔐 Security
*   **Credential Obfuscation**: API keys are XOR-encrypted in production builds.
*   **Context Isolation**: Enabled in Electron main process.

---
*Built for the LMA Edge Hackathon 2025.*
