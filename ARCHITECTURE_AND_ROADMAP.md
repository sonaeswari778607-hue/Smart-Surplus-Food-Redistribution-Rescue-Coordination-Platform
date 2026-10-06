# FoodRescue – Architecture and Project Roadmap

**FoodRescue – Smart Surplus Food Redistribution & Rescue Coordination Platform**

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) platform designed to eliminate food waste by connecting food donors (restaurants, hotels, hostels, canteens, individuals) with verified NGOs and volunteer delivery coordinators.

---

## 1. System Architecture

```text
                  +--------------------------------+
                  |    React + Vite Client (SPA)   |
                  |     (Port 5173 / Dashboards)   |
                  +---------------+----------------+
                                  |
                              REST APIs
                             (Axios + JWT)
                                  |
                                  v
                  +--------------------------------+
                  |       Node.js + Express API    |
                  |       (Port 5000 / Server)     |
                  +---------------+----------------+
                                  |
                               Mongoose
                                  |
                                  v
                  +--------------------------------+
                  |        MongoDB Server 9.0      |
                  |        (Port 27017 / Local)    |
                  +--------------------------------+
```

---

## 2. User Roles & Flow

| Role | Responsibilities | Default Redirect |
|---|---|---|
| **DONOR** | Posts surplus food, manages donations, views delivery progress | `/donor` |
| **NGO** | Browses available food, claims donations, confirms delivery | `/ngo` |
| **VOLUNTEER** | Accepts pickup tasks, picks up food, delivers to NGO | `/volunteer` |
| **ADMIN** | Approves NGOs, manages users, monitors platform metrics | `/admin` |

---

## 3. Core Status Lifecycle

```text
AVAILABLE ──> ACCEPTED ──> ASSIGNED ──> PICKED_UP ──> OUT_FOR_DELIVERY ──> DELIVERED
    |
    ├──> CANCELLED (by Donor)
    └──> EXPIRED (past pickup deadline)
```

---

## 4. Database Collections

- `users` — User profiles, credentials (bcrypt), role, location
- `donations` — Surplus food listings, quantities, deadlines, status
- `ngos` — NGO details, capacity, verification status
- `volunteers` — Volunteer vehicle, capacity, availability
- `assignments` — Pickup/delivery logs, timestamps, status transitions

---

## 5. Phased Development Roadmap

1. **Phase 1: Project Setup & Environment Verification** *(Completed)*
2. **Phase 2: MongoDB Connection & Configuration** *(Completed)*
3. **Phase 3: Express Backend Architecture** *(Completed)*
4. **Phase 4: Mongoose Data Models**
5. **Phase 5: Authentication & JWT Middleware**
6. **Phase 6: Role-Based Authorization**
7. **Phase 7: Donor Dashboard & Create Donation**
8. **Phase 8: Donation CRUD & Status Management**
9. **Phase 9: NGO Dashboard & Donation Claiming**
10. **Phase 10: Volunteer Dashboard & Rescue Tasks**
11. **Phase 11: Pickup & Delivery Workflow Tracking**
12. **Phase 12: Admin Command Center & NGO Verification**
13. **Phase 13: Smart Matching Algorithm (Location & Capacity)**
14. **Phase 14: Interactive Map Integration (RescueMap)**
15. **Phase 15: End-to-End Testing & Polish**
