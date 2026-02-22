# FlowLoG — Complete Project Understanding & Revision Guide

---

## 1. Project Overview

**FlowLoG** is a full-stack **Kanban-style project management** application (inspired by Trello). It allows users to create boards, organize tasks into lists, and manage cards with features like drag-and-drop, labels, checklists, member assignment, due dates, and filtering.

| Layer     | Tech                                                    |
| --------- | ------------------------------------------------------- |
| Frontend  | Next.js 14 (App Router), React 19, TypeScript, CSS Modules |
| Backend   | Node.js, Express.js 5, Prisma ORM                      |
| Database  | PostgreSQL (Supabase)                                   |
| DnD       | @hello-pangea/dnd                                       |
| Others    | date-fns, react-icons, dotenv, cors                     |

---

## 2. Folder Structure (Annotated)

```
FlowLoG/
├── DEPLOYMENT.md                  # Deployment guide (Vercel + Render + Supabase)
├── README.md                      # Project overview & setup instructions
│
├── client/                        # ── FRONTEND (Next.js 14) ──
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tsconfig.json              # TypeScript compiler config
│   ├── next-env.d.ts              # Next.js TypeScript declarations
│   ├── vercel.json                # Vercel deployment config
│   │
│   ├── app/                       # Next.js App Router (pages)
│   │   ├── layout.tsx             # Root layout – wraps entire app with ThemeProvider
│   │   ├── page.tsx               # Dashboard page – lists all boards
│   │   ├── login/page.tsx         # Login page with password eye toggle
│   │   ├── signup/page.tsx        # Signup page with password eye toggle
│   │   ├── page.module.css        # Dashboard styles
│   │   ├── globals.css            # Global styles, CSS variables, dark/light theme
│   │   ├── b/[id]/page.tsx        # Dynamic board page – renders BoardCanvas
│   │   ├── home/page.tsx          # Alternate home page
│   │   ├── members/page.tsx       # Members management page
│   │   ├── settings/page.tsx      # Workspace settings page
│   │   └── templates/page.tsx     # Templates gallery page
│   │
│   ├── components/                # Reusable React components
│   │   ├── BoardCanvas.tsx        # ★ Core: Board view with DnD context, list/card management
│   │   ├── ListColumn.tsx         # Single list column (draggable, droppable for cards)
│   │   ├── CardItem.tsx           # Individual card (draggable, shows labels/meta)
│   │   ├── CardDetailModal.tsx    # ★ Card detail modal (description, labels, checklists, members, dates)
│   │   ├── Header.tsx             # Top navigation bar with search, create, notifications
│   │   ├── Sidebar.tsx            # Left sidebar navigation (boards, templates, members, settings)
│   │   ├── FilterPopup.tsx        # Filter cards by label or member
│   │   ├── SwitchBoardsPopup.tsx  # Quick board switcher overlay
│   │   ├── CreateBoardModal.tsx   # Modal to create new board with background selection
│   │   ├── NotificationPopup.tsx  # Notification dropdown (placeholder)
│   │   ├── ProfileDropdown.tsx    # User profile menu with theme switcher
│   │   └── *.module.css           # Scoped CSS for each component
│   │
│   ├── contexts/
│   │   └── ThemeContext.tsx        # React Context for light/dark/system theme management
│   │
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces (User, Board, List, Card, Label, Checklist)
│   │
│   ├── utils/
│   │   └── api.ts                 # API client – all fetch calls to backend (REST wrapper)
│   │
│   └── public/                    # Static assets
│
└── server/                        # ── BACKEND (Express.js) ──
    ├── package.json               # Backend dependencies & scripts
    ├── index.js                   # Express app entry point – middleware, routes, server start
    ├── prismaClient.js            # Shared PrismaClient singleton
    ├── prisma.config.ts           # Prisma config (earlyAccess flag)
    │
    ├── prisma/
    │   ├── schema.prisma          # ★ Database schema – 9 models, relations, constraints
    │   └── seed.js                # Seed script – creates demo users, board, lists, cards, labels
    │
    ├── controllers/               # Business logic
    │   ├── authController.js      # Login, Signup, GetMe operations
    │   ├── boardController.js     # getBoards, getBoardById, createBoard, deleteBoard
    │   ├── listController.js      # createList, reorderLists, updateList, deleteList
    │   ├── cardController.js      # createCard, updateCard, reorderCards, deleteCard
    │   ├── labelController.js     # CRUD labels + addLabelToCard, removeLabelFromCard
    │   ├── checklistController.js # CRUD checklists & items, toggleChecklistItem
    │   └── memberController.js    # getBoardMembers, assignMemberToCard, removeMemberFromCard, getUsers
    │
    ├── middleware/                # Custom Middleware
    │   └── auth.js                # Auth middleware — extracts userId from token
    │
    └── routes/                    # Express route definitions
        ├── boards.js              # GET /, POST /, GET /:id, DELETE /:id
        ├── lists.js               # POST /, PUT /:id, DELETE /:id, PUT /reorder
        ├── cards.js              # POST /, PUT /:id, DELETE /:id, PUT /reorder
        ├── labels.js              # POST /, PUT /:id, DELETE /:id, POST /card, DELETE /card/:cardId/:labelId
        ├── checklists.js          # POST /, DELETE /:id, POST /:id/items, PUT/PATCH/DELETE items
        ├── members.js             # GET /users, GET /board/:boardId, POST /card, DELETE /card/:cid/:uid
        └── invitations.js         # In-memory invitation system (send, resend, cancel, accept)
```

---

## 3. File-by-File Breakdown

### 3.1 Frontend Files

| File | Purpose | Key Functions / Concepts |
|------|---------|--------------------------|
| `layout.tsx` | Root layout, wraps app in `ThemeProvider` | `RootLayout()` — sets HTML lang, meta, loads Inter font |
| `page.tsx` (root) | Dashboard — shows all boards, recently viewed, templates | `Dashboard()` — fetches boards on mount, renders grid of board cards |
| `b/[id]/page.tsx` | Dynamic route for individual board | `BoardPage()` — uses `use(params)` for async param resolution, fetches board data, renders `BoardCanvas` |
| **BoardCanvas.tsx** | **Core component** — renders entire board with DnD | `onDragEnd()` — handles LIST & CARD type reorder; `handleAddList()`, `handleAddCard()`, `filterCards()` using `useCallback`; stores recent boards in `localStorage` |
| **ListColumn.tsx** | Single draggable list column | Uses `Draggable` + `Droppable` from @hello-pangea/dnd; inline title editing; add card form; contextual dropdown for delete/edit |
| **CardItem.tsx** | Individual draggable card | Renders labels as color bars, due dates with overdue detection, checklist progress (`completedChecks/totalChecks`), member avatars |
| **CardDetailModal.tsx** | Full card detail editor (500+ lines) | `toggleLabel()`, `toggleMember()`, `handleCreateLabel()`, `handleUpdateLabel()`, `handleDeleteLabel()`, `handleCreateChecklist()`, `handleSaveDueDate()`; uses `useRef` for click-outside detection |
| `Header.tsx` | Top navigation bar | Board search with real-time filtering (`useEffect` on `searchQuery`); create board modal trigger; notification popup; profile dropdown |
| `Sidebar.tsx` | Left navigation panel | Workspace collapsible section; active route highlighting with `usePathname()`; links to boards, templates, members, settings |
| `FilterPopup.tsx` | Filter cards by label/member | Receives `activeLabel`, `activeMember`; toggles filters on click; "Clear filters" button |
| `SwitchBoardsPopup.tsx` | Quick board switcher | Loads boards from API + recent boards from `localStorage`; search filter; tab filtering (All / Workspace) |
| `CreateBoardModal.tsx` | Create new board | 8 gradient background presets; form validation; calls `apiClient.createBoard()` |
| `ProfileDropdown.tsx` | Profile menu with theme toggle | Integrates `useTheme()` context; light/dark/system theme picker with visual previews |
| `NotificationPopup.tsx` | Notifications placeholder | Static UI — shows "No unread notifications" with toggle |
| `ThemeContext.tsx` | Theme management via React Context | `ThemeProvider` — persists to `localStorage`, listens to `prefers-color-scheme` media query, sets `data-theme` attribute on `<html>` |
| `types/index.ts` | TypeScript interfaces | `User`, `Board`, `List`, `Card`, `Label`, `Checklist`, `ChecklistItem` |
| `utils/api.ts` | Centralized API client | 20+ methods wrapping `fetch()` calls for all CRUD operations; single `API_BASE` constant |

### 3.2 Backend Files

| File | Purpose | Key Functions |
|------|---------|---------------|
| `index.js` | Express entry point | Configures CORS, JSON parsing; mounts 7 route groups; graceful shutdown via `SIGTERM` |
| `prismaClient.js` | Singleton PrismaClient | Prevents multiple PrismaClient instances in development |
| `schema.prisma` | Database schema (9 models) | User, Board, BoardMember, Label, List, Card, CardLabel, CardMember, Checklist, ChecklistItem — with cascading deletes & composite unique constraints |
| `seed.js` | Database seeder | Creates 3 users, 1 board, 6 labels, 4 lists (To Do → Done), 6 cards with labels/members/checklists; cleans before seeding |
| `boardController.js` | Board CRUD | `getBoards()` — deeply includes members (flattens join table); `getBoardById()` — 4-level nested include with order-by; `createBoard()` with default owner |
| `listController.js` | List CRUD | `createList()` — auto-calculates `order` from max; `reorderLists()` — batch update with `$transaction`  |
| `cardController.js` | Card CRUD | `createCard()` — auto-order; `reorderCards()` — `$transaction` batch with `listId` update for cross-list moves |
| `labelController.js` | Label CRUD & assignment | `addLabelToCard()` — handles Prisma P2002 (duplicate) error; `removeLabelFromCard()` — uses composite key `cardId_labelId` |
| `checklistController.js` | Checklist & item management | `toggleChecklistItem()` — reads then flips `isChecked`; CRUD for checklist items |
| `memberController.js` | Member assignment | `assignMemberToCard()` — P2002 duplicate handling; `removeMemberFromCard()` — composite key `cardId_userId`; `getUsers()` for member picker |
| `invitations.js` | Workspace invitations | **In-memory store** (not DB); token generation; send/resend/cancel/accept flow; placeholder for email integration |

---

## 4. ER Diagram (Entity-Relationship)

```
┌──────────┐       ┌─────────────┐       ┌──────────┐
│   User   │       │ BoardMember │       │  Board   │
├──────────┤       ├─────────────┤       ├──────────┤
│ id (PK)  │──┐    │ id (PK)     │    ┌──│ id (PK)  │
│ email    │  │    │ boardId(FK) │────┘  │ title    │
│ authId(U)│  │    │ userId (FK) │       │ background│
│ name     │  └───>│ userId (FK) │       │ ownerId  │──> User
│ avatarUrl│       └─────────────┘       │ createdAt│
│ createdAt│       @@unique(boardId,     │ updatedAt│
│ updatedAt│        userId)              │ updatedAt│
└──────────┘                             └────┬─────┘
     │                                        │
     │ CardMember                              │ has many
     │                                        ▼
     │  ┌─────────────┐              ┌──────────┐
     │  │ CardMember  │              │   List   │
     │  ├─────────────┤              ├──────────┤
     └─>│ userId (FK) │              │ id (PK)  │
        │ cardId (FK) │──┐           │ title    │
        └─────────────┘  │           │ order    │
        @@unique(cardId, │           │ boardId  │──> Board
         userId)         │           │ createdAt│
                         │           └────┬─────┘
                         │                │ has many
                         │                ▼
                         │       ┌────────────┐
                         └──────>│    Card    │
                                 ├────────────┤
                                 │ id (PK)    │
                                 │ title      │
                                 │ description│
                                 │ order      │
                                 │ dueDate    │
                                 │ listId(FK) │──> List
                                 │ createdAt  │
                                 │ updatedAt  │
                                 └──┬──┬──┬───┘
                                    │  │  │
            ┌───────────────────────┘  │  └────────────────────┐
            ▼                          ▼                        ▼
   ┌─────────────┐            ┌──────────────┐        ┌─────────────┐
   │  CardLabel  │            │  Checklist   │        │    Label    │
   ├─────────────┤            ├──────────────┤        ├─────────────┤
   │ cardId (FK) │            │ id (PK)      │        │ id (PK)     │
   │ labelId(FK) │──> Label   │ title        │        │ name        │
   └─────────────┘            │ cardId (FK)  │        │ color       │
   @@unique(cardId,           └──────┬───────┘        │ boardId(FK) │
    labelId)                         │                 └─────────────┘
                                     ▼
                            ┌────────────────┐
                            │ ChecklistItem  │
                            ├────────────────┤
                            │ id (PK)        │
                            │ content        │
                            │ isChecked      │
                            │ checklistId(FK)│
                            └────────────────┘
```

### Key Relationships:
- **User ↔ Board**: One-to-Many (owner), Many-to-Many (via `BoardMember`)
- **User ↔ Card**: Many-to-Many (via `CardMember`)
- **Board → List → Card**: One-to-Many chain
- **Card ↔ Label**: Many-to-Many (via `CardLabel`)
- **Card → Checklist → ChecklistItem**: One-to-Many chain
- **Label → Board**: Many-to-One (labels are board-scoped)

---

## 5. API Endpoints (Complete)

### Boards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/boards` | Get all boards with members |
| POST | `/api/boards` | Create a new board |
| GET | `/api/boards/:id` | Get board with all nested data (lists→cards→labels→members→checklists) |
| DELETE | `/api/boards/:id` | Delete a board |

### Lists
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/lists` | Create a list (auto-ordered) |
| PUT | `/api/lists/:id` | Update list title |
| DELETE | `/api/lists/:id` | Delete a list |
| PUT | `/api/lists/reorder` | Batch reorder lists via `$transaction` |

### Cards
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cards` | Create a card (auto-ordered) |
| PUT | `/api/cards/:id` | Update card (title, description, dueDate, listId) |
| DELETE | `/api/cards/:id` | Delete a card |
| PUT | `/api/cards/reorder` | Batch reorder + cross-list move via `$transaction` |

### Labels
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/labels` | Create a label for a board |
| PUT | `/api/labels/:id` | Update label name/color |
| DELETE | `/api/labels/:id` | Delete a label |
| POST | `/api/labels/card` | Assign label to card |
| DELETE | `/api/labels/card/:cardId/:labelId` | Remove label from card |

### Checklists
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checklists` | Create a checklist on a card |
| DELETE | `/api/checklists/:id` | Delete a checklist |
| POST | `/api/checklists/:id/items` | Add item to checklist |
| PUT | `/api/checklists/items/:id` | Update an item |
| PATCH | `/api/checklists/items/:id/toggle` | Toggle item checked state |
| DELETE | `/api/checklists/items/:id` | Delete an item |

### Members
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members/users` | Get all users |
| GET | `/api/members/board/:boardId` | Get board members |
| POST | `/api/members/card` | Assign member to card |
| DELETE | `/api/members/card/:cardId/:userId` | Remove member from card |

### Invitations (In-Memory)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/invitations` | Send invitation |
| GET | `/api/invitations` | Get invitations for workspace |
| POST | `/api/invitations/:id/resend` | Resend invitation |
| DELETE | `/api/invitations/:id` | Cancel invitation |
| POST | `/api/invitations/accept/:token` | Accept invitation |

---

## 6. Core Concepts & Patterns Used

### 6.1 Frontend Concepts

| Concept | Where Used | Explanation |
|---------|------------|-------------|
| **Next.js App Router** | `app/` directory | File-system based routing with `page.tsx` convention; `layout.tsx` for shared layouts |
| **Dynamic Routes** | `app/b/[id]/page.tsx` | `[id]` folder creates parameterized URL; params accessed via `use(params)` |
| **Client Components** | All components (`'use client'`) | Needed for hooks (`useState`, `useEffect`), event handlers, browser APIs |
| **React Context API** | `ThemeContext.tsx` | Global theme state without prop drilling; `createContext` + `useContext` pattern |
| **Optimistic UI Updates** | `BoardCanvas.tsx` | State updated immediately on drag-end, then API call fires (`.catch(console.error)`) |
| **Drag & Drop** | `@hello-pangea/dnd` | `DragDropContext` → `Droppable` → `Draggable` hierarchy; two types: `LIST` and `CARD` |
| **useCallback Memoization** | `filterCards()` in BoardCanvas | Prevents re-creation of filter function on every render |
| **Click-Outside Detection** | `CardDetailModal.tsx` | `useRef` + `mousedown` event listener pattern |
| **LocalStorage Persistence** | Recent boards, theme preference | Client-side persistence without backend |
| **CSS Modules** | All `.module.css` files | Scoped CSS — class names are locally scoped to avoid conflicts |
| **CSS Variables (Custom Properties)** | `globals.css` | `[data-theme='dark']` and `[data-theme='light']` selectors for theming |
| **Controlled Components** | All forms (inputs, textareas) | React state drives input values (`value` + `onChange`) |
| **Conditional Rendering** | Modals, popups, filters | `{showModal && <Modal />}` pattern throughout |

### 6.2 Backend Concepts

| Concept | Where Used | Explanation |
|---------|------------|-------------|
| **MVC Pattern** | routes/ + controllers/ | Routes define endpoints, controllers handle business logic |
| **Prisma ORM** | All controllers | Type-safe database queries; auto-generated client from schema |
| **Database Transactions** | `reorderCards()`, `reorderLists()` | `prisma.$transaction([...])` ensures atomicity for batch updates |
| **Cascading Deletes** | `schema.prisma` | `onDelete: Cascade` on all foreign keys — deleting a board removes all its lists, cards, etc. |
| **Composite Unique Constraints** | `@@unique([boardId, userId])` | Prevents duplicate board members, card labels, card members |
| **Prisma Error Handling** | `labelController.js`, `memberController.js` | Catching `P2002` (unique constraint violation) for graceful duplicate handling |
| **Data Transformation** | `boardController.js` | Flattening join tables (`board.members.map(m => m.user)`) before sending response |
| **Auto-Increment Ordering** | `createList()`, `createCard()` | Queries max `order` value, adds 1 for new items |
| **Singleton Pattern** | `prismaClient.js` | Single PrismaClient instance shared across all controllers |
| **Graceful Shutdown** | `index.js` | `SIGTERM` handler disconnects Prisma before exit |
| **RESTful Design** | All routes | Standard HTTP methods: GET (read), POST (create), PUT (update), PATCH (partial), DELETE (remove) |
| **Connection Pooling** | `schema.prisma` | `url` (pooled via Supabase pgBouncer) + `directUrl` (for migrations) |

### 6.3 Database Concepts

| Concept | Explanation |
|---------|-------------|
| **Junction/Join Tables** | `CardLabel`, `CardMember`, `BoardMember` — resolve M:N relationships |
| **Referential Integrity** | Foreign keys with `onDelete: Cascade` ensure no orphan records |
| **Composite Keys** | `@@unique([cardId, labelId])` — compound uniqueness across two columns |
| **Ordered Collections** | `order` field on List and Card — explicit ordering for DnD |
| **Nullable Fields** | `description?`, `dueDate?`, `name?` — optional data with `?` |
| **Index Strategy** | Primary keys auto-indexed; unique constraints create implicit indexes |

---

## 7. How Drag & Drop Works (Key Algorithm)

```
1. User drags a card/list
2. onDragEnd(result) fires with { source, destination, type }
3. If same position → early return (no-op)

FOR LISTS (type === 'LIST'):
   a. Splice source list from array
   b. Insert at destination index
   c. Update state immediately (optimistic)
   d. Map new order values → API call: reorderLists()

FOR CARDS (type === 'CARD'):
   SAME LIST:
      a. Remove card from source index
      b. Insert at destination index
      c. Update state → API: reorderCards()
   
   CROSS-LIST:
      a. Remove card from source list
      b. Update card's listId to destination list
      c. Insert card at destination index in new list
      d. Update state → API: reorderCards() (includes listId change)

API uses Prisma $transaction to batch all order updates atomically.
```

---

## 8. How Theme System Works

```
ThemeProvider (Context)
    │
    ├── State: theme ('light' | 'dark' | 'system')
    ├── Derived: resolvedTheme ('light' | 'dark')
    │
    ├── On mount: reads localStorage('theme')
    ├── On change: sets document.documentElement.setAttribute('data-theme', resolved)
    ├── If 'system': listens to window.matchMedia('prefers-color-scheme: dark')
    │
    └── globals.css uses:
         [data-theme='dark']  { --bg: #1d2125; --text: #b6c2cf; ... }
         [data-theme='light'] { --bg: #ffffff; --text: #172b4d; ... }
```

---

## 9. Data Flow (Board Page)

```
URL: /b/3
    │
    ▼
b/[id]/page.tsx
    │ use(params) → id = "3"
    │ apiClient.getBoard(3)
    │
    ▼
GET /api/boards/3
    │ boardController.getBoardById()
    │ prisma.board.findUnique({ include: { lists: { cards: { labels, members, checklists } } } })
    │
    ▼
Response: { id, title, lists: [{ cards: [{ labels, members, checklists }] }], members, labels }
    │
    ▼
<BoardCanvas board={data} />
    │ useState(initialBoard) — local state copy
    │ DragDropContext wraps entire board
    │
    ├── ListColumn (Draggable + Droppable)
    │       ├── CardItem (Draggable)
    │       └── Add Card form
    │
    ├── CardDetailModal (on card click)
    │       ├── Labels, Members, Checklists, Due Date
    │       └── Each action → apiClient call → onUpdate callback → state update
    │
    └── FilterPopup → filterCards() via useCallback
```

---

## 10. Interview Questions (15 Deep-Dive Questions)

### Architecture & Design

**Q1: Why did you choose Next.js App Router over Pages Router? What trade-offs did you consider?**
> App Router uses React Server Components by default, file-based layouts, and streaming. However, since all components use `'use client'` (due to hooks/DnD), the Server Component advantage is minimal. Pages Router would have been simpler for this use case. App Router was chosen for learning the latest Next.js paradigm and its colocated layout system.

**Q2: Your entire frontend uses client-side rendering. How would you leverage Server Components in this project?**
> The board page data fetch (`apiClient.getBoard`) could be done in a Server Component to reduce client bundle size and improve initial load. The dashboard page (`page.tsx`) could fetch boards server-side. Only interactive parts (DnD, modals, forms) would remain as Client Components.

**Q3: Explain the optimistic UI pattern in your drag-and-drop. What happens if the API call fails?**
> State is updated immediately (splice + re-insert) before the API call. If the API fails, `.catch(console.error)` logs the error but **doesn't rollback the state** — this is a known gap. A production fix would save the previous state, attempt the API call, and rollback on error.

### Database & Backend

**Q4: Why did you use junction tables (CardLabel, CardMember) instead of arrays?**
> Relational databases enforce referential integrity better with junction tables. Arrays would lose foreign key constraints, make queries inefficient (no indexing within arrays), and break normalization. Junction tables allow independent queries (e.g., "find all cards with label X") and Prisma generates typed relations for them.

**Q5: Explain the `$transaction` usage in `reorderCards`. Why is it necessary?**
> When reordering cards, multiple rows need their `order` (and possibly `listId`) updated simultaneously. Without a transaction, a server crash mid-update would leave cards with inconsistent order values. `$transaction` guarantees all-or-nothing — either all cards update or none do.

**Q6: Your `getBoardById` has 4 levels of nested includes. What's the performance concern?**
> Deep nested includes generate complex JOINs or multiple queries. For a board with many lists/cards, this could become slow. Solutions: (1) Use `select` instead of `include` to fetch only needed fields, (2) Paginate cards per list, (3) Lazy-load card details on click instead of upfront.

**Q7: The invitation system uses in-memory storage. What problems does this cause?**
> In-memory arrays are lost on server restart, don't scale across multiple server instances (no shared state), and have no persistence. In production: store invitations in the database with a `Invitation` model, use proper email service (SendGrid/Resend), and implement token expiry with timestamps.

### Frontend Deep-Dive

**Q8: How does your DnD handle both list reordering and card reordering within the same `DragDropContext`?**
> The `type` property in `DropResult` differentiates them: `type === 'LIST'` for horizontal list reordering, `type === 'CARD'` for vertical card reordering. Lists use `Droppable` with `direction="horizontal"` and `type="LIST"`. Each list's card area uses `Droppable` with `type="CARD"` and `droppableId` set to the list's ID.

**Q9: What's the `requestAnimationFrame` trick in BoardCanvas?**
> `useEffect(() => { requestAnimationFrame(() => setEnabled(true)) })` prevents DnD from rendering before the browser has finished painting. This avoids a React 18 strict mode hydration mismatch where the DnD library tries to measure DOM elements that don't exist yet. Without it, drag-and-drop breaks on initial render.

**Q10: How does your theme system handle the "system" preference? What edge cases exist?**
> It reads `window.matchMedia('prefers-color-scheme: dark')` and adds an `addEventListener('change')` for live changes (e.g., OS switches from light to dark at sunset). Edge case: SSR — `window` doesn't exist on the server, so `suppressHydrationWarning` is set and theme defaults to 'dark' until client hydration.

**Q11: Why are you using `useCallback` for `filterCards` but not for other handler functions?**
> `filterCards` is passed as a derived computation that runs on every render to filter lists. `useCallback` memoizes it so it only recalculates when `searchQuery`, `filterLabel`, or `filterMember` change. Other handlers like `handleAddCard` don't benefit from `useCallback` because they're not passed as deps to child memoization.

### Auth & Security (New)

**Q16: How does your authentication bridge work between the Express backend and Supabase?**
> We added an `authId` (UUID) column to the `User` table. Even though the Express backend uses custom tokens for speed, the `authId` allows us to write Supabase RLS policies that use `auth.uid()`, ensuring data is secured at the database level for any future Supabase-direct expansions.

**Q17: Explain your Supabase RLS policy strategy.**
> We implemented 37 Row-Level Security policies. Most follow a chain: a `Card` is accessible if its `List` is accessible, which is accessible if its `Board` is accessible, which is accessible if the `auth.uid()` matches the Board's `ownerId` (via the User bridge). This ensures robust "defense-in-depth".

**Q18: Why use a first-letter avatar instead of showing the full name or predefined initials?**
> A single-letter avatar provides a cleaner, more minimalistic UI that aligns with modern Kanban boards (like Jira or Trello). It's simpler to render consistently across different device sizes.

**Q13: How would you add real-time collaboration (multiple users editing the same board)?**
> Implement WebSocket (Socket.io) on Express. When a user modifies a card/list, broadcast the change to all connected clients on that board's "room". Use optimistic updates locally and reconcile with incoming WebSocket events. Consider CRDT or OT algorithms for conflict resolution on simultaneous edits.

**Q14: What would you change to make this production-ready?**
> (1) Add authentication & authorization. (2) Input validation (Zod/Joi on backend, form validation on frontend). (3) Error boundaries in React. (4) Rate limiting on API. (5) Proper error rollback for optimistic updates. (6) API pagination for boards/cards. (7) Image upload for covers (S3/Cloudinary). (8) Logging (Winston/Pino). (9) Tests (Jest + React Testing Library). (10) CI/CD pipeline.

**Q15: Your API client (`api.ts`) doesn't handle errors consistently. How would you improve it?**
> Create a wrapper function: `async function apiFetch(url, options) { const res = await fetch(...); if (!res.ok) throw new ApiError(res.status, await res.json()); return res.json(); }`. Add global error handling with toast notifications. Implement retry logic for transient failures. Add request/response interceptors for auth tokens.

---

## 11. Alternate Technologies & Better Approaches

### Frontend Alternatives

| Current | Alternative | Why Better |
|---------|------------|------------|
| `@hello-pangea/dnd` | **dnd-kit** | More actively maintained, smaller bundle (12KB vs 30KB), supports virtual lists, touch-first design, better accessibility |
| CSS Modules | **Tailwind CSS** | Faster development with utility classes, consistent design system, smaller final CSS bundle with purging, better for rapid prototyping |
| `fetch()` wrapper (`api.ts`) | **React Query (TanStack Query)** + **Axios** | Auto caching, automatic refetching, loading/error states, retry logic, optimistic mutations, devtools; Axios adds interceptors & better error objects |
| React Context (Theme) | **Zustand** or **Jotai** | Lighter than Context for global state, no unnecessary re-renders, simpler API for multiple stores |
| Client-side data fetching | **Server Components + Server Actions** | Fetch on server, reduce client JS bundle, better SEO, no loading spinners for initial data |
| `localStorage` (recent boards) | **React Query + Cache** | Automatic invalidation, sync between tabs, TTL-based expiry |

### Backend Alternatives

| Current | Alternative | Why Better |
|---------|------------|------------|
| Express.js | **Fastify** or **Hono** | Fastify: 2x faster than Express, built-in schema validation, TypeScript support. Hono: ultra-lightweight, works on edge runtimes |
| Raw controllers (no validation) | **Zod** + Express middleware | Schema validation on every request, type inference, clear error messages, prevents bad data reaching DB |
| Prisma ORM | **Drizzle ORM** | Lighter weight, SQL-like syntax, better performance for complex queries, smaller bundle for serverless |
| No auth | **Supabase Auth** or **Clerk** | Supabase Auth is free with your DB, supports OAuth/email/phone. Clerk has pre-built React components |
| In-memory invitations | **Database model + Resend API** | Persistent, scalable, real email delivery |
| No WebSockets | **Socket.io** or **Supabase Realtime** | Live collaboration; Supabase Realtime is zero-config with your existing Supabase DB |

### Architecture Alternatives

| Current | Alternative | Why Better |
|---------|------------|------------|
| Separate Express backend | **Next.js API Routes / Route Handlers** | Eliminate separate server; single deployment; shared TypeScript types between frontend/backend |
| REST API | **tRPC** | End-to-end type safety (no API client needed), auto-complete on client, zero runtime overhead |
| Separate frontend + backend deploy | **Full-stack on Vercel** (Next.js API routes + Prisma) | Single deployment pipeline, edge functions, automatic scaling, no CORS issues |
| No caching | **Redis** (for sessions, cached queries) | Sub-millisecond reads for frequently accessed boards, session storage, rate limiting |

### Optimal Full Rewrite Stack

```
Next.js 14 (App Router)     ← Unified full-stack framework
├── tRPC                    ← End-to-end type-safe API
├── Drizzle ORM             ← Lightweight, SQL-like ORM
├── Supabase (PostgreSQL)   ← Database + Auth + Realtime
├── Tailwind CSS            ← Utility-first styling
├── dnd-kit                 ← Modern drag-and-drop
├── TanStack Query          ← Data fetching + caching
├── Zustand                 ← Lightweight state management
├── Zod                     ← Runtime validation
└── Clerk / Supabase Auth   ← Authentication
```

---

## 12. Quick Revision Cheat Sheet

```
PROJECT:     Kanban board (Trello clone)
FRONTEND:    Next.js 14 + TypeScript + CSS Modules + @hello-pangea/dnd
BACKEND:     Express.js + Prisma ORM
DATABASE:    PostgreSQL (Supabase) — 9 models, 3 junction tables
KEY FEATURE: Drag & drop (list + card reorder), labels, checklists, members, theme

DnD FLOW:    onDragEnd → splice/insert → setState (optimistic) → API call (async)
THEME FLOW:  Context → localStorage → data-theme attr → CSS variables
DATA FLOW:   /b/[id] → API → getBoardById (nested include) → BoardCanvas → ListColumn → CardItem

DB PATTERNS: Cascade delete, composite unique, junction tables, ordered collections
API PATTERN: MVC, $transaction for batch, P2002 error handling, nested includes with flatten

MISSING:     Auth, validation, error rollback, real-time, testing, logging
BETTER:      dnd-kit, TanStack Query, tRPC, Tailwind, Supabase Auth, Next.js API routes
```

---

*Last updated: February 2026*
