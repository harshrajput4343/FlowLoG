# FlowLoG — Deployment Guide

> **Backend** → Render (Free Tier)  
> **Frontend** → Vercel (Free Tier)  
> **Database** → Supabase PostgreSQL (Cloud — already set up)

---

## ❓ Do I Need to Deploy Supabase Separately?

**No.** Supabase is already a **cloud-hosted** database. Your Supabase project at `aws-1-ap-south-1.pooler.supabase.com` runs on Supabase's own servers 24/7. Both your local machine AND your deployed servers (Render, Vercel) connect to the same Supabase database using the connection string in your `.env`.

- ✅ You can fetch data from Supabase when deployed on Vercel/Render — it's already in the cloud.
- ✅ No extra steps needed for the database — just keep the `DATABASE_URL` and `DIRECT_URL` as-is.
- ⚠️ Never expose your Supabase credentials in frontend code — they should only live in the backend `.env`.

---

## Prerequisites

Before starting, make sure you have:

- [x] A **GitHub account** with your FlowLoG repo pushed
- [x] A **Supabase** account (database already working)
- [x] A **Render** account → [render.com](https://render.com)
- [x] A **Vercel** account → [vercel.com](https://vercel.com)

### Push Your Code to GitHub First

```bash
cd H:\Projects\FlowLoG
git add .
git commit -m "prepare for deployment"
git push origin main
```

---

## Part 1: Deploy Backend on Render

### Step 1 — Create a Render Account

1. Go to [render.com](https://render.com) and sign up (use GitHub login for convenience).

### Step 2 — Create a New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your **GitHub** repository → select **FlowLoG**
3. Fill in the settings:

| Setting | Value |
|---|---|
| **Name** | `flowlog-api` (or any name you like) |
| **Region** | Choose the closest to your Supabase region (Singapore/Mumbai for `ap-south-1`) |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate` |
| **Start Command** | `node index.js` |
| **Instance Type** | `Free` |

### Step 3 — Add Environment Variables

In the **Environment** section, click **"Add Environment Variable"** and add these one by one:

| Key | Value |
|---|---|
| `DATABASE_URL` | `postgresql://postgres.iuugqavlgqtlxvzrxpdh:FlowLoG%40434@aws-1-ap-south-1.pooler.supabase.com:5432/postgres` |
| `DIRECT_URL` | Same as `DATABASE_URL` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render uses this by default) |

> ⚠️ Do **NOT** add `SUPABASE_URL` or `SUPABASE_ANON_KEY` unless your backend code uses them. Currently it only uses Prisma with `DATABASE_URL`.

### Step 4 — Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like:
   ```
   https://flowlog-api.onrender.com
   ```
4. Test it by visiting: `https://flowlog-api.onrender.com/` — should show *"FlowLog API is running"*

### Step 5 — Copy Your Backend URL

Save this URL — you'll need it for the frontend:
```
https://flowlog-api.onrender.com
```

> 💡 **Note:** Render free tier services spin down after 15 minutes of inactivity. The first request after sleep takes ~30-50 seconds. This is normal on the free plan.

---

## Part 2: Deploy Frontend on Vercel

### Step 1 — Create a Vercel Account

1. Go to [vercel.com](https://vercel.com) and sign up (use GitHub login)

### Step 2 — Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Select your **FlowLoG** repository from GitHub
3. Fill in the settings:

| Setting | Value |
|---|---|
| **Project Name** | `flowlog` |
| **Framework Preset** | `Next.js` (auto-detected) |
| **Root Directory** | `client` |

### Step 3 — Add Environment Variable

In the **Environment Variables** section, add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://flowlog-api.onrender.com/api` |

> ⚠️ Replace `flowlog-api` with your **actual** Render URL from Part 1, Step 5.  
> ✅ Make sure to include `/api` at the end!

### Step 4 — Deploy

1. Click **"Deploy"**
2. Wait for the build to finish (1-3 minutes)
3. Once done, Vercel gives you a live URL like:
   ```
   https://flowlog.vercel.app
   ```

### Step 5 — Test

1. Open your Vercel URL in the browser
2. You should see the FlowLoG board application
3. All data comes from your Supabase database through the Render backend

---

## Part 3: Update Render CORS (Important!)

After both are deployed, update the backend to allow requests from your Vercel domain.

### Option A — Keep CORS Open (Current Setup)

Your `server/index.js` currently uses `app.use(cors())` which allows all origins. This works but is less secure.

### Option B — Restrict to Your Vercel Domain (Recommended)

Update `server/index.js` to only allow your Vercel domain:

```js
app.use(cors({
  origin: [
    'http://localhost:3000',                // local development
    'https://flowlog.vercel.app',           // your Vercel URL
    'https://flowlog-yourusername.vercel.app' // preview deployments
  ]
}));
```

Then push the change and Render will auto-redeploy.

---

## Quick Reference: What Goes Where

```
┌─────────────────────────────────────────────────┐
│              SUPABASE (Cloud DB)                │
│         PostgreSQL Database                      │
│   ✅ Already deployed — no action needed         │
└──────────────────────┬──────────────────────────┘
                       │ DATABASE_URL
                       ▼
┌─────────────────────────────────────────────────┐
│           RENDER (Backend API)                   │
│    Express.js + Prisma (Node.js)                │
│    URL: https://flowlog-api.onrender.com        │
└──────────────────────┬──────────────────────────┘
                       │ NEXT_PUBLIC_API_URL
                       ▼
┌─────────────────────────────────────────────────┐
│           VERCEL (Frontend)                      │
│    Next.js React App                             │
│    URL: https://flowlog.vercel.app              │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Backend takes 30+ sec to respond | Normal on Render free tier — first request wakes the server |
| "Failed to fetch boards" on Vercel | Check `NEXT_PUBLIC_API_URL` is correct and includes `/api` |
| CORS errors in browser console | Add your Vercel domain to CORS allowed origins in `server/index.js` |
| Prisma migration errors on Render | Add `npx prisma generate` to the Build Command |
| Supabase connection refused | Check `DATABASE_URL` is correct in Render env vars |
| Changes not appearing | Push to GitHub — both Render and Vercel auto-deploy on push |

---

## Redeployment

Once connected, both platforms **auto-deploy** when you push to GitHub:

```bash
git add .
git commit -m "your changes"
git push origin main
```

- **Render** — detects push → rebuilds → redeploys backend
- **Vercel** — detects push → rebuilds → redeploys frontend
