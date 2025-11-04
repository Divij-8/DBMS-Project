# Deployment Steps for Render ��

## Prerequisites
Before deploying, ensure you have:
1. A Render account (https://render.com)
2. Your GitHub repository pushed with all changes
3. Environment variables ready

## Step 1: Push Your Code to GitHub

```bash
cd /Users/divijmazumdar/DBMS-Project
git add .
git commit -m "Clean up codebase and prepare for Render deployment"
git push origin main
```

## Step 2: Create Backend Service on Render

1. **Go to Render Dashboard** → https://dashboard.render.com
2. **Click "New +"** → Select **"Web Service"**
3. **Connect Your Repository**
   - Select your GitHub repo (you may need to authorize first)
   - Select branch: `main`
   - Root directory: `DBMS-PROJECT`

4. **Configure Build & Deploy**
   - Name: `arms-backend`
   - Environment: `Python 3.12`
   - Build command: `pip install -r requirements.txt && python manage.py migrate`
   - Start command: `gunicorn agricultural_system.wsgi:application --bind 0.0.0.0:$PORT`
   - Plan: **Free** (or paid if needed)

5. **Add Environment Variables** (Settings → Environment)
   ```
   DEBUG = False
   ALLOWED_HOSTS = arms-backend.onrender.com
   CORS_ALLOWED_ORIGINS = https://arms-frontend.onrender.com
   SECRET_KEY = (generate a secure key)
   DATABASE_URL = (Render will provide if using Postgres)
   ```

6. **Create PostgreSQL Database** (Optional but Recommended)
   - Click "New +" → "PostgreSQL"
   - Name: `arms-database`
   - PostgreSQL Version: 15
   - After creation, copy the internal database URL

7. **Update Backend Environment Variables**
   - Add `DATABASE_URL` from PostgreSQL service

## Step 3: Create Frontend Service on Render

1. **Go to Render Dashboard** → Click "New +"
2. **Select "Static Site"**
3. **Connect Repository** (same as backend)
   - Root directory: `shadcn-ui`
   - Build command: `npm install && npm run build`
   - Publish directory: `dist`

4. **Configure Domain**
   - Name: `arms-frontend`
   - Plan: **Free**

5. **Add Environment Variables**
   ```
   VITE_API_URL = https://arms-backend.onrender.com/api
   ```

6. **Add Redirect Rule** (for SPA routing)
   - Go to Settings → Redirects/Rewrites
   - Add: `/* -> /index.html 200`

## Step 4: Alternative - Use render.yaml (One-Click Deploy)

If you want to use the provided `render.yaml`:

1. **Go to Render Dashboard**
2. **Click "New +" → "Blueprint"**
3. **Select "Public Git Repository"**
4. **Enter your GitHub repo URL**
5. **Click "Connect"** and follow the prompts
6. **Render will automatically create both services**

## Step 5: Verify Deployment

### Backend Health Check
```bash
curl https://arms-backend.onrender.com/api/health/
```

### Frontend URL
```
https://arms-frontend.onrender.com
```

## Step 6: Run Database Migrations

After backend deployment:

1. **Connect to Backend Shell**
   - Go to Render Dashboard → arms-backend
   - Click "Shell" tab

2. **Run Migrations**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

## Post-Deployment Checklist

- [ ] Backend service is running
- [ ] Frontend loads without errors
- [ ] Can login with test credentials
- [ ] Products can be created and viewed
- [ ] Equipment rental system works
- [ ] Chat functionality works
- [ ] Orders can be placed
- [ ] Error logs are clean

## Troubleshooting

### Frontend 404 on Refresh
**Solution:** Ensure redirect rule is set: `/* -> /index.html 200`

### CORS Errors
**Solution:** Check `CORS_ALLOWED_ORIGINS` matches frontend URL

### Database Connection Error
**Solution:** Verify `DATABASE_URL` is set in environment variables

### Build Failures
**Solution:** Check build logs in Render dashboard

## Useful Commands

### Access Backend Logs
```
Render Dashboard → arms-backend → Logs
```

### Access Frontend Logs
```
Render Dashboard → arms-frontend → Logs
```

### Update Environment Variables
```
Render Dashboard → Service → Settings → Environment
```

### Manual Redeploy
```
Render Dashboard → Service → Manual Deploy
```

## Important Notes

⚠️ **Free Tier Limitations:**
- Instances will spin down after 15 minutes of inactivity
- May take 30 seconds to wake up on first request
- For production, upgrade to paid plan

✅ **Recommended Setup:**
- Use PostgreSQL database instead of SQLite
- Enable auto-deploy from main branch
- Set up environment variables for production
- Monitor logs regularly

## Success! 🎉

Your Agricultural Resource Management System is now live on Render!

Access URLs:
- **Frontend:** https://arms-frontend.onrender.com
- **Backend API:** https://arms-backend.onrender.com/api
- **Admin Panel:** https://arms-backend.onrender.com/admin
