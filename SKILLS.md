# Engineering Skill Matrix & Competency Guide

Welcome to RentNear. This document maps every technology and integration pattern used across our stack to the specific competencies you will need to contribute effectively. Whether you are onboarding or looking to deepen your expertise in a particular domain, this guide spells out what "knowing X" means in the context of this codebase.

---

## Core Stack Competencies

### Frontend

| Technology | What We Use It For |
|---|---|
| **Next.js 14 (App Router)** | Route groups (`(public)`, `(protected)`, `auth`), server/client component boundaries, layouts, typed routes, image optimization via `next.config.js` |
| **TypeScript (strict mode)** | Shared types package (`@rentnear/types`), end-to-end type safety from DB schema through API responses to React components |
| **TanStack React Query** | All server-state: listing feeds, booking data, conversations, message pagination; cache invalidation driven by socket events and mutation side-effects |
| **Zustand** | Client-only auth state: current user, tokens, OTP step machine (phone → OTP → success); persisted to localStorage |
| **Tailwind CSS 3** | Custom design tokens (brand teal, typography scale, border radii, animation keyframes), fully responsive layouts |
| **react-hook-form + Zod** | All forms (auth, listing creation, profile, KYC submission); resolver-based validation with shared Zod schemas |
| **Leaflet / react-leaflet** | Interactive listing map with OpenStreetMap tiles, markers with popup previews |
| **Socket.io Client** | Real-time chat with automatic reconnection; auth token attached via handshake |
| **react-razorpay** | Payment checkout widget; order ID and amount passed from server-created Razorpay order |

### Backend

| Technology | What We Use It For |
|---|---|
| **NestJS 10 (Express)** | Modular monolith architecture: feature modules (Auth, Listings, Bookings, Payments, Chat, Admin, Disputes), DI containers, guards, pipes |
| **Prisma ORM** | Database schema with 12 models and 6 enums; migrations; transactional writes (booking + availability, payment + booking, review + aggregate); raw queries for admin stats |
| **PostgreSQL** | Relational data with foreign-key constraints; unique constraints (per-booking dispute per user, per-listing per-day availability) |
| **Passport.js (JWT)** | Access token validation via `JwtStrategy`; extracted payload attached to `request.user`; combined with `RolesGuard` for RBAC |
| **Socket.io (server)** | `/chat` gateway namespace; room-based `joinConversation` / `leaveConversation`; JWT guard on WebSocket handshake |
| **class-validator / class-transformer** | Global `ValidationPipe` with whitelist + forbidNonWhitelisted + transform; all DTOs use decorator-based validation |
| **@nestjs/throttler** | Global rate limit (20 requests per 60s per IP); application-level OTP rate caps |
| **AWS SDK v3 (S3)** | Cloudflare R2 presigned URL generation (`PutObjectCommand`, `DeleteObjectCommand`) via S3-compatible endpoint |
| **Razorpay SDK** | Server-side `orders.create()`, HMAC-SHA256 signature verification |
| **Turborepo** | Monorepo orchestration: parallel `dev` / `build` across 2 apps + 2 packages; shared `tsconfig.base.json` |

### Shared Packages

| Package | Purpose |
|---|---|
| **`@rentnear/types`** | TypeScript interfaces for all domain entities (User, Listing, Booking, Payment, Message, Dispute, etc.) and enums (Role, BookingStatus, PaymentStatus, KYCStatus); single source of truth shared between frontend and backend |
| **`@rentnear/api-client`** | Axios instance with request interceptor (Bearer token injection) and response interceptor (automatic 401 → refresh token → retry with request queuing); error normalization into `ApiError` shape |

---

## Advanced Integration Domains

### Phone OTP → JWT Authentication

The auth flow is phone-first: send OTP, verify OTP, receive JWT pair. Competencies required:

- **bcrypt hashing for transient secrets** — OTPs are bcrypt-hashed before storage (never plaintext); refresh tokens are SHA-256 hashed. Understand why each choice is appropriate for its use case.
- **Token rotation and replay prevention** — Each OTP session is one-time-use (marked `verified=true`); refresh tokens are rotated (old token revoked on each refresh). Know how to invalidate sessions server-side without a full blacklist.
- **Rate limiting at two levels** — Global throttler (20 req/60s) + application-level (max 3 pending OTP sessions per phone). Understand layered rate limiting to prevent abuse without breaking legitimate flows.
- **SMS provider abstraction** — Currently mocked (console.log). Know how to swap in MSG91, Twilio, or 2Factor.in without changing the core auth logic.

### Role-Based Access Control (RBAC)

Three roles — `OWNER`, `RENTER`, `ADMIN` — enforced at both the HTTP and WebSocket layers.

- **Declarative guards with metadata** — `@Roles(Role.ADMIN)` decorator combined with `RolesGuard` reads route metadata via NestJS `Reflector`. Understand how to build composable, decorator-driven authorization.
- **Ownership assertion in services** — In addition to role checks, service methods like `assertListingOwner()` verify that the authenticated user owns the resource. This prevents a user with a valid role from accessing another user's data.
- **WebSocket JWT guard** — Token extracted from `handshake.auth.token` or `Authorization` header; same `JwtStrategy` reused. Understand how to bridge HTTP auth patterns into the WebSocket lifecycle.

### Real-Time Chat (Socket.io)

A JWT-authenticated WebSocket gateway powers direct messaging between renters and owners.

- **Room-based broadcasting** — Each conversation has a unique room (`conversation_{id}`). Users join on open and leave on close. Know how to scope messages to rooms and avoid cross-conversation leakage.
- **Reactive cache synchronization** — The `newMessage` event triggers `queryClient.setQueryData` to prepend the new message to the cached message list and reorder the conversations list. Understand the trade-offs between optimistic updates and cache invalidation.
- **Pagination with real-time insertion** — Messages are loaded page-by-page via REST (`GET /chat/conversations/:id/messages`). New real-time messages must be inserted correctly into a paginated cache without disrupting scroll position or page boundaries.

### Payment Gateway (Razorpay)

Payments involve a three-step orchestration between server, client, and Razorpay.

- **Server-side order creation** — The API creates a Razorpay Order from a confirmed booking. The order ID is returned to the client. Know how to model the "pending payment" state between booking confirmation and payment verification.
- **HMAC-SHA256 signature verification** — The Razorpay webhook/callback signature is verified server-side using `crypto.createHmac`. Understand why this prevents tampering and how to implement it for any webhook-based payment flow.
- **Transactional state machine** — `prisma.$transaction` atomically updates `Payment` (status → SUCCESS) and `Booking` (status → COMPLETED). A failure in either step rolls back both. Know how to design state transitions that leave the system in a consistent state regardless of where a failure occurs.

### Direct-to-Cloud Media Uploads (Cloudflare R2)

Photos are uploaded directly from the browser to Cloudflare R2 using presigned URLs — the API server never touches the file bytes.

- **Presigned URL generation** — The `R2Service` generates time-limited (5-minute) presigned PUT URLs. Know the S3 `PutObject` signature v4 process and how to configure bucket policies for public read + private write.
- **Multi-step upload pipeline** — `presignMedia()` → `uploadToR2()` (direct `fetch` with progress callback) → `confirmMedia()` (persists key and URL). Understand why splitting these steps gives the client control over upload progress while keeping the server as the source of truth for media metadata.
- **Object lifecycle and cleanup** — Media deletion calls `DeleteObjectCommand` on R2. Know how to manage object keys (`listings/{listingId}/{uuid}.{ext}`), handle partial upload failures, and clean up orphaned objects.

### Booking & Availability Calendar

A per-date availability grid prevents double-booking of the same listing.

- **Transactional double-booking prevention** — `prisma.$transaction` creates the `Booking` record and updates `Availability` dates in a single atomic operation. Understand isolation levels and why this prevents race conditions when two users try to book the same dates simultaneously.
- **Date lifecycle management** — Availability dates are blocked on booking creation, freed on cancellation/rejection. Know how to model date ranges efficiently and handle partial-date conflicts.
- **Availability query performance** — Listing search must filter by available date ranges. Understand composite indexing strategies for `(listingId, date)` queries.

### KYC Document Verification

Users submit identity documents; admins review and update status.

- **Three-state approval workflow** — `PENDING → VERIFIED | REJECTED`. Once verified, the user cannot resubmit. Know how to enforce state transitions at the database level (enum + application logic).
- **Document storage** — Documents are uploaded via the same R2 presigned URL pipeline. Understand the security implications of storing identity documents and the need for access control on document URLs.
- **Admin review UI** — The admin dashboard lists all pending KYC submissions with accept/reject actions. Know how to build efficient admin tooling that handles document preview and bulk operations.

### Dispute Resolution

A trust-and-safety layer for resolving booking disputes.

- **Per-booking, per-user constraint** — Only one dispute per booking per user is allowed. Enforced via a unique constraint on `(bookingId, userId)`. Know how to model escalation limits without over-engineering.
- **State machine** — Disputes can only be created on non-pending, non-cancelled bookings. Admins can add notes and transition status to RESOLVED or CLOSED. Know how to validate business rules before allowing state transitions.
- **Admin triage dashboard** — Paginated dispute list with filters by status. Understand how to build a simple case-management interface without introducing a full external system.

### API Client SDK (Auto-Refresh with Request Queuing)

The custom `@rentnear/api-client` package is the single gateway for all frontend-to-backend communication.

- **Axios interceptor chain** — The request interceptor injects `Authorization: Bearer <token>`; the response interceptor catches 401s, calls `/auth/refresh`, and retries the original request. Understand interceptor execution order and error propagation.
- **Request queuing during token refresh** — If multiple requests fail simultaneously, only one refresh is issued; the others queue and replay once the new token arrives. Know how to implement a promise-based queue to avoid the "thundering herd" problem at token refresh.
- **Error normalization** — All errors are normalized into a consistent `ApiError` shape with `status`, `message`, and optional `errors` (field-level). Understand how to preserve stack traces in development while sanitizing in production.

---

## Onboarding Checklist / Learning Roadmap

If you are new to the stack, here is a suggested order to build competency:

1. **TypeScript & Monorepo Fundamentals**
   - Understand strict mode, `tsconfig` paths, workspace dependency resolution
   - Trace a request from a React component through `@rentnear/api-client` to a NestJS controller and back

2. **NestJS Module Architecture**
   - Build a small feature module (controller, service, DTO, module registration)
   - Understand dependency injection, global modules, and guard/decorator composition

3. **Prisma & PostgreSQL**
   - Read the schema; understand each model, relation, and enum
   - Run a migration, write a seed script, execute a transactional write

4. **Auth End-to-End**
   - Walk through `send-otp` → `verify-otp` → store tokens in Zustand → attach via Axios interceptor
   - Implement a new guard that checks a custom condition

5. **React Query Patterns**
   - Trace a listing fetch: query key, `staleTime`, cache update on mutation
   - Implement a real-time subscription that updates cached data

6. **One Integration Domain**
   - Pick one: Payments, Media Uploads, or Chat
   - Read every file in that feature directory (frontend + backend + shared types)
   - Trace the full request lifecycle end-to-end

7. **Production Readiness**
   - Review environment configuration, CORS, rate limiting, error handling, and graceful shutdown
   - Understand what changes when deploying vs developing locally
