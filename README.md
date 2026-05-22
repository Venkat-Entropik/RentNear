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
- Node.js `>= 20.0.0`
- npm `>= 10.0.0`
- PostgreSQL instance running locally or remotely

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd RentNear
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy `apps/api/.env.example` to `apps/api/.env` and configure your database and third-party secrets.
   - Copy `apps/web/.env.example` to `apps/web/.env` and update the necessary URLs/Keys.

4. **Database Migration:**
   ```bash
   cd apps/api
   npm run prisma:generate
   npm run prisma:migrate
   ```

### Running the App

To run both the frontend and backend in parallel using Turborepo from the root directory:

```bash
npm run dev
```
- **Web App**: `http://localhost:3000`
- **API Server**: `http://localhost:8000` (or as configured in `.env`)

---
