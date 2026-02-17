# Deploying FlowLoG to Vercel (Frontend) and Render (Backend)

## ✅ PostgreSQL via Supabase

This app uses Prisma with PostgreSQL (Supabase), fully compatible with both Vercel and Render.

---

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **Supabase Account** - Sign up at [supabase.com](https://supabase.com) (PostgreSQL database)

---

## Step 1: Set Up Supabase PostgreSQL Database

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project and set a database password
3. Go to **Project Settings → Database**
4. Copy the two connection strings:
   - **Connection string (pooled)** → use as `DATABASE_URL`
     ```
     postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - **Connection string (direct)** → use as `DIRECT_URL`
     ```
     postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
     ```

> **Why two URLs?** `DATABASE_URL` uses Supabase's connection pooler (port 6543) for runtime queries. `DIRECT_URL` uses a direct connection (port 5432) needed for Prisma migrations.

---

## Step 2: Deploy Backend to Render

1. **Push your code to GitHub** (if not already done)

2. **Go to [Render Dashboard](https://dashboard.render.com)**

3. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `flowlog-backend` (or your choice)
     - **Root Directory**: `server`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free (or paid)

4. **Add Environment Variables:**
   - Click "Environment" tab
   - Add these variables:
     ```
     DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
     DIRECT_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
     PORT=3001
     NODE_ENV=production
     CLIENT_URL=https://your-app.vercel.app
     ```

5. **Deploy** - Render will automatically build and deploy
6. **Copy your backend URL** (e.g., `https://flowlog-backend.onrender.com`)

> ⚠️ **Note**: Free Render services spin down after inactivity. First request may take 50+ seconds.

---

## Step 3: Deploy Frontend to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import your GitHub repository:**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: `client`
     - **Build Command**: `npm run build` (default)
     - **Output Directory**: `.next` (default)

3. **Add Environment Variables:**
   - In the setup page, add:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
     ```
   - Replace with your actual Render backend URL from Step 2

4. **Deploy** - Vercel will build and deploy automatically

5. **Copy your frontend URL** (e.g., `https://flowlog.vercel.app`)

---

## Step 4: Update CORS Settings

After getting your Vercel URL, go back to Render and update the `CLIENT_URL` environment variable:

1. Go to your Render service → Environment
2. Update `CLIENT_URL` to your actual Vercel URL
3. Save changes (this will redeploy)

---

## Step 5: Update API Calls (If Needed)

Check your `client/utils/api.ts` file. It should use the environment variable:

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

---

## Database Migrations

Your Prisma migrations will run automatically during deployment thanks to the build script:
```json
"build": "npx prisma generate && npx prisma migrate deploy"
```

The `DIRECT_URL` in your schema ensures migrations bypass the connection pooler:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

If you need to run migrations manually on Render:
1. Go to your service → Shell tab
2. Run: `npx prisma migrate deploy`

---

## Troubleshooting

### Backend Issues:
- Check Render logs: Dashboard → Logs
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Ensure Supabase project is active (pauses after inactivity on free tier)

### Frontend Issues:
- Check Vercel deployment logs
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors

### Database Connection:
- Ensure `DATABASE_URL` uses port `6543` (pooled) and `DIRECT_URL` uses port `5432` (direct)
- Check that your Supabase project is not paused
- Test connection locally first with the production connection strings

### CORS Errors:
- Verify `CLIENT_URL` matches your Vercel URL exactly
- Check if CORS is properly configured in `server/index.js`

---

## Important Notes

1. **Free Tier Limitations:**
   - Render: Services sleep after 15 min of inactivity (50s cold start)
   - Vercel: 100GB bandwidth/month on free tier
   - Supabase: 500MB database storage, project pauses after 1 week of inactivity on free tier

2. **Environment Variables:**
   - Never commit `.env` files to Git
   - Use `.env.example` as a template
   - Set all variables in Render and Vercel dashboards
   - Both `DATABASE_URL` and `DIRECT_URL` are required for Supabase + Prisma

3. **Custom Domains:**
   - Both Vercel and Render support custom domains
   - Configure in their respective dashboards

4. **Automatic Deployments:**
   - Both platforms auto-deploy when you push to GitHub
   - Configure branch settings in their dashboards

---

## Quick Checklist

- [ ] Supabase PostgreSQL project created
- [ ] `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) obtained
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Environment variables set on Render (DATABASE_URL, DIRECT_URL, PORT, CLIENT_URL)
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on Vercel (NEXT_PUBLIC_API_URL)
- [ ] CORS settings updated with correct URLs
- [ ] Test the application end-to-end

---

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
