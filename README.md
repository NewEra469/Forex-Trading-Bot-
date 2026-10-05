# 🚀 24/7 Automated Forex Trading Bot

A **production-ready, cloud-deployed trading bot** that runs continuously without VPS or Windows installation. Built with Python backend, React dashboard, and MT5 integration.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

✅ **24/7 Cloud Operation** - Runs on free Railway.app tier  
✅ **Real-Time Dashboard** - React UI with live indicators & trade monitoring  
✅ **Custom Strategies** - Modular strategy framework for any logic  
✅ **MT5 Integration** - Direct broker connection via MetaTrader5 API  
✅ **No VPS Required** - Deploy in minutes, auto-scaling infrastructure  
✅ **WebSocket Updates** - Real-time trade feeds & indicators  
✅ **Trade Management** - Open/close positions, view P&L, trade history  
✅ **Risk Controls** - Max positions, lot size, drawdown limits  

---

## 🎯 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  React Dashboard (Browser) - Real-time UI                   │
│  - Settings panel                                           │
│  - Live indicators                                          │
│  - Active trades                                            │
│  - Trade history & stats                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ WebSocket/REST API
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Python Backend (Railway Cloud) - Bot Logic                 │
│  - MT5 connection manager                                   │
│  - Strategy engine                                          │
│  - Trade executor                                           │
│  - Indicator calculator                                     │
│  - WebSocket broadcaster                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ MT5 API
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  MetaTrader5 (Your Broker)                                  │
│  - Real market data (24/5)                                  │
│  - Live order execution                                     │
│  - Account balance & positions                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 What You Get

```
forex-trading-bot/
├── bot_backend.py          # Main Flask API + WebSocket server
├── strategy.py             # Custom strategy framework + examples
├── dashboard.jsx           # React dashboard component
├── requirements.txt        # Python dependencies
├── config-template.json    # Configuration template
├── Procfile                # Railway deployment config
├── runtime.txt             # Python version spec
├── DEPLOYMENT_GUIDE.md     # Complete setup instructions
└── README.md              # This file
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Prepare Files

```bash
# Create project folder
mkdir forex-bot && cd forex-bot

# Copy all files from this repo to folder
```

### Step 2: Test Locally (Optional)

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start backend
python bot_backend.py

# Open browser: http://localhost:5000
```

### Step 3: Deploy to Cloud (Production)

**Use Railway.app** (free tier, 24/7 uptime):

1. Create GitHub account: https://github.com
2. Push files to GitHub repo
3. Connect to Railway: https://railway.app
4. Deploy automatically in 2 minutes
5. Get live URL: `https://your-bot-xxx.railway.app`

### Step 4: Configure Bot

In dashboard → Settings:
- Enter MT5 credentials
- Select trading symbols
- Set timeframes & lot sizes
- Configure indicators
- Click "Save & Connect"

### Step 5: Start Trading

Click "Start Bot" → Bot runs 24/7! 🎉

---

## 📊 Dashboard Features

### Real-Time Monitoring
- **Performance Stats**: Win rate, P&L, drawdown
- **Active Trades**: Current positions, entry prices, P&L
- **Live Indicators**: RSI, Moving Averages, MACD values
- **Trade Feed**: Execution history with timestamps

### Trading Controls
- ⏯️ **Start/Stop Bot** - Toggle automation
- 🔧 **Settings Panel** - Adjust parameters without restart
- ⚙️ **Symbol Configuration** - Add/remove trading pairs
- 📈 **Indicator Tuning** - Customize technical indicators
- 🔐 **Secure Auth** - MT5 credentials stored locally

### Trade Management
- 📋 View all active positions
- ❌ Close trades manually anytime
- 📊 Historical performance data
- 💾 Activity logs & execution times

---

## 🎓 Strategy Examples

### Simple RSI Strategy
```python
# Buy when RSI < 30, Sell when RSI > 70
from strategy import RSIStrategy

strategy = RSIStrategy({"rsi_period": 14})
signal = strategy.generate_signal("EURUSD", indicators)
# Returns: BUY with confidence 0.8
```

### Moving Average Crossover
```python
# Buy when price crosses above MA
from strategy import MovingAverageCrossover

strategy = MovingAverageCrossover({"ma_period": 20})
signal = strategy.generate_signal("EURUSD", indicators)
# Returns: BUY with confidence 0.7
```

### MACD Strategy
```python
# Buy on MACD bullish crossover
from strategy import MACDStrategy

strategy = MACDStrategy({"macd_fast": 12, "macd_slow": 26})
signal = strategy.generate_signal("EURUSD", indicators)
# Returns: SELL with confidence 0.65
```

### Combine Multiple Signals
```python
# Need RSI + MA + MACD confirmation for stronger signals
from strategy import CombinedStrategy

strategy = CombinedStrategy(config)
signal = strategy.generate_signal("EURUSD", indicators)
# Returns: Strong BUY (all signals agree)
```

**→ Create your own!** See `strategy.py` for template.

---

## 🔌 API Reference

### HTTP Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/settings` | Save MT5 credentials & config |
| POST | `/api/bot/start` | Start automated trading |
| POST | `/api/bot/stop` | Stop automated trading |
| GET | `/api/status` | Get current bot status |
| GET | `/api/trades` | Get active + historical trades |
| POST | `/api/close-trade/{id}` | Close specific trade |

### WebSocket Events

```javascript
// Real-time status updates
socket.on('status_update', (data) => {
  console.log(data.stats.total_pnl);  // Total profit/loss
  console.log(data.active_trades);     // Number of open positions
});

// Live indicator values
socket.on('indicator_update', (data) => {
  console.log(`${data.symbol}: RSI=${data.indicators.rsi}`);
});
```

---

## 🔧 Configuration Guide

### Trading Parameters

```json
{
  "symbols": ["EURUSD", "GBPUSD"],
  "timeframes": {"EURUSD": 15, "GBPUSD": 5},
  "lot_size": {"EURUSD": 0.1, "GBPUSD": 0.05},
  "max_trades": 5,
  "risk_per_trade": 2
}
```

- **symbols**: Currency pairs to trade
- **timeframes**: Candle period in minutes (1, 5, 15, 30, 60, 240, 1440)
- **lot_size**: Position size per trade
- **max_trades**: Maximum concurrent open positions
- **risk_per_trade**: Risk percentage per trade

### Indicator Settings

```json
{
  "rsi_period": 14,
  "ma_period": 20,
  "macd_enabled": true
}
```

Adjust these values in dashboard without restarting bot.

---

## 🚨 Risk Management

### Before Going Live

1. **Test on Demo** - Run 2-4 weeks on demo account
2. **Start Small** - Use 0.01-0.05 lot sizes initially
3. **Monitor Closely** - Review logs daily for first month
4. **Gradual Scale** - Increase lots only after consistent profits
5. **Set Limits** - Max drawdown, stop loss, take profit

### Safety Features

- ✅ Max positions limit (prevents over-exposure)
- ✅ Confidence threshold (ignores weak signals)
- ✅ Lot size controls (risk per trade)
- ✅ Manual override (stop bot anytime)
- ✅ Trade audit log (all executions recorded)

---

## 🌐 Deployment Options

### ⭐ Recommended: Railway.app
- **Cost**: Free tier ($5/month credit)
- **Uptime**: 99.9%
- **Setup**: 2 minutes
- **Scaling**: Auto-scales with usage
- **Logs**: Real-time monitoring

**[See DEPLOYMENT_GUIDE.md for Railway setup]**

### Alternative: Heroku, Render, AWS
- Follow similar Docker/buildpack process
- Requires more configuration
- Generally paid tier after free trial

---

## 📈 Performance Tips

1. **Reduce symbol count** - Monitor fewer pairs per bot
2. **Increase check interval** - Less frequent updates = lower latency
3. **Limit trade history** - Archive old trades to DB
4. **Optimize indicators** - Cache calculations when possible
5. **Use higher timeframes** - 30+ minute candles = fewer calculations

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection failed" | Check backend URL, verify server running |
| "MT5 auth failed" | Verify login/password/server correct |
| "No trades executing" | Check indicator values, confidence threshold |
| "Dashboard shows lag" | Reduce symbols, increase update interval |
| "High memory usage" | Limit trade history, restart bot |
| "Trades closing immediately" | Review strategy logic, add delays |

**Full troubleshooting:** See `DEPLOYMENT_GUIDE.md` → Troubleshooting section

---

## 📚 Learning Resources

- **MetaTrader5 Python API**: https://www.mql5.com/en/docs/integration/python_metatrader5
- **Technical Indicators**: https://en.wikipedia.org/wiki/Technical_analysis
- **Flask Documentation**: https://flask.palletsprojects.com/
- **React Hooks**: https://react.dev/reference/react/hooks
- **WebSocket Guide**: https://socket.io/docs/

---

## 🤝 Contributing

Have an improvement? 
1. Test thoroughly on demo first
2. Document your strategy
3. Add error handling
4. Update logs appropriately

---

## ⚠️ Disclaimer

**Trading involves risk.** This bot is provided as-is for educational purposes. 

- Test extensively on demo accounts first
- Past performance ≠ future results
- Start with minimal capital
- Never trade with money you can't afford to lose
- Implement additional risk controls per your risk tolerance
- Monitor bot regularly, don't set and forget

---

## 📞 Support & Questions

### Common Questions

**Q: Can I run multiple bots?**  
A: Yes! Deploy separate backends for different strategies/brokers

**Q: Does it work on mobile?**  
A: Dashboard is responsive, view stats on your phone

**Q: How much does it cost?**  
A: Free for development, $5/month on Railway for production

**Q: What if my internet goes down?**  
A: Bot continues running in cloud, you just can't monitor dashboard

---

## 🎯 Roadmap

- [ ] Email/SMS alerts for trade execution
- [ ] Database persistence (trade history)
- [ ] Advanced charting (TradingView integration)
- [ ] Machine learning strategy optimization
- [ ] Multi-broker support
- [ ] Mobile app (iOS/Android)

---

## 📄 License

MIT License - Free for commercial use

---

## 🚀 Get Started Now!

1. **5 min setup**: `python bot_backend.py`
2. **2 min deploy**: Push to Railway
3. **24/7 trading**: Bot runs automatically

[→ See DEPLOYMENT_GUIDE.md for step-by-step]

---

**Built with ❤️ for forex traders**

Need help? Check the troubleshooting section or review the strategy examples in `strategy.py`
