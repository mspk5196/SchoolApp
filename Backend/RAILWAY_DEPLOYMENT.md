# Railway Deployment Guide

This guide explains how to deploy your School App backend with cron jobs to Railway.

## Railway Configuration

Your app has been configured for Railway deployment with the following structure:

### 1. **Procfile** (Multi-Process Setup)
```
web: node server.js
worker: node src/cronWorker.js
```

- **web**: Main API server
- **worker**: Dedicated process for cron jobs

### 2. **Cron Jobs Schedule**
The following cron jobs are configured:

| Job | Schedule | Description |
|-----|----------|-------------|
| Attendance Updater | `0 18 * * *` (6:00 PM daily) | Updates student attendance |
| Assessment Sessions | `59 23 * * *` (11:59 PM daily) | Creates assessment sessions |
| Academic Sessions | `5 0 * * *` (12:05 AM daily) | Creates daily academic sessions |
| Overdue Check | `0 1 * * *` (1:00 AM daily) | Checks for overdue student levels |

### 3. **Environment Variables Required**

Set these environment variables in Railway:

```env
NODE_ENV=production
TIMEZONE=Asia/Kolkata
DATABASE_HOST=your_db_host
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_db_name
```

## Deployment Steps

### Option 1: Railway CLI (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize and Deploy**
   ```bash
   cd Backend
   railway init
   railway up
   ```

4. **Deploy Worker Process**
   ```bash
   railway service create worker
   railway up --service worker
   ```

### Option 2: GitHub Integration

1. **Connect Repository**
   - Go to Railway dashboard
   - Connect your GitHub repository
   - Select the Backend directory as root

2. **Configure Services**
   - Create two services: `web` and `worker`
   - Set build commands accordingly

3. **Set Environment Variables**
   - Add all required environment variables in Railway dashboard

## Manual Testing Cron Jobs

You can manually trigger cron jobs via API endpoints:

```bash
# Test attendance updater
POST /api/student/attendanceUpdater

# Other endpoints can be added as needed
```

## Monitoring

### Railway Dashboard
- Monitor both web and worker processes
- Check logs for cron job execution
- Set up alerts for failures

### Logs
Cron jobs provide detailed logging:
- ✅ Success indicators
- ❌ Error indicators  
- 🔄 Process start indicators
- 💓 Heartbeat every 5 minutes

## Troubleshooting

### Cron Jobs Not Running
1. Check if worker process is running
2. Verify `CRON_WORKER=true` environment variable
3. Check timezone configuration

### Database Connection Issues
1. Verify database environment variables
2. Check network policies
3. Ensure database accepts connections from Railway

### Memory/Resource Issues
1. Monitor resource usage in Railway dashboard
2. Consider upgrading Railway plan if needed
3. Optimize cron job queries

## File Structure

```
Backend/
├── Procfile                    # Railway process definitions
├── Dockerfile                 # Container configuration
├── railway.json               # Railway configuration
├── src/
│   ├── cronManager.js         # Centralized cron management
│   ├── cronWorker.js          # Dedicated worker process
│   └── controllers/
│       ├── student/
│       │   └── attendanceCron.js
│       └── mentor/
│           ├── assesmentCronJob.js
│           ├── dailyScheduleUpdate.js
│           └── studentBacklogsCron.js
```

## Best Practices

1. **Separate Processes**: Web and worker processes run independently
2. **Error Handling**: All cron jobs have proper error handling
3. **Logging**: Comprehensive logging for monitoring
4. **Timezone Aware**: Configurable timezone support
5. **Environment Specific**: Different behavior for dev/prod environments

## Cost Optimization

- **Starter Plan**: Can run both web and worker processes
- **Pro Plan**: Recommended for production with better resources
- **Resource Monitoring**: Keep an eye on CPU/memory usage

## Support

For Railway-specific issues:
- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Support: support@railway.app
