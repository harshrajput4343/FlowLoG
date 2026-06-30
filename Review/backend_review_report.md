# Backend Review & Database Audit Report: FlowLoG

## 1. Database & ORM Performance Audit

### Database N+1 Queries & API N+1 Loops
*   **Location:** `client/app/dashboard/page.tsx` (`handleUseTemplate` - Lines 107–126)
*   **Issue:** **API N+1 Loop.** When a user creates a board from a template, the client executes N+1 HTTP calls sequentially in nested loops:
    1.  `POST /api/boards` (1 call)
    2.  `POST /api/lists` (M calls - one for each list)
    3.  `POST /api/cards` (K calls - one for each card in each list)
    This can result in 15–20 sequential HTTP roundtrips to instantiate a template, leading to network latency bottlenecks and database transaction sprawl.
*   **Fix:** Create a single transactional endpoint on the backend (e.g., `POST /api/boards/template`) that accepts the template configuration and instantiates the entire board, lists, and cards inside a single database transaction (`prisma.$transaction`).

---

### Missing Database Indexes on Foreign Keys (Query Latency Risk)
*   **Location:** [schema.prisma](file:///h:/Projects/FlowLoG/server/prisma/schema.prisma)
*   **Issue:** Foreign key fields lack database indexes:
    *   `Board.ownerId`
    *   `List.boardId`
    *   `Card.listId`
    *   `Label.boardId`
    *   `Checklist.cardId`
    *   `ChecklistItem.checklistId`
    *   `Invitation.senderId`
    In PostgreSQL, foreign key relations **do not** automatically create indexes (unlike MySQL). Because the application queries lists by `boardId` and cards by `listId` on every board paint, the database must execute full table scans once records scale, degrading retrieval latency.
*   **Fix:** Add `@@index` annotations to all relation foreign keys in the Prisma schema:
    ```prisma
    model List {
      ...
      boardId Int
      board   Board @relation(fields: [boardId], references: [id])
      
      @@index([boardId])
    }
    ```

---

### Race Conditions in Reordering / Creation
*   **Location:**
    *   `listController.js` (`createList` - Lines 27–32)
    *   `cardController.js` (`createCard` - Lines 31–36)
*   **Issue:** Read-modify-write concurrency race. Both controllers fetch the maximum order value sequentially before inserting the new record:
    ```javascript
    const lastCard = await prisma.card.findFirst({ where: { listId }, orderBy: { order: 'desc' } });
    const order = lastCard ? lastCard.order + 1 : 0;
    await prisma.card.create({ data: { ..., order } });
    ```
    If two requests create lists/cards concurrently, both will read the same max order index, resulting in duplicate order indices.
*   **Fix:** Utilize a database lock, implement atomic serial sequences, or handle index sorting elegantly on the frontend client when duplicates are rendered.

---

## 2. API Design & REST Compliance

### REST Resource Violations & RPC Anti-Patterns
*   **Location:** [routes/payment.js](file:///h:/Projects/FlowLoG/server/routes/payment.js), [routes/invitations.js](file:///h:/Projects/FlowLoG/server/routes/invitations.js), [routes/checklists.js](file:///h:/Projects/FlowLoG/server/routes/checklists.js)
*   **Issue:** The REST endpoints utilize action-oriented RPC subpaths:
    *   `POST /api/boards/:id/share` (RPC action instead of exposing a share relation sub-resource).
    *   `PATCH /api/checklists/items/:id/toggle` (Toggles state without passing updated request fields).
    *   `POST /api/members/card` (Instead of nested routing e.g., `POST /api/cards/:cardId/members`).
*   **Fix:** Standardize REST patterns. For example, change toggling to a standard `PATCH /api/checklists/items/:id` endpoint that accepts `{ isChecked: boolean }` fields.

---

### Payload Bloat (Missing Pagination and Pruning)
*   **Location:** `boardController.js` (`getBoardById` & `getBoardByShareToken`)
*   **Issue:** These queries fetch a nested graph containing all lists, cards, checklists, label joins, and board members in a single payload. If a board grows to contain hundreds of cards and checklists, the JSON payload becomes massive (multiple megabytes), leading to high serialized transfer sizes.
*   **Fix:** Paginate card retrievals inside lists or defer loading detailed card checklist arrays until the user opens the card modal details.

---

## 3. Scalability & Caching Opportunities

### Cache Wildcard Eviction Thundering Herds
*   **Location:** `checklistController.js`, `labelController.js`, `memberController.js`
*   **Issue:** To invalidate board caches, these controllers invoke:
    ```javascript
    await deleteCachePattern("board:*:user:*");
    ```
    This deletes the cached board responses for **every user and board** in the system whenever a checklist item is ticked or a label is added. It forces immediate database query spikes across all users as they reload their boards.
*   **Fix:** Query the parent `boardId` and strictly limit cache invalidations to that specific board:
    ```javascript
    await deleteCachePattern(`board:${boardId}:user:*`);
    ```

---

### Missing Cache Coverage on Public Shared Boards
*   **Location:** `boardController.js` (`getBoardByShareToken` - Lines 252–314)
*   **Issue:** The public shared board endpoint is not cached. Public boards linked in external documents that experience traffic spikes will bypass the caching layer entirely and query the Supabase database directly, creating performance bottlenecks.
*   **Fix:** Cache shared board responses in Redis under the token key (`board:share:${token}`) with a short TTL (e.g., 60 seconds).

---

## 4. Error Handling & System Monitoring

### Redundant Try/Catch Boilerplate in Controllers
*   **Location:** Across all backend controller endpoints
*   **Issue:** Try/catch blocks repeat `res.status(500).json({ error: error.message })`. This clutters controllers and obscures custom error codes. Since **Express 5** natively forwards rejected async router promises to the next error middleware, these try/catch wrappers are redundant.
*   **Fix:** Remove local catches in controllers and write a centralized error middleware to format and log database and execution errors in `server/middleware/errorHandler.js`.

---

### Poor Structured Logging
*   **Location:** Throughout backend workspace
*   **Issue:** Standard `console.log` and `console.error` calls are used for logging. Plain text outputs are difficult to filter, index, or parse inside log aggregation engines (like Elastic, Datadog, or CloudWatch).
*   **Fix:** Implement a structured logger (such as **Winston** or **Pino**) to output logs in structured JSON formats with severity tags:
    ```json
    {"level":"error","message":"Razorpay order creation failed","timestamp":"2026-06-10T12:00:00Z","error":"..."}
    ```
