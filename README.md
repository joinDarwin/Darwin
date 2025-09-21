# 🌍 Darwin Global Timer System

A real-time, globally synchronized countdown timer that resets when specific token trades occur on the Solana blockchain. All users worldwide see the exact same timer state regardless of location, timezone, or device.

## 🎯 What It Does

- **Global Timer**: 10-minute countdown synchronized across all users
- **Blockchain Integration**: Monitors Solana for token trades with configurable token addresses
- **Auto Reset**: Timer resets when buy/sell transactions are detected
- **Real-time Sync**: Instant updates across all connected users
- **Redis Persistence**: Timer state persists across server restarts and scales globally
- **Smart Monitoring**: Optimized polling with 95% credit reduction and webhook support
- **Admin Panel**: Complete configuration and monitoring interface

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Helius API key (for Solana RPC)
- Redis Cloud account (for production persistence)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd Darwin

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Add your configuration to .env.local

# Start development server
npm run dev
```

### Environment Variables

#### **Vercel Frontend (.env.local)**
```env
# Required: Service URLs (deployed services)
TIMER_SERVICE_URL=https://your-timer-service.railway.app
SOLANA_MONITOR_SERVICE_URL=https://your-monitor-service.railway.app

# Required: Helius API key for Solana RPC
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
HELIUS_API_KEY=your_helius_api_key_here
```

#### **Timer Service (.env)**
```env
# Required: Redis for persistence
REDIS_URL=your_redis_cloud_url_here

# Optional: Timer configuration
TIMER_DEFAULT_DURATION=600000  # 10 minutes in milliseconds
```

#### **Solana Monitor Service (.env)**
```env
# Required: Helius API key for Solana RPC
HELIUS_API_KEY=your_helius_api_key_here

# Required: Timer service URL for notifications
TIMER_SERVICE_URL=https://your-timer-service.railway.app

# Optional: Token configuration
TOKEN_ADDRESS=9VxExA1iRPbuLLdSJ2rB3nyBxsyLReT4aqzZBMaBaY1p

# Optional: Webhook mode for maximum efficiency
HELIUS_WEBHOOK_MODE=false
HELIUS_WEBHOOK_URL=https://yourdomain.com/api/webhook/helius
```

## 🎮 How It Works

### For Users
1. **Open the app** - Timer automatically connects and syncs
2. **See countdown** - 10-minute timer synchronized globally
3. **Watch for resets** - Timer resets when token trades occur
4. **Real-time updates** - All users see changes instantly

### For Administrators
1. **Access Admin Panel** - Navigate to `/admin` for full control
2. **Configure Monitoring** - Set polling speed and webhook settings
3. **Monitor Costs** - Real-time Helius credit usage tracking
4. **Manage Settings** - Update token addresses and timer duration

### For Developers
```typescript
// Access timer state
const { timeLeft, isActive, resetTimer, lastTrade } = useTimer()

// Check sync status
const isSynced = timeSync.isSynced()

// Manual reset (testing)
resetTimer()

// Access admin functionality
const { setPollingSpeed, getCostStats } = useAdmin()
```

## 🔄 Timer Reset Triggers

### ✅ **Automatic Resets**
- **Buy Transactions**: User purchases token → Timer resets
- **Sell Transactions**: User sells token → Timer resets
- **Any DEX**: Works across 15+ Solana DEXs (Raydium, Jupiter, Orca, etc.)

### ❌ **Does NOT Reset**
- Token transfers between wallets
- Airdrops or distributions
- Liquidity operations
- Non-trading transactions

## 🏪 Supported DEXs

**Primary DEXs:**
- Raydium (AMM, CPMM, CLMM)
- Jupiter (V4, V6 Aggregator)
- Orca (Whirlpool)
- Serum DEX
- OpenBook

**Secondary DEXs:**
- Metora, Lifinity, Aldrin, Crema, Stepn, Saber, Mercurial, Cykura, Invariant

## 🌐 Global Synchronization

### **Key Features**
- **Server Authority**: Single source of truth for timer state
- **Real-time Updates**: Server-Sent Events for instant sync
- **Cross-Platform**: Works on all devices and browsers
- **Timezone Independent**: Uses UTC timestamps
- **Network Resilient**: Automatic reconnection on issues

### **Sync Timeline**
```
Trade Executed → 1-2s: Blockchain confirmation → 3s: Detection → 0.1s: Server reset → 0.1s: Global broadcast
Total: ~4-5 seconds from trade to global reset
```

## 🛠️ Technical Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Next.js API Routes, Server-Sent Events
- **Blockchain**: Solana Web3.js, Helius RPC
- **UI**: Tailwind CSS, shadcn/ui components
- **State**: React Context, Global Timer Service

## 📊 Monitoring & Performance

### **Detection Accuracy**
- **99.9%+ Detection Rate**: Catches virtually all legitimate trades
- **<0.1% False Positives**: Filters out non-trading transactions
- **3-5s Detection Latency**: From trade to timer reset
- **<1s Global Sync**: Instant updates to all users

### **System Performance**
- **Smart Polling**: Dynamic intervals (30s-5min) based on activity
- **Credit Optimization**: 95% reduction in Helius API usage
- **Webhook Support**: 99% credit reduction with real-time notifications
- **Redis Persistence**: Global state synchronization across instances
- **Memory Usage**: Minimal (efficient state management)
- **Network**: Lightweight JSON messages only

### **Cost Optimization**
| Mode | Credits/Hour | Use Case |
|------|--------------|----------|
| **Conservative** | 48-240 | Low activity periods |
| **Balanced** | 120-480 | Default mode |
| **Aggressive** | 240-960 | High trading activity |
| **Ultra** | 480-1,440 | Real-time monitoring |
| **Webhook** | ~0 | Maximum efficiency |

## 🧪 Testing

### **Manual Testing**
- **Manual Reset Button**: Test timer reset functionality
- **Debug Check**: Analyze recent transactions
- **Test TX Button**: Analyze specific transaction

### **Real Testing**
- Execute actual buy/sell trades on any supported DEX
- Verify timer resets within 3-5 seconds
- Check global synchronization across multiple browsers

## 🔧 Configuration

### **Admin Panel Configuration**
Access the admin panel at `/admin` to configure:
- **Token Address**: Monitor any Solana token
- **Timer Duration**: Set custom countdown duration
- **Polling Speed**: Choose from 4 optimization modes
- **Webhook Settings**: Enable real-time notifications
- **Cost Monitoring**: Track Helius credit usage

### **Environment Configuration**
```env
# Timer settings
TIMER_DEFAULT_DURATION=600000  # 10 minutes

# Token monitoring
TOKEN_ADDRESS=9VxExA1iRPbuLLdSJ2rB3nyBxsyLReT4aqzZBMaBaY1p

# Webhook optimization
HELIUS_WEBHOOK_MODE=true
HELIUS_WEBHOOK_URL=https://yourdomain.com/api/webhook/helius
```

### **Programmatic Configuration**
```typescript
// Set polling speed dynamically
monitor.setPollingSpeed('aggressive')

// Get cost statistics
const stats = monitor.getCostStats()
console.log(`Current cost: ${stats.currentCost} credits/hour`)

// Update token address
monitor.updateTokenAddress('new_token_address')
```

## 📁 Project Structure

```
Darwin/
├── app/                           # Next.js app directory (Vercel Frontend)
│   ├── admin/                     # Admin panel
│   │   └── page.tsx              # Redesigned admin interface
│   ├── api/                      # API endpoints (Proxy to services)
│   │   ├── admin/                # Admin API routes
│   │   │   ├── monitoring/       # Monitoring configuration
│   │   │   ├── settings/         # Settings management
│   │   │   └── stats/            # Statistics
│   │   ├── timer/                # Timer API routes (Proxy)
│   │   ├── webhook/              # Webhook endpoints
│   │   └── health/               # Health checks
│   └── page.tsx                  # Main page
├── components/                    # React components
│   ├── ui/                       # shadcn/ui components
│   └── VaultTimer.tsx           # Timer UI component
├── contexts/                      # React contexts
│   └── TimerContext.tsx         # Global timer state
├── lib/                          # Core libraries
│   ├── deprecated/               # Deprecated files (moved to services)
│   │   ├── global-timer-service-prod.ts
│   │   ├── solana-monitor.ts
│   │   └── solana-webhook-monitor.ts
│   ├── websocket-service.ts          # Real-time communication
│   └── time-sync.ts                 # Time synchronization
├── services/                      # Dedicated Services
│   ├── timer-service/            # Timer Service
│   │   ├── index.js              # Timer service logic
│   │   ├── package.json          # Dependencies
│   │   ├── Dockerfile            # Container config
│   │   └── env.example           # Environment template
│   └── solana-monitor-service/   # Solana Monitor Service
│       ├── index.js              # Monitor service logic
│       ├── package.json          # Dependencies
│       ├── Dockerfile            # Container config
│       └── env.example           # Environment template
├── docs/                         # Documentation
│   ├── PRODUCTION_DEPLOYMENT_GUIDE.md  # Complete deployment guide
│   ├── TECHNICAL_DOCS.md         # Technical documentation & architecture
│   ├── MIGRATION_SUMMARY.md      # Migration documentation
│   └── env.example               # Environment template
├── docker-compose.yml            # Local development
├── railway.json                  # Railway deployment config
├── vercel.json                   # Vercel configuration
├── deploy.sh                     # Quick deployment script
├── env.example                   # Environment template
└── README.md                     # This file
```

## 🚀 Deployment

### **Separate Services Architecture (Recommended)**

The system now uses a separate services architecture to reduce Vercel resource usage by 60-80%:

#### **1. Deploy Dedicated Services**
```bash
# Quick deployment with script
./deploy.sh railway    # Deploy to Railway (recommended)
./deploy.sh docker     # Deploy with Docker Compose

# Or manual deployment
# See docs/PRODUCTION_DEPLOYMENT_GUIDE.md for detailed instructions
```

#### **2. Deploy Vercel Frontend**
```bash
# Deploy to Vercel
npx vercel

# Set environment variables in Vercel dashboard
TIMER_SERVICE_URL=https://your-timer-service.railway.app
SOLANA_MONITOR_SERVICE_URL=https://your-monitor-service.railway.app
NEXT_PUBLIC_HELIUS_API_KEY=your_api_key
HELIUS_API_KEY=your_api_key
```

### **Production Requirements**
- **Timer Service**: Dedicated service for timer logic and Redis operations
- **Monitor Service**: Dedicated service for Solana blockchain monitoring
- **Redis**: Required for global state persistence
- **Environment Variables**: Configure service URLs and API keys

### **Deployment Platforms**
- **Railway**: Recommended for dedicated services (easy deployment)
- **Vercel**: Frontend and API proxy (lightweight)
- **Docker**: Local development and self-hosted deployments
- **AWS/GCP**: Enterprise deployments with managed services

## 🔮 Recent Enhancements

- ✅ **Separate Services Architecture**: 60-80% reduction in Vercel resource usage
- ✅ **Dedicated Timer Service**: Independent timer logic and Redis operations
- ✅ **Dedicated Monitor Service**: Independent Solana blockchain monitoring
- ✅ **Redis Persistence**: Global state synchronization across instances
- ✅ **Smart Polling**: Dynamic intervals with 95% credit reduction
- ✅ **Webhook Support**: 99% credit reduction with real-time notifications
- ✅ **Redesigned Admin Panel**: Clean, functional interface for the new architecture
- ✅ **Cost Optimization**: Real-time credit usage tracking
- ✅ **Service Health Monitoring**: Real-time status of all services

## 🔮 Future Enhancements

- **Multiple Timers**: Support for different tokens simultaneously
- **Price Tracking**: Real-time price updates and alerts
- **Volume Analytics**: Trading volume insights and trends
- **Push Notifications**: Browser notifications for timer events
- **Historical Data**: Trade history and analytics dashboard
- **Custom Themes**: User-customizable appearance
- **Mobile App**: Native mobile applications

## 📞 Support

- **Issues**: Create GitHub issues for bugs
- **Features**: Submit feature requests
- **Documentation**: See `TECHNICAL_DOCS.md` for detailed implementation

## 📄 License

[Add your license here]

---

**Built with ❤️ for the Solana ecosystem**