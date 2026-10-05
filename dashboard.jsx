import React, { useState, useEffect, useRef } from 'react';
import { Play, StopCircle, Settings, TrendingUp, TrendingDown, Zap, AlertCircle } from 'lucide-react';

const ForexTradingDashboard = () => {
  const [apiUrl, setApiUrl] = useState('http://localhost:5000');
  const [botRunning, setBotRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    total_trades: 0,
    winners: 0,
    losers: 0,
    win_rate: 0,
    total_pnl: 0,
    balance: 0,
    active_trades: 0
  });

  const [settings, setSettings] = useState({
    login: '',
    password: '',
    server: '',
    symbols: ['EURUSD', 'GBPUSD', 'USDJPY'],
    timeframes: { EURUSD: 15, GBPUSD: 15, USDJPY: 15 },
    lot_size: { EURUSD: 0.1, GBPUSD: 0.1, USDJPY: 0.1 },
    indicators: {
      rsi_period: 14,
      ma_period: 20,
      macd_enabled: true
    },
    max_trades: 5,
    risk_per_trade: 2
  });

  const [trades, setTrades] = useState({ active: [], history: [] });
  const [indicators, setIndicators] = useState({});
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
    const wsUrl = apiUrl.replace('http', 'ws');
    
    wsRef.current = new WebSocket(`${protocol}://${new URL(apiUrl).host}`);
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'status_update') {
        setStats(data.payload?.stats || stats);
      } else if (data.type === 'indicator_update') {
        setIndicators(prev => ({
          ...prev,
          [data.payload?.symbol]: data.payload?.indicators
        }));
      }
    };

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [apiUrl]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev.slice(-99), {
      time: new Date().toLocaleTimeString(),
      message,
      type
    }]);
  };

  const saveSettings = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await response.json();
      if (data.success) {
        addLog('Settings saved & MT5 connected', 'success');
      } else {
        addLog(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    }
  };

  const startBot = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/bot/start`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setBotRunning(true);
        addLog('Bot started successfully', 'success');
      } else {
        addLog(`Start failed: ${data.message}`, 'error');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    }
  };

  const stopBot = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/bot/stop`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setBotRunning(false);
        addLog('Bot stopped', 'warning');
      }
    } catch (error) {
      addLog(`Error: ${error.message}`, 'error');
    }
  };

  const closeTrade = async (tradeId) => {
    try {
      const response = await fetch(`${apiUrl}/api/close-trade/${tradeId}`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        addLog(`Trade ${tradeId} closed`, 'info');
      }
    } catch (error) {
      addLog(`Error closing trade: ${error.message}`, 'error');
    }
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSymbolSetting = (symbol, key, value) => {
    if (key === 'timeframe') {
      setSettings(prev => ({
        ...prev,
        timeframes: { ...prev.timeframes, [symbol]: parseInt(value) }
      }));
    } else if (key === 'lot_size') {
      setSettings(prev => ({
        ...prev,
        lot_size: { ...prev.lot_size, [symbol]: parseFloat(value) }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Forex Trading Bot
            </h1>
            <p className="text-sm text-slate-400 mt-1">24/7 Automated Trading Dashboard</p>
          </div>
          <div className="flex gap-3">
            {botRunning ? (
              <button
                onClick={stopBot}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
              >
                <StopCircle className="w-5 h-5" />
                Stop Bot
              </button>
            ) : (
              <button
                onClick={startBot}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
              >
                <Play className="w-5 h-5" />
                Start Bot
              </button>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${botRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm">{botRunning ? 'Running' : 'Stopped'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-900 border-b border-slate-700 px-4">
        <div className="max-w-7xl mx-auto flex gap-4">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'trades', label: 'Trades', icon: TrendingDown },
            { id: 'logs', label: 'Logs', icon: AlertCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Trades', value: stats.total_trades, color: 'blue' },
                { label: 'Win Rate', value: `${stats.win_rate.toFixed(1)}%`, color: 'green' },
                { label: 'Total P&L', value: `$${stats.total_pnl.toFixed(2)}`, color: stats.total_pnl >= 0 ? 'green' : 'red' },
                { label: 'Balance', value: `$${stats.balance.toFixed(2)}`, color: 'purple' }
              ].map(stat => (
                <div key={stat.label} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Active Trades */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <h2 className="text-lg font-semibold mb-4">Active Trades ({stats.active_trades})</h2>
              {trades.active.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-slate-400 text-xs uppercase border-b border-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Symbol</th>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-right">Lot Size</th>
                        <th className="px-4 py-2 text-right">Entry Price</th>
                        <th className="px-4 py-2 text-right">P&L</th>
                        <th className="px-4 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {trades.active.map(trade => (
                        <tr key={trade.id} className="hover:bg-slate-700/50">
                          <td className="px-4 py-3 font-semibold">{trade.symbol}</td>
                          <td className={`px-4 py-3 ${trade.order_type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.order_type}
                          </td>
                          <td className="px-4 py-3 text-right">{trade.lot_size}</td>
                          <td className="px-4 py-3 text-right">{trade.entry_price.toFixed(5)}</td>
                          <td className={`px-4 py-3 text-right font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${trade.pnl.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => closeTrade(trade.id)}
                              className="text-xs px-2 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded transition"
                            >
                              Close
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No active trades</p>
              )}
            </div>

            {/* Live Indicators */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <h2 className="text-lg font-semibold mb-4">Live Indicators</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(indicators).slice(0, 6).map(([symbol, ind]) => (
                  <div key={symbol} className="bg-slate-700/50 rounded p-3 border border-slate-600">
                    <p className="font-semibold text-blue-400 mb-2">{symbol}</p>
                    <div className="text-sm space-y-1 text-slate-300">
                      {ind?.rsi && <p>RSI: <span className="text-white font-semibold">{ind.rsi.toFixed(2)}</span></p>}
                      {ind?.price && <p>Price: <span className="text-white font-semibold">{ind.price.toFixed(5)}</span></p>}
                      {ind?.ma && <p>MA: <span className="text-white font-semibold">{ind.ma.toFixed(5)}</span></p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            {/* MT5 Connection */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4">MT5 Connection</h2>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="MT5 Login"
                  value={settings.login}
                  onChange={(e) => updateSettings('login', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="password"
                  placeholder="MT5 Password"
                  value={settings.password}
                  onChange={(e) => updateSettings('password', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Broker Server (e.g., XMGlobal-Demo)"
                  value={settings.server}
                  onChange={(e) => updateSettings('server', e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Indicators */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Indicator Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">RSI Period</label>
                  <input
                    type="number"
                    value={settings.indicators.rsi_period}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      indicators: { ...prev.indicators, rsi_period: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Moving Average Period</label>
                  <input
                    type="number"
                    value={settings.indicators.ma_period}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      indicators: { ...prev.indicators, ma_period: parseInt(e.target.value) }
                    }))}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Symbols Configuration */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <h2 className="text-lg font-semibold mb-4">Trading Symbols</h2>
              <div className="space-y-4">
                {settings.symbols.map(symbol => (
                  <div key={symbol} className="grid grid-cols-3 gap-4 p-4 bg-slate-700/50 rounded">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Symbol</label>
                      <input
                        type="text"
                        value={symbol}
                        disabled
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white opacity-75"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Timeframe (min)</label>
                      <input
                        type="number"
                        value={settings.timeframes[symbol] || 15}
                        onChange={(e) => updateSymbolSetting(symbol, 'timeframe', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Lot Size</label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.lot_size[symbol] || 0.1}
                        onChange={(e) => updateSymbolSetting(symbol, 'lot_size', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={saveSettings}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Save Settings & Connect
            </button>
          </div>
        )}

        {/* TRADES TAB */}
        {activeTab === 'trades' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <h2 className="text-lg font-semibold mb-4">Trade History</h2>
            {trades.history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-slate-400 text-xs uppercase border-b border-slate-700">
                    <tr>
                      <th className="px-4 py-2 text-left">Symbol</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-right">Lot Size</th>
                      <th className="px-4 py-2 text-right">Entry</th>
                      <th className="px-4 py-2 text-right">P&L</th>
                      <th className="px-4 py-2 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {trades.history.map(trade => (
                      <tr key={trade.id} className="hover:bg-slate-700/50">
                        <td className="px-4 py-3 font-semibold">{trade.symbol}</td>
                        <td className={`px-4 py-3 ${trade.order_type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                          {trade.order_type}
                        </td>
                        <td className="px-4 py-3 text-right">{trade.lot_size}</td>
                        <td className="px-4 py-3 text-right">{trade.entry_price.toFixed(5)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${trade.pnl.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-400">
                          {new Date(trade.entry_time).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">No trade history</p>
            )}
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
            <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded ${
                      log.type === 'success'
                        ? 'bg-green-900/30 text-green-300'
                        : log.type === 'error'
                        ? 'bg-red-900/30 text-red-300'
                        : log.type === 'warning'
                        ? 'bg-yellow-900/30 text-yellow-300'
                        : 'bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500">{log.time}</span> {log.message}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-8">No logs yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForexTradingDashboard;
