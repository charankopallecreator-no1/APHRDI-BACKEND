# Production Configuration Guide

This document outlines the recommended production configuration for the APHRDI backend.

## Deployment on Render

1. Prerequisites
   - A GitHub account with this repository
   - A Render account (sign up at https://render.com)
   - MongoDB Atlas cluster (for production database)
   - OpenAI API key

2. Deployment Steps
   1. Go to [Render Dashboard](https://dashboard.render.com)
   2. Click "New +" and select "Web Service"
   3. Connect your GitHub repository
   4. Render will automatically detect the `render.yaml` configuration
   5. Configure the following environment variables:
      - `MONGO_URI`: Your production MongoDB connection string
      - `JWT_SECRET`: A secure random string (min 64 chars)
      - `OPENAI_API_KEY`: Your OpenAI API key
      - `SENTRY_DSN` (Optional): Your Sentry project DSN
      - `CORS_ORIGINS`: Your frontend application URL

3. Post-Deployment
   - Render will automatically:
     - Build the Docker image
     - Deploy the container
     - Set up HTTPS
     - Configure health checks
     - Enable auto-deployment for future pushes
   - Verify the deployment by checking:
     - Health endpoint (`/health`)
     - API endpoints
     - Logs in Render dashboard
     - Environment variables

4. Maintenance on Render
   - Monitor the service in Render dashboard
   - Check deployment logs
   - Set up notifications for failed deployments
   - Configure auto-scaling if needed
   - Set up custom domains

## Environment Variables for Production

```env
# Required
NODE_ENV=production
PORT=5000  # or your hosting provider's port
MONGO_URI=mongodb+srv://user:pass@your-prod-cluster.mongodb.net/aphrdi?retryWrites=true&w=majority
JWT_SECRET=<your-secure-jwt-secret>
OPENAI_API_KEY=<your-openai-api-key>

# Security (recommended)
CORS_ORIGINS=https://your-frontend-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring (optional but recommended)
SENTRY_DSN=<your-sentry-dsn>
LOG_LEVEL=info
```

## Security Checklist

1. Database
   - [ ] Use MongoDB Atlas (managed service)
   - [ ] Enable network access restrictions
   - [ ] Use strong database user password
   - [ ] Enable database auditing
   - [ ] Regular backups configured

2. Authentication & Authorization
   - [ ] Strong JWT secret (min 64 chars)
   - [ ] JWT expiry set appropriately
   - [ ] Rate limiting enabled
   - [ ] CORS origins restricted

3. SSL/TLS
   - [ ] Force HTTPS in production
   - [ ] Valid SSL certificate
   - [ ] Modern TLS version (1.2+)

4. API Security
   - [ ] Input validation on all routes
   - [ ] Request size limits
   - [ ] Security headers (already via helmet)

5. Monitoring
   - [ ] Sentry for error tracking
   - [ ] Metrics endpoint secured
   - [ ] Logging configured
   - [ ] Health checks set up

## Docker Production Tips

1. Use multi-stage builds to reduce image size
2. Set NODE_ENV=production
3. Don't run as root
4. Pin dependency versions
5. Regular security scans

## Health Monitoring

The `/health` endpoint returns:
- Server uptime
- MongoDB connection status
- Basic ping test

Example monitoring setup with `curl`:
```bash
# Health check
curl -f https://your-api.com/health

# Simple uptime monitor (Unix/Linux)
while true; do
  curl -fs https://your-api.com/health >/dev/null \
    && echo "[$(date)] UP" \
    || echo "[$(date)] DOWN"
  sleep 300
done
```

## Backup Strategy

1. MongoDB Atlas automatic backups
2. Regular exports of critical collections
3. Backup verification process
4. Documented restore procedure

## Scaling Considerations

1. Horizontal Scaling
   - Stateless design allows multiple instances
   - Use load balancer
   - Session management via JWT

2. Database Scaling
   - MongoDB Atlas handles scaling
   - Consider read replicas for heavy read loads
   - Index optimization

3. Rate Limiting
   - Per-IP limits
   - Global API limits
   - Separate limits for auth endpoints

## Deployment Checklist

Pre-deployment:
- [ ] Environment variables set
- [ ] Database connection tested
- [ ] CORS origins configured
- [ ] SSL/TLS certificates ready
- [ ] Security headers enabled
- [ ] Rate limits configured
- [ ] Monitoring set up
- [ ] Logging configured
- [ ] Backup strategy implemented

Post-deployment:
- [ ] Health check passing
- [ ] Metrics collecting
- [ ] Logs streaming
- [ ] SSL/TLS working
- [ ] CORS working
- [ ] Rate limits effective
- [ ] Error tracking active
- [ ] Backups running

## Maintenance

1. Regular Tasks
   - Monitor error rates
   - Review logs
   - Check disk usage
   - Verify backups
   - Update dependencies
   - Rotate API keys

2. Security Updates
   - Node.js version
   - npm packages
   - System packages
   - SSL certificates

3. Performance Monitoring
   - Response times
   - Error rates
   - Database queries
   - Resource usage