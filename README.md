# Smart Hostel Safety & Management System — Full Stack Platform

A modern, role-based **Smart Hostel Safety & Management Platform** built with **Spring Boot 3.3.2 (Java 21)**, **MongoDB**, and **React (Vite)**.

---

## 🌟 Key Features

- **Role-Based Portals**: Tailored interfaces for **Students**, **Wardens**, and **Admins**.
- **100% DB-Driven Attendance Management**: Daily attendance tracking with dynamic record matching across roll numbers, names, and ObjectIds with automatic single-record per date deduplication.
- **Leave Request Resolution**: Automated student identity resolution connecting user profiles with leave applications.
- **Mess & Wastage Analytics**: Weekly menu scheduling, student food rating system, and daily wastage analytics.
- **Complaints & Feedback**: Full complaint lifecycle tracking (`OPEN` → `IN_PROGRESS` → `RESOLVED`) with Warden response notes.
- **Security & Authorization**: Stateless JWT (JSON Web Tokens) with Spring Security role enforcement.

---

## 📁 Repository Architecture

```
.
├── smart-hostel-safety-platform/          # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/                   # UI Components (Cards, Modals, Badges)
│   │   ├── context/HostelContext.jsx      # Global State Sync & API Integration
│   │   ├── pages/                        # Student, Warden & Admin Portals
│   │   └── services/                     # Axios API Services
│   └── package.json
│
└── Two Services/authorization-service/    # Spring Boot Java Backend
    ├── src/main/java/com/hostel/authz/
    │   ├── controller/                   # REST API Endpoints
    │   ├── service/                      # Core Business Logic & Deduplication
    │   ├── repository/                   # Spring Data MongoDB Repositories
    │   ├── entity/                       # MongoDB Document Models
    │   └── security/                     # SecurityConfig & JWT Filter
    └── pom.xml
```

---

## 🚀 How to Run Locally

### 1. Backend Service (Spring Boot)
- **Database**: Ensure MongoDB is running on `localhost:27017` (Database: `smarthostel_authz`).
- Run `Two Services/authorization-service`:
  ```bash
  cd "Two Services/authorization-service"
  start_authz.bat
  # Backend runs on http://localhost:8082
  ```

### 2. Frontend Application (React / Vite)
- Run `smart-hostel-safety-platform`:
  ```bash
  cd "smart-hostel-safety-platform"
  npm install
  npm run dev
  # Frontend runs on http://localhost:5173
  ```

---

## 🛠️ Built With

- **Backend**: Java 21, Spring Boot 3.3.2, Spring Security, Spring Data MongoDB, JWT (jjwt 0.12.5), Lombok
- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, Recharts, Axios
- **Database**: MongoDB
