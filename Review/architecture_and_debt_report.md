# Architecture Review, Technical Debt, & Refactoring Plan: FlowLoG

## 1. Architecture Review (Phase 8)

### Scalability Analysis & Bottleneck Identification

```
                  +--------------------------------+
                  |  Scalability Limit Assessment  |
                  +--------------------------------+
                    1,000 Users:   [  OK  ]  - Free/Basic Tier Handles Load
                   10,000 Users:   [ ALERT]  - Pool Exhaustion & Index Scans
                  100,000 Users:   [ FAIL ]  - Cache Storms & API N+1 Timeouts
                1,000,000 Users:   [ CRASH]  - Single Container Memory Lock
```

*   **1,000 Concurrent Users:** **Fully Supported.** System fits within cheap/free tier containers (e.g. Render) and standard database instances (e.g. Supabase Free).
*   **10,000 Concurrent Users:** **Performance Degrades.** Bottlenecks appear immediately:
    1.  *Connection pool exhaustion* occurs due to redundant `new PrismaClient()` statements.
    2.  *High CPU usage* on PostgreSQL due to missing database indexes on foreign keys (`boardId`, `listId`, etc.), causing full table scans.
*   **100,000 Concurrent Users:** **System Failure.** 
    1.  *Redis Cache Eviction Storms:* Wildcard cache flushes (`board:*:user:*`) drop all caches system-wide on every label/checklist edit, creating a massive thundering herd on PostgreSQL.
    2.  *API Timeout / Connection Limits:* The client-side template instantiator fires M*N sequential HTTP calls to create columns/cards. Multiple concurrent users creating templates will block the Express event loop and exhaust browser connection limits.
    3.  *Client Latency:* Client-side rendering without card memoization causes significant UI lag when reordering lists.
*   **1,000,000 Concurrent Users:** **Complete Outage.** Supabase/Render services crash.
    *   *Resolutions:* Require horizontal backend container scaling, centralized database pooling middleware (pgBouncer), read replicas, edge-caching on Next.js, and background write-queues (RabbitMQ/BullMQ) to decouple board mutations from database operations.

---

### Reliability Review
*   **Retry Mechanisms:** None. Client API calls fail immediately on network glitches.
*   **Circuit Breakers:** None. Integration failures with payment (Razorpay) or AI (Google AI Studio) delay thread execution and flow directly back to users.
*   **Queue Handling:** None. Drag-and-drop state modifications hit PostgreSQL synchronously.
*   **Failure Recovery:** Restarts rely on container-level checks (Render). No process manager (e.g. PM2) is configured for internal node recovery.

---

### Observability Review
*   **Logging:** Weak. Output uses unstructured `console.log` and `console.error` strings which are difficult to parse in log aggregators.
*   **Metrics / Tracing:** No APM metric collectors (e.g. Datadog, New Relic) or tracing packages (e.g. OpenTelemetry) are integrated.

---

## 2. Technical Debt Report (Phase 9)

```
+-------------------------------------------------------------------------+
|                        Technical Debt Prioritization                    |
+-------------------------------------------------------------------------+
|  CRITICAL (Immediate)  - IDOR Vulnerabilities (Checklists/Labels)        |
|                        - SQL Injection (executeRawUnsafe in Reorders)   |
|                        - Redundant PrismaClient Instantiations          |
+-------------------------------------------------------------------------+
|  HIGH (This Sprint)    - Wildcard Cache Eviction Storms                 |
|                        - Client-side Template N+1 API Loops             |
|                        - Public Client-side Unsplash API Key Leak       |
+-------------------------------------------------------------------------+
|  MEDIUM (This Month)   - Missing DB Indexes on Schema Foreign Keys      |
|                        - Unnecessary Client Re-renders (Memoization)    |
|                        - DOM XSS Vulnerability in FlowBot               |
|                        - Missing Route Rate-Limiters                    |
+-------------------------------------------------------------------------+
|  LOW (Nice-to-Have)    - Unused Code Components (LiveDate/Comments)     |
|                        - Structured JSON Logging (Pino/Winston)         |
|                        - Client Auth State context/hook abstraction     |
+-------------------------------------------------------------------------+
```

---

## 3. Refactoring Plan (Phase 10)

### Quick Wins (1–2 Hours)
*   **Standardize Prisma Client:**
    Replace redundant `new PrismaClient()` statements in `server/index.js`, `server/middleware/auth.js`, and `server/controllers/subscriptionController.js` with calls to the shared export client at `server/prismaClient.js`.
*   **Clean Up Dead Code:**
    Remove the unused `LiveDate` component inside `BoardCanvas.tsx` and delete commented-out debugging lines in `ProfileDropdown.tsx`.

---

### Short-Term Refactors (1–3 Days)
*   **Fix Broken Access Control / IDOR (Labels & Checklists):**
    Fetch the parent board ID in the label and checklist controllers, and apply `userHasBoardAccess(req.userId, boardId)` validation checks before executing operations.
*   **Secure Reordering Logic (SQL Injection Immunity):**
    Replace unsafe string interpolation in `$executeRawUnsafe` with safe parameterized queries, or refactor to execute card/list updates inside a `prisma.$transaction` mapping loop.
*   **Target Redis Cache Evictions:**
    Refactor checklist and label cache invalidations to delete specific board key patterns (`board:${boardId}:user:*`) instead of flushing the entire cache database via wildcards.
*   **Mitigate DOM XSS:**
    Sanitize user messages in `FlowBot.tsx` using a client-side sanitizer library before binding them to `dangerouslySetInnerHTML`.

---

### Long-Term Refactors (1–4 Weeks)
*   **Proxy Third-Party API Keys:**
    Establish a backend endpoint `/api/unsplash/search` to proxy Unsplash requests, removing `NEXT_PUBLIC_UNSPLASH_KEY` and keeping credentials private.
*   **Create Indexes on Foreign Keys:**
    Add index annotations to relations inside [schema.prisma](file:///h:/Projects/FlowLoG/server/prisma/schema.prisma) and run database migrations to build indexes on target foreign keys, improving retrieval speeds.
*   **Transaction-based Board Template Instantiation:**
    Create a single backend endpoint (`POST /api/boards/template`) that creates the board and populates all columns/cards inside a database transaction, eliminating client-side HTTP loops.
*   **Optimize Client Render Path:**
    Memoize `ListColumn.tsx` and `CardItem.tsx` components using `React.memo` and wrap canvas updates in `useCallback` to prevent complete board re-renders during card drags.
*   **Introduce Structured Logging & APMs:**
    Integrate Winston/Pino JSON logging and configure APM traces (OpenTelemetry) to provide performance observability.
