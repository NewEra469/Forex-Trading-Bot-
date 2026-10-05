"""
Custom Strategy Template
Modify this file with your own trading logic

Example: RSI + Moving Average Strategy
"""

from typing import Dict, Optional
from dataclasses import dataclass
from enum import Enum

class OrderType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

@dataclass
class SignalResult:
    """Trading signal result"""
    order_type: Optional[OrderType] = None
    confidence: float = 0.0  # 0-1
    reason: str = ""

class Strategy:
    """Base strategy class - extend this"""
    
    def __init__(self, indicators_config: Dict):
        self.config = indicators_config
    
    def generate_signal(self, symbol: str, indicators: Dict) -> SignalResult:
        """
        Generate a trading signal based on indicators
        
        Args:
            symbol: Trading symbol (e.g., "EURUSD")
            indicators: Dict with calculated indicators:
                - rsi: 0-100
                - ma: Moving average price
                - macd: MACD value
                - macd_signal: Signal line
                - bid/ask: Current prices
        
        Returns:
            SignalResult with order_type and confidence
        """
        raise NotImplementedError("Override generate_signal() method")

# ======================== EXAMPLE STRATEGIES ========================

class RSIStrategy(Strategy):
    """Simple RSI-based strategy"""
    
    def generate_signal(self, symbol: str, indicators: Dict) -> SignalResult:
        if 'rsi' not in indicators:
            return SignalResult()
        
        rsi = indicators['rsi']
        
        # Buy when RSI < 30 (oversold)
        if rsi < 30:
            return SignalResult(
                order_type=OrderType.BUY,
                confidence=min((30 - rsi) / 30, 1.0),
                reason=f"RSI oversold: {rsi:.2f}"
            )
        
        # Sell when RSI > 70 (overbought)
        elif rsi > 70:
            return SignalResult(
                order_type=OrderType.SELL,
                confidence=min((rsi - 70) / 30, 1.0),
                reason=f"RSI overbought: {rsi:.2f}"
            )
        
        return SignalResult()

class MovingAverageCrossover(Strategy):
    """MA crossover strategy"""
    
    def generate_signal(self, symbol: str, indicators: Dict) -> SignalResult:
        if 'price' not in indicators or 'ma' not in indicators:
            return SignalResult()
        
        price = indicators['price']
        ma = indicators['ma']
        
        # Buy when price crosses above MA
        if price > ma * 1.001:  # 0.1% above MA
            return SignalResult(
                order_type=OrderType.BUY,
                confidence=0.7,
                reason=f"Price above MA (price: {price:.5f}, MA: {ma:.5f})"
            )
        
        # Sell when price crosses below MA
        elif price < ma * 0.999:
            return SignalResult(
                order_type=OrderType.SELL,
                confidence=0.7,
                reason=f"Price below MA (price: {price:.5f}, MA: {ma:.5f})"
            )
        
        return SignalResult()

class MACDStrategy(Strategy):
    """MACD-based strategy"""
    
    def generate_signal(self, symbol: str, indicators: Dict) -> SignalResult:
        if 'macd' not in indicators or 'macd_signal' not in indicators:
            return SignalResult()
        
        macd = indicators['macd']
        signal = indicators['macd_signal']
        
        # Buy when MACD crosses above signal
        if macd > signal and (macd - signal) > 0.0001:
            confidence = min(abs(macd - signal) / 0.001, 1.0)
            return SignalResult(
                order_type=OrderType.BUY,
                confidence=confidence,
                reason=f"MACD bullish crossover"
            )
        
        # Sell when MACD crosses below signal
        elif macd < signal and (signal - macd) > 0.0001:
            confidence = min(abs(signal - macd) / 0.001, 1.0)
            return SignalResult(
                order_type=OrderType.SELL,
                confidence=confidence,
                reason=f"MACD bearish crossover"
            )
        
        return SignalResult()

class CombinedStrategy(Strategy):
    """Combine multiple signals for stronger confirmation"""
    
    def __init__(self, indicators_config: Dict):
        super().__init__(indicators_config)
        self.rsi_strategy = RSIStrategy(indicators_config)
        self.ma_strategy = MovingAverageCrossover(indicators_config)
        self.macd_strategy = MACDStrategy(indicators_config)
    
    def generate_signal(self, symbol: str, indicators: Dict) -> SignalResult:
        """Use multiple strategies and combine signals"""
        
        signals = []
        
        # Get signals from each strategy
        rsi_signal = self.rsi_strategy.generate_signal(symbol, indicators)
        if rsi_signal.order_type:
            signals.append((rsi_signal, 0.3))  # 30% weight
        
        ma_signal = self.ma_strategy.generate_signal(symbol, indicators)
        if ma_signal.order_type:
            signals.append((ma_signal, 0.3))  # 30% weight
        
        macd_signal = self.macd_strategy.generate_signal(symbol, indicators)
        if macd_signal.order_type:
            signals.append((macd_signal, 0.4))  # 40% weight
        
        if not signals:
            return SignalResult()
        
        # Check if all signals agree
        order_types = [s[0].order_type for s in signals]
        if len(set(order_types)) == 1:  # All same signal
            weighted_confidence = sum(s[0].confidence * w for s, w in signals)
            return SignalResult(
                order_type=order_types[0],
                confidence=min(weighted_confidence, 1.0),
                reason="Multi-indicator confirmation"
            )
        
        return SignalResult()

# ======================== USAGE ========================

# In your bot backend, use it like:
"""
from strategy import CombinedStrategy

strategy = CombinedStrategy(bot.settings.indicators)

# In bot loop:
signal = strategy.generate_signal(symbol, indicators)
if signal.order_type and signal.confidence > 0.5:
    bot.execute_trade(symbol, signal.order_type, lot_size)
"""
