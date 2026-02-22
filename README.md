# **🧠 Context Window**

**The asynchronous, AI-powered ghostwriter for your technical thoughts.**

Context Window is an IDE-like, developer-focused web application designed to solve the "blank page problem" for software engineers. It allows you to log chronological technical breadcrumbs (code snippets, errors, quick thoughts) while you work, and utilizes an LLM to compile those raw logs into a highly accurate, structured technical draft ready for review and publishing.

## **🛑 The Problem**

Engineers solve complex problems daily but rarely document them due to context-switching friction. By the time a feature is merged, the nuances of the journey—failed attempts, raw error logs, and specific architectural decisions—are forgotten. Staring at a blank page to write a technical blog post or post-mortem is a daunting chore.

## **💡 The Solution**

Log your thoughts in an IDE-like terminal feed as you build. When you are done, hit **Compile**. Context Window feeds your raw chronological traces to an AI model (Gemini, Claude, GPT-4o, or Kimi) which acts as a senior engineer, drafting a structured, perfectly formatted markdown article based *strictly* on your breadcrumbs.

## **✨ Key Features**

* **Zero-Friction Capture:** Keyboard-centric workflow. Hit Cmd+K to jump between traces, and use slash commands (/code, /error, /text) to format your logs instantly.
* **Soft Mutability:** Logs act like immutable console outputs to preserve forensic history, but allow quick inline editing to scrub accidental secrets (like API keys) before compilation.
* **Multi-Model LLM Compiler:** Utilizes an Adapter Pattern supporting multiple AI providers:
  * **Gemini (Default):** Fast, highly accurate reasoning.
  * **Claude 3.5 Sonnet:** Unmatched "engineer-to-engineer" tone.
  * **Kimi (Moonshot AI):** 200k context window for massive log payloads and raw JSON dumps.
  * **OpenAI GPT-4o:** The industry standard.
* **Split-Screen Review:** Compare the LLM-generated markdown directly against your original timestamped logs to verify technical accuracy.
* **GitHub OAuth:** Frictionless, secure login designed for developers.

## **🏗️ Architecture & Tech Stack**

Context Window is built as an enterprise-grade monorepo using **Turborepo** (pnpm), ensuring end-to-end type safety between the frontend and backend.

### **The Stack**

* **Frontend (apps/web):** React, TanStack Start (File-based routing, SSR), Tailwind CSS.
* **Backend (apps/api):** NestJS (Modular, strictly typed API).
* **Database:** PostgreSQL.
* **ORM:** Prisma (packages/database).
* **Validation:** Yup/Zod (packages/shared).

### **Monorepo Structure**

```
context-window/
├── apps/
│   ├── api/                    # NestJS Backend (Guards, Services, AI Adapters)
│   └── web/                    # TanStack Start Client (UI, Routers, Pages)
├── packages/
│   ├── database/               # Prisma schema and generated type-safe client
│   ├── shared/                 # Shared validation schemas and TS interfaces
│   └── config/                 # Shared ESLint/TS configs
├── turbo.json                  # Turborepo pipeline configuration
└── package.json
```

## **🚀 Getting Started**

### **Prerequisites**

* Node.js (v18+)
* pnpm (v8+)
* PostgreSQL running locally or via Docker

### **1. Clone & Install**

```bash
git clone https://github.com/realabdullah/context-window.git
cd context-window
pnpm install
```

### **2. Environment Setup**

You will need to set up environment variables for both the API and the Web client.

**Backend (apps/api/.env):**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/context_window"

# Auth (GitHub OAuth)
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
SESSION_SECRET="super_secret_session_string"

# AI Providers (Add the ones you wish to support)
GEMINI_API_KEY="your_gemini_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"
OPENAI_API_KEY="your_openai_api_key"
MOONSHOT_API_KEY="your_moonshot_api_key"  # For Kimi
```

**Frontend (apps/web/.env):**

```env
VITE_API_BASE_URL="http://localhost:3000"
```

### **3. Database Migration**

From the project root, push the schema to your local Postgres instance and generate the client.

```bash
pnpm --filter @context-window/database exec prisma db push
pnpm --filter @context-window/database exec prisma generate
```

### **4. Run the Application**

From the root directory, start the Turborepo dev server (runs both API and web), or run an app individually:

```bash
pnpm run dev
```

Or from root with filter, e.g. API only:

```bash
pnpm --filter @context-window/api run dev
```

* **Frontend:** http://localhost:3000
* **Backend:** http://localhost:3001

## **📖 Glossary**

To keep the mental model clean, the app uses the following terminology:

* **Trace:** The parent container for a specific task or feature (e.g., "Implementing WebSocket Auth"). Analogous to a workspace or a thread.
* **Log:** A single, timestamped entry within a Trace.
* **Compile:** The action of feeding a Trace's Logs to the LLM backend.
* **Article:** The final Markdown output produced by the Compile action.

## **🤝 Contributing**

Contributions are welcome! If you are adding a new LLM provider, please ensure you implement the AiProviderInterface in apps/api and update the SupportedAIProviders type in packages/shared.

## **📜 License**

This project is licensed under the MIT License.
