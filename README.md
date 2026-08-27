# Smart Hostel Safety & Management System — Full Stack Platform

A modern, enterprise-grade **Smart Hostel Safety & Management Platform** built with **Spring Boot 3.3.2 (Java 21)**, **Dual Database Architecture (Oracle XE Database + MongoDB)**, and **React 18 (Vite)**.

---

## 🗄️ Dual Database Architecture

This platform utilizes a hybrid storage pattern:
1. **Oracle Database XE 21c (Relational Database)**:
   - Manages relational user authentication, credentials, profiles, security tokens, and JPA operational records.
   - Connected via Spring Data JPA & Oracle OJDBC11 driver (`ojdbc11`).
2. **MongoDB (Document Database)**:
   - Manages student attendance records, leave requests, hostel room allocations, complaints, mess feedback/wastage analytics, and AI safety monitoring.
   - Connected via Spring Data MongoDB.

---

## 🌟 Key Features

- **Role-Based Portals**: Tailored interfaces for **Students**, **Wardens**, and **Admins**.
- **User Authentication**: Secure JWT-based login with Oracle DB persistence (`authentication-service`).
- **100% DB-Driven Attendance Management**: Daily attendance tracking with dynamic record matching across roll numbers, names, and ObjectIds with automatic single-record per date deduplication.
- **Leave Request Resolution**: Automated student identity resolution connecting user profiles with leave applications.
- **Mess & Wastage Analytics**: Weekly menu scheduling, student food rating system, and daily wastage analytics.
- **Complaints & Feedback**: Full complaint lifecycle tracking (`OPEN` → `IN_PROGRESS` → `RESOLVED`) with Warden response notes.
- **AI Safety Monitoring & Utility Tracking**: Real-time room resource and anomaly detection.
- **Security & Authorization**: Stateless JWT (JSON Web Tokens) with Spring Security role enforcement.

---

## 📁 Repository Architecture

```text
.
├── smart-hostel-safety-platform/          # React 18 (Vite) SPA Frontend
│   ├── src/
│   │   ├── components/                   # UI Components & Shared Layouts
│   │   ├── context/HostelContext.jsx      # Global State Sync & API Integration
│   │   ├── pages/                        # Student, Warden & Admin Portals
│   │   └── services/                     # Axios API Services
│   └── package.json
│
├── Two Services/
│   ├── authentication-service/           # Spring Boot Auth Backend (Port 8081 - Oracle DB)
│   │   ├── src/main/java/com/hostel/auth/
│   │   │   ├── controller/               # Auth Endpoints (/api/auth/login, /register)
│   │   │   ├── repository/               # Oracle JPA Repositories
│   │   │   └── security/                 # SecurityConfig & Token Management
│   │   └── pom.xml
│   │
│   └── authorization-service/            # Spring Boot Authz Backend (Port 8082 - MongoDB)
│       ├── src/main/java/com/hostel/authz/
│       │   ├── controller/               # Attendance, Complaints, Mess, AI Safety Endpoints
│       │   ├── service/                  # Business Logic & Deduplication
│       │   ├── repository/               # Spring Data MongoDB Repositories
│       │   └── entity/                   # MongoDB Document Models
│       └── pom.xml
│
└── docker-compose.yml                     # Docker Compose Orchestration (Oracle XE + MongoDB + Microservices)
```

---

## 🚀 How to Run Locally

### 1. Database Setup
- **Oracle XE Database**: Ensure Oracle XE 21c is running on `localhost:1521` (Service: `XEPDB1`, User: `system` / Password: `swathi_02`).
- **MongoDB**: Ensure MongoDB is running on `localhost:27017` (Database: `smarthostel_authz`).

Alternatively, launch both databases and services using Docker Compose:
```bash
docker-compose up -d
```

### 2. Backend Services (Spring Boot)
- **Authentication Service** (Port 8081):
  ```bash
  cd "Two Services/authentication-service"
  mvn spring-boot:run
  ```
- **Authorization & Management Service** (Port 8082):
  ```bash
  cd "Two Services/authorization-service"
  start_authz.bat
  # Backend runs on http://localhost:8082
  ```

### 3. Frontend Application (React / Vite)
- Run `smart-hostel-safety-platform`:
  ```bash
  cd "smart-hostel-safety-platform"
  npm install
  npm run dev
  # Frontend runs on http://localhost:5173
  ```

---

## 🛠️ Built With

- **Backend**: Java 21, Spring Boot 3.3.2, Spring Security, Spring Data JPA, Spring Data MongoDB, JWT (jjwt 0.12.5), Lombok
- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Recharts, Axios
- **Databases**: **Oracle Database XE 21c** (Relational Data / JPA) & **MongoDB** (Document & Audit Store)
- **DevOps**: Docker, Docker Compose, GitHub Actions CI/CD

