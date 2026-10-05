#!/usr/bin/env python3
"""
Forex Trading Bot Backend
Connects to MT5, executes strategies, serves real-time data via WebSocket + REST API
"""

import os
import json
import logging
import asyncio
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

import MetaTrader5 as mt5
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import pandas as pd

# ======================== CONFIGURATION ========================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ======================== DATA MODELS ========================

class TradeStatus(str, Enum):
    OPEN = "open"
    CLOSED = "closed"
    PENDING = "pending"

class OrderType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

@dataclass
class BotSettings:
    """Bot configuration"""
    login: int
    password: str
    server: str
    symbols: List[str]
    timeframes: Dict[str, int]  # {"EURUSD": 15, "GBPUSD": 1}
    lot_size: Dict[str, float]  # {"EURUSD": 0.1, "GBPUSD": 0.05}
    indicators: Dict[str, Dict]  # {"rsi_period": 14, "ma_period": 20, ...}
    max_trades: int = 5
    risk_per_trade: float = 2.0

@dataclass
class Trade:
    """Active trade record"""
    id: str
    symbol: str
    order_type: OrderType
    lot_size: float
    entry_price: float
    entry_time: str
    status: TradeStatus
    pnl: float = 0.0
    ticket: Optional[int] = None

class ForexTradingBot:
    """Main bot class"""
    
    def __init__(self):
        self.is_running = False
        self.settings: Optional[BotSettings] = None
        self.trades: Dict[str, Trade] = {}
        self.trade_history: List[Trade] = []
        self.stats = {
            "total_trades": 0,
            "winners": 0,
            "losers": 0,
            "win_rate": 0.0,
            "total_pnl": 0.0,
            "drawdown": 0.0,
            "balance": 0.0
        }
        
    def initialize_mt5(self, login: int, password: str, server: str) -> bool:
        """Connect to MT5"""
        try:
            if not mt5.initialize(
                path=None,  # Use default MT5 path
                login=login,
                password=password,
                server=server
            ):
                logger.error(f"MT5 initialization failed: {mt5.last_error()}")
                return False
            
            account_info = mt5.account_info()
            if account_info:
                self.stats["balance"] = account_info.balance
                logger.info(f"Connected to MT5 - Balance: {account_info.balance}")
                return True
            return False
        except Exception as e:
            logger.error(f"MT5 connection error: {e}")
            return False
    
    def load_settings(self, settings: Dict) -> bool:
        """Load bot settings from config"""
        try:
            self.settings = BotSettings(**settings)
            return True
        except Exception as e:
            logger.error(f"Settings load error: {e}")
            return False
    
    def get_indicators(self, symbol: str, timeframe: int) -> Dict[str, float]:
        """Calculate technical indicators"""
        if not self.settings:
            return {}
        
        try:
            # Get OHLC data
            rates = mt5.copy_rates_from_pos(
                symbol, 
                timeframe, 
                0, 
                200  # Last 200 candles
            )
            
            if rates is None:
                logger.warning(f"No rates for {symbol}")
                return {}
            
            df = pd.DataFrame(rates)
            df['time'] = pd.to_datetime(df['time'], unit='s')
            
            indicators = {}
            
            # RSI
            if "rsi_period" in self.settings.indicators:
                period = self.settings.indicators["rsi_period"]
                delta = df['close'].diff()
                gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
                loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
                rs = gain / loss
                rsi = 100 - (100 / (1 + rs))
                indicators["rsi"] = float(rsi.iloc[-1])
            
            # Moving Averages
            if "ma_period" in self.settings.indicators:
                period = self.settings.indicators["ma_period"]
                indicators["ma"] = float(df['close'].rolling(window=period).mean().iloc[-1])
            
            # MACD
            if "macd_enabled" in self.settings.indicators and self.settings.indicators["macd_enabled"]:
                exp1 = df['close'].ewm(span=12).mean()
                exp2 = df['close'].ewm(span=26).mean()
                macd = exp1 - exp2
                signal = macd.ewm(span=9).mean()
                indicators["macd"] = float(macd.iloc[-1])
                indicators["macd_signal"] = float(signal.iloc[-1])
            
            # Current price
            tick = mt5.symbol_info_tick(symbol)
            if tick:
                indicators["bid"] = tick.bid
                indicators["ask"] = tick.ask
                indicators["price"] = (tick.bid + tick.ask) / 2
            
            return indicators
        except Exception as e:
            logger.error(f"Indicator error for {symbol}: {e}")
            return {}
    
    def execute_trade(self, symbol: str, order_type: OrderType, lot_size: float) -> bool:
        """Execute a market order"""
        try:
            tick = mt5.symbol_info_tick(symbol)
            if not tick:
                logger.error(f"No tick for {symbol}")
                return False
            
            request_dict = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": symbol,
                "volume": lot_size,
                "type": mt5.ORDER_TYPE_BUY if order_type == OrderType.BUY else mt5.ORDER_TYPE_SELL,
                "price": tick.ask if order_type == OrderType.BUY else tick.bid,
                "comment": "Bot trade",
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            
            result = mt5.order_send(request_dict)
            
            if result.retcode != mt5.TRADE_RETCODE_DONE:
                logger.error(f"Order failed: {result.retcode}")
                return False
            
            trade = Trade(
                id=f"{symbol}_{datetime.now().timestamp()}",
                symbol=symbol,
                order_type=order_type,
                lot_size=lot_size,
                entry_price=result.price,
                entry_time=datetime.now().isoformat(),
                status=TradeStatus.OPEN,
                ticket=result.order
            )
            
            self.trades[trade.id] = trade
            logger.info(f"Trade opened: {trade.id} - {order_type} {lot_size} {symbol}")
            return True
        except Exception as e:
            logger.error(f"Trade execution error: {e}")
            return False
    
    def close_trade(self, trade_id: str) -> bool:
        """Close an open trade"""
        try:
            if trade_id not in self.trades:
                return False
            
            trade = self.trades[trade_id]
            if trade.status != TradeStatus.OPEN:
                return False
            
            tick = mt5.symbol_info_tick(trade.symbol)
            if not tick:
                return False
            
            # Close position
            close_type = mt5.ORDER_TYPE_SELL if trade.order_type == OrderType.BUY else mt5.ORDER_TYPE_BUY
            request_dict = {
                "action": mt5.TRADE_ACTION_DEAL,
                "symbol": trade.symbol,
                "volume": trade.lot_size,
                "type": close_type,
                "price": tick.bid if trade.order_type == OrderType.BUY else tick.ask,
                "position": trade.ticket,
                "comment": "Bot close",
                "type_time": mt5.ORDER_TIME_GTC,
                "type_filling": mt5.ORDER_FILLING_IOC,
            }
            
            result = mt5.order_send(request_dict)
            
            if result.retcode == mt5.TRADE_RETCODE_DONE:
                trade.status = TradeStatus.CLOSED
                current_price = (tick.bid + tick.ask) / 2
                trade.pnl = (current_price - trade.entry_price) * trade.lot_size
                if trade.order_type == OrderType.SELL:
                    trade.pnl = -trade.pnl
                
                self.trade_history.append(trade)
                del self.trades[trade_id]
                
                # Update stats
                self.stats["total_trades"] += 1
                if trade.pnl > 0:
                    self.stats["winners"] += 1
                else:
                    self.stats["losers"] += 1
                self.stats["total_pnl"] += trade.pnl
                self.stats["win_rate"] = (self.stats["winners"] / self.stats["total_trades"] * 100) if self.stats["total_trades"] > 0 else 0
                
                logger.info(f"Trade closed: {trade_id} - PnL: {trade.pnl}")
                return True
            return False
        except Exception as e:
            logger.error(f"Close trade error: {e}")
            return False
    
    def get_status(self) -> Dict[str, Any]:
        """Get current bot status"""
        return {
            "running": self.is_running,
            "stats": self.stats,
            "active_trades": len(self.trades),
            "trades": [asdict(t) for t in self.trades.values()],
            "timestamp": datetime.now().isoformat()
        }

# ======================== FLASK APP ========================

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

bot = ForexTradingBot()
bot_thread: Optional[threading.Thread] = None

def bot_loop():
    """Main bot trading loop - runs in separate thread"""
    while bot.is_running:
        try:
            if not bot.settings:
                asyncio.sleep(5)
                continue
            
            # Check each symbol
            for symbol in bot.settings.symbols:
                timeframe = bot.settings.timeframes.get(symbol, 15)
                
                # Get indicators
                indicators = bot.get_indicators(symbol, timeframe)
                
                if not indicators:
                    continue
                
                # TODO: Implement your custom strategy logic here
                # Example:
                # if indicators['rsi'] < 30:
                #     bot.execute_trade(symbol, OrderType.BUY, bot.settings.lot_size[symbol])
                # elif indicators['rsi'] > 70:
                #     bot.execute_trade(symbol, OrderType.SELL, bot.settings.lot_size[symbol])
                
                # Emit update via WebSocket
                socketio.emit('indicator_update', {
                    'symbol': symbol,
                    'indicators': indicators,
                    'timestamp': datetime.now().isoformat()
                }, broadcast=True)
            
            # Update trade status
            socketio.emit('status_update', bot.get_status(), broadcast=True)
            
            asyncio.sleep(5)  # Check every 5 seconds
        except Exception as e:
            logger.error(f"Bot loop error: {e}")
            asyncio.sleep(5)

# ======================== API ROUTES ========================

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "timestamp": datetime.now().isoformat()})

@app.route('/api/settings', methods=['GET', 'POST'])
def settings_route():
    if request.method == 'GET':
        return jsonify(asdict(bot.settings) if bot.settings else {})
    
    settings = request.json
    if bot.load_settings(settings):
        # Try MT5 connection
        if bot.initialize_mt5(
            settings['login'],
            settings['password'],
            settings['server']
        ):
            return jsonify({"success": True, "message": "Settings saved and MT5 connected"})
        else:
            return jsonify({"success": False, "message": "MT5 connection failed"}), 400
    return jsonify({"success": False, "message": "Invalid settings"}), 400

@app.route('/api/bot/start', methods=['POST'])
def start_bot():
    global bot_thread
    
    if bot.is_running:
        return jsonify({"success": False, "message": "Bot already running"}), 400
    
    if not bot.settings:
        return jsonify({"success": False, "message": "Settings not configured"}), 400
    
    bot.is_running = True
    bot_thread = threading.Thread(target=bot_loop, daemon=True)
    bot_thread.start()
    
    logger.info("Bot started")
    return jsonify({"success": True, "message": "Bot started"})

@app.route('/api/bot/stop', methods=['POST'])
def stop_bot():
    bot.is_running = False
    logger.info("Bot stopped")
    return jsonify({"success": True, "message": "Bot stopped"})

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(bot.get_status())

@app.route('/api/trades', methods=['GET'])
def get_trades():
    return jsonify({
        "active": [asdict(t) for t in bot.trades.values()],
        "history": [asdict(t) for t in bot.trade_history[-100:]]  # Last 100 trades
    })

@app.route('/api/close-trade/<trade_id>', methods=['POST'])
def close_trade(trade_id):
    if bot.close_trade(trade_id):
        return jsonify({"success": True})
    return jsonify({"success": False}), 400

# ======================== WEBSOCKET EVENTS ========================

@socketio.on('connect')
def handle_connect():
    logger.info(f"Client connected: {request.sid}")
    emit('status_update', bot.get_status())

@socketio.on('disconnect')
def handle_disconnect():
    logger.info(f"Client disconnected: {request.sid}")

# ======================== MAIN ========================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=False)
