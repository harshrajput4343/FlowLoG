# Code Quality & Maintainability Review: FlowLoG

## 1. Clean Code Violations

### God Components (Single Responsibility Violations)
*   **Location:** [BoardCanvas.tsx](file:///h:/Projects/FlowLoG/client/components/BoardCanvas.tsx) (897 lines)
*   **Issue:** `BoardCanvas` is a God Component that manages a wide array of concerns:
    1.  Orchestrating list and card drag-and-drop operations (`onDragEnd`).
    2.  Performing Unsplash background search, rendering, loading, and error states.
    3.  Generating board share links and copy-to-clipboard interactions.
    4.  Filtering cards by text, labels, and members.
    5.  Managing state transitions for board deletion and column additions.
    This high density of distinct responsibilities makes the component fragile and complex to read.
*   **Refactor:** Decompose `BoardCanvas` into modular sub-components:
    *   `BackgroundPicker`: Handles color palettes and Unsplash integration.
    *   `BoardShareMenu`: Handles share token generation and copy links.
    *   `BoardFilters`: Manages label and member filtering selections.
    This delegates rendering and state to smaller, focused components.

---

### Long Functions & Deep Nesting
*   **Location:** [BoardCanvas.tsx](file:///h:/Projects/FlowLoG/client/components/BoardCanvas.tsx) (`onDragEnd` - Lines 541–620)
*   **Issue:** The drag-and-drop callback is 80 lines long and contains deep conditional nesting. It handles list position shifting, single-list card reordering, and cross-list card transfers. The nested branches make the state updates and backend calls difficult to trace.
*   **Refactor:** Break the function into dedicated helper handlers:
    *   `handleListReorder(sourceIndex, destinationIndex)`
    *   `handleCardReorderWithinList(listId, sourceIndex, destinationIndex)`
    *   `handleCardReorderAcrossLists(sourceListId, destListId, sourceIndex, destinationIndex)`

---

### Dead Code & Commented-Out Statements
*   **Location:** 
    *   [BoardCanvas.tsx](file:///h:/Projects/FlowLoG/client/components/BoardCanvas.tsx) (Lines 243–277) -> Unused component `LiveDate`.
    *   [ProfileDropdown.tsx](file:///h:/Projects/FlowLoG/client/components/ProfileDropdown.tsx) (Line 44) -> Commented-out cache removal statements:
        `// localStorage.removeItem('recentBoards');`
*   **Issue:** Leftover components and commented statements reduce code readability and pollute bundle files.
*   **Refactor:** Remove the unused `LiveDate` component and clean up commented-out debugging lines.

---

## 2. SOLID Design Principle Violations

### Single Responsibility Principle (SRP) Violations
*   **Location:** [flowguideController.js](file:///h:/Projects/FlowLoG/server/controllers/flowguideController.js)
*   **Issue:** The AI controller handles:
    1.  Translating prompt messages into SQL/Prisma operations (Pass 1).
    2.  Enforcing model whitelists, limits, and user scope bounds.
    3.  Executing database queries.
    4.  Formatting natural language query summaries (Pass 2).
    This tightly couples the query generation engine, data access layer, security policy, and responder into a single module.
*   **Refactor:** Separate the concerns:
    *   `server/services/llmService.js`: Interface to Google AI Studio REST calls.
    *   `server/services/querySecurity.js`: Enforces model whitelists and userId injection scopes.
    *   `server/controllers/flowguideController.js`: Serves purely as the HTTP handler delegating to the services.

---

### Dependency Inversion Principle (DIP) & Tight Coupling
*   **Location:** [emailService.js](file:///h:/Projects/FlowLoG/server/utils/emailService.js)
*   **Issue:** The email dispatch utility is tightly coupled to direct implementations of Google SMTP and the Resend API client. If the email infrastructure changes to SendGrid, Mailgun, or another service, the core file must be rewritten.
*   **Refactor:** Implement an `EmailProvider` interface:
    ```javascript
    class EmailProvider {
      async send({ to, subject, html }) { throw new Error('Not implemented'); }
    }
    ```
    Then create concrete classes (`ResendProvider`, `SmtpProvider`) and inject the active provider depending on environment variables at startup.

---

## 3. Maintainability & Code Consistency

### Inconsistent PrismaClient Instantiation Patterns
*   **Location:** Backend server workspace
*   **Issue:** Highly inconsistent data connection patterns. Part of the controllers require a shared client `const prisma = require('../prismaClient')`, while other files invoke `new PrismaClient()` directly, leading to pool fragmentation.
*   **Refactor:** Enforce use of the centralized `server/prismaClient.js` pool across all modules.

---

### Inconsistent Auth Verification Patterns
*   **Location:** [routes/auth.js](file:///h:/Projects/FlowLoG/server/routes/auth.js) vs other route files
*   **Issue:** Some routes verify authorization using Express route middleware:
    ```javascript
    router.post('/accept/:token', authMiddleware, requireAuth, async (req, res) => { ... })
    ```
    While other controllers (like `subscriptionController.js`) omit `requireAuth` in the route declaration and manually verify authorization inside the controller body:
    ```javascript
    if (!req.userId) return res.status(401).json({ error: 'Authentication required' });
    ```
    This inconsistency increases the risk of developers forgetting to add authorization checks to new controllers.
*   **Refactor:** Standardize API endpoint authorization by enforcing `authMiddleware` and `requireAuth` middleware uniformly at the routing layer for all protected paths.

---

### Typing Laxity (Use of `any`)
*   **Location:** [api.ts](file:///h:/Projects/FlowLoG/client/utils/api.ts)
*   **Issue:** API client wrappers frequently resolve values typed as `any` or `any[]` (e.g. `getBoardByShareToken` returns `Promise<any>`). This disables TypeScript safety and increases the risk of developers writing incorrect schema paths on the frontend.
*   **Refactor:** Define rigorous TypeScript types for the API payloads (e.g. `Board`, `List`, `Card`, `User`) and replace all occurrences of `any` with concrete type interfaces.
