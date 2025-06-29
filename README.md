#  Data Alchemist

**AI-Powered Resource-Allocation Configurator**

Bring order to the chaos of messy spreadsheets. Data Alchemist is a Next.js + TypeScript web app designed to simplify client-task-worker management using powerful AI features. Built for non-technical users, it lets you upload raw data, validate, clean, and configure rules—no code required.

---

## 🌟 Features

### 🔹 1. Data Ingestion
- Upload CSV or XLSX files for:
  - Clients
  - Workers
  - Tasks
- Auto-maps even incorrect headers using AI-enabled parsing.
- Display parsed data in editable data grids.
- Supports inline editing with real-time validation feedback.

### 🔹 2. Validation + In-App Editing
Validations run on upload and on real-time changes. Issues are highlighted instantly.

#### Core Validations (At least 8 recommended):
- ✅ Missing required columns
- ✅ Duplicate IDs (ClientID, WorkerID, TaskID)
- ✅ Malformed lists (e.g., non-numeric slots)
- ✅ Out-of-range values (e.g., PriorityLevel not 1–5)
- ✅ Broken JSON in AttributesJSON
- ✅ Unknown references (e.g., RequestedTaskIDs not in tasks)
- ✅ Circular co-run groups
- ✅ Conflicting rules or overloads

#### Advanced AI-Enhanced Validations:
- AI-based validator for broader errors.
- Natural language search for queries like:
  > “Tasks with duration >1 and preferred in phase 2”
- Smart data correction suggestions and auto-fix options.

### 🔹 3. Rule‑Input UI
- Build rules via an intuitive UI. Examples:
  - Co-run tasks
  - Phase window constraints
  - Load limits per worker group
  - Regex-based pattern matching
- Export rules as a clean `rules.json` file.

#### AI-Powered Enhancements and AI Chat:
- Natural language rule entry → UI auto-generates structured rule
- Rule recommendations (e.g., overloaded workers → add load limit)
- Gemini integration help you get insight of data and also do conversation with data

### 🔹 4. Prioritization & Weights
Define what matters most to your allocation logic:
- Sliders / Numeric inputs for criteria like PriorityLevel, Fairness, Task Fulfillment
- Drag & drop reordering
- AHP matrix for pairwise comparison
- Pre-built profiles (e.g., “Fair Distribution”, “Maximize Fulfillment”)

### 🔹 5. Export Package
Once data is validated and rules are set:
- Export cleaned data (`clients.csv`, `workers.csv`, `tasks.csv`)
- Export `rules.json` containing all rule and priority settings

---
## Getting Started

1. **Clone the repository:**
    ```bash
    git clone 
    cd alchemist
    ```

2. **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Configure environment variables:**
    - `.env` update values as needed.

4. **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## Scripts

- `dev` – Start development server
- `build` – Build for production
- `start` – Start production server
- `test` – Run tests





