# ⚙️ RentNear Backend API (`apps/api`)

This is the NestJS backend application for RentNear, built with TypeScript, Prisma, and PostgreSQL.

---

## 🔄 Backend Data Flow Diagram

The following diagram illustrates how incoming requests are intercepted, processed, verified, and saved in the storage layer or external services:

```mermaid
graph TD
    %% Direction
    direction TB

    %% Nodes
    subgraph Ingest ["🔌 Ingestion & Entry Gateways"]
        ClientRequest["📡 Client REST HTTP / Socket.io"]
        CorsThrottler["🛡️ CORS & NestJS Throttler<br/>(Rate limiting & CORS policies)"]
        Router["🛣️ Router & Routing Layer"]
    end

    subgraph Interceptors ["🔒 Security & Validation Interceptors"]
        JwtAuth["🔑 JwtAuthGuard<br/>(Passport JWT Token Verification)"]
        RolesAuth["🚦 RolesGuard<br/>(Verifies OWNER, RENTER, ADMIN roles)"]
        ValidationPipe["🔎 ValidationPipe<br/>(class-validator & class-transformer DTO parsing)"]
    end

    subgraph Business ["🧠 Business Core & Services"]
        Controller["🕹️ Controllers & WS Gateways"]
        AuthSvc["👤 AuthService & OTP Session"]
        ListingsSvc["🏠 ListingsService"]
        BookingsSvc["📅 BookingsService"]
        ChatSvc["💬 ChatService & WS Server"]
        PaymentsSvc["💳 PaymentsService"]
    end

    subgraph Data ["🗄️ Persistence & Storage"]
        PrismaClient["💎 Prisma ORM Client"]
        Postgres[("🐘 PostgreSQL DB")]
    end

    subgraph ExtServices ["☁️ External Systems"]
        S3Cloudflare["🪣 AWS SDK S3 / Cloudflare R2<br/>(KYC & Listing Media uploads)"]
        RazorpaySDK["💸 Razorpay API / Webhook Manager"]
    end

    %% Flows
    ClientRequest --> CorsThrottler
    CorsThrottler --> Router
    Router --> JwtAuth
    JwtAuth --> RolesAuth
    RolesAuth --> ValidationPipe
    
    ValidationPipe --> Controller
    
    Controller -->|Auth endpoint| AuthSvc
    Controller -->|Listings endpoint| ListingsSvc
    Controller -->|Bookings endpoint| BookingsSvc
    Controller -->|Chats/Sockets endpoint| ChatSvc
    Controller -->|Payments endpoint| PaymentsSvc
    
    AuthSvc & ListingsSvc & BookingsSvc & ChatSvc & PaymentsSvc --> PrismaClient
    PrismaClient <--> Postgres

    ListingsSvc -->|Generates upload URLs| S3Cloudflare
    PaymentsSvc -->|Processes payments & orders| RazorpaySDK
    RazorpaySDK -->|Asynchronous Callback / webhook| PaymentsSvc

    %% Styling
    classDef ingestStyle fill:#fff7ed,stroke:#ea580c,stroke-width:2px,color:#431407,rx:6px,ry:6px;
    classDef securityStyle fill:#fff1f2,stroke:#f43f5e,stroke-width:2px,color:#4c0519,rx:6px,ry:6px;
    classDef bizStyle fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#052e16,rx:6px,ry:6px;
    classDef dataStyle fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b,rx:6px,ry:6px;
    classDef extStyle fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#3b0764,rx:6px,ry:6px;

    class ClientRequest,CorsThrottler,Router ingestStyle;
    class JwtAuth,RolesAuth,ValidationPipe securityStyle;
    class Controller,AuthSvc,ListingsSvc,BookingsSvc,ChatSvc,PaymentsSvc bizStyle;
    class PrismaClient,Postgres dataStyle;
    class S3Cloudflare,RazorpaySDK extStyle;
```

## 📂 Key Architecture Modules

### 1. Ingestion, Security & Authorization
- **NestJS Throttler**: Protects controllers against brute-force attacks.
- **Passport JWT**: Extends authentication parsing using custom guards. JWT tokens verify user identities dynamically on secure HTTP endpoints and socket gateways.
- **Roles Guard**: Restricts access based on enum roles (`OWNER`, `RENTER`, `ADMIN`).

### 2. Business Logic Core
- **OTP Login System**: Generates secure OTP logins, hashes them using `bcryptjs` and expires sessions efficiently to prevent spoofing.
- **Listings & Cloudflare R2**: Securely orchestrates document & photo media uploads using pre-signed AWS S3 compatible upload links, bypassing server performance bottlenecks.
- **Real-Time Live Chat Gateway**: Manages stateful WebSocket rooms using Socket.io, persisting messaging histories securely via Prisma.
- **Razorpay Orders & Webhooks**: Triggers orders dynamically and processes asynchronous server signature verifications to complete rental bookings.

---
