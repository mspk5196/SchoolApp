# Railway Deployment Guide - Single Service Setup

Your Railway deployment is now configured for a single service that runs both the web API and cron jobs together.

## Current Configuration

### Files Updated:
- ✅ `Dockerfile` - Optimized for Railway deployment
- ✅ `src/cronManager.js` - Railway-compatible cron management
- ✅ `src/app.js` - Auto-loads cron jobs
- ✅ `railway.json` - Railway configuration
- ✅ `package.json` - Updated start scripts

### Cron Jobs Schedule:
- **Attendance Updater**: Daily at 6:00 PM IST
- **Assessment Sessions**: Daily at 11:59 PM IST  
- **Academic Sessions**: Daily at 12:05 AM IST
- **Overdue Check**: Daily at 1:00 AM IST

## Railway Setup Steps

### 1. Environment Variables (Set in Railway Dashboard)
```env
NODE_ENV=production
TIMEZONE=Asia/Kolkata
PORT=5000

# Your database credentials
DATABASE_HOST=your_host
DATABASE_USER=your_user  
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_db_name
```

### 2. Deploy
Since you already connected via GitHub integration:
1. Push your changes to GitHub
2. Railway will automatically detect the changes and redeploy
3. Monitor the deployment logs

### 3. Verify Cron Jobs
After deployment, check the logs for:
```
🔧 Cron configuration:
  - Should run crons: true
🕐 Loading cron jobs for Railway deployment...
✅ All cron jobs initialized
```

### 4. Monitor Health
Visit these endpoints to check status:
- `https://your-app.railway.app/health` - Basic health check
- `https://your-app.railway.app/cron-status` - Cron job status

## How It Works

1. **Single Process**: Your app runs as one service on Railway
2. **Auto-Start Crons**: Cron jobs start automatically when the app starts
3. **Timezone Aware**: All jobs run in IST timezone
4. **Error Handling**: Failed cron jobs are logged but don't crash the app
5. **Railway Optimized**: Uses Railway's single-service model efficiently

## Monitoring

Watch your Railway logs for cron job execution:
- `🔄` - Job starting
- `✅` - Job completed successfully  
- `❌` - Job failed (with error details)

## Troubleshooting

**Crons not running?**
- Check `NODE_ENV=production` is set
- Verify timezone in logs
- Look for cron initialization messages

**Database errors?**
- Verify all DB environment variables are set
- Check database connection in Railway logs

That's it! Your cron jobs will now run automatically on Railway alongside your web API.
