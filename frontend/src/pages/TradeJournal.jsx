import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Filter, X, ChevronDown } from 'lucide-react'
import { api } from '../utils/api'
import { formatCurrency, formatPnl, pnlColor, formatDateTime } from '../utils/format'

function TradeModal({ onClose, onSave, trade }) {
  const [form, setForm] = useState(
    trade || {
      symbol: '', direction: 'BUY', volume: 0.01, entry_price: 0,
      exit_price: '', stop_loss: '', take_profit: '', profit: 0,
      status: 'OPEN', open_time: new Date().toISOString().slice(0, 16),
      close_time: '', strategy: '', setup_type: '', timeframe: '',
      risk_reward: '', risk_percent: '', notes: '', tags: [], rating: null,
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form }
    data.volume = parseFloat(data.volume) || 0.01
    data.entry_price = parseFloat(data.entry_price) || 0
    data.exit_price = data.exit_price ? parseFloat(data.exit_price) : null
    data.stop_loss = data.stop_loss ? parseFloat(data.stop_loss) : null
    data.take_profit = data.take_profit ? parseFloat(data.take_profit) : null
    data.profit = parseFloat(data.profit) || 0
    data.risk_reward = data.risk_reward ? parseFloat(data.risk_reward) : null
    data.risk_percent = data.risk_percent ? parseFloat(data.risk_percent) : null
    data.rating = data.rating ? parseInt(data.rating) : null
    if (data.open_time) data.open_time = new Date(data.open_time).toISOString()
    if (data.close_time) data.close_time = new Date(data.close_time).toISOString()
    else data.close_time = null
    if (typeof data.tags === 'string') data.tags = data.tags.split(',').map(t => t.trim()).filter(Boolean)
    await onSave(data)
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{trade ? 'Edit Trade' : 'Add Trade'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Symbol</label>
              <input className="input" value={form.symbol} onChange={set('symbol')} placeholder="EURUSD" required />
            </div>
            <div>
              <label className="label">Direction</label>
              <select className="input" value={form.direction} onChange={set('direction')}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>
            <div>
              <label className="label">Volume</label>
              <input className="input" type="number" step="0.01" value={form.volume} onChange={set('volume')} />
            </div>
            <div>
              <label className="label">Entry Price</label>
              <input className="input" type="number" step="any" value={form.entry_price} onChange={set('entry_price')} required />
            </div>
            <div>
              <label className="label">Exit Price</label>
              <input className="input" type="number" step="any" value={form.exit_price} onChange={set('exit_price')} />
            </div>
            <div>
              <label className="label">Stop Loss</label>
              <input className="input" type="number" step="any" value={form.stop_loss} onChange={set('stop_loss')} />
            </div>
            <div>
              <label className="label">Take Profit</label>
              <input className="input" type="number" step="any" value={form.take_profit} onChange={set('take_profit')} />
            </div>
            <div>
              <label className="label">Profit/Loss</label>
              <input className="input" type="number" step="any" value={form.profit} onChange={set('profit')} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={set('status')}>
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div>
              <label className="label">Open Time</label>
              <input className="input" type="datetime-local" value={typeof form.open_time === 'string' ? form.open_time.slice(0, 16) : ''} onChange={set('open_time')} required />
            </div>
            <div>
              <label className="label">Close Time</label>
              <input className="input" type="datetime-local" value={form.close_time ? form.close_time.slice(0, 16) : ''} onChange={set('close_time')} />
            </div>
            <div>
              <label className="label">Strategy</label>
              <input className="input" value={form.strategy || ''} onChange={set('strategy')} placeholder="Breakout" />
            </div>
            <div>
              <label className="label">Setup Type</label>
              <input className="input" value={form.setup_type || ''} onChange={set('setup_type')} placeholder="M15 FVG" />
            </div>
            <div>
              <label className="label">Timeframe</label>
              <select className="input" value={form.timeframe || ''} onChange={set('timeframe')}>
                <option value="">-</option>
                <option value="M1">M1</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="M30">M30</option>
                <option value="H1">H1</option>
                <option value="H4">H4</option>
                <option value="D1">D1</option>
                <option value="W1">W1</option>
              </select>
            </div>
            <div>
              <label className="label">Risk:Reward</label>
              <input className="input" type="number" step="0.1" value={form.risk_reward || ''} onChange={set('risk_reward')} />
            </div>
            <div>
              <label className="label">Risk %</label>
              <input className="input" type="number" step="0.1" value={form.risk_percent || ''} onChange={set('risk_percent')} />
            </div>
            <div>
              <label className="label">Rating (1-5)</label>
              <select className="input" value={form.rating || ''} onChange={set('rating')}>
                <option value="">-</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Tags</label>
              <input className="input" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''} onChange={set('tags')} placeholder="tag1, tag2" />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input h-24 resize-none" value={form.notes || ''} onChange={set('notes')} placeholder="Trade notes..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Trade</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TradeJournal() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTrade, setEditTrade] = useState(null)
  const [filters, setFilters] = useState({ status: '', symbol: '', strategy: '' })
  const [showFilters, setShowFilters] = useState(false)

  const loadTrades = () => {
    setLoading(true)
    api.getTrades(filters)
      .then(setTrades)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTrades() }, [filters])

  const handleSave = async (data) => {
    if (editTrade) {
      await api.updateTrade(editTrade.id, data)
    } else {
      await api.createTrade(data)
    }
    setShowModal(false)
    setEditTrade(null)
    loadTrades()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this trade?')) return
    await api.deleteTrade(id)
    loadTrades()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trade Journal</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{trades.length} trades</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button onClick={() => { setEditTrade(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Trade
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-4">
          <select className="input w-auto" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
          </select>
          <input className="input w-auto" placeholder="Symbol" value={filters.symbol} onChange={e => setFilters({ ...filters, symbol: e.target.value })} />
          <input className="input w-auto" placeholder="Strategy" value={filters.strategy} onChange={e => setFilters({ ...filters, strategy: e.target.value })} />
          <button onClick={() => setFilters({ status: '', symbol: '', strategy: '' })} className="text-sm text-primary-600 hover:underline">Clear</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trades.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Vol</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">Exit</th>
                <th className="px-4 py-3 font-medium">SL</th>
                <th className="px-4 py-3 font-medium">TP</th>
                <th className="px-4 py-3 font-medium">P&L</th>
                <th className="px-4 py-3 font-medium">Strategy</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(trade => (
                <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                  <td className="px-4 py-3">
                    <span className={trade.direction === 'BUY' ? 'badge-green' : 'badge-red'}>{trade.direction}</span>
                  </td>
                  <td className="px-4 py-3">{trade.volume}</td>
                  <td className="px-4 py-3">{trade.entry_price}</td>
                  <td className="px-4 py-3">{trade.exit_price || '-'}</td>
                  <td className="px-4 py-3">{trade.stop_loss || '-'}</td>
                  <td className="px-4 py-3">{trade.take_profit || '-'}</td>
                  <td className={`px-4 py-3 font-medium ${pnlColor(trade.profit)}`}>{formatPnl(trade.profit)}</td>
                  <td className="px-4 py-3">{trade.strategy || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(trade.open_time)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link to={`/journal/${trade.id}`} className="text-primary-600 hover:underline text-xs">View</Link>
                      <button onClick={() => { setEditTrade(trade); setShowModal(true) }} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs ml-2">Edit</button>
                      <button onClick={() => handleDelete(trade.id)} className="text-red-500 hover:text-red-700 text-xs ml-2">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-400 mb-4">No trades recorded yet</p>
          <button onClick={() => { setEditTrade(null); setShowModal(true) }} className="btn-primary">Add Your First Trade</button>
        </div>
      )}

      {showModal && <TradeModal trade={editTrade} onClose={() => { setShowModal(false); setEditTrade(null) }} onSave={handleSave} />}
    </div>
  )
}
