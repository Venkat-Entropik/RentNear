# 🖥️ RentNear Frontend Web App (`apps/web`)

This is the Next.js frontend application for RentNear, built with React, Tailwind CSS, and TypeScript.

---

## 🔄 Frontend Data Flow Diagram

The following diagram illustrates how data flows within the frontend application, starting from a user interaction down to network requests and WebSocket streams:

```mermaid
graph TD
    %% Direction
    direction TB

    %% Nodes
    subgraph UI ["🎨 View Layer (Next.js & Tailwind CSS)"]
        User["👤 End User Action"]
        Pages["📄 Pages & Layouts<br/>(e.g., Discovery, Listing details, Chat, Checkout)"]
        Forms["📝 React Hook Form<br/>(Zod Schema Validation)"]
        Maps["🗺️ Leaflet Maps<br/>(Interactive search & Map Pins)"]
    end

    subgraph Logic ["⚙️ State & Logic Layer"]
        Zustand["📦 Zustand Store<br/>(Auth status, Active filters, Session state)"]
        ReactQuery["🔄 TanStack React Query<br/>(Cache, Queries, Mutations, Prefetching)"]
    end

    subgraph Network ["🔌 Network & Gateway Client Layer"]
        ApiClient["📡 @rentnear/api-client<br/>(Axios SDK for REST API)"]
        SocketClient["💬 socket.io-client<br/>(Persistent WS Connection)"]
        RazorpaySdk["💳 Razorpay checkout.js<br/>(External Payment SDK)"]
    end

    subgraph BackendGateway ["🔒 External / Backend Boundaries"]
        BackendAPI["🌐 NestJS HTTP Endpoints"]
        BackendWS["⚡ NestJS WebSockets Gateway"]
        RazorpayServer["💸 Razorpay Server"]
    end

    %% Flows
    User -->|Triggers click/input| Pages
    Pages -->|Binds inputs| Forms
    Pages -->|Interacts with maps| Maps
    
    Forms -->|Validates & submits| ReactQuery
    Maps -->|Sends bounds/filters| ReactQuery
    
    ReactQuery -->|Triggers mutation/query| ApiClient
    ReactQuery <-->|Reads/Writes client cache| Zustand
    
    ApiClient -->|HTTP GET/POST/PUT/DELETE| BackendAPI
    SocketClient <-->|Real-time chat events| BackendWS
    
    %% Specific flow for Payment
    Pages -->|Initiates Payment| RazorpaySdk
    RazorpaySdk -->|Authenticates & processes| RazorpayServer
    RazorpaySdk -->|Returns payment_id & signature| ReactQuery

    %% Styling
    classDef uiStyle fill:#fff1f2,stroke:#f43f5e,stroke-width:2px,color:#4c0519,rx:6px,ry:6px;
    classDef logicStyle fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#1e1b4b,rx:6px,ry:6px;
    classDef netStyle fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#3b0764,rx:6px,ry:6px;
    classDef extStyle fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#0f172a,rx:6px,ry:6px;

    class User,Pages,Forms,Maps uiStyle;
    class Zustand,ReactQuery logicStyle;
    class ApiClient,SocketClient,RazorpaySdk netStyle;
    class BackendAPI,BackendWS,RazorpayServer extStyle;
```

## 📂 Key Features & Tech Stack

### State Management & Queries
- **Zustand**: Handles simple, global, client-side UI states like drawer states, active filters, user session context, etc.
- **TanStack React Query**: Manages asynchronous server state caching, caching invalidation upon mutations, and automated polling/fetching.

### Interactive Maps
- **Leaflet & React Leaflet**: Powers the geographical listing search. Map pan/zoom triggers coordinates bounds calculations which update the listing search queries dynamically.

### Real-Time Live Chat
- **Socket.io Client**: Connects renters and owners, allowing instant message exchanges, read receipts, and live notification badges.

### Payments
- **React Razorpay**: Handles the payment modal integration directly on the frontend for smooth, fast checkout checkout flows.

---
