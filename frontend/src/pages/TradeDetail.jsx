import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Trash2, Star, Clock, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { api } from '../utils/api'
import { formatCurrency, formatPnl, pnlColor, formatDateTime } from '../utils/format'

export default function TradeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trade, setTrade] = useState(null)
  const [journal, setJournal] = useState(null)
  const [journalForm, setJournalForm] = useState({ content: '', emotions: '', lessons_learned: '', mistakes: '', daily_grade: '' })
  const [loading, setLoading] = useState(true)
  const fileRef = useRef()

  useEffect(() => {
    Promise.all([
      api.getTrade(id),
      api.getJournal().then(entries => entries.find(e => e.trade_id === parseInt(id))),
    ])
      .then(([t, j]) => {
        setTrade(t)
        if (j) {
          setJournal(j)
          setJournalForm({ content: j.content || '', emotions: j.emotions || '', lessons_learned: j.lessons_learned || '', mistakes: j.mistakes || '', daily_grade: j.daily_grade || '' })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  const handleScreenshot = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    await api.uploadScreenshot(id, file, 'Chart screenshot')
    const updated = await api.getTrade(id)
    setTrade(updated)
  }

  const handleJournalSave = async () => {
    const data = { ...journalForm, trade_id: parseInt(id), date: trade.open_time }
    if (journal) {
      await api.updateJournalEntry(journal.id, data)
    } else {
      const entry = await api.createJournalEntry(data)
      setJournal(entry)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!trade) return <div className="text-center py-12 text-gray-500">Trade not found</div>

  const fields = [
    { label: 'Symbol', value: trade.symbol },
    { label: 'Direction', value: trade.direction, badge: trade.direction === 'BUY' ? 'badge-green' : 'badge-red' },
    { label: 'Volume', value: trade.volume },
    { label: 'Entry Price', value: trade.entry_price },
    { label: 'Exit Price', value: trade.exit_price || '-' },
    { label: 'Stop Loss', value: trade.stop_loss || '-' },
    { label: 'Take Profit', value: trade.take_profit || '-' },
    { label: 'Profit/Loss', value: formatPnl(trade.profit), color: pnlColor(trade.profit) },
    { label: 'Commission', value: formatCurrency(trade.commission) },
    { label: 'Swap', value: formatCurrency(trade.swap) },
    { label: 'Status', value: trade.status, badge: trade.status === 'OPEN' ? 'badge-blue' : 'badge-gray' },
    { label: 'Open Time', value: formatDateTime(trade.open_time) },
    { label: 'Close Time', value: trade.close_time ? formatDateTime(trade.close_time) : '-' },
    { label: 'Strategy', value: trade.strategy || '-' },
    { label: 'Setup', value: trade.setup_type || '-' },
    { label: 'Timeframe', value: trade.timeframe || '-' },
    { label: 'R:R', value: trade.risk_reward || '-' },
    { label: 'Risk %', value: trade.risk_percent ? `${trade.risk_percent}%` : '-' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate('/journal')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4" /> Back to Journal
      </button>

      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold">{trade.symbol}</h2>
        <span className={trade.direction === 'BUY' ? 'badge-green' : 'badge-red'}>{trade.direction}</span>
        <span className={`text-2xl font-bold ${pnlColor(trade.profit)}`}>{formatPnl(trade.profit)}</span>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Trade Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fields.map(({ label, value, badge, color }) => (
            <div key={label}>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              {badge ? (
                <span className={badge}>{value}</span>
              ) : (
                <p className={`font-medium ${color || ''}`}>{value}</p>
              )}
            </div>
          ))}
        </div>
        {trade.tags && trade.tags.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {trade.tags.map((tag, i) => <span key={i} className="badge-gray">{tag}</span>)}
          </div>
        )}
        {trade.notes && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{trade.notes}</p>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Screenshots</h3>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" /> Upload
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
        </div>
        {trade.screenshots && trade.screenshots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trade.screenshots.map(ss => (
              <div key={ss.id} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img src={`/uploads/${ss.filename}`} alt={ss.label || 'Screenshot'} className="w-full" />
                {ss.label && <p className="px-3 py-2 text-xs text-gray-500">{ss.label}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No screenshots yet</p>
        )}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold mb-4">Journal Entry</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Notes / Analysis</label>
            <textarea className="input h-32 resize-none" value={journalForm.content} onChange={e => setJournalForm({ ...journalForm, content: e.target.value })} placeholder="What happened in this trade? What was your analysis?" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Emotions</label>
              <input className="input" value={journalForm.emotions} onChange={e => setJournalForm({ ...journalForm, emotions: e.target.value })} placeholder="Confident, anxious, FOMO..." />
            </div>
            <div>
              <label className="label">Grade</label>
              <select className="input" value={journalForm.daily_grade} onChange={e => setJournalForm({ ...journalForm, daily_grade: e.target.value })}>
                <option value="">-</option>
                <option value="A+">A+</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Lessons Learned</label>
            <textarea className="input h-20 resize-none" value={journalForm.lessons_learned} onChange={e => setJournalForm({ ...journalForm, lessons_learned: e.target.value })} placeholder="What did you learn?" />
          </div>
          <div>
            <label className="label">Mistakes</label>
            <textarea className="input h-20 resize-none" value={journalForm.mistakes} onChange={e => setJournalForm({ ...journalForm, mistakes: e.target.value })} placeholder="Any mistakes made?" />
          </div>
          <div className="flex justify-end">
            <button onClick={handleJournalSave} className="btn-primary">Save Journal Entry</button>
          </div>
        </div>
      </div>
    </div>
  )
}
