# Deploying Trello Clone to Vercel (Frontend) and Render (Backend)

## ✅ YES, MySQL works perfectly with this setup!

Your app uses Prisma with MySQL, which is fully compatible with both Vercel and Render.

---

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Render Account** - Sign up at [render.com](https://render.com)
4. **MySQL Database** - You can use:
   - [PlanetScale](https://planetscale.com) (Free tier available, MySQL-compatible)
   - [Railway](https://railway.app) (MySQL hosting)
   - [Render PostgreSQL](https://render.com) (Or switch to PostgreSQL)
   - Any MySQL hosting service

---

## Step 1: Set Up MySQL Database

### Option A: Using PlanetScale (Recommended for MySQL)
1. Go to [planetscale.com](https://planetscale.com) and create an account
2. Create a new database
3. Get your connection string (format: `mysql://username:password@host/database?sslaccept=strict`)

### Option B: Using Render PostgreSQL (Alternative)
1. If you prefer PostgreSQL, update `server/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "mysql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update dependencies in `server/package.json`:
   - Remove `mysql2` from dependencies (it's already there)
   - Keep `pg` (it's already there)

---

## Step 2: Deploy Backend to Render

1. **Push your code to GitHub** (if not already done)

2. **Go to [Render Dashboard](https://dashboard.render.com)**

3. **Create a new Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `trello-clone-backend` (or your choice)
     - **Root Directory**: `server`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Plan**: Free (or paid)

4. **Add Environment Variables:**
   - Click "Environment" tab
   - Add these variables:
     ```
     DATABASE_URL=your_mysql_connection_string
     PORT=5000
     NODE_ENV=production
     CLIENT_URL=https://your-app.vercel.app
     ```

5. **Deploy** - Render will automatically build and deploy
6. **Copy your backend URL** (e.g., `https://trello-clone-backend.onrender.com`)

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

5. **Copy your frontend URL** (e.g., `https://trello-clone.vercel.app`)

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
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

---

## Database Migrations

Your Prisma migrations will run automatically during deployment thanks to the build script:
```json
"build": "prisma generate && prisma migrate deploy"
```

If you need to run migrations manually on Render:
1. Go to your service → Shell tab
2. Run: `npx prisma migrate deploy`

---

## Troubleshooting

### Backend Issues:
- Check Render logs: Dashboard → Logs
- Verify DATABASE_URL is correct
- Ensure MySQL database is accessible

### Frontend Issues:
- Check Vercel deployment logs
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check browser console for errors

### Database Connection:
- Ensure your MySQL provider allows external connections
- For PlanetScale, use SSL connection string
- Test connection locally first with the production DATABASE_URL

### CORS Errors:
- Verify CLIENT_URL matches your Vercel URL exactly
- Check if CORS is properly configured in `server/index.js`

---

## Important Notes

1. **Free Tier Limitations:**
   - Render: Services sleep after 15 min of inactivity (50s cold start)
   - Vercel: 100GB bandwidth/month on free tier
   - PlanetScale: 5GB storage on free tier

2. **Environment Variables:**
   - Never commit `.env` files to Git
   - Use `.env.example` as a template
   - Set all variables in Render and Vercel dashboards

3. **Custom Domains:**
   - Both Vercel and Render support custom domains
   - Configure in their respective dashboards

4. **Automatic Deployments:**
   - Both platforms auto-deploy when you push to GitHub
   - Configure branch settings in their dashboards

---

## Quick Checklist

- [ ] MySQL database created and accessible
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Environment variables set on Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set on Vercel
- [ ] CORS settings updated with correct URLs
- [ ] Test the application end-to-end

---

## Need Help?

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PlanetScale Documentation](https://planetscale.com/docs)
