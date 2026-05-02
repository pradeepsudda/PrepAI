  ---
  AI Interview System

  A full-stack, AI-powered interview preparation platform that simulates real technical interviews with intelligent question generation, real-time answer evaluation,
  live collaborative rooms, and multi-language code execution.

  ---
  Overview

  AI Interview System is designed to help software engineers practice and prepare for technical interviews across multiple domains — Data Structures & Algorithms,
  System Design, and Behavioral questions. It leverages AI (OpenAI-compatible APIs) to dynamically generate context-aware questions, evaluate your answers with scoring
   and detailed feedback, and simulate a realistic interview experience — all in your browser.

  ---
  Tech Stack

  ┌──────────────────┬─────────────────────────────────────────────────────────────┐
  │      Layer       │                         Technology                          │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Backend          │ Java 21, Spring Boot 3.5, Spring Security, Spring WebSocket │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Frontend         │ React 18, TypeScript 5, Vite 5, Tailwind CSS 3              │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Database         │ PostgreSQL 16 (with Flyway migrations)                      │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Cache            │ Redis 7                                                     │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ AI               │ OpenAI API / GitHub Models API (gpt-4.1-mini or gpt-4)      │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Code Execution   │ Judge0 API (via RapidAPI)                                   │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Real-time        │ STOMP WebSocket + SockJS                                    │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Auth             │ JWT (Access + Refresh tokens)                               │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ State Management │ Zustand, TanStack React Query                               │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Build            │ Maven, npm                                                  │
  ├──────────────────┼─────────────────────────────────────────────────────────────┤
  │ Infrastructure   │ Docker Compose (PostgreSQL + Redis)                         │
  └──────────────────┴─────────────────────────────────────────────────────────────┘

  ---                                                                                                                                                                  
  Features
                                                                                                                                                                       
  AI-Powered Interview Engine                                                                                                                                        

  - Dynamically generates interview questions using OpenAI-compatible APIs                                                                                             
  - Supports 4 interview types: DSA, System Design, Behavioral (STAR method), and Mixed
  - Adapts difficulty (Easy / Medium / Hard) and generates follow-up questions based on your previous answers                                                          
  - Evaluates answers with multi-dimensional scoring: Technical Score, Clarity Score, and Confidence Score (each 0–100)                                                
  - Provides structured feedback: model answer, strengths, areas of improvement                                                                                        
                                                                                                                                                                       
  Voice Interview Mode                                                                                                                                                 
                                                                                                                                                                       
  - Browser-based speech recognition for hands-free answering                                                                                                          
  - Text-to-speech to hear questions read aloud
  - Waveform visualization during voice recording                                                                                                                      
                                                                                                                                                                     
  Coding Challenges                                                                                                                                                    
                                                                                                                                                                     
  - LeetCode-style coding problems with multiple difficulty levels                                                                                                     
  - Full in-browser code editor with syntax highlighting                                                                                                             
  - Multi-language code execution powered by Judge0 (run custom inputs or submit against hidden test cases)                                                            
  - Tracks submission history and results                                                                                                                              
                                                                                                                                                                       
  Live Collaborative Rooms                                                                                                                                             
                                                                                                                                                                       
  - Create or join real-time interview rooms with unique room codes                                                                                                    
  - Synchronized code editor — changes broadcast instantly to all participants
  - In-room chat messaging                                                                                                                                             
  - WebRTC-based audio for live voice communication                                                                                                                  
  - Online user presence tracking                                                                                                                                      
                                                                                                                                                                     
  Resume Parsing                                                                                                                                                       
                                                                                                                                                                     
  - AI-powered resume text analysis                                                                                                                                    
  - Extracts skills, years of experience, seniority level (Junior / Mid / Senior), tech stack, and focus areas                                                       
                                                                                                                                                                       
  Analytics Dashboard
                                                                                                                                                                       
  - Tracks performance across all interview sessions                                                                                                                   
  - Per-topic and per-difficulty breakdowns
  - Visual charts and trend analysis                                                                                                                                   
                                                                                                                                                                       
  Session Review
                                                                                                                                                                       
  - Detailed post-interview report for every session                                                                                                                   
  - Question-by-question answer breakdown with scores and model answers
                                                                                                                                                                       
  ---                                                                                                                                                                
  Architecture                                                                                                                                                         
                                                                                                                                                                     
  Backend — Layered Spring Boot Architecture
  controller/     → REST API + WebSocket message handlers (8 controllers)                                                                                              
  service/        → Business logic, AI orchestration, code execution (10 services)
  model/          → JPA entities mapped to PostgreSQL (10 entities)                                                                                                    
  repository/     → Spring Data JPA repositories (8 repositories)                                                                                                    
  config/         → Security, WebSocket, JWT filter, CORS, WebClient                                                                                                   
  dto/            → 30+ request/response data transfer objects                                                                                                       
  exceptions/     → Custom exception hierarchy                                                                                                                         
                                                                                                                                                                     
  Frontend — Component-Based React                                                                                                                                     
  pages/          → 12 full-page route components                                                                                                                    
  components/     → Reusable UI + interview-specific components                                                                                                        
  services/       → Axios-based API clients (auth, interview, coding, room, resume, analytics)                                                                       
  store/          → Zustand global state (auth, interview session)                                                                                                     
  hooks/          → Custom hooks (speech, WebSocket room, interview session, countdown)                                                                                
  types/          → TypeScript interfaces for all domain objects                                                                                                       
                                                                                                                                                                       
  ---                                                                                                                                                                  
  Database Schema                                                                                                                                                      
                                                                                                                                                                       
  Managed by Flyway with 12 versioned migrations:
                                                                                                                                                                       
  - users — accounts, hashed passwords, refresh tokens                                                                                                                 
  - interview_sessions — session metadata, type, difficulty, topic, status, aggregate scores
  - interview_questions — per-session questions with order index                                                                                                       
  - interview_answers — answers with technical/clarity/confidence scores, feedback, strengths, improvements                                                            
  - coding_challenges — problems with JSONB examples, constraints, starter code (per language), test cases                                                             
  - code_submissions — submission records with test results (JSONB)                                                                                                    
  - interview_rooms — room metadata, host, room code, participant list                                                                                                 
                                                                                                                                                                       
  ---                                                                                                                                                                  
  API Reference (Summary)                                                                                                                                              
                                                                                                                                                                     
  ┌────────────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
  │   Domain   │                                                 Endpoints                                                  │
  ├────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤                                          
  │ Auth       │ POST /register, POST /login, GET /me, PUT /me, PATCH /me/password                                          │
  ├────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤                                          
  │ Interviews │ Create session, list sessions, get session, next question (AI), submit answer (AI eval), complete, abandon │                                          
  ├────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤                                          
  │ Coding     │ List challenges, get challenge, run code, submit code                                                      │                                          
  ├────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤                                          
  │ Rooms      │ Create room, join room, close room, list active rooms                                                      │                                        
  ├────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤                                          
  │ Resume     │ POST /parse — AI resume parsing                                                                            │                                        
  ├────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤                                          
  │ Analytics  │ GET /dashboard — performance summary                                                                       │
  ├────────────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────┤                                          
  │ WebSocket  │ Join/leave room, chat, code sync, WebRTC signaling                                                         │                                        
  └────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────┘                                          
                                                                                                                                                                     
  All authenticated endpoints require Authorization: Bearer <JWT> header.                                                                                              
                                                                                                                                                                     
  ---
  Getting Started
                                                                                                                                                                       
  Prerequisites
                                                                                                                                                                       
  - Java 21+                                                                                                                                                         
  - Node.js 18+
  - Docker & Docker Compose
  - A Judge0 API key (via RapidAPI)
  - An OpenAI API key or a GitHub Personal Access Token (for GitHub Models)                                                                                            
   
  1. Clone the repo                                                                                                                                                    
                                                                                                                                                                     
  git clone https://github.com/your-username/AiInterviewSystem.git                                                                                                     
  cd AiInterviewSystem                                                                                                                                               

  2. Configure environment variables                                                                                                                                   
   
  Edit src/main/resources/.env (or set these as system environment variables):                                                                                         
                                                                                                                                                                     
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
                                                                                                                                                                       
  # AI (OpenAI or GitHub Models)                                                                                                                                       
  OPEN_AI_API_KEY=your-api-key
  OPEN_AI_API_URL=https://models.inference.ai.azure.com                                                                                                                
  OPEN_AI_API_MODEL=gpt-4.1-mini                                                                                                                                     
  OPEN_AI_API_TOKENS=2048                                                                                                                                              
   
  # Code Execution (Judge0 via RapidAPI)                                                                                                                               
  JUDGE_O_API_URL=https://judge029.p.rapidapi.com                                                                                                                    
  JUDGE_O_API_HOST=judge029.p.rapidapi.com                                                                                                                             
  JUDGE_O_API_KEY=your-rapidapi-key
                                                                                                                                                                       
  # CORS                                                                                                                                                             
  CORS_ALLOWED_ORIGINS=http://localhost:5173
                                                                                                                                                                       
  3. Start PostgreSQL & Redis
                                                                                                                                                                       
  docker-compose up -d                                                                                                                                               

  4. Run the backend                                                                                                                                                   
   
  ./mvnw clean spring-boot:run                                                                                                                                         
  # Starts on http://localhost:8080                                                                                                                                  
  # Flyway applies DB migrations automatically
                                                                                                                                                                       
  5. Run the frontend
                                                                                                                                                                       
  cd frontend                                                                                                                                                        
  npm install
  npm run dev
  # Starts on http://localhost:5173
  # API calls are proxied to localhost:8080                                                                                                                            
   
  ---                                                                                                                                                                  
  Project Structure                                                                                                                                                  

  AiInterviewSystem/
  ├── docker-compose.yml              # PostgreSQL + Redis services
  ├── pom.xml                         # Maven dependencies                                                                                                             
  ├── src/main/
  │   ├── java/com/example/AiInterviewSystem/                                                                                                                          
  │   │   ├── controller/             # REST + WebSocket controllers                                                                                                   
  │   │   ├── service/                # Business logic + AI integration
  │   │   ├── model/                  # JPA entities                                                                                                                   
  │   │   ├── repository/             # Spring Data repositories                                                                                                     
  │   │   ├── config/                 # Security, WebSocket, JWT config                                                                                                
  │   │   ├── dto/                    # Request/response objects                                                                                                       
  │   │   └── enums/                  # SessionType, Difficulty, Status enums
  │   └── resources/                                                                                                                                                   
  │       ├── application.yaml        # Spring Boot configuration                                                                                                    
  │       └── db/migration/           # 12 Flyway SQL migrations                                                                                                       
  └── frontend/                                                                                                                                                        
      ├── vite.config.ts              # Vite + proxy config
      └── src/                                                                                                                                                         
          ├── pages/                  # Route-level page components                                                                                                  
          ├── components/             # Reusable UI components                                                                                                         
          ├── services/               # API layer (Axios)                                                                                                              
          ├── store/                  # Zustand state stores
          ├── hooks/                  # Custom React hooks                                                                                                             
          └── types/                  # TypeScript type definitions  
