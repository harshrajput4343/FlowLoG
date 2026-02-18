<p align="center">
  <img src="client/public/flowlog-logo.png" alt="FlowLoG Logo" width="120" />
</p>

<h1 align="center">FlowLoG</h1>

<p align="center">
  <strong>A modern, full-stack Kanban-style project management application</strong><br/>
  <em>Organize. Prioritize. Deliver.</em>
</p>

<p align="center">
  <a href="https://flowlogwork.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-FlowLoG-blue?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express.js-5-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Supabase-Cloud-3ECF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Render-Backend-46E3B7?style=flat-square&logo=render&logoColor=white" alt="Render" />
</p>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🖥️ Live Demo](#️-live-demo)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [📊 ER Diagram (Database Schema)](#-er-diagram-database-schema)
- [📁 Folder Structure](#-folder-structure)
- [🔌 API Endpoints](#-api-endpoints)
- [🚀 Getting Started](#-getting-started)
- [☁️ Deployment](#️-deployment)
- [📸 Screenshots](#-screenshots)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 🌟 Overview

**FlowLoG** is a feature-rich, Trello-inspired Kanban board application designed for seamless project and task management. Built with a modern full-stack architecture, it provides an intuitive drag-and-drop interface to organize tasks across customizable boards, lists, and cards — all with real-time interactivity, dark/light themes, and cloud deployment.

Whether you're managing a personal project or coordinating a team, FlowLoG gives you the tools to visualize your workflow and stay productive.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📋 **Board Management** | Create, view, and delete multiple project boards with custom gradient backgrounds |
| 📝 **Lists & Cards** | Create lists (columns) and cards (tasks) within boards |
| 🖱️ **Drag & Drop** | Reorder lists and cards, move cards across lists using smooth drag-and-drop |
| 🏷️ **Labels** | Assign color-coded labels (Urgent, Required, Not Urgent, etc.) to cards |
| ✅ **Checklists** | Add checklists with progress tracking inside cards |
| 👥 **Members** | Assign members to cards and manage board membership |
| 📅 **Due Dates** | Set and track due dates on cards |
| 🎨 **Color Picker** | Customize list header colors |
| 🌗 **Dark / Light Theme** | Toggle between dark and light mode |
| 🔍 **Search & Filter** | Search cards and filter by labels, members, or due dates |
| 📱 **Responsive Design** | Fully mobile-friendly and responsive UI |
| 🚫 **No Login Required** | Demo user auto-logged in for instant access |
| 📤 **Board Templates** | Pre-configured board templates for quick setup |
| 🔔 **Notifications** | In-app notification system |

---

## 🖥️ Live Demo

<p align="center">
  <a href="https://flowlogwork.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/▶_Open_FlowLoG-Live_App-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Open Live App" />
  </a>
</p>

> **Frontend**: [https://flowlogwork.vercel.app](https://flowlogwork.vercel.app)  
> **Backend API**: Hosted on [Render](https://render.com)  
> **Database**: Hosted on [Supabase](https://supabase.com) (PostgreSQL)

> ⚠️ **Note:** The backend is on Render's free tier and may take ~30s to wake up on first visit.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework with App Router, SSR & file-based routing |
| [React 19](https://react.dev/) | UI library for building component-based interfaces |
| [TypeScript 5](https://www.typescriptlang.org/) | Static typing for safer, scalable code |
| [CSS Modules](https://github.com/css-modules/css-modules) | Scoped component-level styling |
| [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) | Drag-and-drop library for lists & cards |
| [React Icons](https://react-icons.github.io/react-icons/) | Icon library |
| [date-fns](https://date-fns.org/) | Date utility library |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | JavaScript runtime for the server |
| [Express.js 5](https://expressjs.com/) | Minimal web framework for REST APIs |
| [Prisma ORM 5](https://www.prisma.io/) | Type-safe database ORM with migrations |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Supabase](https://supabase.com/) | Cloud-hosted PostgreSQL database |
| [CORS](https://www.npmjs.com/package/cors) | Cross-origin resource sharing middleware |
| [dotenv](https://www.npmjs.com/package/dotenv) | Environment variable management |
| [Nodemon](https://nodemon.io/) | Auto-restart during development |

### DevOps & Deployment
| Service | Role |
|---|---|
| [Vercel](https://vercel.com/) | Frontend hosting with CI/CD |
| [Render](https://render.com/) | Backend hosting (Node.js) |
| [Supabase](https://supabase.com/) | Managed PostgreSQL database |
| [GitHub](https://github.com/) | Version control & CI/CD trigger |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                  Next.js 16 + React 19 + TypeScript             │
│              Vercel: https://flowlogwork.vercel.app             │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP REST (fetch)
                             │  NEXT_PUBLIC_API_URL
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (API Layer)                          │
│              Express.js 5 + Prisma ORM + Node.js                │
│                    Render (Cloud Hosted)                         │
│                                                                 │
│   Routes:  /api/boards  /api/lists  /api/cards  /api/labels     │
│            /api/checklists  /api/members  /api/invitations      │
└────────────────────────────┬────────────────────────────────────┘
                             │  Prisma Client
                             │  DATABASE_URL (connection pooling)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                       │
│                   Supabase (Cloud Hosted)                        │
│            Region: ap-south-1 (Mumbai, India)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 ER Diagram (Database Schema)

Below is the **Entity-Relationship Diagram** representing all models and their relationships in the FlowLoG database, defined using Prisma ORM:

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│    User      │       │   BoardMember    │       │    Board     │
├─────────────┤       ├──────────────────┤       ├─────────────┤
│ id       PK │◄──┐   │ id           PK  │   ┌──►│ id       PK │
│ email   UNQ │   ├───│ userId       FK  │   │   │ title       │
│ name        │   │   │ boardId      FK  │───┘   │ background  │
│ avatarUrl   │   │   │                  │       │ ownerId  FK │──┐
│ createdAt   │   │   │ UNQ(boardId,     │       │ createdAt   │  │
│ updatedAt   │   │   │     userId)      │       │ updatedAt   │  │
└──────┬──────┘   │   └──────────────────┘       └──────┬──────┘  │
       │          │                                     │         │
       │          │                                     │         │
       │          │   ┌──────────────────┐              │         │
       │          │   │     Label        │              │         │
       │          │   ├──────────────────┤              │         │
       │          │   │ id           PK  │◄─────────┐   │         │
       │          │   │ name             │          │   │         │
       │          │   │ color            │          │   │         │
       │          │   │ boardId      FK  │──────────┼───┘         │
       │          │   └──────────────────┘          │             │
       │          │                                 │             │
       │          │                                 │             │
       │          │   ┌──────────────────┐          │             │
       │          │   │      List        │          │             │
       │          │   ├──────────────────┤          │             │
       │          │   │ id           PK  │◄──┐      │             │
       │          │   │ title            │   │      │             │
       │          │   │ color            │   │      │             │
       │          │   │ order            │   │      │             │
       │          │   │ boardId      FK  │───┼──────┼─────────────┘
       │          │   │ createdAt        │   │      │
       │          │   │ updatedAt        │   │      │
       │          │   └──────────────────┘   │      │
       │          │                          │      │
       │          │   ┌──────────────────┐   │      │
       │          │   │      Card        │   │      │
       │          │   ├──────────────────┤   │      │
       │          │   │ id           PK  │◄──┼──┐   │
       │          │   │ title            │   │  │   │
       │          │   │ description      │   │  │   │
       │          │   │ order            │   │  │   │
       │          │   │ dueDate          │   │  │   │
       │          │   │ listId       FK  │───┘  │   │
       │          │   │ createdAt        │      │   │
       │          │   │ updatedAt        │      │   │
       │          │   └──────────────────┘      │   │
       │          │                             │   │
       │          │                             │   │
       │          │   ┌──────────────────┐      │   │
       │          │   │   CardLabel      │      │   │
       │          │   ├──────────────────┤      │   │
       │          │   │ id           PK  │      │   │
       │          │   │ cardId       FK  │──────┘   │
       │          │   │ labelId      FK  │──────────┘
       │          │   │                  │
       │          │   │ UNQ(cardId,      │
       │          │   │     labelId)     │
       │          │   └──────────────────┘
       │          │
       │          │   ┌──────────────────┐
       │          │   │   CardMember     │
       │          │   ├──────────────────┤
       │          │   │ id           PK  │
       │          └───│ userId       FK  │
       │              │ cardId       FK  │──────────────┐
       │              │                  │              │
       │              │ UNQ(cardId,      │              │
       │              │     userId)      │              │
       │              └──────────────────┘              │
       │                                               │
       │              ┌──────────────────┐              │
       │              │   Checklist      │              │
       │              ├──────────────────┤              │
       │              │ id           PK  │◄──┐          │
       │              │ title            │   │          │
       │              │ cardId       FK  │───┼──────────┘
       │              └──────────────────┘   │
       │                                     │
       │              ┌──────────────────┐   │
       │              │ ChecklistItem    │   │
       │              ├──────────────────┤   │
       │              │ id           PK  │   │
       │              │ content          │   │
       │              │ isChecked        │   │
       │              │ checklistId  FK  │───┘
       │              └──────────────────┘
       │
       │ (User.ownedBoards → Board.ownerId)
       └──────────────────────────────────────────────────────────┘
```

### Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| `User` → `Board` | One-to-Many | A user owns multiple boards |
| `User` ↔ `Board` (via `BoardMember`) | Many-to-Many | Users can be members of multiple boards |
| `Board` → `List` | One-to-Many | A board contains multiple lists |
| `Board` → `Label` | One-to-Many | A board has multiple labels |
| `List` → `Card` | One-to-Many | A list contains multiple cards |
| `Card` ↔ `Label` (via `CardLabel`) | Many-to-Many | Cards can have multiple labels |
| `Card` ↔ `User` (via `CardMember`) | Many-to-Many | Cards can be assigned to multiple users |
| `Card` → `Checklist` | One-to-Many | A card can have multiple checklists |
| `Checklist` → `ChecklistItem` | One-to-Many | A checklist contains multiple items |

> **Cascade Deletes:** All child records are automatically deleted when a parent is removed (e.g., deleting a Board removes all its Lists, Cards, Labels, etc.)

---

## 📁 Folder Structure

```
FlowLoG/
├── 📄 README.md                        # Project documentation (you are here)
├── 📄 deploy.md                        # Deployment guide
├── 📄 .gitignore                       # Git ignore rules
│
├── 📂 client/                          # ⚛️ FRONTEND — Next.js Application
│   ├── 📂 app/                         # Next.js App Router pages
│   │   ├── 📄 layout.tsx               # Root layout (ThemeProvider, fonts)
│   │   ├── 📄 page.tsx                 # Home page (dashboard)
│   │   ├── 📄 page.module.css          # Home page styles
│   │   ├── 📄 globals.css              # Global CSS variables (dark/light theme)
│   │   ├── 📂 b/[id]/                  # Dynamic board page (/b/:id)
│   │   ├── 📂 home/                    # Home route
│   │   ├── 📂 members/                 # Members management page
│   │   ├── 📂 settings/                # Settings page
│   │   └── 📂 templates/               # Board templates page
│   │
│   ├── 📂 components/                  # Reusable UI components
│   │   ├── 📄 Header.tsx               # Top navigation bar
│   │   ├── 📄 Sidebar.tsx              # Side navigation panel
│   │   ├── 📄 BoardCanvas.tsx          # Main Kanban board (drag-and-drop)
│   │   ├── 📄 ListColumn.tsx           # Individual list column
│   │   ├── 📄 CardItem.tsx             # Individual card item
│   │   ├── 📄 CardDetailModal.tsx      # Card detail view (labels, checklists, etc.)
│   │   ├── 📄 CreateBoardModal.tsx     # New board creation modal
│   │   ├── 📄 FilterPopup.tsx          # Search & filter popover
│   │   ├── 📄 ProfileDropdown.tsx      # User profile dropdown
│   │   ├── 📄 NotificationPopup.tsx    # Notifications popover
│   │   ├── 📄 SwitchBoardsPopup.tsx    # Board switcher
│   │   └── 📄 *.module.css             # Component-specific CSS modules
│   │
│   ├── 📂 contexts/                    # React context providers
│   │   └── 📄 ThemeContext.tsx          # Dark/Light theme context
│   │
│   ├── 📂 types/                       # TypeScript type definitions
│   │   └── 📄 index.ts                 # Board, List, Card, User, Label, Checklist types
│   │
│   ├── 📂 utils/                       # Utility functions
│   │   └── 📄 api.ts                   # API client (all HTTP requests)
│   │
│   ├── 📂 public/                      # Static assets
│   │   └── 📄 flowlog-logo.png         # Application logo
│   │
│   ├── 📄 package.json                 # Frontend dependencies & scripts
│   ├── 📄 tsconfig.json                # TypeScript configuration
│   └── 📄 vercel.json                  # Vercel deployment config
│
├── 📂 server/                          # 🖥️ BACKEND — Express.js API
│   ├── 📄 index.js                     # Express app entry point (middleware, routes)
│   ├── 📄 prismaClient.js             # Prisma client singleton
│   │
│   ├── 📂 controllers/                 # Route handlers (business logic)
│   │   ├── 📄 boardController.js       # Board CRUD operations
│   │   ├── 📄 listController.js        # List CRUD + reorder
│   │   ├── 📄 cardController.js        # Card CRUD + reorder
│   │   ├── 📄 labelController.js       # Label CRUD + card assignment
│   │   ├── 📄 checklistController.js   # Checklist & item management
│   │   └── 📄 memberController.js      # User & member management
│   │
│   ├── 📂 routes/                      # Express route definitions
│   │   ├── 📄 boards.js                # /api/boards
│   │   ├── 📄 lists.js                 # /api/lists
│   │   ├── 📄 cards.js                 # /api/cards
│   │   ├── 📄 labels.js                # /api/labels
│   │   ├── 📄 checklists.js            # /api/checklists
│   │   ├── 📄 members.js               # /api/members
│   │   └── 📄 invitations.js           # /api/invitations
│   │
│   ├── 📂 prisma/                      # Prisma ORM configuration
│   │   ├── 📄 schema.prisma            # Database schema (models & relations)
│   │   └── 📄 seed.js                  # Database seed script
│   │
│   ├── 📄 package.json                 # Backend dependencies & scripts
│   ├── 📄 .env.example                 # Environment variable template
│   └── 📄 prisma.config.ts             # Prisma config overrides
```

---

## 🔌 API Endpoints

### Boards
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/boards` | List all boards |
| `GET` | `/api/boards/:id` | Get board with lists, cards, labels & members |
| `POST` | `/api/boards` | Create a new board |
| `DELETE` | `/api/boards/:id` | Delete a board |

### Lists
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/lists` | Create a new list |
| `PUT` | `/api/lists/:id` | Update list title or color |
| `PUT` | `/api/lists/reorder` | Reorder lists within a board |
| `DELETE` | `/api/lists/:id` | Delete a list |

### Cards
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/cards` | Create a new card |
| `PUT` | `/api/cards/:id` | Update card (title, description, dueDate) |
| `PUT` | `/api/cards/reorder` | Reorder cards & move between lists |
| `DELETE` | `/api/cards/:id` | Delete a card |

### Labels
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/labels` | Create a new label |
| `PUT` | `/api/labels/:id` | Update label name/color |
| `DELETE` | `/api/labels/:id` | Delete a label |
| `POST` | `/api/labels/card` | Assign a label to a card |
| `DELETE` | `/api/labels/card/:cardId/:labelId` | Remove a label from a card |

### Checklists
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/checklists` | Create a checklist |
| `DELETE` | `/api/checklists/:id` | Delete a checklist |
| `POST` | `/api/checklists/:id/items` | Add an item to a checklist |
| `PATCH` | `/api/checklists/items/:id/toggle` | Toggle checklist item status |
| `DELETE` | `/api/checklists/items/:id` | Delete a checklist item |

### Members
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/members/users` | List all users |
| `POST` | `/api/members/users` | Create a new user |
| `GET` | `/api/members/board/:boardId` | Get board members |
| `POST` | `/api/members/card` | Assign member to card |
| `DELETE` | `/api/members/card/:cardId/:userId` | Remove member from card |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **PostgreSQL** installed and running (or use [Supabase](https://supabase.com/) for cloud DB)
- **Git** — [Download](https://git-scm.com/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/harshrajput4343/FlowLoG.git
cd FlowLoG
```

### 2️⃣ Setup the Database

Create a PostgreSQL database (e.g., `flowlog_db`), then configure the backend environment:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your connection string:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flowlog_db?schema=public"
DIRECT_URL="postgresql://postgres:yourpassword@localhost:5432/flowlog_db?schema=public"
```

### 3️⃣ Start the Backend

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed        # Seeds demo data
npm run dev         # Starts on http://localhost:3001
```

### 4️⃣ Start the Frontend

```bash
cd client
npm install
npm run dev         # Starts on http://localhost:3000
```

### 5️⃣ Open the App

Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser. 🎉

---

## ☁️ Deployment

FlowLoG is deployed using a **3-tier cloud architecture**:

| Layer | Service | URL |
|---|---|---|
| **Frontend** | Vercel | [https://flowlogwork.vercel.app](https://flowlogwork.vercel.app) |
| **Backend** | Render | Cloud-hosted Express.js API |
| **Database** | Supabase | Managed PostgreSQL (ap-south-1) |

### Deployment Workflow

```
  GitHub Push (main branch)
        │
        ├──► Vercel auto-deploys frontend
        │
        └──► Render auto-deploys backend
                │
                └──► Connects to Supabase PostgreSQL
```

> 📖 For full deployment instructions, see [`deploy.md`](./deploy.md)

---

## 📸 Screenshots

<p align="center"><em>Coming soon — screenshots of the FlowLoG dashboard, board view, card detail modal, and mobile responsive views.</em></p>

<!-- 
Uncomment and add your screenshots:
| Dashboard | Board View | Card Details |
|---|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Board](screenshots/board.png) | ![Card](screenshots/card-detail.png) |
-->

---

## 🧩 Key Design Decisions

| Decision | Rationale |
|---|---|
| **Next.js App Router** | File-based routing, React Server Components support, built-in optimization |
| **CSS Modules** | Scoped styles prevent class name collisions — no extra CSS-in-JS runtime |
| **Prisma ORM** | Type-safe queries, auto-generated migrations, excellent DX |
| **Supabase** | Free managed PostgreSQL with connection pooling — zero DB ops overhead |
| **@hello-pangea/dnd** | Maintained fork of `react-beautiful-dnd` — reliable drag-and-drop |
| **No Auth** | Demo-first approach — removes friction for showcasing functionality |
| **Cascade Deletes** | Prisma `onDelete: Cascade` ensures data integrity across relations |

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Tips

- Backend auto-reloads with `nodemon` during development
- Frontend auto-reloads with Next.js Fast Refresh
- Use `npx prisma studio` to browse the database visually

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>Built with passion by <a href="https://github.com/harshrajput4343">Harsh Kumar | heymyselfharsh@gmail.com</a></strong>
</p>

<p align="center">
  <a href="https://github.com/harshrajput4343/FlowLoG">
    <img src="https://img.shields.io/badge/⭐_Star_this_repo-GitHub-181717?style=for-the-badge&logo=github" alt="Star on GitHub" />
  </a>
</p>
