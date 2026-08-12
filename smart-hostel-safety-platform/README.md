# Smart Hostel Safety & Resource Platform

A web application for hostel management, with dedicated portals for
Admins, Wardens, and Students — attendance tracking, room management,
complaints, visitor verification, mess analytics, resource monitoring,
and safety alerts.

## Running the project

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Demo accounts

The login screen auto-detects the role from the email address:

| Role    | Email               | Password    |
|---------|----------------------|-------------|
| Admin   | admin@hostel.edu     | admin123    |
| Warden  | warden@hostel.edu    | warden123   |
| Student | arjun@college.edu    | student123  |

## Project structure

```
src/
  assets/       Static assets (images, icons) — currently empty
  components/
    common/     Reusable UI primitives (Badge, Avatar, Modal, Button, ...)
  hooks/        Custom React hooks (e.g. useAuth)
  layouts/      Structural layout pieces (Sidebar, Topbar)
  pages/        Screens, grouped by portal (admin/, warden/, student/, shared/, auth/)
  routes/       Navigation menu + page-title configuration per role
  services/     Mock data (stand-in for a future API layer)
  styles/       Global CSS (Tailwind entry, theme tokens, fonts, animations)
  utils/        Small shared helpers (e.g. classNames)
  App.jsx       Top-level app shell: auth gate + role-based section switching
  main.jsx      Vite/React entry point
```

The app manages "pages" via in-memory section state per role rather than a
URL router — `src/routes/navigation.js` is the single source of truth for
each portal's sidebar items and section titles.

All data is mocked in `src/services/mockData.js` for demo purposes.
