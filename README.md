# 🚀 AI Interview System

A high-performance, full-stack, AI-powered interview preparation platform that simulates real-world technical interviews. The system provides intelligent, context-aware question generation, real-time response evaluation, live collaborative coding rooms, and cross-compiled multi-language code execution.

Designed to mimic rigorous engineering interview loops, the platform covers **Data Structures & Algorithms (DSA)**, **System Design**, and **Behavioral (STAR method)** tracks with real-time feedback and structured performance matrices.

---

## 📌 Architectural Overview

The application is split into a decoupled client-server architecture built for low-latency updates and high-throughput transaction processing:
* **Backend Layer:** Built on **Java 21** and **Spring Boot 3.5**, featuring structural thread safety, stateless JWT authentication, transactional database persistence, and native WebSocket protocol handling.
* **Frontend Layer:** Powered by **React 18**, **TypeScript 5**, and **Vite**, utilizing unidirectional client-state stores and optimistic asynchronous data query caching layers.
* **Engine Integration:** Orchestrates multi-agent downstream calls out-of-the-box to **OpenAI/GitHub Models** for structural AI processing and **Judge0** for remote sandboxed source code compilation and runtime evaluation.

---

## 🛠️ Tech Stack & Ecosystem

### Backend Architecture
* **Language & Runtime:** Java 21 (LTS), Spring Boot 3.5+
* **Security & Auth:** Spring Security (Stateless Filter Chain, Custom JWT Validation)
* **Real-time Protocol:** STOMP over WebSockets (fallback supported via SockJS)
* **Persistence & Schema:** PostgreSQL 16 managed via Flyway Migrations
* **Caching & Session Storage:** Redis 7 (Distributed state caches and volatile messaging data)
* **Dependency Management:** Apache Maven

### Frontend Application
* **Runtime Framework:** React 18 / TypeScript 5 (Strict Mode compilation)
* **Build Bundler:** Vite 5 (Optimized chunk splitting)
* **Client State Management:** Zustand (High-performance, un-opinionated global state store)
* **Data Fetching & Caching:** TanStack React Query v5 (Optimistic updates, window revalidation)
* **Styling Engine:** Tailwind CSS v3 (Utility-first atomic styling)
* **Asynchronous Client:** Axios (Interceptors configured for token rotation)

### Infrastructure & External APIs
* **Containerization:** Docker / Docker Compose v2
* **AI Inference Engine:** OpenAI API v1 Spec / GitHub Models (`gpt-4`, `gpt-4.1-mini`)
* **Code Sandbox Executor:** Judge0 API (Routed via RapidAPI Gateway cloud nodes)

---

## ✨ System Features

### 🧠 1. AI-Powered Interview Engine
* **Context-Aware Progression:** Generates algorithmic, design, or behavioral interview content based on historical answers.
* **Adaptive Tuning Engine:** Shifts dynamic session difficulty metrics (**Easy**, **Medium**, **Hard**) mid-loop based on evaluated code space complexity or reasoning completeness.
* **Deep Evaluation Schema:** Returns immediate diagnostic response payloads over specific dimensions:
    * `Technical Accuracy Score` (0-100%): Validation of runtime algorithms or design correctness.
    * `Clarity Score` (0-100%): Syntactic structural organization and delivery flow.
    * `Confidence Score` (0-100%): Behavioral markers and absolute statement assertion metrics.
* **Granular Feedback Response:** Streams structured Markdown segments containing exhaustive *Model Solutions*, *Observed Strengths*, and *Actionable Improvements*.

### 🎤 2. Audio & Voice Analysis Mode
* **Native Speech Recognition:** Low-latency Web Speech API integration translating spoken vocal answers into text payloads in real time.
* **Speech-to-Text & Feedback Integration:** Automated synthesis engine providing natural audio delivery of programmatic engineering prompts.
* **Visualizer Matrices:** CSS Canvas-driven live waveform audio amplitude rendering.

### 💻 3. Embedded Sandbox Code Environment
* **Monaco Core System:** Complete code editing panel supporting advanced linting, syntax highlights, and automated tab sizing.
* **Multi-Language Execution:** Compiles and executes code chunks (Java, C++, Python, JavaScript, Go) on sandboxed distributed clusters through Judge0 execution layers.
* **Test Case Matrix Evaluation:** Validates code blocks against explicit user runtime parameters as well as strict, unexposed hidden assertion tests.

### 👥 4. Live Collaborative Distributed Rooms
* **Peer Rooms:** Instantaneous synchronization using isolated WebSockets rooms created by secure alphanumeric codes.
* **Operational Transformation Concept:** Shared real-time synchronized coding canvases via persistent WebSockets messaging channels.
* **Signaling & Media Infrastructure:** Out-of-the-box WebRTC negotiation paths facilitating decentralized peer-to-peer live high-fidelity audio streams.
* **Presence Matrix:** Redis-backed active subscriber mapping for immediate state sync hooks.[cite: 1]

### 📄 5. AI-Assisted Resume Parser
* **Structural Parsing Blocks:** Extracted multi-line text files analyzed via structured JSON schema instructions to return discrete objects for `Core Technical Skills`, `Quantifiable Engineering Experience`, `Project Architectures`, and calculated `Seniority Matrix`.[cite: 1]

### 📊 6. Engineering Performance Analytics Dashboard
* **Data Aggregation Blocks:** Comprehensive historical breakdown panels mapping performance metrics over targeted domains.[cite: 1]
* **Trend Vectors:** Historical charting lines analyzing progress markers and confidence ratings over consistent time scales.[cite: 1]

---

## 🏗️ Architecture Design & Layout

### ⚙️ Backend Module Decomposition (`/src/main/java/...`)
```text
└── com.example.AiInterviewSystem
    ├── config          # Security configuration, CORS policies, Filter Chains, WebSocket Broker routing
    ├── controller      # REST Controller endpoints, JSON mapping layers, WebSocket text framing handlers
    ├── dto             # Immutable Request/Response POJOs mapped during API I/O operations
    ├── enums           # System type domains (Difficulty levels, Challenge Language types, Session states)
    ├── exceptions      # Global exception interceptors, ApiException payload definitions
    ├── model           # Relational domain JPA mapping schemas configured for transactional persistence
    ├── repository      # Data layer interfaces extending Spring Data JPA with structural abstraction
    └── service         # Isolated business operations, Judge0 mapping loops, downstream OpenAI client connections
