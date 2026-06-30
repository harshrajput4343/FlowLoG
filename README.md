<p align="center">
  <img src="client/public/flowlog-logo.jpg" alt="FlowLoG Logo" width="120" />
</p>

<h1 align="center">FlowLoG</h1>

<p align="center">
  <strong>A modern, full-stack Kanban-style project management application</strong><br/>
  <em>Organize. Prioritize. Deliver.</em>
</p>

<p align="center">
  <a href="https://flowlogwork.me" target="_blank">
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
  <img src="https://img.shields.io/badge/Redis-Caching-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Razorpay-Payments-02042B?style=flat-square&logo=razorpay&logoColor=white" alt="Razorpay" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Groq%20%7C%20Gemini-AI-FF6F00?style=flat-square&logo=google&logoColor=white" alt="AI" />
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

**FlowLoG** is a feature-rich, Trello-inspired Kanban board application designed for seamless project and task management. Built with a modern full-stack architecture, it provides an intuitive drag-and-drop interface to organize tasks across customizable boards, lists, and cards — all with real-time interactivity, a premium liquid glassmorphism UI, and cloud deployment.

Whether you're managing a personal project or coordinating a team, FlowLoG gives you the tools to visualize your workflow and stay productive with zero latency via optimistic rendering, built-in AI assistants (FlowBot & FlowGuide AI), secure JWT authentication, and a full premium subscription system.

---

## 💎 Advanced Features Showcase

### 🎨 Liquid Glassmorphism & Dynamic UI
FlowLoG moves beyond standard flat designs by implementing a premium **Liquid Glassmorphism** layered architecture. Instead of solid colors, the interface utilizes dynamically blurred overlays (`backdrop-filter: blur()`), floating fluid background blobs with CSS animations, and seamless dark/light theme switching. A custom blue-to-teal gradient scale dynamically reacts to the user's context, ensuring an immersive and highly polished visual experience across the dashboard, settings, and member panels.

### 🤖 FlowGuide AI — Data-Aware Assistant
The **FlowGuide AI** is a data-aware chat assistant powered by **Groq** or **Google Gemini** LLMs. Unlike static chatbots, FlowGuide translates natural-language questions (e.g., "How many overdue cards do I have?") into safe, user-scoped **Prisma read-only queries** — executing them against the live database and summarizing the results in plain English. Security is enforced through a multi-layered architecture: JWT authentication, operation whitelisting (read-only), automatic userId injection, result caps, and include-depth sanitization. The assistant is accessible via a floating panel for authenticated users only.

### 💬 FlowBot — Knowledge-Base Chatbot
**FlowBot** is a lightweight, static knowledge-base chatbot built directly into the app. It answers common questions about how to use FlowLoG — creating boards, using templates, drag-and-drop, labels, checklists, due dates, inviting members, themes, and more — using keyword matching against a curated knowledge base. No API calls required, instant responses.

### 🔐 JWT Authentication System
FlowLoG implements a complete **JWT-based authentication** system with bcrypt password hashing (12 rounds), 7-day token expiry, and signed HS256 tokens. The system includes signup, login, and a legacy password migration flow (`set-password`) for accounts created before the auth system was introduced. All mutating API endpoints are protected by layered middleware: `authMiddleware` (JWT verification) and `requireAuth` (blocks guest/unauthenticated writes).

### 🔗 Board Sharing with Share Tokens
Boards can be shared publicly via unique **share tokens**. Board owners can generate a share link that allows anyone to view the board in read-only mode without authentication. The share page features status-based rendering with loading, error, and not-found states.

### 🖼️ Board Background Customization (Unsplash)
Board backgrounds can be customized with **Unsplash integration** — users can search and select high-quality photos as board backgrounds. The system includes secure URL validation to prevent abuse. Premium users unlock dynamic image backgrounds, while free users can use gradient colors.

### ⚡ Optimistic Rendering Architecture
To completely eliminate UI flickering and guarantee a zero-latency feel—even when navigating complex hierarchical data—FlowLoG implements a rigorous **Optimistic UI Caching Strategy**. When navigating to the dashboard, board configurations are instantly painted to the screen via `localStorage`. Simultaneously, a background synchronization process silently fetches fresh data from the Postgres database ensuring you never stare at a loading spinner.

### 📬 Dual Email System (Resend + SMTP)
FlowLoG uses a **dual email delivery** system: primary delivery via the **Resend HTTP API** (bypasses Render's SMTP port blocking) with automatic **SMTP/Nodemailer fallback** for Gmail. The system sends two types of emails: workspace invitation emails and card assignment notification emails with rich HTML templates featuring the FlowLoG branding.

### 💳 Razorpay Payment & Subscription System
A full **premium subscription system** is integrated with **Razorpay** payment processing. Users can upgrade to Pro ($9/year) to unlock unlimited boards, dynamic image backgrounds, member invitations, premium templates, and advanced labels. The system includes subscription status checking, upgrade flows, cancellation, and server-side premium gating on protected features.

### ⏱️ Resilient Cloud Infrastructure (Keep-Alive)
Because the backend API is hosted on Render's free tier (which forcibly spins down after 15 minutes of inactivity), an automated **Node-Cron / Axios Keep-Alive** utility continuously self-pings the application. This ensures the connection pool to the Supabase database remains hot and entirely bypasses the notorious 30+ second cloud cold-start delays.

### 🔒 Board Access Authorization
A shared **board access utility** (`boardAccess.js`) enforces ownership and membership checks at every mutation level — boards, lists, cards, and nested resources. Users can only modify resources that belong to boards they own or are members of. Destructive operations (e.g., deleting a board) require board ownership, not just membership.

### 🔍 SEO & Web Standards
FlowLoG implements comprehensive **SEO best practices**: dynamic meta tags, Open Graph & Twitter cards, structured data (JSON-LD `SoftwareApplication` schema), `sitemap.xml`, `robots.txt`, canonical URLs, Google Search Console verification, and Vercel Analytics integration.

---

## 📋 Core Capabilities

| Feature | Description |
|---|---|
| 📋 **Board Management** | Create, view, update, and delete multiple project boards with custom gradient backgrounds or Unsplash images |
| 🔐 **JWT Authentication** | Secure signup & login with bcrypt password hashing, signed JWT tokens, and legacy password migration |
| 📝 **Lists & Cards** | Create lists (columns) and cards (tasks) within boards |
| 🖱️ **Drag & Drop** | Reorder lists and cards, move cards across lists using smooth drag-and-drop |
| 🏷️ **Labels** | Assign color-coded labels (Urgent, Required, Not Urgent, etc.) to cards |
| ✅ **Checklists** | Add checklists with progress tracking inside cards |
| 👥 **Members** | Assign members to cards and manage board membership with email notifications |
| 🔗 **Board Sharing** | Generate public share links with unique tokens for read-only board access |
| 🤖 **FlowGuide AI** | Data-aware AI assistant that queries your boards, cards, and tasks using LLM-powered Prisma queries |
| 💬 **FlowBot** | Static knowledge-base chatbot for instant app guidance |
| 💳 **Premium Subscriptions** | Razorpay-powered subscription system with Pro feature gating |
| ⚖️ **Security (RLS + Auth)** | Row-Level Security policies in Supabase + JWT middleware + board access authorization |
| 🌗 **Dark / Light Theme** | Toggle between dark and light mode flawlessly |
| 🔍 **Search & Filter** | Search cards and filter by labels, members, or due dates |
| 📱 **Responsive Design** | Fully mobile-friendly and responsive UI |
| 📧 **Email Notifications** | Resend API + SMTP email for workspace invitations and card assignment alerts |
| 🎨 **Dynamic Avatars** | First-letter avatars and real user email display |
| 📤 **Board Templates** | Pre-configured board templates for quick setup |
| 🔔 **Notifications & Toasts** | In-app notification system with elegant outline icons and toast notifications |
| 🔍 **SEO Optimized** | Sitemap, robots.txt, structured data, Open Graph, and Vercel Analytics |

---

## 🖥️ Live Demo

<p align="center">
  <a href="https://flowlogwork.me" target="_blank">
    <img src="https://img.shields.io/badge/▶_Open_FlowLoG-Live_App-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Open Live App" />
  </a>
</p>

> **Frontend**: [https://flowlogwork.me](https://flowlogwork.me)  
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
| [@vercel/analytics](https://vercel.com/analytics) | Production analytics and performance monitoring |

### Backend
| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org/) | JavaScript runtime for the server |
| [Express.js 5](https://expressjs.com/) | Minimal web framework for REST APIs |
| [Prisma ORM 5](https://www.prisma.io/) | Type-safe database ORM with migrations |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Supabase](https://supabase.com/) | Cloud-hosted PostgreSQL database |
| [JWT (jsonwebtoken)](https://github.com/auth0/node-jsonwebtoken) | Signed token-based authentication (HS256, 7-day expiry) |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing with configurable salt rounds |
| [Upstash Redis](https://upstash.com/) | Serverless Redis for API response caching |
| [Razorpay](https://razorpay.com/) | Payment gateway for premium subscriptions |
| [Resend](https://resend.com/) | Primary email delivery via HTTP API |
| [Nodemailer](https://nodemailer.com/) | SMTP email fallback for Gmail delivery |
| [Groq / Google Gemini](https://groq.com/) | LLM providers for FlowGuide AI data assistant |
| [CORS](https://www.npmjs.com/package/cors) | Cross-origin resource sharing middleware |
| [dotenv](https://www.npmjs.com/package/dotenv) | Environment variable management |
| [Node-Cron/Axios](https://github.com/axios/axios) | Automated keep-alive jobs to bypass PaaS cold starts |

### DevOps & Deployment
| Service | Role |
|---|---|
| [Vercel](https://vercel.com/) | Frontend hosting with CI/CD + custom domain (`flowlogwork.me`) |
| [Render](https://render.com/) | Backend hosting (Node.js) |
| [Supabase](https://supabase.com/) | Managed PostgreSQL database |
| [Upstash](https://upstash.com/) | Managed Redis (serverless) |
| [GitHub](https://github.com/) | Version control & CI/CD trigger |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                  Next.js 16 + React 19 + TypeScript             │
│                 Vercel: https://flowlogwork.me                  │
│                                                                 │
│   Pages:  /  /dashboard  /landing  /login  /signup  /pricing    │
│           /b/:id  /board/share/:token  /join/:token             │
│           /templates  /members  /settings                       │
│                                                                 │
│   Assistants:  FlowBot (static KB)  |  FlowGuide AI (LLM)      │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP REST (fetch)
                             │  Authorization: Bearer <JWT>
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (API Layer)                          │
│              Express.js 5 + Prisma ORM + Node.js                │
│                    Render (Cloud Hosted)                         │
│                                                                 │
│   Auth:    JWT (HS256) + bcrypt + authMiddleware + requireAuth   │
│                                                                 │
│   Routes:  /api/auth  /api/boards  /api/lists  /api/cards       │
│            /api/labels  /api/checklists  /api/members            │
│            /api/invitations  /api/flowguide                      │
│            /api/subscription  /api/payment                       │
│                                                                 │
│   Email:   Resend HTTP API  →  SMTP/Nodemailer fallback         │
│   AI:      Groq API  |  Google Gemini API                       │
└───────────────┬───────────────────────┬────────────────────────┘
                │  Prisma Client        │  HTTP (Resend/Groq/Gemini)
                │  DATABASE_URL         │
                ▼                       ▼
┌───────────────────────────┐   ┌───────────────────────────┐
│   DATABASE (PostgreSQL)   │   │   EXTERNAL SERVICES       │
│   Supabase (Cloud)        │   │   • Upstash Redis (cache) │
│   Region: ap-south-1      │   │   • Resend (email)        │
│                           │   │   • Groq / Gemini (AI)    │
│                           │   │   • Razorpay (payments)   │
│                           │   │   • Unsplash (images)     │
└───────────────────────────┘   └───────────────────────────┘
```

---

## 📊 ER Diagram (Database Schema)

Below is the **Entity-Relationship Diagram** representing all models and their relationships in the FlowLoG database, defined using Prisma ORM:

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│      User        │       │   BoardMember    │       │      Board       │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id           PK │◄──┐   │ id           PK  │   ┌──►│ id           PK │
│ email       UNQ │   ├───│ userId       FK  │   │   │ title           │
│ name            │   │   │ boardId      FK  │───┘   │ background      │
│ avatarUrl       │   │   │                  │       │ ownerId      FK │──┐
│ passwordHash    │   │   │ UNQ(boardId,     │       │ shareToken  UNQ │  │
│ isPremium       │   │   │     userId)      │       │ createdAt       │  │
│ subscriptionExp │   │   └──────────────────┘       │ updatedAt       │  │
│ subscriptionPln │   │                              └────────┬────────┘  │
│ createdAt       │   │                                       │           │
│ updatedAt       │   │                                       │           │
└──────┬──────────┘   │   ┌──────────────────┐               │           │
       │              │   │     Label        │               │           │
       │              │   ├──────────────────┤               │           │
       │              │   │ id           PK  │◄──────────┐   │           │
       │              │   │ name             │           │   │           │
       │              │   │ color            │           │   │           │
       │              │   │ boardId      FK  │───────────┼───┘           │
       │              │   └──────────────────┘           │               │
       │              │                                  │               │
       │              │   ┌──────────────────┐           │               │
       │              │   │      List        │           │               │
       │              │   ├──────────────────┤           │               │
       │              │   │ id           PK  │◄──┐       │               │
       │              │   │ title            │   │       │               │
       │              │   │ color            │   │       │               │
       │              │   │ order            │   │       │               │
       │              │   │ boardId      FK  │───┼───────┼───────────────┘
       │              │   │ createdAt        │   │       │
       │              │   │ updatedAt        │   │       │
       │              │   └──────────────────┘   │       │
       │              │                          │       │
       │              │   ┌──────────────────┐   │       │
       │              │   │      Card        │   │       │
       │              │   ├──────────────────┤   │       │
       │              │   │ id           PK  │◄──┼──┐    │
       │              │   │ title            │   │  │    │
       │              │   │ description      │   │  │    │
       │              │   │ order            │   │  │    │
       │              │   │ dueDate          │   │  │    │
       │              │   │ listId       FK  │───┘  │    │
       │              │   │ createdAt        │      │    │
       │              │   │ updatedAt        │      │    │
       │              │   └──────────────────┘      │    │
       │              │                             │    │
       │              │   ┌──────────────────┐      │    │
       │              │   │   CardLabel      │      │    │
       │              │   ├──────────────────┤      │    │
       │              │   │ id           PK  │      │    │
       │              │   │ cardId       FK  │──────┘    │
       │              │   │ labelId      FK  │───────────┘
       │              │   │                  │
       │              │   │ UNQ(cardId,      │
       │              │   │     labelId)     │
       │              │   └──────────────────┘
       │              │
       │              │   ┌──────────────────┐
       │              │   │   CardMember     │
       │              │   ├──────────────────┤
       │              │   │ id           PK  │
       │              └───│ userId       FK  │
       │                  │ cardId       FK  │──────────────┐
       │                  │                  │              │
       │                  │ UNQ(cardId,      │              │
       │                  │     userId)      │              │
       │                  └──────────────────┘              │
       │                                                   │
       │                  ┌──────────────────┐              │
       │                  │   Checklist      │              │
       │                  ├──────────────────┤              │
       │                  │ id           PK  │◄──┐          │
       │                  │ title            │   │          │
       │                  │ cardId       FK  │───┼──────────┘
       │                  └──────────────────┘   │
       │                                         │
       │                  ┌──────────────────┐   │
       │                  │ ChecklistItem    │   │
       │                  ├──────────────────┤   │
       │                  │ id           PK  │   │
       │                  │ content          │   │
       │                  │ isChecked        │   │
       │                  │ checklistId  FK  │───┘
       │                  └──────────────────┘
       │
       │                  ┌──────────────────┐
       │                  │   Invitation     │
       │                  ├──────────────────┤
       │                  │ id           PK  │
       │                  │ email            │
       │                  │ token        UNQ │
       │                  │ status           │
       │                  │ emailSent        │
       │                  │ workspaceId      │
       └──────────────────│ senderId     FK  │
                          │ createdAt        │
                          │ updatedAt        │
                          └──────────────────┘

 (User.ownedBoards → Board.ownerId)
```

### Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| `User` → `Board` | One-to-Many | A user owns multiple boards |
| `User` ↔ `Board` (via `BoardMember`) | Many-to-Many | Users can be members of multiple boards |
| `User` → `Invitation` | One-to-Many | A user sends multiple invitations |
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
├── 📄 Explanation.md                   # Detailed feature explanations
├── 📄 .gitignore                       # Git ignore rules
│
├── 📂 client/                          # ⚛️ FRONTEND — Next.js Application
│   ├── 📂 app/                         # Next.js App Router pages
│   │   ├── 📄 layout.tsx               # Root layout (fonts, metadata, SEO, structured data)
│   │   ├── 📄 providers.tsx            # Client providers (Theme, Toast, Sidebar, FlowBot, FlowGuide, Analytics)
│   │   ├── 📄 page.tsx                 # Landing page (hero, features, CTA)
│   │   ├── 📄 page.module.css          # Landing page styles
│   │   ├── 📄 globals.css              # Global CSS variables (dark/light theme)
│   │   ├── 📄 sitemap.ts              # Dynamic sitemap generation for SEO
│   │   ├── 📄 robots.ts               # Robots.txt configuration
│   │   ├── 📂 dashboard/              # Authenticated user dashboard
│   │   ├── 📂 landing/                # Landing page route
│   │   ├── 📂 login/                  # Login page with legacy password migration
│   │   ├── 📂 signup/                 # Signup page
│   │   ├── 📂 pricing/               # Premium subscription pricing page
│   │   ├── 📂 b/[id]/                # Dynamic board page (/b/:id)
│   │   ├── 📂 board/share/[token]/   # Public shared board page (read-only)
│   │   ├── 📂 join/[token]/          # Invitation acceptance page
│   │   ├── 📂 home/                   # Home route
│   │   ├── 📂 members/               # Members management page
│   │   ├── 📂 settings/              # Settings page
│   │   └── 📂 templates/             # Board templates page
│   │
│   ├── 📂 components/                 # Reusable UI components
│   │   ├── 📄 Header.tsx              # Top navigation bar
│   │   ├── 📄 Sidebar.tsx             # Side navigation panel
│   │   ├── 📄 BoardCanvas.tsx         # Main Kanban board (drag-and-drop, Unsplash backgrounds)
│   │   ├── 📄 ListColumn.tsx          # Individual list column
│   │   ├── 📄 CardItem.tsx            # Individual card item
│   │   ├── 📄 CardDetailModal.tsx     # Card detail view (labels, checklists, etc.)
│   │   ├── 📄 CreateBoardModal.tsx    # New board creation modal
│   │   ├── 📄 FilterPopup.tsx         # Search & filter popover
│   │   ├── 📄 ProfileDropdown.tsx     # User profile dropdown
│   │   ├── 📄 NotificationPopup.tsx   # Notifications popover
│   │   ├── 📄 SwitchBoardsPopup.tsx   # Board switcher
│   │   ├── 📄 FlowBot.tsx            # Static knowledge-base chatbot
│   │   ├── 📄 FlowGuide.tsx          # AI data assistant (LLM-powered)
│   │   ├── 📄 PremiumGateModal.tsx   # Premium feature upsell modal
│   │   └── 📄 *.module.css           # Component-specific CSS modules
│   │
│   ├── 📂 contexts/                   # React context providers
│   │   ├── 📄 ThemeContext.tsx         # Dark/Light theme context
│   │   ├── 📄 ToastContext.tsx        # Toast notification context
│   │   └── 📄 SidebarContext.tsx      # Sidebar state context
│   │
│   ├── 📂 types/                      # TypeScript type definitions
│   │   └── 📄 index.ts                # Board, List, Card, User, Label, Checklist types
│   │
│   ├── 📂 utils/                      # Utility functions
│   │   ├── 📄 api.ts                  # API client (all HTTP requests with JWT auth headers)
│   │   └── 📄 premiumGate.ts         # Premium status helper (UX-layer only)
│   │
│   ├── 📂 public/                     # Static assets
│   │   └── 📄 flowlog-logo.png        # Application logo
│   │
│   ├── 📄 package.json                # Frontend dependencies & scripts
│   ├── 📄 tsconfig.json               # TypeScript configuration
│   └── 📄 vercel.json                 # Vercel deployment config
│
├── 📂 server/                          # 🖥️ BACKEND — Express.js API
│   ├── 📄 index.js                    # Express app entry point (middleware, routes, health check)
│   ├── 📄 prismaClient.js            # Prisma client singleton
│   │
│   ├── 📂 controllers/                # Route handlers (business logic)
│   │   ├── 📄 boardController.js      # Board CRUD + share token + background update
│   │   ├── 📄 listController.js       # List CRUD + reorder
│   │   ├── 📄 cardController.js       # Card CRUD + reorder
│   │   ├── 📄 labelController.js      # Label CRUD + card assignment
│   │   ├── 📄 checklistController.js  # Checklist & item management
│   │   ├── 📄 memberController.js     # User & member management + card assignment emails
│   │   ├── 📄 flowguideController.js  # FlowGuide AI (NL → Prisma queries via Groq/Gemini)
│   │   ├── 📄 paymentController.js    # Razorpay order creation & verification
│   │   └── 📄 subscriptionController.js # Subscription status, upgrade & cancel
│   │
│   ├── 📂 routes/                     # Express route definitions
│   │   ├── 📄 auth.js                 # /api/auth (signup, login, me, set-password)
│   │   ├── 📄 boards.js               # /api/boards (CRUD + share)
│   │   ├── 📄 lists.js                # /api/lists
│   │   ├── 📄 cards.js                # /api/cards
│   │   ├── 📄 labels.js               # /api/labels
│   │   ├── 📄 checklists.js           # /api/checklists
│   │   ├── 📄 members.js              # /api/members
│   │   ├── 📄 invitations.js          # /api/invitations (send, accept, resend, cancel)
│   │   ├── 📄 flowguide.js            # /api/flowguide (AI chat)
│   │   ├── 📄 subscription.js         # /api/subscription (status, upgrade, cancel)
│   │   └── 📄 payment.js              # /api/payment (create-order, verify)
│   │
│   ├── 📂 middleware/                 # Express middleware
│   │   ├── 📄 auth.js                 # JWT verification middleware (Bearer token → req.userId)
│   │   └── 📄 requireAuth.js         # Blocks guest/unauthenticated users on write routes
│   │
│   ├── 📂 utils/                      # Utility modules
│   │   ├── 📄 boardAccess.js          # Board ownership & membership verification
│   │   ├── 📄 emailService.js         # Resend API + SMTP email delivery (invitations, card assignments)
│   │   ├── 📄 redisClient.js          # Upstash Redis client for caching
│   │   └── 📄 keepAlive.js            # Render keep-alive self-ping utility
│   │
│   ├── 📂 prisma/                     # Prisma ORM configuration
│   │   ├── 📄 schema.prisma           # Database schema (models & relations)
│   │   └── 📄 seed.js                 # Database seed script
│   │
│   ├── 📄 package.json                # Backend dependencies & scripts
│   ├── 📄 .env.example                # Environment variable template
│   └── 📄 prisma.config.ts            # Prisma config overrides
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new account (bcrypt hash, JWT issued) |
| `POST` | `/api/auth/login` | Login with email + password (JWT issued) |
| `GET` | `/api/auth/me` | Get current authenticated user profile |
| `POST` | `/api/auth/set-password` | Set password for legacy accounts (migration flow) |

### Boards
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/boards` | List all boards for authenticated user |
| `GET` | `/api/boards/:id` | Get board with lists, cards, labels & members |
| `POST` | `/api/boards` | Create a new board |
| `PUT` | `/api/boards/:id` | Update board (title, background) |
| `DELETE` | `/api/boards/:id` | Delete a board |
| `POST` | `/api/boards/:id/share` | Generate a share token for a board |
| `GET` | `/api/boards/share/:token` | Get board by share token (public, read-only) |

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
| `PUT` | `/api/checklists/items/:id` | Update a checklist item |
| `PATCH` | `/api/checklists/items/:id/toggle` | Toggle checklist item status |
| `DELETE` | `/api/checklists/items/:id` | Delete a checklist item |

### Members
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/members/users` | List all users |
| `POST` | `/api/members/users` | Create a new user |
| `DELETE` | `/api/members/users/:id` | Delete a user |
| `GET` | `/api/members/board/:boardId` | Get board members |
| `POST` | `/api/members/card` | Assign member to card (+ email notification) |
| `DELETE` | `/api/members/card/:cardId/:userId` | Remove member from card |

### Invitations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/invitations` | Send an invitation email (premium only) |
| `GET` | `/api/invitations` | Get invitations sent by current user |
| `POST` | `/api/invitations/:id/resend` | Resend an invitation email |
| `DELETE` | `/api/invitations/:id` | Cancel/delete an invitation |
| `POST` | `/api/invitations/accept/:token` | Accept an invitation (adds user as board member) |

### FlowGuide AI
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/flowguide/chat` | Send a natural-language query to FlowGuide AI |

### Subscription
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subscription/status` | Get current subscription status |
| `POST` | `/api/subscription/upgrade` | Upgrade to premium |
| `POST` | `/api/subscription/cancel` | Cancel premium subscription |

### Payment
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payment/create-order` | Create a Razorpay payment order |
| `POST` | `/api/payment/verify` | Verify a completed payment |

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

Edit `server/.env` with your connection string and required keys:

```env
# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flowlog_db?schema=public"
DIRECT_URL="postgresql://postgres:yourpassword@localhost:5432/flowlog_db?schema=public"

# Authentication (REQUIRED)
JWT_SECRET="your-secret-key-here"

# Email (optional — pick one)
RESEND_API_KEY=re_xxxxxxxxxxxx
# OR
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_16_char_app_password

# AI Assistant (optional — pick one)
GROQ_API_KEY=gsk_xxxxxxxxxxxx
# OR
GEMINI_API_KEY=AIzaxxxxxxxxxxxxxxxxxxxxxxx

# Payment (optional)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Frontend URL
FRONTEND_URL=http://localhost:3000
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

> [!TIP]
> Use port `6543` for the `DATABASE_URL` (Supabase Pooler) and the direct host for `DIRECT_URL` to ensure stable connectivity.

### 4️⃣ Start the Frontend

```bash
cd client
npm install
npm run dev         # Starts on http://localhost:3000
```

### 5️⃣ Create an Account

Navigate to **[http://localhost:3000/signup](http://localhost:3000/signup)** to create your account. You must be signed in to create new boards.

---

## ☁️ Deployment

FlowLoG is deployed using a **3-tier cloud architecture**:

| Layer | Service | URL |
|---|---|---|
| **Frontend** | Vercel | [https://flowlogwork.me](https://flowlogwork.me) |
| **Backend** | Render | Cloud-hosted Express.js API |
| **Database** | Supabase | Managed PostgreSQL (ap-south-1) |
| **Cache** | Upstash | Managed Redis (serverless) |

### Deployment Workflow

```
  GitHub Push (main branch)
        │
        ├──► Vercel auto-deploys frontend (flowlogwork.me)
        │
        └──► Render auto-deploys backend
                │
                ├──► Connects to Supabase PostgreSQL
                ├──► Connects to Upstash Redis
                ├──► Connects to Resend / SMTP (email)
                └──► Connects to Groq / Gemini (AI)
```

> 📖 For full deployment instructions, see [`deploy.md`](./deploy.md)

---

## 📸 Screenshots

<p align="center"><em>Go to Live link: [https://flowlogwork.me] — screenshots of the FlowLoG dashboard, board view, card detail modal, and mobile responsive views.</em></p>

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
| **JWT + bcrypt Auth** | Stateless authentication with signed tokens and secure password hashing |
| **Layered Middleware** | `authMiddleware` → `requireAuth` → controller: clean separation of auth concerns |
| **Board Access Utility** | Centralized ownership/membership checks propagated to card and list level |
| **FlowGuide AI (Prisma)** | LLM translates NL → Prisma queries with 6 security layers (whitelist, scoping, caps) |
| **Resend + SMTP Fallback** | Resend HTTP API bypasses Render's SMTP port blocks; SMTP fallback for Gmail |
| **Optimistic Rendering** | `localStorage` serves cached layouts instantly while the background UI syncs seamless updates |
| **Liquid Glassmorphism** | Replacing standard solid layers with highly translucent, blurred panels and fluid background blobs |
| **Keep-Alive Server** | Render free-tier APIs sleep after 15 mins. A node script intercepts downtime to guarantee immediate frontend capability |
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
