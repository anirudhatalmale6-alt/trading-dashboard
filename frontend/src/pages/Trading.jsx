import { useState, useEffect } from 'react'
import { AlertTriangle, Star, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { api } from '../utils/api'
import { formatCurrency, formatPnl, pnlColor, formatDateTime } from '../utils/format'

const SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'AUDCAD', 'AUDCHF', 'AUDJPY', 'AUDNZD', 'EURGBP', 'EURJPY',
  'XAUUSD', 'BTCUSD', 'US500', 'US30', 'NAS100',
]

const TIMEFRAMES = [
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '30m', value: '30' },
  { label: '1h', value: '60' },
  { label: '4h', value: '240' },
  { label: 'D', value: 'D' },
]

const WATCHLIST_DATA = [
  { symbol: 'AUDCAD', last: '0.96515', chg: '+5.07%' },
  { symbol: 'AUDCHF', last: '0.54503', chg: '+3.15%' },
  { symbol: 'AUDJPY', last: '108.576', chg: '+8.28%' },
  { symbol: 'AUDNZD', last: '1.17854', chg: '+3.32%' },
  { symbol: 'AUDUSD', last: '0.70698', chg: '+7.89%' },
  { symbol: 'EURUSD', last: '1.18439', chg: '+2.46%' },
  { symbol: 'GBPUSD', last: '1.33821', chg: '+4.12%' },
  { symbol: 'USDJPY', last: '142.350', chg: '-1.85%' },
  { symbol: 'XAUUSD', last: '2355.40', chg: '+0.67%' },
  { symbol: 'NAS100', last: '19580.0', chg: '+1.24%' },
]

export default function Trading() {
  const [symbol, setSymbol] = useState('EURUSD')
  const [timeframe, setTimeframe] = useState('60')
  const [stats, setStats] = useState(null)
  const [trades, setTrades] = useState([])
  const [account, setAccount] = useState(null)
  const [bottomTab, setBottomTab] = useState('open')
  const [rightTab, setRightTab] = useState('watchlist')
  const [watchSearch, setWatchSearch] = useState('')
  const [starred, setStarred] = useState({})

  useEffect(() => {
    api.getDashboard().then(setStats).catch(console.error)
    api.getTrades({ limit: 50 }).then(setTrades).catch(console.error)
  }, [])

  const todayTrades = trades.filter(t => {
    const d = new Date(t.open_time)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  const openPositions = trades.filter(t => t.status === 'OPEN')
  const closedPositions = trades.filter(t => t.status === 'CLOSED')
  const todayPnl = stats?.daily_pnl ?? 0
  const maxLoss = 5000
  const dailyTarget = 10000
  const pnlPercent = todayPnl >= 0
    ? Math.min((todayPnl / dailyTarget) * 50, 50)
    : Math.max((todayPnl / maxLoss) * -50, -50)

  const maxTradesPerDay = 5
  const tradesTodayCount = todayTrades.length

  const isWithinWindow = (() => {
    const now = new Date()
    const h = now.getUTCHours()
    return h >= 8 && h < 17
  })()

  const filteredWatchlist = WATCHLIST_DATA.filter(w =>
    w.symbol.toLowerCase().includes(watchSearch.toLowerCase())
  )

  const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_trading&symbol=${symbol}&interval=${timeframe}&hidesidetoolbar=0&symboledit=0&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0&locale=en`

  return (
    <div className="-m-4 md:-m-6 flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-48px)]">
      {/* Top stats bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Trading</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Plan, execute, and manage your trades with real-time charts and precision tools.</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">Balance</p>
              <p className="text-sm font-bold">{formatCurrency(stats?.balance ?? 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">Open P&L</p>
              <p className={`text-sm font-bold ${pnlColor(openPositions.reduce((s, t) => s + (t.profit || 0), 0))}`}>
                {formatPnl(openPositions.reduce((s, t) => s + (t.profit || 0), 0))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">Equity</p>
              <p className="text-sm font-bold">{formatCurrency(stats?.equity ?? 0)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 uppercase">Margin Health</p>
              <p className="text-sm font-bold text-emerald-500">Excellent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/30 px-4 py-2 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <span className="text-sm text-amber-700 dark:text-amber-400">Review your trade plan before trading.</span>
        <a href="/edge" className="ml-auto text-xs text-primary-600 hover:underline font-medium">Open Trade Plan</a>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Chart area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Timeframe bar */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 py-1.5 flex items-center gap-2">
            <div className="flex rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
              {TIMEFRAMES.map(tf => (
                <button key={tf.value} onClick={() => setTimeframe(tf.value)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    timeframe === tf.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                  {tf.label}
                </button>
              ))}
            </div>
            <select className="text-xs border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              value={symbol} onChange={e => setSymbol(e.target.value)}>
              {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* TradingView chart */}
          <div className="flex-1 min-h-0">
            <iframe key={`${symbol}-${timeframe}`} src={widgetUrl} className="w-full h-full border-0" allowFullScreen />
          </div>

          {/* Bottom positions panel */}
          <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800" style={{ height: '160px' }}>
            <div className="flex border-b border-gray-200 dark:border-gray-800">
              {[
                { key: 'open', label: 'Open Positions', count: openPositions.length },
                { key: 'pending', label: 'Pending Orders', count: 0 },
                { key: 'closed', label: 'Closed Positions', count: closedPositions.length },
              ].map(tab => (
                <button key={tab.key} onClick={() => setBottomTab(tab.key)}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                    bottomTab === tab.key
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}>
                  {tab.label} <span className="ml-1 text-gray-400">{tab.count}</span>
                </button>
              ))}
            </div>
            <div className="overflow-y-auto" style={{ height: '124px' }}>
              {bottomTab === 'open' && (
                openPositions.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-3 py-1.5 text-left font-medium">Symbol</th>
                        <th className="px-3 py-1.5 text-left font-medium">Type</th>
                        <th className="px-3 py-1.5 text-left font-medium">Volume</th>
                        <th className="px-3 py-1.5 text-left font-medium">Entry</th>
                        <th className="px-3 py-1.5 text-left font-medium">SL</th>
                        <th className="px-3 py-1.5 text-left font-medium">TP</th>
                        <th className="px-3 py-1.5 text-right font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openPositions.map(t => (
                        <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-3 py-1.5 font-medium">{t.symbol}</td>
                          <td className="px-3 py-1.5"><span className={t.direction === 'BUY' ? 'text-emerald-500' : 'text-red-500'}>{t.direction}</span></td>
                          <td className="px-3 py-1.5">{t.volume}</td>
                          <td className="px-3 py-1.5">{t.entry_price}</td>
                          <td className="px-3 py-1.5">{t.stop_loss || '-'}</td>
                          <td className="px-3 py-1.5">{t.take_profit || '-'}</td>
                          <td className={`px-3 py-1.5 text-right font-medium ${pnlColor(t.profit)}`}>{formatPnl(t.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">No open positions</div>
                )
              )}
              {bottomTab === 'pending' && (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">No pending orders</div>
              )}
              {bottomTab === 'closed' && (
                closedPositions.length > 0 ? (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-3 py-1.5 text-left font-medium">Symbol</th>
                        <th className="px-3 py-1.5 text-left font-medium">Type</th>
                        <th className="px-3 py-1.5 text-left font-medium">Volume</th>
                        <th className="px-3 py-1.5 text-left font-medium">Entry</th>
                        <th className="px-3 py-1.5 text-left font-medium">Exit</th>
                        <th className="px-3 py-1.5 text-left font-medium">Time</th>
                        <th className="px-3 py-1.5 text-right font-medium">P&L</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closedPositions.slice(0, 20).map(t => (
                        <tr key={t.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                          <td className="px-3 py-1.5 font-medium">{t.symbol}</td>
                          <td className="px-3 py-1.5"><span className={t.direction === 'BUY' ? 'text-emerald-500' : 'text-red-500'}>{t.direction}</span></td>
                          <td className="px-3 py-1.5">{t.volume}</td>
                          <td className="px-3 py-1.5">{t.entry_price}</td>
                          <td className="px-3 py-1.5">{t.exit_price || '-'}</td>
                          <td className="px-3 py-1.5 text-gray-500">{formatDateTime(t.close_time)}</td>
                          <td className={`px-3 py-1.5 text-right font-medium ${pnlColor(t.profit)}`}>{formatPnl(t.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">No closed positions</div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:flex flex-col w-80 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          {/* Trade status section */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 space-y-3">
            {/* Trades Today */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Trades Today:</span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: maxTradesPerDay }).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${
                    i < tradesTodayCount
                      ? (todayTrades[i]?.profit > 0 ? 'bg-emerald-500' : 'bg-red-500')
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                ))}
                <span className="text-xs font-bold ml-1">{tradesTodayCount}/{maxTradesPerDay}</span>
              </div>
            </div>

            {/* Trading Window */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Trading Window 08:00 - 17:00 (UTC)</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                isWithinWindow
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-600'
              }`}>
                {isWithinWindow ? 'Open' : 'Closed'}
              </span>
            </div>

            {/* Today's Net P&L */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-gray-500">Today's Net P&L</span>
                <span className={`text-lg font-bold ${pnlColor(todayPnl)}`}>{formatPnl(todayPnl)}</span>
              </div>
              {/* P&L progress bar */}
              <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 relative">
                    {todayPnl < 0 && (
                      <div className="absolute right-0 top-0 h-full bg-red-500 rounded-l-full"
                        style={{ width: `${Math.min(Math.abs(todayPnl) / maxLoss * 100, 100)}%` }} />
                    )}
                  </div>
                  <div className="w-1/2 relative">
                    {todayPnl > 0 && (
                      <div className="absolute left-0 top-0 h-full bg-emerald-500 rounded-r-full"
                        style={{ width: `${Math.min(todayPnl / dailyTarget * 100, 100)}%` }} />
                    )}
                  </div>
                </div>
                <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300 dark:bg-gray-600" />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-400">-${(maxLoss / 1000).toFixed(0)}K</span>
                <span className="text-[10px] text-gray-400">0</span>
                <span className="text-[10px] text-gray-400">${(dailyTarget / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-gray-500">Max Loss ${(maxLoss / 1000).toFixed(0)}K</span>
                <span className="text-[10px] text-gray-500">Daily Target ${(dailyTarget / 1000).toFixed(0)}K</span>
              </div>
            </div>

            {/* Warning if outside hours */}
            {!isWithinWindow && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[11px] text-amber-700 dark:text-amber-400">Trade placed outside your allowed hours.</span>
              </div>
            )}
          </div>

          {/* Watchlist / Alerts / Trade Plans tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            {[
              { key: 'watchlist', label: 'Watchlist', icon: '⭐' },
              { key: 'alerts', label: 'Alerts', icon: '🔔' },
              { key: 'plans', label: 'Trade Plans', icon: '📋' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setRightTab(tab.key)}
                className={`flex-1 px-2 py-2 text-[11px] font-medium border-b-2 transition-colors ${
                  rightTab === tab.key
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {rightTab === 'watchlist' && (
              <>
                <div className="px-3 py-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                      placeholder="Search..." value={watchSearch} onChange={e => setWatchSearch(e.target.value)} />
                  </div>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                      <th className="px-3 py-1 text-left font-medium">Instrument</th>
                      <th className="px-3 py-1 text-right font-medium">Last</th>
                      <th className="px-3 py-1 text-right font-medium">Chg</th>
                      <th className="px-1 py-1 w-6"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWatchlist.map(item => (
                      <tr key={item.symbol} onClick={() => setSymbol(item.symbol)}
                        className={`border-b border-gray-50 dark:border-gray-800/30 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                          symbol === item.symbol ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                        }`}>
                        <td className="px-3 py-2 font-medium">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[8px] font-bold">
                              {item.symbol.slice(0, 2)}
                            </div>
                            {item.symbol}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">{item.last}</td>
                        <td className={`px-3 py-2 text-right font-medium ${item.chg.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                          {item.chg}
                        </td>
                        <td className="px-1 py-2">
                          <button onClick={e => { e.stopPropagation(); setStarred(prev => ({ ...prev, [item.symbol]: !prev[item.symbol] })) }}
                            className={starred[item.symbol] ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'}>
                            <Star className="w-3 h-3" fill={starred[item.symbol] ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {rightTab === 'alerts' && (
              <div className="flex items-center justify-center h-32 text-xs text-gray-400">No alerts configured</div>
            )}
            {rightTab === 'plans' && (
              <div className="p-3 space-y-2">
                <a href="/edge" className="block card px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">A+ Setup Checklist</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-medium">Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-4">The 5 Golden Rules</p>
                </a>
                <a href="/edge" className="block card px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">Daily Bias</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-medium">Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-4">Under 5 Minutes</p>
                </a>
                <a href="/edge" className="block card px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-medium">Asia Sweep Strategy</span>
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 font-medium">Active</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 ml-4">Asia High/Low LQ Sweep</p>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
