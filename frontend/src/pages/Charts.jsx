import { useState } from 'react'

const SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'XAUUSD', 'BTCUSD', 'US500', 'US30', 'NAS100',
]

const TIMEFRAMES = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '30m', value: '30' },
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1D', value: 'D' },
  { label: '1W', value: 'W' },
]

export default function Charts() {
  const [symbol, setSymbol] = useState('EURUSD')
  const [timeframe, setTimeframe] = useState('60')
  const [customSymbol, setCustomSymbol] = useState('')

  const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${symbol}&interval=${timeframe}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=0&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&showpopupbutton=0&locale=en`

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Charts</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">TradingView chart viewer</p>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Symbol:</label>
            <select className="input w-auto" value={symbol} onChange={e => setSymbol(e.target.value)}>
              {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input className="input w-32" placeholder="Custom..." value={customSymbol} onChange={e => setCustomSymbol(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && customSymbol) { setSymbol(customSymbol.toUpperCase()); setCustomSymbol('') } }} />
            {customSymbol && <button onClick={() => { setSymbol(customSymbol.toUpperCase()); setCustomSymbol('') }} className="btn-secondary text-sm">Go</button>}
          </div>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeframe === tf.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
          <iframe
            key={`${symbol}-${timeframe}`}
            src={widgetUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
