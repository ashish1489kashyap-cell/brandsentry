# BrandSentry — AI-Powered Pre-Publication Brand Governance Platform

> **CODEAXIS Hackathon Round 2 Project**  
> GitHub Repository: [https://github.com/ashish1489kashyap-cell/brandsentry](https://github.com/ashish1489kashyap-cell/brandsentry)

BrandSentry is a pre-publication brand governance platform designed to protect brand reputation, voice consistency, and regulatory compliance across multi-channel digital publishing (LinkedIn, X, Blogs, Press Releases, Email Newsletters, and Advertising Copy).

---

## Architecture & Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: React 19, TypeScript
- **Styling**: Tailwind CSS (Navy SaaS Design System with high-contrast accessibility)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linting & Quality**: ESLint, TypeScript Strict Mode (`tsc --noEmit`)

---

## Phase 1: Project Foundation Features

1. **Shared Platform Shell & Navigation**
   - Responsive sidebar with active path highlighting (`Dashboard`, `Content Review`, `Brand Vault`, `Review History`, `Settings`).
   - Unified TopBar with workspace context, live status badges, and primary "Review Content" action.
   - Mobile slide-over drawer navigation and responsive layout.

2. **Governance Dashboard (`/`)**
   - Four core summary metric cards: *Reviews Analyzed*, *Detected Issues*, *Pending Approvals*, and *Compliance Rate*.
   - Recent Content Reviews table with severity badges, channel indicators, and inspection drawer.
   - Dual-view mode toggle: **Honest Empty State** (zero inventiveness baseline) vs. **Sample Benchmark View** (explicitly labeled illustrative data).

3. **Brand Vault (`/vault`)**
   - Central brand policy catalog categorizing rules by *Tone & Voice*, *Terminology*, *Legal Compliance*, and *Restricted Claims*.
   - Rule status toggle (Active/Disabled), severity ratings (Critical, Warning, Info), and guideline creation modal.

4. **Content Review Engine Shell (`/review`)**
   - Real-time pre-publication text scanner with channel presets (LinkedIn, X, Blog, Press Release, Email, Ads).
   - Local deterministic rule engine running brand nomenclature, unsubstantiated claim checks, and disclaimer detection.
   - Severity breakdown, compliance scoring (0–100), and interactive preset loaders (*Draft with Violations* vs. *Compliant Draft*).

5. **Review History & Audit Trail (`/history`)**
   - Historical audit log with channel and status filtering.
   - Full audit record inspection modal and export action hook.

6. **Workspace Settings (`/settings`)**
   - Governance policies, compliance threshold slider (50–100%), strict auto-block toggles.
   - AI Reasoning provider selector (Local Rules Engine, Claude 3.5 Sonnet, GPT-4o) and notifications setup.

7. **Review Engine Domain Utilities (`src/lib/engine/`)**
   - `types.ts`: Domain models for rules, evaluations, scans, severities, and channels.
   - `rules.ts`: Governance rules and pattern matchers.
   - `scorer.ts`: Deterministic compliance scoring algorithm and issue aggregator.

---

## Getting Started

### Prerequisites
- Node.js `v20+` (tested with Node.js `v24.13.0`)
- npm `v10+` (tested with npm `v11.6.2`)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/ashish1489kashyap-cell/brandsentry.git
cd brandsentry
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to access the BrandSentry dashboard.

### 3. Production Build & Linting
Validate the codebase against TypeScript and ESLint:
```bash
# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build
```

---

## Environment & Security Policy

- Local environment files (`.env`, `.env.local`) and API keys are explicitly excluded by `.gitignore`.
- Phase 1 does not transmit external data or require paid credentials.
- All evaluation in Phase 1 runs through the local deterministic governance engine.

---

## Phase 2 Roadmap

- **Multi-modal Visual Brand Scanner**: Analyze logo placement, contrast ratios, and color palettes in uploaded creatives.
- **LLM Contextual Reasoning**: Connect Claude 3.5 Sonnet / GPT-4o for subtle tone analysis and nuanced PR risk identification.
- **CMS & Social Connectors**: Direct publishing gate integrations with WordPress, HubSpot, Buffer, and Sprout Social.
- **Enterprise SSO & Audit Export**: Role-based access control (RBAC) and SOC2-compliant PDF audit export.
