# Forex Trading Bot - Complete Deployment Guide

## 🚀 Quick Start Options

### Option 1: Local Development (Testing)
### Option 2: Cloud Deployment (Production 24/7)

---

## ⚙️ OPTION 1: LOCAL SETUP (Windows/Mac/Linux)

### Prerequisites
- Python 3.9+
- MT5 installed on your system
- pip package manager

### Step 1: Clone/Download Files
```bash
mkdir forex-bot
cd forex-bot

# Copy these files:
# - bot_backend.py
# - requirements.txt
# - strategy.py
# - dashboard.jsx
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Run Backend
```bash
python bot_backend.py
```

You should see:
```
INFO:app:Running on http://0.0.0.0:5000
```

### Step 4: Open Dashboard
1. Visit: `http://localhost:5000`
2. Or use the React component in your frontend

### Step 5: Configure Settings
In dashboard → Settings tab:
- Enter MT5 login credentials
- Set broker server (e.g., "XMGlobal-Demo")
- Configure symbols, timeframes, lot sizes
- Click "Save Settings & Connect"

### Step 6: Start Bot
Click "Start Bot" button in dashboard

---

## 🌐 OPTION 2: CLOUD DEPLOYMENT (24/7, No VPS/Windows)

### ⭐ RECOMMENDED: Deploy on Railway.app (Free)

#### Step 1: Prepare GitHub Repository

1. Create GitHub account (free): https://github.com
2. Create new repository: `forex-trading-bot`
3. Upload these files:
```
forex-trading-bot/
├── bot_backend.py
├── requirements.txt
├── strategy.py
├── Procfile (CREATE THIS)
├── runtime.txt (CREATE THIS)
├── config.json (CREATE THIS)
└── README.md
```

#### Step 2: Create Procfile
**File: `Procfile`**
```
web: gunicorn --worker-class=geventwebsocket.gunicorn.workers.GeventWebSocketWorker --bind 0.0.0.0:$PORT bot_backend:app
```

#### Step 3: Create runtime.txt
**File: `runtime.txt`**
```
python-3.11.8
```

#### Step 4: Update requirements.txt
Add these for cloud:
```
Flask==3.0.0
flask-cors==4.0.0
flask-socketio==5.3.5
python-socketio==5.10.0
MetaTrader5==5.0.45
pandas==2.1.4
python-dateutil==2.8.2
gunicorn==21.2.0
gevent-websocket==0.10.1
gevent==23.9.1
python-engineio==4.8.0
```

#### Step 5: Deploy to Railway

1. Go to: https://railway.app
2. Sign up (free)
3. Click "New Project" → "Deploy from GitHub"
4. Connect your GitHub account
5. Select `forex-trading-bot` repository
6. Railway auto-detects Python + creates deployment
7. Wait for deployment to complete (2-3 minutes)

#### Step 6: Get Your Live URL
Railway provides: `https://your-project-randomstring.railway.app`

This is your **live bot backend!**

#### Step 7: Update Dashboard
In your React dashboard, change:
```javascript
const [apiUrl, setApiUrl] = useState('https://your-project-randomstring.railway.app');
```

---

## 🤖 CUSTOMIZING YOUR STRATEGY

### Understanding the Strategy Framework

The bot uses a modular strategy system. Edit `strategy.py`:

```python
class YourCustomStrategy(Strategy):
    def generate_signal(self, symbol: str, indicators: Dict) -> SignalResult:
        """Your trading logic here"""
        
        # Access indicators
        rsi = indicators.get('rsi', 0)
        price = indicators.get('price', 0)
        ma = indicators.get('ma', 0)
        
        # Your logic
        if rsi < 30 and price > ma:
            return SignalResult(
                order_type=OrderType.BUY,
                confidence=0.8,
                reason="Custom signal"
            )
        
        return SignalResult()
```

### Available Indicators
```python
indicators = {
    'rsi': 0-100,           # RSI value
    'ma': float,            # Moving Average
    'macd': float,          # MACD line
    'macd_signal': float,   # Signal line
    'bid': float,           # Bid price
    'ask': float,           # Ask price
    'price': float,         # Mid price (bid+ask)/2
}
```

### Using the Strategy in Backend

In `bot_backend.py`, find the bot loop (around line 350) and uncomment:

```python
from strategy import YourCustomStrategy

strategy = YourCustomStrategy(bot.settings.indicators)

# In bot loop:
signal = strategy.generate_signal(symbol, indicators)

if signal.order_type and signal.confidence > 0.5:  # Confidence threshold
    if len(bot.trades) < bot.settings.max_trades:  # Max positions limit
        bot.execute_trade(
            symbol, 
            signal.order_type, 
            bot.settings.lot_size.get(symbol, 0.1)
        )
```

### Example Strategies Included
1. **RSIStrategy** - Buy RSI <30, Sell RSI >70
2. **MovingAverageCrossover** - Price crosses MA
3. **MACDStrategy** - MACD signal crosses
4. **CombinedStrategy** - Multiple confirmations

---

## 📊 BACKEND API REFERENCE

### REST Endpoints

#### Save Settings & Connect MT5
```
POST /api/settings
{
  "login": 123456,
  "password": "your_password",
  "server": "XMGlobal-Demo",
  "symbols": ["EURUSD", "GBPUSD", "USDJPY"],
  "timeframes": {"EURUSD": 15, "GBPUSD": 15, "USDJPY": 1},
  "lot_size": {"EURUSD": 0.1, "GBPUSD": 0.1, "USDJPY": 0.05},
  "indicators": {
    "rsi_period": 14,
    "ma_period": 20,
    "macd_enabled": true
  },
  "max_trades": 5,
  "risk_per_trade": 2
}
```

#### Start Bot
```
POST /api/bot/start
```
Response: `{"success": true, "message": "Bot started"}`

#### Stop Bot
```
POST /api/bot/stop
```
Response: `{"success": true, "message": "Bot stopped"}`

#### Get Bot Status
```
GET /api/status
```
Response:
```json
{
  "running": true,
  "stats": {
    "total_trades": 10,
    "winners": 7,
    "losers": 3,
    "win_rate": 70.0,
    "total_pnl": 125.50,
    "balance": 10125.50,
    "drawdown": 2.1
  },
  "active_trades": 2,
  "trades": [...],
  "timestamp": "2024-01-15T10:30:00"
}
```

#### Get Trades
```
GET /api/trades
```

#### Close Specific Trade
```
POST /api/close-trade/{trade_id}
```

### WebSocket Events

The bot broadcasts real-time updates via WebSocket:

```javascript
// Connect
const ws = new WebSocket('wss://your-backend.railway.app');

// Listen for updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Status update - bot stats, active trades
  if (data.type === 'status_update') {
    console.log(data.payload.stats);
  }
  
  // Indicator update - live indicator values
  if (data.type === 'indicator_update') {
    console.log(`${data.payload.symbol}: RSI=${data.payload.indicators.rsi}`);
  }
};
```

---

## 🔧 ENVIRONMENT VARIABLES (Cloud)

On Railway, set these in Project Settings → Variables:

```
PORT=5000
LOG_LEVEL=INFO
```

---

## 📝 EXAMPLE CONFIG FILE

**File: `config.json`**
```json
{
  "mt5": {
    "login": 123456,
    "password": "your_password",
    "server": "XMGlobal-Demo"
  },
  "trading": {
    "symbols": ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"],
    "timeframes": {
      "EURUSD": 15,
      "GBPUSD": 15,
      "USDJPY": 5,
      "AUDUSD": 30
    },
    "lot_size": {
      "EURUSD": 0.1,
      "GBPUSD": 0.1,
      "USDJPY": 0.05,
      "AUDUSD": 0.08
    },
    "max_trades": 5,
    "risk_per_trade": 2.0
  },
  "indicators": {
    "rsi_period": 14,
    "ma_period": 20,
    "macd_enabled": true
  }
}
```

---

## 🐛 TROUBLESHOOTING

### "Connection failed: Failed to fetch"
- Check if backend is running/deployed
- Verify API URL is correct
- Check CORS settings (should be enabled)

### "MT5 initialization failed"
- Verify login/password are correct
- Check server name matches your broker
- Ensure MT5 is installed on local machine

### "No indicators calculated"
- Check symbol is valid (e.g., "EURUSD", not "EU")
- Verify timeframe (in minutes: 1, 5, 15, 30, 60)
- Wait for enough candles to be loaded

### Bot not executing trades
- Verify indicator thresholds are realistic
- Check max_trades limit not reached
- Ensure lot size is supported by broker
- Review strategy.py confidence thresholds

### Memory usage increasing
- Limit trade history with database cleanup
- Reduce number of symbols being monitored
- Increase sleep interval in bot loop

---

## 📈 PRODUCTION CHECKLIST

Before running live:

- [ ] Test on demo account first (6-12 hours minimum)
- [ ] Monitor all trades manually initially
- [ ] Set `max_trades` to 1-2 initially
- [ ] Use small lot sizes (0.01-0.05)
- [ ] Set stop loss in bot or broker
- [ ] Monitor logs regularly
- [ ] Have email/SMS alerts (implement yourself)
- [ ] Test bot stop functionality
- [ ] Backup configuration daily
- [ ] Document all custom strategy code

---

## 🚀 SCALING OPTIONS

### Option A: Multiple Strategies
Run separate bot instances for different strategies/symbols

### Option B: Multi-Broker
Deploy multiple backends, one per broker

### Option C: Higher Tier
Upgrade Railway plan for better performance/uptime

---

## 📚 NEXT STEPS

1. **Test locally** with strategy.py examples
2. **Deploy to Railway** for 24/7 operation
3. **Customize strategy** with your trading logic
4. **Run on demo account** for at least 1 week
5. **Gradually increase** lot sizes and positions
6. **Monitor** performance and adjust settings

---

## 💡 TIPS

- **Start small**: Use 0.01-0.05 lot sizes
- **Test long**: Run demo for 2-4 weeks minimum
- **Log everything**: Review bot logs daily
- **Manual override**: Always be able to stop bot
- **Backup settings**: Save config.json regularly
- **Monitor memory**: Cloud resources are limited
- **Use demo first**: Test thoroughly before live trading

---

Need help? Review the strategy examples in strategy.py or check Flask-SocketIO docs for API details.

Happy trading! 🎯
