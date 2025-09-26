# 🚀 Production Deployment Guide v1

## Overview

This guide provides step-by-step instructions for deploying the Darwin Global Timer System using the new separate services architecture. This architecture reduces Vercel resource usage by 60-80% while maintaining full functionality.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend + API)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js App (Lightweight)                  │ │
│  │  • Frontend (React)                                    │ │
│  │  • API Routes (Proxy to services)                      │ │
│  │  • WebSocket/SSE (Proxy to timer service)              │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/WebSocket
┌─────────────────────┴───────────────────────────────────────┐
│                Dedicated Services                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Solana Monitor  │  │ Timer Service   │  │ Redis       │ │
│  │ Service         │  │                 │  │ Database    │ │
│  │ • Blockchain    │  │ • Timer Logic   │  │ • Timer     │ │
│  │   Polling       │  │ • Redis Ops     │  │   State     │ │
│  │ • Trade         │  │ • Pub/Sub       │  │ • Events    │ │
│  │   Detection     │  │ • Reset Logic   │  │ • Settings  │ │
│  │ • Webhooks      │  │ • Sync Logic    │  │ • Pub/Sub   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Benefits

- **60-80% reduction** in Vercel memory usage
- **70-90% reduction** in Vercel CPU usage
- **Better reliability** with dedicated services
- **Easier scaling** of individual components
- **Cost optimization** for production deployments

## 🛠️ Deployment Options

### **Option 1: Railway (Recommended)**

Railway provides the easiest deployment experience with automatic scaling and built-in Redis.

#### **Step 1: Deploy Timer Service**

1. **Connect to Railway:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   ```

2. **Deploy Timer Service:**
   ```bash
   # Navigate to timer service
   cd services/timer-service
   
   # Deploy to Railway
   railway up
   
   # Set environment variables
   railway variables set REDIS_URL=your_redis_cloud_url
   railway variables set TIMER_DEFAULT_DURATION=600000
   ```

3. **Get Timer Service URL:**
   ```bash
   railway domain
   # Note the URL: https://your-timer-service.railway.app
   ```

#### **Step 2: Deploy Solana Monitor Service**

1. **Deploy Monitor Service:**
   ```bash
   # Navigate to monitor service
   cd services/solana-monitor-service
   
   # Deploy to Railway
   railway up
   
   # Set environment variables
   railway variables set HELIUS_API_KEY=your_helius_api_key
   railway variables set TIMER_SERVICE_URL=https://your-timer-service.railway.app
   railway variables set TOKEN_ADDRESS=9VxExA1iRPbuLLdSJ2rB3nyBxsyLReT4aqzZBMaBaY1p
   ```

2. **Get Monitor Service URL:**
   ```bash
   railway domain
   # Note the URL: https://your-monitor-service.railway.app
   ```

#### **Step 3: Deploy Vercel Frontend**

1. **Deploy to Vercel:**
   ```bash
   # From project root
   npx vercel
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   ```env
   TIMER_SERVICE_URL=https://your-timer-service.railway.app
   SOLANA_MONITOR_SERVICE_URL=https://your-monitor-service.railway.app
   NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
   HELIUS_API_KEY=your_helius_api_key
   ```

### **Option 2: Docker Compose (Self-Hosted)**

For self-hosted deployments or local development.

#### **Step 1: Setup Environment**

1. **Create environment files:**
   ```bash
   # Copy environment templates
   cp services/timer-service/env.example services/timer-service/.env
   cp services/solana-monitor-service/env.example services/solana-monitor-service/.env
   cp docs/env.example .env
   ```

2. **Configure environment variables:**
   ```bash
   # Edit each .env file with your configuration
   # See Environment Variables section below
   ```

#### **Step 2: Deploy with Docker Compose**

1. **Start all services:**
   ```bash
   # From project root
   docker-compose up -d
   ```

2. **Verify deployment:**
   ```bash
   # Check service status
   docker-compose ps
   
   # Check logs
   docker-compose logs -f
   ```

3. **Deploy Vercel Frontend:**
   ```bash
   # Set environment variables for local services
   # TIMER_SERVICE_URL=http://localhost:3002
   # SOLANA_MONITOR_SERVICE_URL=http://localhost:3001
   
   npx vercel
   ```

### **Option 3: AWS/GCP (Enterprise)**

For enterprise deployments with managed services.

#### **Step 1: Setup Infrastructure**

1. **Create managed services:**
   - **Redis**: AWS ElastiCache or Google Cloud Memorystore
   - **Compute**: AWS ECS/EKS or Google Cloud Run/GKE
   - **Load Balancer**: AWS ALB or Google Cloud Load Balancer

2. **Deploy services:**
   ```bash
   # Build and push Docker images
   docker build -t your-registry/timer-service ./services/timer-service
   docker build -t your-registry/monitor-service ./services/solana-monitor-service
   
   # Deploy to your container platform
   # See platform-specific documentation
   ```

## 🔧 Environment Variables

### **Vercel Frontend (.env.local)**

```env
# Required: Service URLs
TIMER_SERVICE_URL=https://your-timer-service.railway.app
SOLANA_MONITOR_SERVICE_URL=https://your-monitor-service.railway.app

# Required: Helius API key
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key
HELIUS_API_KEY=your_helius_api_key
```

### **Timer Service (.env)**

```env
# Required: Redis connection
REDIS_URL=redis://username:password@host:port

# Optional: Timer configuration
TIMER_DEFAULT_DURATION=600000  # 10 minutes in milliseconds
```

### **Solana Monitor Service (.env)**

```env
# Required: Helius API key
HELIUS_API_KEY=your_helius_api_key

# Required: Timer service URL
TIMER_SERVICE_URL=https://your-timer-service.railway.app

# Optional: Token configuration
TOKEN_ADDRESS=9VxExA1iRPbuLLdSJ2rB3nyBxsyLReT4aqzZBMaBaY1p

# Optional: Webhook configuration
HELIUS_WEBHOOK_MODE=false
HELIUS_WEBHOOK_URL=https://yourdomain.com/api/webhook/helius
```

## 🔍 Verification & Testing

### **Step 1: Verify Services**

1. **Check Timer Service:**
   ```bash
   curl https://your-timer-service.railway.app/health
   # Should return: {"status":"healthy","instanceId":"..."}
   ```

2. **Check Monitor Service:**
   ```bash
   curl https://your-monitor-service.railway.app/health
   # Should return: {"status":"healthy","tokenAddress":"..."}
   ```

3. **Check Vercel Frontend:**
   ```bash
   curl https://your-vercel-app.vercel.app/api/health
   # Should return: {"status":"healthy","services":{...}}
   ```

### **Step 2: Test Functionality**

1. **Access Admin Panel:**
   - Navigate to `https://your-vercel-app.vercel.app/admin`
   - Verify all services show as "healthy"
   - Test timer reset functionality

2. **Test Timer Sync:**
   - Open multiple browser tabs
   - Verify timer countdown is synchronized
   - Test manual reset and verify sync

3. **Test Trade Detection:**
   - Execute a real trade on the monitored token
   - Verify timer resets within 3-5 seconds
   - Check admin panel for trade detection logs

## 📊 Monitoring & Maintenance

### **Service Health Monitoring**

1. **Timer Service Health:**
   ```bash
   curl https://your-timer-service.railway.app/health
   ```

2. **Monitor Service Health:**
   ```bash
   curl https://your-monitor-service.railway.app/health
   ```

3. **Frontend Health:**
   ```bash
   curl https://your-vercel-app.vercel.app/api/health
   ```

### **Log Monitoring**

1. **Railway Logs:**
   ```bash
   railway logs --service timer-service
   railway logs --service monitor-service
   ```

2. **Vercel Logs:**
   - Check Vercel dashboard for function logs
   - Monitor API route performance

### **Performance Monitoring**

1. **Vercel Analytics:**
   - Monitor function execution times
   - Track memory usage
   - Monitor API route performance

2. **Service Metrics:**
   - Monitor Redis connection status
   - Track trade detection accuracy
   - Monitor timer reset frequency

## 🔧 Troubleshooting

### **Common Issues**

1. **Service Connection Errors:**
   ```bash
   # Check service URLs are correct
   # Verify environment variables are set
   # Check network connectivity
   ```

2. **Redis Connection Issues:**
   ```bash
   # Verify REDIS_URL is correct
   # Check Redis service is running
   # Verify network access
   ```

3. **Trade Detection Issues:**
   ```bash
   # Check HELIUS_API_KEY is valid
   # Verify TOKEN_ADDRESS is correct
   # Check monitor service logs
   ```

### **Debug Commands**

1. **Check Service Status:**
   ```bash
   # Timer service
   curl https://your-timer-service.railway.app/api/timer/state
   
   # Monitor service
   curl https://your-monitor-service.railway.app/api/monitor/stats
   ```

2. **Check Redis Connection:**
   ```bash
   # From timer service
   curl https://your-timer-service.railway.app/health
   # Look for "redisAvailable": true
   ```

## 🚀 Scaling Considerations

### **Horizontal Scaling**

1. **Timer Service:**
   - Multiple instances can run simultaneously
   - Redis ensures state synchronization
   - Load balancer distributes requests

2. **Monitor Service:**
   - Single instance recommended (avoids duplicate detection)
   - Can scale vertically for high-volume tokens

### **Vertical Scaling**

1. **Timer Service:**
   - Increase memory for high concurrent users
   - Increase CPU for complex Redis operations

2. **Monitor Service:**
   - Increase memory for large transaction batches
   - Increase CPU for complex transaction analysis

## 📈 Cost Optimization

### **Vercel Optimization**

- **Function Duration**: Reduced from 10+ seconds to <1 second
- **Memory Usage**: Reduced from 1GB+ to <100MB
- **CPU Usage**: Reduced from continuous to request-only

### **Service Optimization**

- **Railway**: Pay only for actual usage
- **Redis**: Use appropriate instance size
- **Helius**: Optimize polling intervals

## 🔒 Security Considerations

### **Environment Variables**

- Never commit `.env` files to version control
- Use secure secret management
- Rotate API keys regularly

### **Network Security**

- Use HTTPS for all service communication
- Implement proper CORS policies
- Use API keys for service authentication

### **Redis Security**

- Use strong passwords
- Enable SSL/TLS connections
- Restrict network access

## 📊 Expected Results

After implementing separate services:

- **Vercel Memory Usage**: 1,133 GB-Hrs → ~100-200 GB-Hrs (60-80% reduction)
- **Vercel CPU Usage**: 7h 53m → ~1-2 hours (70-90% reduction)
- **Better Reliability**: Services can restart independently
- **Easier Scaling**: Scale services based on individual needs
- **Cost Optimization**: Pay only for what you use

## 🎯 Quick Start Summary

### **One-Command Deployment**
```bash
# Railway (Recommended)
./deploy.sh railway

# Docker Compose (Self-hosted)
./deploy.sh docker
```

### **Manual Deployment**
1. Deploy Timer Service to Railway/Docker
2. Deploy Monitor Service to Railway/Docker
3. Deploy Vercel Frontend with service URLs
4. Set environment variables
5. Verify deployment with health checks

### **Required Environment Variables**
- **Vercel**: `TIMER_SERVICE_URL`, `SOLANA_MONITOR_SERVICE_URL`
- **Timer Service**: `REDIS_URL`
- **Monitor Service**: `HELIUS_API_KEY`, `TIMER_SERVICE_URL`

## 📞 Support

- **Documentation**: See `TECHNICAL_DOCS.md` for detailed implementation
- **Issues**: Create GitHub issues for bugs
- **Features**: Submit feature requests

---

**Built with ❤️ for the Solana ecosystem**
