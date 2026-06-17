import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, ChevronLeft, ChevronRight, Share2, Focus, X } from 'lucide-react'
import { api } from '../utils/api'
import { formatCurrency, formatPnl, pnlColor, formatDateTime, formatDate } from '../utils/format'

const SESSIONS = ['London', 'New York', 'Asian', 'Sydney']
const CONFLUENCES = ['LQ sweep', 'LTF POI Mitigation', 'MTF POI mitigation', 'MS', 'FVG', 'OB Retest', 'BOS', 'Inducement']
const MGMT_TAGS = ['Partial Profits', 'Trailed SL', 'Set & Forget', 'Moved to BE', 'Scaled In']
const MISTAKE_TAGS = ['Impatience', 'Too late', 'FOMO', 'Oversize', 'No SL', 'Revenge trade', 'Broke rules']
const EMOTIONS = ['Confident', 'Calm', 'Anxious', 'Fear', 'Greedy', 'Revenge', 'Relieved', 'Frustrated', 'Neutral']

export default function TradeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trade, setTrade] = useState(null)
  const [journal, setJournal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [allTrades, setAllTrades] = useState([])
  const fileRefs = { htf: useRef(), mtf: useRef(), ltf: useRef() }

  const [review, setReview] = useState({
    plan_followed: true,
    plan_name: 'A+ Setup Checklist',
    confluences: [],
    management: [],
    mistakes: [],
    entry_emotion: '',
    exit_emotion: '',
    notes: '',
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.getTrade(id),
      api.getJournal().then(entries => entries.find(e => e.trade_id === parseInt(id))),
      api.getTrades({ limit: 200 }),
    ]).then(([t, j, all]) => {
      setTrade(t)
      setAllTrades(all)
      if (j) {
        setJournal(j)
        try {
          const parsed = j.content ? JSON.parse(j.content) : {}
          setReview(prev => ({ ...prev, ...parsed }))
        } catch {
          setReview(prev => ({ ...prev, notes: j.content || '' }))
        }
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const currentIdx = allTrades.findIndex(t => t.id === parseInt(id))
  const prevTrade = currentIdx < allTrades.length - 1 ? allTrades[currentIdx + 1] : null
  const nextTrade = currentIdx > 0 ? allTrades[currentIdx - 1] : null

  const handleScreenshot = async (e, label) => {
    const file = e.target.files[0]
    if (!file) return
    await api.uploadScreenshot(id, file, label)
    const updated = await api.getTrade(id)
    setTrade(updated)
  }

  const saveReview = async () => {
    const data = {
      trade_id: parseInt(id),
      date: trade.open_time,
      title: `${trade.symbol} Review`,
      content: JSON.stringify(review),
      emotions: review.entry_emotion,
      lessons_learned: review.notes,
      mistakes: review.mistakes.join(', '),
    }
    if (journal) {
      await api.updateJournalEntry(journal.id, data)
    } else {
      const entry = await api.createJournalEntry(data)
      setJournal(entry)
    }
  }

  const toggleTag = (key, tag) => {
    setReview(prev => ({
      ...prev,
      [key]: prev[key].includes(tag) ? prev[key].filter(t => t !== tag) : [...prev[key], tag],
    }))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!trade) return <div className="text-center py-12 text-gray-500">Trade not found</div>

  const netPnl = (trade.profit || 0) + (trade.commission || 0) + (trade.swap || 0)
  const duration = trade.close_time
    ? (() => {
        const ms = new Date(trade.close_time) - new Date(trade.open_time)
        const mins = Math.floor(ms / 60000)
        if (mins < 60) return `${mins}m`
        const hrs = Math.floor(mins / 60)
        if (hrs < 24) return `${hrs}h ${mins % 60}m`
        return `${Math.floor(hrs / 24)}d ${hrs % 24}h`
      })()
    : 'Open'

  const htfScreenshots = (trade.screenshots || []).filter(s => s.label === 'HTF')
  const mtfScreenshots = (trade.screenshots || []).filter(s => s.label === 'MTF')
  const ltfScreenshots = (trade.screenshots || []).filter(s => s.label === 'LTF')
  const otherScreenshots = (trade.screenshots || []).filter(s => !['HTF', 'MTF', 'LTF'].includes(s.label))

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/journal')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600">
          <ArrowLeft className="w-4 h-4" /> Journal
        </button>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-xs flex items-center gap-1"><Share2 className="w-3 h-3" /> Share Trade</button>
          <button className="btn-secondary text-xs flex items-center gap-1"><Focus className="w-3 h-3" /> Focus Mode</button>
          {prevTrade && <Link to={`/journal/${prevTrade.id}`} className="btn-secondary text-xs flex items-center gap-1"><ChevronLeft className="w-3 h-3" /> Previous</Link>}
          {nextTrade && <Link to={`/journal/${nextTrade.id}`} className="btn-secondary text-xs flex items-center gap-1">Next Trade <ChevronRight className="w-3 h-3" /></Link>}
        </div>
      </div>

      {/* Title bar */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold">
          {trade.symbol.slice(0, 2)}
        </div>
        <h2 className="text-xl font-bold">{trade.symbol}</h2>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">{trade.volume > 0.01 ? `${Math.round(trade.volume * 1000) / 1000}` : '1'} position{trade.volume > 1 ? 's' : ''}</span>
        <span className="text-gray-400">•</span>
        <span className="text-gray-500">{formatDate(trade.open_time)}</span>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Trade Details */}
        <div className="card p-6 space-y-6">
          <h3 className="font-semibold text-lg">Trade Details</h3>

          {/* Net P&L */}
          <div>
            <p className={`text-3xl font-bold ${pnlColor(netPnl)}`}>{formatPnl(netPnl)}</p>
            <p className="text-xs text-gray-500 uppercase mt-1">Net PNL</p>
          </div>

          {/* Instrument / Direction / Lot Size */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y border-gray-200 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[8px] font-bold">{trade.symbol.slice(0, 2)}</div>
                <span className="font-bold">{trade.symbol}</span>
              </div>
              <p className="text-[10px] text-gray-500 uppercase mt-1">Instrument</p>
            </div>
            <div>
              <p className={`font-bold ${trade.direction === 'BUY' ? 'text-emerald-500' : 'text-red-500'}`}>
                {trade.direction === 'BUY' ? '↑' : '↓'} {trade.direction === 'BUY' ? 'Buy' : 'Sell'}
              </p>
              <p className="text-[10px] text-gray-500 uppercase mt-1">Direction</p>
            </div>
            <div>
              <p className="font-bold">{(trade.volume * 1000).toFixed(0)}.00</p>
              <p className="text-[10px] text-gray-500 uppercase mt-1">Lot Size</p>
            </div>
          </div>

          {/* Context */}
          <div>
            <p className="text-xs text-gray-500 uppercase mb-3">Context:</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-500 text-sm">Date</span><span className="text-sm font-medium">{formatDate(trade.open_time)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-sm">Session</span><span className="text-sm font-medium">{trade.setup_type || 'London'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-sm">Duration</span><span className="text-sm font-medium">{duration}</span></div>
            </div>
          </div>

          {/* Execution */}
          <div>
            <p className="text-xs text-gray-500 uppercase mb-3">Execution:</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-500 text-sm">Avg Entry Price</span><span className="text-sm font-medium">{trade.entry_price}</span></div>
              {trade.exit_price && <div className="flex justify-between"><span className="text-gray-500 text-sm">Avg Exit Price</span><span className="text-sm font-medium">{trade.exit_price}</span></div>}
              {trade.stop_loss && <div className="flex justify-between"><span className="text-gray-500 text-sm">Stop Loss</span><span className="text-sm font-medium">{trade.stop_loss}</span></div>}
              {trade.take_profit && <div className="flex justify-between"><span className="text-gray-500 text-sm">Take Profit</span><span className="text-sm font-medium">{trade.take_profit}</span></div>}
            </div>
          </div>

          {/* Performance */}
          <div>
            <p className="text-xs text-gray-500 uppercase mb-3">Performance:</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-500 text-sm">Risk (R)</span><span className="text-sm font-medium">{trade.risk_percent ? `${trade.risk_percent}R` : '1R'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-sm">Return (R)</span><span className={`text-sm font-medium ${pnlColor(trade.profit)}`}>{trade.risk_reward ? `${trade.risk_reward}R` : `${(trade.profit || 0) > 0 ? '+' : ''}${((trade.profit || 0) / Math.max(Math.abs(trade.profit || 1), 1)).toFixed(2)}R`}</span></div>
            </div>
          </div>

          {/* Costs */}
          <div>
            <p className="text-xs text-gray-500 uppercase mb-3">Costs:</p>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-500 text-sm">Fees</span><span className="text-sm font-medium">{formatCurrency(trade.commission || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 text-sm">Swap</span><span className="text-sm font-medium">{formatCurrency(trade.swap || 0)}</span></div>
            </div>
          </div>
        </div>

        {/* Right: Charts + Review */}
        <div className="space-y-6">
          {/* Charts */}
          <div className="card p-6">
            <h3 className="font-semibold text-lg mb-1">Charts</h3>
            <p className="text-xs text-gray-500 mb-4">Add screenshots to review context + execution:</p>

            <div className="grid grid-cols-3 gap-3">
              {[{ key: 'htf', label: 'HTF', ref: fileRefs.htf, shots: htfScreenshots },
                { key: 'mtf', label: 'MTF', ref: fileRefs.mtf, shots: mtfScreenshots },
                { key: 'ltf', label: 'LTF', ref: fileRefs.ltf, shots: ltfScreenshots }].map(({ key, label, ref, shots }) => (
                <div key={key}>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs font-semibold">{label}</span>
                    <span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px] flex items-center justify-center text-gray-500">?</span>
                  </div>
                  {shots.length > 0 ? (
                    <div className="space-y-2">
                      {shots.map(ss => (
                        <img key={ss.id} src={`/uploads/${ss.filename}`} alt={label} className="w-full rounded-lg border border-gray-200 dark:border-gray-700" />
                      ))}
                      <button onClick={() => ref.current?.click()} className="text-[10px] text-primary-600 hover:underline">+ Add more</button>
                    </div>
                  ) : (
                    <button onClick={() => ref.current?.click()}
                      className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors cursor-pointer">
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-[10px] text-gray-400">Upload {label}</span>
                    </button>
                  )}
                  <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => handleScreenshot(e, label)} />
                </div>
              ))}
            </div>
          </div>

          {/* Review & Reflection */}
          <div className="card p-6 space-y-5">
            <h3 className="font-semibold text-lg">Review & Reflection</h3>

            {/* Plan */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Plan</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={review.plan_followed} onChange={e => setReview({ ...review, plan_followed: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm">I followed my trade plan</span>
                </label>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Which plan did you intend to follow?</p>
                <select className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800"
                  value={review.plan_name} onChange={e => setReview({ ...review, plan_name: e.target.value })}>
                  <option>A+ Setup Checklist</option>
                  <option>Daily Bias</option>
                  <option>Asia Sweep Strategy</option>
                </select>
              </div>
            </div>

            {/* Entry Confluences + Trade Management */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Entry Confluences</p>
                <div className="flex flex-wrap gap-1.5">
                  {CONFLUENCES.map(tag => (
                    <button key={tag} onClick={() => toggleTag('confluences', tag)}
                      className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                        review.confluences.includes(tag)
                          ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                      }`}>
                      {tag} {review.confluences.includes(tag) && '×'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Trade Management</p>
                <div className="flex flex-wrap gap-1.5">
                  {MGMT_TAGS.map(tag => (
                    <button key={tag} onClick={() => toggleTag('management', tag)}
                      className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                        review.management.includes(tag)
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                      }`}>
                      {tag} {review.management.includes(tag) && '×'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mistakes */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Mistakes</p>
              <div className="flex flex-wrap gap-1.5">
                {MISTAKE_TAGS.map(tag => (
                  <button key={tag} onClick={() => toggleTag('mistakes', tag)}
                    className={`text-[11px] px-2 py-1 rounded-full border transition-colors ${
                      review.mistakes.includes(tag)
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                    }`}>
                    {tag} {review.mistakes.includes(tag) && '×'}
                  </button>
                ))}
              </div>
            </div>

            {/* Entry/Exit Emotions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Entry Emotion</p>
                <select className="input text-sm" value={review.entry_emotion} onChange={e => setReview({ ...review, entry_emotion: e.target.value })}>
                  <option value="">Select...</option>
                  {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Exit Emotion</p>
                <select className="input text-sm" value={review.exit_emotion} onChange={e => setReview({ ...review, exit_emotion: e.target.value })}>
                  <option value="">Select...</option>
                  {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs text-gray-500 mb-2">Add a note or voice reflection</p>
              <textarea className="input h-24 resize-none text-sm" value={review.notes}
                onChange={e => setReview({ ...review, notes: e.target.value })}
                placeholder="What went well? What will you do differently next time?" />
            </div>

            <button onClick={saveReview} className="btn-primary w-full">Save Review</button>
          </div>
        </div>
      </div>
    </div>
  )
}
