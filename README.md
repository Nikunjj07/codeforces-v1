# Codeverse

**Codeverse** is a modern, full-stack platform for hosting and participating in competitive programming contests. Built from the ground up as a sleek, dark-themed SaaS application, it features real-time live leaderboards, browser-based embedded code execution, robust role-based access control, and comprehensive problem sets.

## Features
- **Browser Code Editor**: Integrated Monaco Editor (VS Code core) running in the browser for writing and executing code.
- **Automated Judging Platform**: Submissions are compiled, run, and judged through the robust **Judge0 CE** API with proper execution limits (Time Limit, Memory Limit).
- **Live Leaderboards**: Built on **Socket.IO**. Whenever a competitor gets an Accepted submission, the overall rankings dynamically shift and recalculate across all clients in real-time.
- **Admin Dashboard**: Dedicated portal for teachers/admins to orchestrate and curate contests, upload problems mapping to test cases (public and hidden), and monitor user activity.
- **Scoring Mechanisms**: Supports flexible scoring methodologies (Time Penalty/ACM-style, test-case passing partial grading).
- **Responsive Dark Mode UI**: A fully cohesive design system crafted with Tailwind CSS variables to support sleek visual aesthetics without any visual emojis.

## Tech Stack

### Frontend (Client)
- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS, custom variable theme (`theme.css`)
- **State Management**: Tanstack React Query (server state caching) + Context API
- **Live Updates**: `socket.io-client` + `react-window` for virtualizing hyper-active leaderboard tables.
- **Components**: `recharts` for user stat graphs, `@monaco-editor/react` for the code IDE.

### Backend (Server)
- **Runtime**: Node.js + Express
- **Database**: MongoDB leveraging Mongoose ODM
- **Language**: Strict TypeScript
- **Auth Strategy**: Stateless/Stateful hybrid mechanism — `15-minute HTTP bearer Access Token`, validated via middleware; `7-day HTTP-Only Secure Refresh Token Cookie` injected upon login.
- **File System**: `zod` schema runtime validation for `.env` ingestion.

### External Services
- **Judge0 CE**: Code execution sandbox endpoint.
- **Socket.IO**: WebSocket events handling parallel broadcasts to competition rooms.
- **Nodemailer**: Email Service provider configured using generic SMTP standard configurations.

---

## Data Flow & Workflow

### 1. Identity Verification (Auth) Flow
1. **User Action:** Submits credentials via `/register` or `/login`.
2. **Server Operation:** Express verifies BCrypt hash, creates a MongoDB User entry (if registering). Signs an `Access JWT` payload and a `Refresh JWT` payload.
3. **Response Handling:** React intercepts HTTP 200, saves token locally, and redirects to Dashboard. The refresh cookie is bound automatically to `api.ts` `withCredentials` settings. A 401 Interceptor immediately attempts token rotation on expiry before booting the user out.

### 2. Code Execution (Submit) Flow
1. **Developer Input:** User hits `Submit` inside `/contests/:id/problems/:pId`.
2. **REST API Ingestion:** POST request with `source_code` and `language_id` is passed via auth guards to the submissions controller.
3. **Sandbox Dispatch:** A `PENDING` MongoDB record is created. The backend simultaneously POSTs standard + hidden test-cases to Judge0 and retrieves base64-encoded callback tokens.
4. **Polling / Callback:** The backend polls Judge0 using these tokens until an executed state is recognized (`ACCEPTED`, `WRONG_ANSWER`, `TLE`, `CE`).
5. **Persistence & Emit:** Validated outputs dictate score changes in MongoDB. If score increases, the server emits a `leaderboard:update` socket message specifically broadcast to the targeted contest namespace/room.
6. **Frontend Sync:** React Query receives socket instruction to invalidate and refetch the standings immediately locally avoiding manual refreshes or long-polling locks.

---

## Local Development Setup

CodeArena heavily utilizes its NPM Workspaces mechanism allowing concurrent starting operations.

### Prerequisites
1. Node.js (v18+)
2. MongoDB installed locally OR a MongoDB Atlas cluster URI. 
3. (Optional) RapidAPI account for Judge0 API Key.

### Environment Variable Configs
Create two `.env` files matching the `.env.example` templates present.

**1. `server/.env`**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/codearena
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=superrefreshsecret
CLIENT_URL=http://localhost:5173
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=YOUR_RAPIDAPI_KEY
```

**2. `client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### Installation & Serving
```bash
# Enter the root directory
cd codeforces

# Install dependencies for root workspace, client, and server cleanly.
npm install

# Start the concurrent Vite development proxy and Express ts-node.
npm run dev
```

Visit the `http://localhost:5173` URI. You may register as a normal student; to gain Administrator privileges directly manually manipulate your Mongo entry:
`db.users.updateOne({ username: "yourname" }, { $set: { "role": "ADMIN" } })`
