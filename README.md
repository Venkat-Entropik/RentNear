# RentNear

RentNear is a peer-to-peer neighborhood rental platform. It allows users (owners) to list items for rent and other users (renters) to discover, book, and rent these items seamlessly. 

The project is structured as a **Turborepo** monorepo containing a Next.js frontend, a NestJS backend API, and shared packages.

---

## 🏗️ Architecture

Below is the high-level architecture diagram of the RentNear platform:

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
    
    <!-- APIClient -->|HTTP Requests (REST API)| Controllers -->
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


## 💻 Tech Stack

### Frontend (`apps/web`)
- **Framework**: Next.js (v14)
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Maps**: Leaflet & React Leaflet
- **Real-Time**: Socket.io-client

### Backend (`apps/api`)
- **Framework**: NestJS (v10)
- **Database ORM**: Prisma
- **Authentication**: Passport.js (JWT) with bcryptjs
- **Real-Time**: NestJS WebSockets (Socket.io)
- **Storage Integration**: AWS SDK / Cloudflare R2 (Presigned URLs)
- **Payments**: Razorpay Node SDK

### Data & Infrastructure
- **Database**: PostgreSQL
- **Object Storage**: Cloudflare R2 / AWS S3
- **Payment Gateway**: Razorpay
- **Monorepo Management**: Turborepo, npm workspaces

## 📂 Project Structure

```text
RentNear/
├── apps/
│   ├── api/             # NestJS Backend Application (see apps/api/README.md)
│   └── web/             # Next.js Frontend Application (see apps/web/README.md)
├── packages/
│   ├── api-client/      # Shared API client SDK (Axios)
│   └── types/           # Shared TypeScript interfaces & types
├── package.json         # Root configurations & workspaces
└── turbo.json           # Turborepo pipeline configuration
```

For app-specific architecture, request lifecycle, and data flow details:
- 👉 Read the [Frontend App Data Flow & Documentation](apps/web/README.md)
- 👉 Read the [Backend API Data Flow & Documentation](apps/api/README.md)

## 🚀 Getting Started

### Prerequisites

| Dependency     | Minimum Version |
| -------------- | --------------- |
| **Node.js**    | `>= 20.0.0`     |
| **npm**        | `>= 10.0.0`     |
| **PostgreSQL** | `>= 14`         |

Ensure a PostgreSQL instance is running locally (or accessible remotely). The default connection string expects:

```
postgresql://rentnear:rentnear@localhost:5432/rentnear_dev
```

---

### Installation

**1. Clone the repository:**
```bash
git clone <repo-url>
cd RentNear
```

**2. Install all dependencies (root, apps, and packages):**
```bash
npm install
```
> This uses npm workspaces — it installs deps for all packages under `apps/` and `packages/` into a single `node_modules` at the root.

**3. Configure environment variables:**
```bash
# Copy the API environment template — edit it with your own secrets
cp apps/api/.env.example apps/api/.env
```

| Variable                 | Required | Purpose                                                    |
| ------------------------ | -------- | ---------------------------------------------------------- |
| `DATABASE_URL`           | ✅       | PostgreSQL connection string                               |
| `JWT_SECRET`             | ✅       | Secret key used to sign and verify JWT tokens              |
| `CORS_ORIGINS`           | ✅       | Comma-separated allowed origins (e.g. `http://localhost:3000`) |
| `R2_*`                   | ✅       | Cloudflare R2 / AWS S3 credentials for media uploads       |
| `RAZORPAY_KEY_ID`        | ✅       | Razorpay payment gateway API key                           |
| `RAZORPAY_KEY_SECRET`    | ✅       | Razorpay payment gateway API secret                        |

> The frontend (`apps/web`) does **not** require a `.env` file by default — all runtime config is served by the Next.js server.

**4. Set up the database:**

```bash
# Generate the Prisma client (creates Type-safe DB client from schema)
npm run prisma:generate -w @rentnear/api

# Apply database migrations (creates/updates tables in PostgreSQL)
npm run prisma:migrate -w @rentnear/api
```

| Command                               | Purpose                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `prisma generate`                     | Generates the Prisma Client from `schema.prisma` — must run after every schema change |
| `prisma migrate dev`                  | Creates and applies migrations to keep the database schema in sync      |
| `prisma db push`                      | Pushes schema changes directly (without creating migration files)       |
| `prisma studio`                       | Opens Prisma Studio — a GUI to browse and edit database data            |

---

### Running the App

All commands below are executed from the **repository root**.

#### ▶️ Start both frontend and backend (development)

```bash
npm run dev
```

This runs the `dev` script defined in the root `package.json`:

```json
"dev": "turbo run dev --parallel"
```

Turborepo runs all workspace `dev` scripts **in parallel**:
- **`apps/web`** — `next dev -p 3000`
- **`apps/api`** — `nest start --watch` (defaults to port `3001`)
- **`packages/api-client`** — `tsc --watch` (recompiles the shared SDK on changes)
- **`packages/types`** — `tsc --watch` (recompiles shared types on changes)

| Service          | URL                                    |
| ---------------- | -------------------------------------- |
| **Web App**      | `http://localhost:3000`                |
| **API Server**   | `http://localhost:3001/api/v1`         |

> The API port can be changed by setting the `PORT` environment variable in `apps/api/.env`.

#### ▶️ Start only the backend

```bash
npm run dev -w @rentnear/api
```

#### ▶️ Start only the frontend

```bash
npm run dev -w @rentnear/web
```

#### ▶️ Database GUI (Prisma Studio)

```bash
npm run prisma:studio -w @rentnear/api
```

This opens a browser-based database explorer at `http://localhost:5555`.

---

### Other Useful Commands

| Command                          | Purpose                                                    |
| -------------------------------- | ---------------------------------------------------------- |
| `npm run build`                  | Build all apps and packages for production                 |
| `npm run lint`                   | Run ESLint across all workspaces                           |
| `npm run type-check`             | Run TypeScript type-checking across all workspaces         |
| `npm run format`                 | Format all source files with Prettier                      |
| `npm run clean`                  | Remove all build artifacts and `node_modules`              |

---

### Production Build

```bash
# Build everything
npm run build

# Start API in production mode
npm run start:prod -w @rentnear/api

# Start frontend in production mode
npm run start -w @rentnear/web
```
The API production command (`start:prod`) runs the compiled `dist/main.js` directly via Node. The frontend production command (`start`) uses Next.js's built-in production server.

---
