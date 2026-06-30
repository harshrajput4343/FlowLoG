# Frontend Review & Code Audit Report: FlowLoG

## 1. React & Next.js Implementation Quality

### Unnecessary Re-renders (Performance Bottleneck)
*   **Location:** [BoardCanvas.tsx](file:///h:/Projects/FlowLoG/client/components/BoardCanvas.tsx), [ListColumn.tsx](file:///h:/Projects/FlowLoG/client/components/ListColumn.tsx), [CardItem.tsx](file:///h:/Projects/FlowLoG/client/components/CardItem.tsx)
*   **Issue:** Missing memoization on nested board elements. Whenever a card is dragged, the search query is updated, or a filter chip is toggled, the root state of `BoardCanvas` updates. Because none of the child components (like `ListColumn` or `CardItem`) are memoized using `React.memo`, the entire virtual DOM tree of the board (all lists and all cards) re-renders from scratch. On active boards with 100+ cards, this causes noticeable input lag and drag stutter.
*   **Fix:** Wrap child rendering components in `React.memo` and verify that callback functions passed down (like `onCardClick`) are wrapped in `useCallback` inside `BoardCanvas.tsx`.

---

### Unused Code & Dead Components (Artifacts)
*   **Location:** [BoardCanvas.tsx](file:///h:/Projects/FlowLoG/client/components/BoardCanvas.tsx) (Lines 243–277)
*   **Issue:** **Dead component `LiveDate`**. The file defines a React component `LiveDate` that starts a `setInterval` hook on mount to display a floating current date string. However, this component is declared but never exported, rendered, or referenced anywhere in the JSX.
*   **Fix:** Remove the `LiveDate` component definition entirely to clean up the codebase.

---

## 2. UI/UX Problems & Accessibility (WCAG)

### Inadequate Error States (Graceful Degradation Failure)
*   **Location:** `client/app/b/[id]/page.tsx` (Lines 20–24)
*   **Issue:** Poor API error mapping. If the API request to fetch a board fails due to a network timeout or a backend crash (500), the page catch-handler calls Next.js `notFound()`. This redirects users to a generic 404 "Page Not Found" screen, which is confusing and misleading (as the board does exist, but the server is down).
*   **Fix:** Maintain a structured error state in the page component (e.g. `error: string | null`) and render a retry-prompt or server status message on API failures.

---

### Missing Accessibility Safeguards (WCAG Guidelines)
*   **Location:** [BoardCanvas.tsx](file:///h:/Projects/FlowLoG/client/components/BoardCanvas.tsx), [ListColumn.tsx](file:///h:/Projects/FlowLoG/client/components/ListColumn.tsx)
*   **Issue:**
    1.  **Keyboard Navigation:** Kanban boards cannot be navigated using the keyboard. Users cannot use the Tab key to focus cards or use Arrow keys to reorder cards or traverse lists.
    2.  **Color Contrast:** Custom Unsplash image backgrounds are rendered directly behind board title text without adding a dark semi-transparent backing overlay. If a user selects a light Unsplash image, white text elements on the board header become unreadable, violating WCAG color contrast standards.
*   **Fix:**
    1.  Add standard ARIA labels, focus states (`tabIndex={0}`), and keyboard event handlers (`onKeyDown`) for keyboard accessibility.
    2.  Add a CSS styling overlay to the background wrapper (`background: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)`) to ensure text readability on all custom board backgrounds.

---

## 3. Frontend Security Audits

### Unsplash API Client Key Exposure
*   **Location:** [BoardCanvas.tsx](file:///h:/Projects/FlowLoG/client/components/BoardCanvas.tsx) (Line 56)
*   **Issue:** **Client-side API key leak**. The Unsplash search query reads `process.env.NEXT_PUBLIC_UNSPLASH_KEY`. Because this key is prefixed with `NEXT_PUBLIC_`, Next.js embeds the credential into the client-side JavaScript bundle. Anyone inspecting web traffic or viewing JS assets can copy the Unsplash API key.
*   **Fix:** Move the Unsplash image search API call to a backend controller `/api/unsplash/search` to keep the Unsplash credential private on the server.

---

### Unsafe Client-Side LocalStorage State Dependencies
*   **Location:** [ProfileDropdown.tsx](file:///h:/Projects/FlowLoG/client/components/ProfileDropdown.tsx) (Line 20), [Sidebar.tsx](file:///h:/Projects/FlowLoG/client/components/Sidebar.tsx) (Line 21)
*   **Issue:** Trusting untrusted client-side inputs. The frontend trusts parameters like `isPremium` and the `user` object directly from `localStorage`. If a user manually changes `isPremium` to `true` or modifies user metadata in their browser console, the client-side UI will spoof premium views and options on screen.
*   **Fix:** Treat `localStorage` states strictly as UI hints, and retrieve authority records (like user tiers and profiles) directly from the authenticated `/api/auth/me` endpoint.
