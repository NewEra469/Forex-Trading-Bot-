# ⚡ Forex Trading Bot - 5 Minute Quick Start

## 🎯 Choose Your Path

### Path A: Test Locally (Windows/Mac/Linux) - 5 minutes
### Path B: Deploy to Cloud (24/7 Running) - 10 minutes

---

## 📦 Path A: LOCAL TESTING

### Step 1: Install Python
- Download: https://www.python.org/downloads/
- Install Python 3.9+ (check "Add Python to PATH")

### Step 2: Setup Project
```bash
# Create folder and enter
mkdir forex-bot
cd forex-bot

# Copy all files here from repository
# Especially: bot_backend.py, requirements.txt, strategy.py
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Start Bot
```bash
python bot_backend.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
 * WARNING: This is a development server
```

### Step 5: Open Dashboard
Visit: **http://localhost:5000**

### Step 6: Configure
1. Click "⚙️ Settings" tab
2. Enter MT5 login/password/server
3. Keep default symbols (EURUSD, GBPUSD, USDJPY)
4. Click "Save Settings & Connect"

### Step 7: Start Trading
Click "Start Bot" → Watch it trade!

---

## 🌐 Path B: DEPLOY TO CLOUD (Production)

### Why Cloud?
✅ Runs 24/7 without your computer  
✅ No VPS installation needed  
✅ Free tier available  
✅ Auto-scaling  
✅ Better reliability  

### Step 1: Prepare on GitHub

```bash
# Create GitHub account (free): https://github.com

# Create new repo called: forex-trading-bot

# Upload these files to repo:
- bot_backend.py
- requirements.txt  
- strategy.py
- Procfile (see below)
- runtime.txt (see below)
- dashboard.html
```

**Create Procfile** (no extension, exact name):
```
web: gunicorn --worker-class=geventwebsocket.gunicorn.workers.GeventWebSocketWorker --bind 0.0.0.0:$PORT bot_backend:app
```

**Create runtime.txt**:
```
python-3.11.8
```

### Step 2: Deploy on Railway

1. Go to: https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"  
4. Choose your `forex-trading-bot` repo
5. Wait 2-3 minutes...
6. ✅ Done! Your bot is live!

### Step 3: Get Live URL
Railway shows you: `https://your-bot-xxxxx.railway.app`

**This is your live bot backend!**

### Step 4: Open Dashboard
Visit your Railway URL in browser

### Step 5: Same Configuration
Enter MT5 credentials, start bot → 24/7 trading! 🎉

---

## 🔧 Configuration Cheat Sheet

### MT5 Credentials
```
Login:    Your MT5 account number (e.g., 123456)
Password: Your MT5 password
Server:   Your broker server (e.g., "XMGlobal-Demo")
```

Common brokers:
- XM Global: `XMGlobal-Demo` or `XMGlobal-Real`
- Exness: `Exness-MT5` or similar
- ICMarkets: `ICMarkets-Demo`

### Default Settings
```
Symbols:     EURUSD, GBPUSD, USDJPY
Timeframes:  15 min (M15)
Lot Size:    0.1 (micro lot)
Max Trades:  5 open positions
RSI Period:  14 (standard)
MA Period:   20 (standard)
```

### Indicator Settings
```json
{
  "rsi_period": 14,        // RSI sensitivity (lower=more signals)
  "ma_period": 20,         // Moving average period
  "macd_enabled": true     // Use MACD signals
}
```

---

## 🚀 Quick API Reference

### Start Trading
```
POST /api/bot/start
```

### Stop Trading
```
POST /api/bot/stop
```

### Get Status
```
GET /api/status
```

### Get Trades
```
GET /api/trades
```

### Close Trade
```
POST /api/close-trade/{trade_id}
```

---

## 🎯 Example Workflows

### Workflow 1: Test Strategy
```
1. Run locally: python bot_backend.py
2. Use DEMO account (not real money!)
3. Run for 24 hours minimum
4. Review results in dashboard
5. Adjust strategy if needed
6. Repeat until satisfied
```

### Workflow 2: Go Live
```
1. Deploy to Railway ✅
2. Connect with DEMO account first
3. Run demo for 1 week
4. Switch to small REAL account (0.01-0.05 lot)
5. Monitor daily for 1 month
6. Gradually increase lot sizes
```

### Workflow 3: Multiple Strategies
```
1. Deploy Bot A (RSI strategy) → Symbol: EURUSD
2. Deploy Bot B (MA strategy) → Symbol: GBPUSD
3. Deploy Bot C (MACD strategy) → Symbol: USDJPY
4. Each runs independently 24/7
5. Aggregate results in one dashboard
```

---

## 📊 Dashboard Tabs Explained

### 📊 Dashboard Tab
- **Stats**: Win rate, total profit, active trades
- **Active Trades**: Current open positions
- **Live Indicators**: Real-time RSI, MA, MACD values

### ⚙️ Settings Tab
- **MT5 Connection**: Broker credentials
- **Indicator Settings**: RSI, MA, MACD parameters
- **Symbol Configuration**: Which pairs to trade, lot sizes

### 📈 Trades Tab
- **Trade History**: All closed trades
- **P&L**: Profit/loss per trade
- **Timestamps**: When each trade executed

### 📋 Logs Tab
- **Real-time Logs**: Every action recorded
- **Connection Status**: MT5 connection health
- **Error Messages**: Troubleshooting info

---

## ⚠️ Important Notes

### Before First Trade
- [ ] Test on DEMO account only
- [ ] Run for minimum 24 hours
- [ ] Monitor every trade
- [ ] Review logs for errors
- [ ] Have manual stop button ready

### Risk Management
- Start with 0.01-0.05 lot sizes
- Max 3-5 open positions
- Use stop loss limits
- Never risk more than 2% per trade
- Withdrawals only after 1+ month profit

### Troubleshooting

**"Connection failed"**
- Is backend running?
- Check API URL correct
- Review browser console (F12)

**"MT5 auth failed"**
- Verify login/password
- Check broker server name
- Ensure account not locked

**"No trades executing"**
- Check indicator thresholds
- Review strategy logs
- Verify symbols exist on broker
- Check market hours (forex 24/5)

**"Dashboard lags"**
- Reduce number of symbols
- Increase check interval
- Restart bot

---

## 📈 Performance Optimization

### For Better Results

1. **Test Different Strategies**
   - See: `strategy.py` for examples
   - Combine indicators for confirmation
   - Backtest before deploying

2. **Adjust Indicator Settings**
   - Lower RSI period = more trades (riskier)
   - Higher MA period = slower response (safer)
   - Add MACD for confirmation

3. **Optimize Symbol Selection**
   - Trade major pairs (EURUSD, GBPUSD, USDJPY)
   - Avoid exotic pairs (wider spreads)
   - Stick with liquid instruments

4. **Risk Management**
   - Set max drawdown limit
   - Use partial position sizing
   - Scale in/out of trades

---

## 💻 System Requirements

### Local Testing
- Python 3.9+
- 500MB disk space
- MT5 installed locally (only for local testing)
- 2GB RAM minimum

### Cloud Deployment
- GitHub account (free)
- Railway account (free tier $5/month credit)
- No other requirements!

---

## 🔐 Security Notes

### MT5 Credentials
- Stored locally in browser (not sent to cloud)
- Never share your password
- Use demo account first
- Change password if shared

### API Security
- Use HTTPS in production
- Limit bot access to demo account initially
- Monitor account activity
- Set IP whitelist if available

---

## 📞 Getting Help

### Common Questions

**Q: Can bot run on my old laptop?**
A: For testing yes, but deploy to cloud for 24/7 (no laptop needed then)

**Q: How much does it cost?**
A: Free to code, Railway costs $5/month, broker fees vary

**Q: Can I trade multiple symbols?**
A: Yes! Add them in Settings → Trading Symbols

**Q: Can I modify the strategy?**
A: Yes! Edit `strategy.py` and redeploy

**Q: What if my internet goes down?**
A: Cloud bot keeps running, you just can't see dashboard

---

## 🎯 Next Steps

### Right Now
1. Pick local or cloud
2. Follow setup steps
3. Add your MT5 credentials
4. Click "Start Bot"

### This Week
1. Run on demo account
2. Watch for 24+ hours
3. Review results
4. Adjust settings if needed

### This Month
1. Run demo for 1 full week
2. Consider live account (small)
3. Start with 0.01 lot size
4. Monitor daily

### This Quarter
1. Consistent demo profits?
2. Increase lot sizes gradually
3. Document your system
4. Consider multiple strategies

---

## 💡 Pro Tips

✅ **Start with demo** - Always test before real money
✅ **Use small lots** - 0.01-0.05 minimum
✅ **Monitor daily** - Review logs, check performance
✅ **Keep records** - Document every trade
✅ **Test strategies** - Try examples in strategy.py
✅ **Scale slowly** - Increase lots only after profits
✅ **Use stop loss** - Protect yourself always
✅ **Have exit plan** - Know when to stop bot

---

## 📚 File Descriptions

| File | Purpose |
|------|---------|
| `bot_backend.py` | Main bot engine + API server |
| `strategy.py` | Trading strategy templates |
| `dashboard.html` | Web interface (served by backend) |
| `requirements.txt` | Python dependencies |
| `Procfile` | Cloud deployment config |
| `runtime.txt` | Python version (cloud) |
| `config-template.json` | Configuration template |
| `README.md` | Full documentation |
| `DEPLOYMENT_GUIDE.md` | Detailed setup guide |

---

## 🚀 Ready to Start?

### Option 1: Local (Right Now)
```bash
pip install -r requirements.txt
python bot_backend.py
# Then open http://localhost:5000
```

### Option 2: Cloud (Do Today)
```bash
1. Create GitHub repo
2. Upload files
3. Connect to Railway
4. Done! Bot runs 24/7
```

**Choose your path and get started! 🎉**

Questions? See:
- `README.md` - Full feature list
- `DEPLOYMENT_GUIDE.md` - Detailed instructions
- `strategy.py` - Strategy examples
- Activity logs in dashboard - Real-time debugging

---

**Happy trading! 📈🎯**
