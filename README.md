# RentNear 🏡

RentNear is a premium, localized peer-to-peer neighborhood rental marketplace. It allows local users to publish listings for household items, tools, properties, or equipment, search for geolocated pins on an interactive split-pane map, handle trust/safety with live KYC documents, chat in real-time, and process seamless payments securely.

This repository is organized as a high-performance **Turborepo monorepo** with a decoupled TypeScript frontend and NestJS backend.

---

## 🗺️ System Architecture

Below is the high-level top-down representation of the RentNear architecture. It shows how data flows seamlessly between the client interface, server controllers, business services, local database, and third-party integrations.

```mermaid
graph TB
    %% Direction
    direction TB

    %% Node definitions
    subgraph UserLayer ["🧑‍💻 User Interaction"]
        User["👤 End User (Renter / Owner)"]
    end

    subgraph FrontendLayer ["🖥️ Client / Frontend Layer (apps/web)"]
        UI["🎨 React / Next.js UI Components<br/>(Tailwind CSS, Lucide, Leaflet Maps)"]
        State["📦 Client-Side State & Forms<br/>(Zustand, React Query, React Hook Form, Zod)"]
        APIClient["🔌 Network Client SDK<br/>(Axios / api-client, socket.io-client)"]
    end

    subgraph BackendLayer ["⚙️ Server / Backend Layer (apps/api)"]
        Controllers["🛡️ API Controllers & WS Gateways<br/>(NestJS Routing, Auth Guards, WebSockets)"]
        Services["🧠 Business Logic Services<br/>(Auth, Listings, Bookings, Chat, Payments)"]
        Prisma["💎 Prisma ORM Client<br/>(Data access & Schema Mapping)"]
    end

    subgraph DataLayer ["🗄️ Data & Storage Layer"]
        DB[("🐘 PostgreSQL Database<br/>(Core App Data)")]
    end

    subgraph ExtLayer ["☁️ Third-Party / External Services"]
        R2["🪣 Cloudflare R2 / AWS S3<br/>(Media & KYC Document Storage)"]
        Razorpay["💳 Razorpay Payment Gateway<br/>(Transaction Processing)"]
    end

    %% Flows & Connections (Request Tracing)
    User -->|Interacts with Web UI| UI
    UI -->|Uses State & Form hooks| State
    State -->|Triggers remote requests| APIClient

    APIClient -->|HTTP Requests (REST API)| Controllers
    APIClient <-->|Real-time Socket.io events| Controllers

    Controllers -->|Routes input data| Services
    Services -->|Database operations| Prisma
    Prisma <-->|SQL Queries & Mutations| DB

    Services -->|Generates Presigned S3 URLs| R2
    Services -->|Creates Payment Orders & Verifies webhooks| Razorpay

    %% Class Application
    class User UserStyle;
    class UI,State,APIClient FrontendStyle;
    class Controllers,Services,Prisma BackendStyle;
    class DB DbStyle;
    class R2,Razorpay ExtStyle;

    %% Class Styling
    classDef UserStyle fill:#fff1f2,stroke:#f43f5e,stroke-width:2px,color:#4c0519,rx:6px,ry:6px;
    classDef FrontendStyle fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b,rx:6px,ry:6px;
    classDef BackendStyle fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#052e16,rx:6px,ry:6px;
    classDef DbStyle fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#431407,rx:6px,ry:6px;
    classDef ExtStyle fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#3b0764,rx:6px,ry:6px;
```

---

## 🔍 Request Tracing: A Beginner's Guide

For developers starting with the RentNear codebase, tracing a typical request (such as booking a listing or sending a chat message) follows this path:

```
[User Interface] ➔ [State Manager] ➔ [SDK API Client] ➔ [NestJS Guard & Controller] ➔ [NestJS Service] ➔ [Prisma Client] ➔ [PostgreSQL]
```

### 1. The Interaction (Client UI)

- The **User** interacts with a React component inside `apps/web/src` (e.g., clicking the "Book Now" button on a listing page or panning the interactive Leaflet map to discover listings).
- React components are styled dynamically using **Tailwind CSS** and use custom icons from **Lucide React**.

### 2. State & Client-Side Network Client

- The UI triggers an action that utilizes a **React Query** mutation or reads/writes to a global **Zustand** store.
- Input validation (like forms) is enforced on the frontend using **React Hook Form** matched with **Zod** schemas.
- The mutation uses the shared `@rentnear/api-client` package (which packages Axios HTTP requests) or issues a real-time event via `socket.io-client`.

### 3. Server Reception & Authentication

- The request reaches the backend NestJS server at `apps/api/src`.
- The request passes through global middleware and route-level **Auth Guards** (handled by `Passport` with JWT strategy), ensuring the user is authenticated.
- A **NestJS Controller** (e.g., `BookingsController` or `ChatGateway` for WebSockets) receives the validated payload and maps it to a Data Transfer Object (DTO).

### 4. Business Logic Service

- The Controller delegates the core logic to the respective **NestJS Service** (e.g., `BookingsService`).
- If processing a booking, the service handles calculations, checks dates availability, and interacts with third-party webhooks.
- For chat or live status, real-time gateways emit events to connected sockets instantly.

### 5. Data Access & Schema Persistence

- The Service interacts with **Prisma Client** (auto-generated database client matching `schema.prisma`).
- Prisma converts the javascript-based schema calls into raw SQL queries sent to the **PostgreSQL** database.
- Results are returned back up through the service to the controller, then down to the frontend to update global UI state.

### 6. Cloud & External Services

- **Cloudflare R2 (S3 API)**: Used when users upload listing images or KYC documentation. The NestJS service generates a secure, presigned R2 upload URL so clients can upload directly from their browser, optimizing server bandwidth.
- **Razorpay**: Used when paying for listing bookings. The backend orders payments, verifies signed signatures via webhook, and triggers booking confirmations automatically.

---

## 🛠️ Technology Stack

| Layer                  | Technology              | Purpose                                                                |
| :--------------------- | :---------------------- | :--------------------------------------------------------------------- |
| **Monorepo Framework** | Turborepo               | Smart caching, pipeline orchestration, and task scheduling             |
| **Frontend Core**      | Next.js (v14.2.35)      | Server-side rendering (SSR), optimized routing, and SEO                |
| **Frontend Styling**   | Tailwind CSS            | Utility-first styling with responsive, cohesive layout design          |
| **Frontend State**     | Zustand & React Query   | Global UI state management and asynchronous server cache state         |
| **Maps & Location**    | Leaflet / React Leaflet | Interactive neighborhood search and marker pin clusters                |
| **Backend Core**       | NestJS (v10.4.22)       | Modular, enterprise-ready TypeScript framework                         |
| **Database Access**    | Prisma (v5.22.0)        | Type-safe ORM for database migrations and queries                      |
| **Storage Engine**     | PostgreSQL              | Robust relational database for users, listings, messages, and listings |
| **Real-time Engine**   | Socket.io               | Bi-directional, low-latency live messaging and notifications           |
| **Cloud Storage**      | Cloudflare R2 / S3      | Distributed object storage for public images and private KYC files     |
| **Payments Gateway**   | Razorpay SDK            | End-to-end payment creation, capture, and verification                 |

---

## 📂 Repository Structure

```
RentNear/
├── apps/
│   ├── api/                 # NestJS Backend API
│   │   ├── prisma/          # Database migrations & Prisma Schema
│   │   └── src/             # NestJS Modules, Controllers, Services, & Gateways
│   └── web/                 # Next.js Frontend Application
│       └── src/             # Features, Pages, Components, Hooks, & Styling
├── packages/
│   ├── api-client/          # Shared Axios API wrapper SDK used by web app
│   └── types/               # Shared TypeScript schemas, interfaces, & enums
├── package.json             # Root monorepo configuration (npm workspaces)
├── turbo.json               # Turborepo task configuration pipeline
└── README.md                # This comprehensive documentation file
```

---

## 🚀 Local Development Setup

To run RentNear locally, ensure you have **Node.js (>=20)** and a **PostgreSQL** instance running.

### 1. Install Dependencies

Run the install command from the root of the repository:

```bash
npm install
```

### 2. Configure Environment Variables

1. Navigate to the backend app:
   ```bash
   cd apps/api
   ```
2. Copy the example configuration to a local file:
   ```bash
   cp .env.example .env
   ```
3. Update the variables in `apps/api/.env` (such as `DATABASE_URL` with your local PostgreSQL credentials, Cloudflare R2 credentials, and Razorpay test credentials).

### 3. Setup the Database

Generate Prisma client and run migrations to setup your database tables:

```bash
# Generate Prisma Client types
npm run prisma:generate --workspace=@rentnear/api

# Run database migrations to provision tables
npm run prisma:migrate --workspace=@rentnear/api
```

### 4. Start Development Servers

From the root directory, launch the entire application stack:

```bash
npm run dev
```

This runs both **Next.js (http://localhost:3000)** and **NestJS (http://localhost:3001)** concurrently, with Turborepo managing shared packages recompilation automatically.

---

## 🌟 Contributing & Quality Controls

- **Format Code**: `npm run format`
- **Lint Projects**: `npm run lint`
- **Type Checking**: `npm run type-check`
