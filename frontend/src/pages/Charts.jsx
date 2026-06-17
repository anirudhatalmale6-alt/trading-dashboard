import { useState, useEffect, useRef } from 'react'

const SYMBOLS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'NZDUSD', 'USDCAD',
  'XAUUSD', 'DXY',
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
  const chartRef = useRef(null)

  const tvSymbol = symbol === 'DXY' ? 'TVC:DXY' : symbol === 'XAUUSD' ? 'OANDA:XAUUSD' : `FX:${symbol}`

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.innerHTML = ''
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: timeframe,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      enable_publishing: false,
      withdateranges: true,
    })
    const container = document.createElement('div')
    container.className = 'tradingview-widget-container'
    container.style.height = '100%'
    container.style.width = '100%'
    const inner = document.createElement('div')
    inner.className = 'tradingview-widget-container__widget'
    inner.style.height = 'calc(100% - 32px)'
    inner.style.width = '100%'
    container.appendChild(inner)
    container.appendChild(script)
    chartRef.current.appendChild(container)
  }, [tvSymbol, timeframe])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Charts</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">TradingView realtime chart viewer</p>
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
              <button key={tf.value} onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeframe === tf.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}>
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }} ref={chartRef} />
      </div>
    </div>
  )
}
