# Duplicate Code Detection & Refactoring Report: FlowLoG

## 1. Summary of Duplications Detected

This audit identifies structural duplication across the backend (Express 5/Prisma) and frontend (Next.js 16/React 19) codebases. Eliminating these redundancies will optimize connection limits, minimize cache corruption risks, simplify component state sharing, and drastically reduce boilerplate code.

### High-Level Refactoring Metrics Estimation
*   **Total Lines of Code (LoC) that can be removed:** ~150+ lines
*   **Maintenance Reduction:** Estimated at 35% (fewer locations to update for schemas, endpoints, and helpers)
*   **Complexity Reduction:** High (improved connection pooling, standardized error handling, and cleaner component state management)

---

## 2. Duplicate Blocks Catalog

### Duplicate 1: PrismaClient Instantiation (Architectural Risk)
*   **Files:**
    *   `server/index.js` (Line 10)
    *   `server/middleware/auth.js` (Line 12)
    *   `server/controllers/subscriptionController.js` (Line 2)
    *   `server/prismaClient.js` (Line 4)
*   **Functions:** Inline instantiation via `new PrismaClient()`
*   **Duplicate of:** `server/prismaClient.js` (the central shared instance client)
*   **Why duplicate:** Developers instantiated new instances of the client locally in routes/middleware files rather than requiring the exported client.
*   **Suggested refactor:**
    Remove `const prisma = new PrismaClient();` from the three duplicate locations, and replace with:
    ```javascript
    const prisma = require('../prismaClient'); // or './prismaClient' in index.js
    ```
*   **Estimates:**
    *   **Lines removed:** 6 lines
    *   **Maintenance reduction:** Moderate (ensures connection configurations are kept in a single location)
    *   **Complexity reduction:** Critical (prevents PostgreSQL connection exhaustion by sharing a single connection pool)

---

### Duplicate 2: User Subscription Upgrade Business Logic
*   **Files:**
    *   `server/controllers/subscriptionController.js` (Lines 54–63)
    *   `server/controllers/paymentController.js` (Lines 70–79)
*   **Functions:**
    *   `subscriptionController.js` -> `upgradeSubscription`
    *   `paymentController.js` -> `verifyPayment`
*   **Duplicate of:** Each other (exact duplicate queries and expiry math)
*   **Why duplicate:** The payment verification webhook and the manual upgrade route both perform the account state transition independently.
*   **Suggested refactor:**
    Create a user service/helper file `server/utils/subscription.js` and encapsulate the update logic:
    ```javascript
    async function upgradeUserToPro(userId) {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 365);
      return await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          subscriptionExpiry: expiry,
          subscriptionPlan: 'pro'
        }
      });
    }
    ```
    Then import and call this function in both controllers.
*   **Estimates:**
    *   **Lines removed:** ~15 lines
    *   **Maintenance reduction:** High (expiry offset changes or subscription status adjustments only need to be modified once)
    *   **Complexity reduction:** High (centralizes business logic for account transitions)

---

### Duplicate 3: Background/Cover Style Formatting (Client Utility)
*   **Files:**
    *   `client/app/dashboard/page.tsx` (Lines 128–134)
    *   `client/components/SwitchBoardsPopup.tsx` (Lines 43–49)
*   **Functions:** `getBackgroundStyle`
*   **Duplicate of:** Each other (identical utility logic)
*   **Why duplicate:** Boards have customizable backgrounds (solid hexes, gradients, or Unsplash URL images). Both components need to render board cards and parse this string style independently.
*   **Suggested refactor:**
    Extract the function to a client utility helper file `client/utils/styleHelper.ts` and export it:
    ```typescript
    export const getBackgroundStyle = (background?: string): React.CSSProperties => {
      if (!background) return { background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' };
      if (background.startsWith('linear')) return { background };
      if (background.startsWith('url')) return { backgroundImage: background, backgroundSize: 'cover' };
      if (background.startsWith('#')) return { background };
      return { background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' };
    };
    ```
*   **Estimates:**
    *   **Lines removed:** 8 lines
    *   **Maintenance reduction:** Low
    *   **Complexity reduction:** Moderate (removes duplicate client style parsing)

---

### Duplicate 4: Cache Eviction Wildcard Patterns (Performance/Cleanliness)
*   **Files:** Across all controllers (`boardController.js`, `cardController.js`, `listController.js`, `checklistController.js`, `labelController.js`, `memberController.js`)
*   **Functions:** Inline invocations of `deleteCachePattern` and `deleteCache`
*   **Duplicate of:** Multiple scattered strings
*   **Why duplicate:** Every mutations controller handles database updates and must clear the board/user caches. The Redis pattern keys are repeated across files.
*   **Suggested refactor:**
    Create a centralized invalidation manager in `server/utils/cacheInvalidator.js`:
    ```javascript
    const { deleteCache, deleteCachePattern } = require('./redisClient');

    const invalidateBoard = async (boardId) => {
      await deleteCachePattern(`board:${boardId}:user:*`);
    };

    const invalidateUserBoards = async (userId) => {
      await deleteCache(`boards:user:${userId}`);
    };

    const invalidateAllBoards = async () => {
      await deleteCachePattern('board:*:user:*');
    };

    module.exports = { invalidateBoard, invalidateUserBoards, invalidateAllBoards };
    ```
*   **Estimates:**
    *   **Lines removed:** ~20 lines (replaces scattered inline strings with structured helper calls)
    *   **Maintenance reduction:** High (safeguards against typos in cache keys which cause stale data bugs)
    *   **Complexity reduction:** High (centralizes caching side-effects)

---

### Duplicate 5: Cryptographic Password Hashing Setup
*   **Files:**
    *   `server/routes/auth.js` (Line 44 & Line 162)
*   **Functions:** Inline invocation of `await bcrypt.hash(password, BCRYPT_ROUNDS)`
*   **Duplicate of:** Each other
*   **Why duplicate:** Hashing is executed in both the initial user `/signup` route and the legacy account `/set-password` route.
*   **Suggested refactor:**
    Define a helper function at the top of the route file or in a utility folder:
    ```javascript
    async function hashPassword(password) {
      return await bcrypt.hash(password, BCRYPT_ROUNDS);
    }
    ```
*   **Estimates:**
    *   **Lines removed:** 4 lines
    *   **Maintenance reduction:** Low (allows easy adjustments of hash rounds)
    *   **Complexity reduction:** Low

---

### Duplicate 6: Controller try/catch Error Handler Boilerplate (Express 5 Optimizations)
*   **Files:** 30+ endpoints across all controllers in `server/controllers/`
*   **Functions:** Catch block error responses:
    ```javascript
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
    ```
*   **Duplicate of:** Each other (repeated in every endpoint handler)
*   **Why duplicate:** Classic boilerplate for catching database errors or application panics and sending 500 status codes.
*   **Suggested refactor:**
    Because the application runs on **Express.js 5**, Express natively intercepts rejected promises in async route handlers and passes them to the downstream error middleware.
    1.  Remove all generic try/catch blocks from controller methods that only serve to return `res.status(500)`.
    2.  Write a single error handler middleware in `server/middleware/errorHandler.js`:
        ```javascript
        const errorHandler = (err, req, res, next) => {
          console.error(err);
          res.status(500).json({ error: err.message || 'Internal Server Error' });
        };
        module.exports = errorHandler;
        ```
    3.  Register it in `server/index.js` as the final middleware:
        ```javascript
        app.use(require('./middleware/errorHandler'));
        ```
*   **Estimates:**
    *   **Lines removed:** ~90+ lines of redundant catch blocks
    *   **Maintenance reduction:** Very High (implements cleaner, standardized HTTP error outputs)
    *   **Complexity reduction:** Very High (simplifies controller functions to single-line declarations of intent)

---

### Duplicate 7: Client-side Authentication Token Retrievals
*   **Files:**
    *   `client/app/landing/page.tsx`
    *   `client/app/page.tsx`
    *   `client/app/dashboard/page.tsx`
    *   `client/app/board/share/[token]/page.tsx`
    *   `client/components/FlowGuide.tsx`
    *   `client/components/Header.tsx`
*   **Functions:** Inline query patterns check token presence:
    ```typescript
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    ```
*   **Duplicate of:** Each other
*   **Why duplicate:** Components and page routes need to verify authentication state, redirect unauthenticated users, or build API authorization headers locally.
*   **Suggested refactor:**
    Expose a custom hook `useAuth` or consolidate under a React `AuthContext` to share authorization state, redirect logic, and token access cleanly.
*   **Estimates:**
    *   **Lines removed:** ~20 lines
    *   **Maintenance reduction:** High
    *   **Complexity reduction:** High (removes direct localStorage dependency, rendering auth checks isomorphic-safe)
