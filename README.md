🚀 AI Interview System

A full-stack, AI-powered interview preparation platform that simulates real technical interviews with intelligent question generation, real-time answer evaluation, live collaborative rooms, and multi-language code execution.

📌 Overview

AI Interview System helps software engineers prepare for technical interviews across:

Data Structures & Algorithms
System Design
Behavioral (STAR method)

It uses AI (OpenAI-compatible APIs) to:

Generate context-aware questions
Evaluate answers with scoring + feedback
Simulate a real interview experience — directly in your browser
🛠️ Tech Stack
Layer	Technology
Backend	Java 21, Spring Boot 3.5, Spring Security, Spring WebSocket
Frontend	React 18, TypeScript 5, Vite 5, Tailwind CSS 3
Database	PostgreSQL 16 (Flyway migrations)
Cache	Redis 7
AI	OpenAI API / GitHub Models (gpt-4.1-mini / gpt-4)
Code Execution	Judge0 API (RapidAPI)
Real-time	STOMP WebSocket + SockJS
Auth	JWT (Access + Refresh Tokens)
State Mgmt	Zustand, TanStack React Query
Build Tools	Maven, npm
Infra	Docker Compose (PostgreSQL + Redis)
✨ Features
🧠 AI-Powered Interview Engine
Dynamic question generation using AI
Supports:
DSA
System Design
Behavioral
Mixed
Adaptive difficulty (Easy / Medium / Hard)
Follow-up questions based on answers
Multi-dimensional scoring:
Technical Score
Clarity Score
Confidence Score
Structured feedback:
Model answer
Strengths
Areas of improvement
🎤 Voice Interview Mode
Browser-based speech recognition
Text-to-speech for questions
Live waveform visualization
💻 Coding Challenges
LeetCode-style problems
Syntax-highlighted code editor
Multi-language execution via Judge0
Custom input + hidden test cases
Submission tracking
👥 Live Collaborative Rooms
Create/join rooms via unique codes
Real-time synchronized code editor
Chat messaging
WebRTC-based audio communication
Online presence tracking
📄 Resume Parsing
AI-based resume analysis
Extracts:
Skills
Experience
Seniority level
Tech stack
📊 Analytics Dashboard
Performance tracking
Topic-wise breakdown
Difficulty-based insights
Trend visualization
🔍 Session Review
Post-interview reports
Question-by-question breakdown
Scores + model answers
🏗️ Architecture
Backend (Spring Boot)
controller/   → REST APIs + WebSocket handlers
service/      → Business logic + AI orchestration
model/        → JPA entities
repository/   → Spring Data JPA
config/       → Security, JWT, WebSocket config
dto/          → Request/response models
exceptions/   → Custom exception handling
Frontend (React)
pages/        → Route-level components
components/   → Reusable UI
services/     → API clients (Axios)
store/        → Zustand state
hooks/        → Custom hooks
types/        → TypeScript interfaces
🗄️ Database Schema

Managed using Flyway (12 migrations):

users → accounts, auth data
interview_sessions → session metadata
interview_questions → generated questions
interview_answers → scores + feedback
coding_challenges → problems (JSONB)
code_submissions → execution results
interview_rooms → live room data
🔗 API Reference (Summary)
Domain	Endpoints
Auth	POST /register, POST /login, GET /me, PUT /me, PATCH /me/password
Interviews	Create session, next question, submit answer, complete/abandon
Coding	List challenges, run code, submit code
Rooms	Create room, join room, close room
Resume	POST /parse
Analytics	GET /dashboard
WebSocket	Chat, code sync, WebRTC signaling

🔐 All protected endpoints require:
Authorization: Bearer <JWT>

⚙️ Getting Started
📋 Prerequisites
Java 21+
Node.js 18+
Docker & Docker Compose
Judge0 API Key
OpenAI API Key / GitHub PAT
1️⃣ Clone Repository
git clone https://github.com/your-username/AiInterviewSystem.git
cd AiInterviewSystem
2️⃣ Configure Environment Variables

Create .env:

# Database
DB_URL=jdbc:postgresql://localhost:5432/interview_prep
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_SECRET_EXPIRY_TIME=86400000
JWT_SECRET_REFRESH_TIME=604800000

# AI
OPEN_AI_API_KEY=your-api-key
OPEN_AI_API_URL=https://models.inference.ai.azure.com
OPEN_AI_API_MODEL=gpt-4.1-mini
OPEN_AI_API_TOKENS=2048

# Judge0
JUDGE_O_API_URL=https://judge029.p.rapidapi.com
JUDGE_O_API_HOST=judge029.p.rapidapi.com
JUDGE_O_API_KEY=your-rapidapi-key

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
3️⃣ Start Services
docker-compose up -d
4️⃣ Run Backend
./mvnw clean spring-boot:run

➡️ http://localhost:8080

5️⃣ Run Frontend
cd frontend
npm install
npm run dev

➡️ http://localhost:5173

📁 Project Structure
AiInterviewSystem/
├── docker-compose.yml
├── pom.xml
├── src/main/
│   ├── java/com/example/AiInterviewSystem/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── model/
│   │   ├── repository/
│   │   ├── config/
│   │   ├── dto/
│   │   └── enums/
│   └── resources/
│       ├── application.yaml
│       └── db/migration/
└── frontend/
    ├── vite.config.ts
    └── src/
        ├── pages/
        ├── components/
        ├── services/
        ├── store/
        ├── hooks/
        └── types/
