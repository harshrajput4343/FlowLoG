# Trello Clone

A Kanban-style project management application built with **Next.js**, **Node.js (Express)**, and **PostgreSQL (Prisma)**.

## Features

- **Board Management**: Create and view boards.
- **Lists & Cards**: Create lists and cards, drag and drop to reorder.
- **Drag & Drop**: Powered by `@hello-pangea/dnd`.
- **Card Details**: Add labels, due dates, members, and checklists.
- **Responsive Design**: Mobile-friendly UI.
- **No Login Required**: Default user 'Demo User' is automatically logged in.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, CSS Modules, @hello-pangea/dnd.
- **Backend**: Node.js, Express.js, Prisma ORM.
- **Database**: PostgreSQL.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running.

### 1. Database Setup
Create a PostgreSQL database (e.g., `trello_clone`).
Update `server/.env` with your connection string:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trello_clone?schema=public"
```

### 2. Backend Setup
```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```
Server runs on `http://localhost:3001`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:3000`.

## API Documentation

- `GET /api/boards` - List all boards
- `GET /api/boards/:id` - Get board details
- `POST /api/boards` - Create new board
- `POST /api/lists` - Create list
- `PUT /api/lists/reorder` - Reorder lists
- `POST /api/cards` - Create card
- `PUT /api/cards/reorder` - Reorder cards (and move between lists)
- `PUT /api/cards/:id` - Update card details

## folder Structure
- `client/`: Next.js frontend application.
- `server/`: Express.js backend API.
