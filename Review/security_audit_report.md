# Security Audit & Vulnerability Report: FlowLoG

## 1. Executive Summary
This audit focuses on locating security weaknesses across the FlowLoG application architecture. The audit has uncovered two **Critical** Broken Access Control (IDOR) vulnerabilities, one **Critical** SQL Injection vulnerability, a **Medium** DOM-based XSS risk, and missing rate limiting safeguards on credential and LLM routes.

---

## 2. Itemized Security Vulnerabilities

### Issue 1: Broken Access Control / IDOR (Labels Controller)
*   **Severity:** Critical
*   **Location:** [labelController.js](file:///h:/Projects/FlowLoG/server/controllers/labelController.js) (All endpoints: `createLabel`, `updateLabel`, `deleteLabel`, `addLabelToCard`, `removeLabelFromCard`)
*   **Explanation:** 
    The label controller does not perform any authorization check. It receives parameters (`id`, `boardId`, `cardId`, `labelId`) directly from the request and performs mutations (`prisma.label.create`, `prisma.label.update`, `prisma.label.delete`, `prisma.cardLabel.create`, `prisma.cardLabel.delete`) without verifying that the requesting user (`req.userId`) owns or is a collaborator on the target board.
*   **Attack Scenario:** 
    An authenticated attacker can write a script to cycle through IDs and delete labels belonging to other users' private boards, or insert arbitrary label relationships into other users' private cards:
    ```bash
    # Deleting labels on private boards of other users
    curl -X DELETE http://localhost:3001/api/labels/9999 \
      -H "Authorization: Bearer <attacker-token>"
    ```
*   **Fix:**
    Prior to any action, resolve the corresponding `boardId` and verify access using the shared validation helper:
    ```javascript
    const hasAccess = await userHasBoardAccess(req.userId, boardId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'You do not have access to this board' });
    }
    ```

---

### Issue 2: Broken Access Control / IDOR (Checklists Controller)
*   **Severity:** Critical
*   **Location:** [checklistController.js](file:///h:/Projects/FlowLoG/server/controllers/checklistController.js) (All endpoints: `createChecklist`, `deleteChecklist`, `addChecklistItem`, `toggleChecklistItem`, `updateChecklistItem`, `deleteChecklistItem`)
*   **Explanation:** 
    Like the label controller, the checklist controller operates directly on checklist and checklist item records without checking card or board membership. Any logged-in user can query or edit nested check lists of any board.
*   **Attack Scenario:**
    An attacker can mark checklist items as checked, update task content, or delete checklist sections on boards they do not have access to:
    ```bash
    # Deleting checklists from other users' tasks
    curl -X DELETE http://localhost:3001/api/checklists/843 \
      -H "Authorization: Bearer <attacker-token>"
    ```
*   **Fix:**
    Resolve the parent board ID via the card/checklist relations and wrap the request handler in a `userHasBoardAccess` check before applying Prisma modifications.

---

### Issue 3: SQL Injection Vulnerability in Reordering Logic
*   **Severity:** Critical
*   **Location:** 
    *   [cardController.js](file:///h:/Projects/FlowLoG/server/controllers/cardController.js) (`reorderCards` - Lines 120–138)
    *   [listController.js](file:///h:/Projects/FlowLoG/server/controllers/listController.js) (`reorderLists` - Lines 70–74)
*   **Explanation:** 
    Both reordering functions dynamically construct raw SQL queries by concatenating user inputs from `req.body` (`items` list containing `id`, `order`, and `listId`) directly into a SQL statement template. The query is executed using `prisma.$executeRawUnsafe`. Because these parameters are not cast to integers or validated as numeric prior to interpolation, this opens the door to SQL injection.
*   **Attack Scenario:**
    An attacker sends a payload in the `id` field of a reorder request containing injection sequences:
    ```json
    {
      "items": [
        {
          "id": "1; DROP TABLE \"CardLabel\" CASCADE; --",
          "order": 1
        }
      ]
    }
    ```
    This results in executing raw database dropping commands directly inside Supabase.
*   **Fix:**
    Coerce the array parameters strictly to numbers or rewrite the query using parameterized placeholders inside `prisma.$executeRaw` rather than `prisma.$executeRawUnsafe`. Alternatively, process the updates via a Prisma transaction loop:
    ```javascript
    await prisma.$transaction(
      items.map(item =>
        prisma.card.update({
          where: { id: Number(item.id) },
          data: { order: Number(item.order), listId: Number(item.listId) }
        })
      )
    );
    ```

---

### Issue 4: DOM Cross-Site Scripting (XSS) in Help Assistant
*   **Severity:** Medium
*   **Location:** [FlowBot.tsx](file:///h:/Projects/FlowLoG/client/components/FlowBot.tsx) (Line 150)
*   **Explanation:**
    The `renderMarkdown` utility processes message strings (including the user's typed inputs) and renders them using `dangerouslySetInnerHTML`. Because there is no sanitization step (e.g. using DOMPurify), standard script injections are evaluated.
*   **Attack Scenario:**
    A user inserts a script tag or image handler into their query text in the Chat:
    ```
    <img src=x onerror="alert(document.cookie)">
    ```
    The chat bubble immediately executes the alert, yielding a DOM-based XSS vulnerability.
*   **Fix:**
    Sanitize the HTML using a library like `dompurify` before passing it to `dangerouslySetInnerHTML` or render messages as plain text using default React escaping, applying rich text features strictly to safe bot-generated keywords.

---

### Issue 5: Missing Rate Limiting guards
*   **Severity:** Medium
*   **Location:** [index.js](file:///h:/Projects/FlowLoG/server/index.js) / Route files
*   **Explanation:**
    The API does not implement rate limits. This makes it vulnerable to brute-force authentication attacks and API quota exhaustion on paid services like Google AI Studio (Gemma 4) and Razorpay.
*   **Attack Scenario:**
    An attacker automates thousands of calls to the `/api/auth/login` endpoint to crack a target's password, or repeatedly triggers the `/api/flowguide/chat` route to exhaust the developer's Google AI Studio token budget.
*   **Fix:**
    Mount the `express-rate-limit` middleware on sensitive authentication and AI chat routes to limit access to a reasonable frequency (e.g., max 100 requests per 15 minutes).

---

### Issue 6: Flat-Text Secret Exposures (Configuration Check)
*   **Severity:** Medium / Low
*   **Location:** `server/.env`
*   **Explanation:**
    Flat-text secrets (such as supabase connection strings, JWT secret tokens, and Razorpay/AI Studio API keys) are kept in the local `.env` configuration.
*   **Attack Scenario:**
    If the project is committed to a public Git repository without `.env` being explicitly added to `.gitignore`, credentials leak immediately.
*   **Fix:**
    Verify that `.env` is listed inside `.gitignore`, and use hosted environment secrets dashboards on deployment providers like Render or Vercel.
