import { useState, useEffect, useRef } from 'react'
import {
  Plus, X, Edit, Trash2, CheckCircle, Circle, Clock, Shield,
  BarChart3, TrendingUp, Upload, ChevronRight, Check, Pencil,
} from 'lucide-react'
import { api } from '../utils/api'
import { formatCurrency } from '../utils/format'

function PlanModal({ onClose, onSave, plan }) {
  const [form, setForm] = useState(plan || {
    name: '', subtitle: '', plan_type: '', is_active: true, is_preset: false,
    color: '#ef4444', max_trades_per_day: '', max_daily_loss: '', max_daily_profit: '',
    risk_per_trade: '', trading_window_start: '08:00', trading_window_end: '17:00',
    trading_window_tz: 'UTC', charting_process: [], entry_criteria: [],
    trade_management_rules: '', exit_criteria: '', trading_notes: [],
  })
  const [stepInput, setStepInput] = useState('')
  const [criteriaInput, setCriteriaInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const addToList = (key, input, setInput) => {
    if (!input.trim()) return
    setForm({ ...form, [key]: [...(form[key] || []), input.trim()] })
    setInput('')
  }
  const removeFromList = (key, idx) => {
    setForm({ ...form, [key]: form[key].filter((_, i) => i !== idx) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form }
    data.max_trades_per_day = data.max_trades_per_day ? parseInt(data.max_trades_per_day) : null
    data.max_daily_loss = data.max_daily_loss ? parseFloat(data.max_daily_loss) : null
    data.max_daily_profit = data.max_daily_profit ? parseFloat(data.max_daily_profit) : null
    data.risk_per_trade = data.risk_per_trade ? parseFloat(data.risk_per_trade) : null
    await onSave(data)
  }

  const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{plan ? 'Edit Plan' : 'New Trading Plan'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Plan Name</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="A+ Setup Checklist" required />
            </div>
            <div>
              <label className="label">Subtitle</label>
              <input className="input" value={form.subtitle || ''} onChange={set('subtitle')} placeholder="The 5 Golden Rules" />
            </div>
            <div>
              <label className="label">Plan Type</label>
              <input className="input" value={form.plan_type || ''} onChange={set('plan_type')} placeholder="The 5 Golden Rules" />
            </div>
            <div>
              <label className="label">Color</label>
              <div className="flex gap-2 mt-1">
                {colors.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={`w-8 h-8 rounded-full border-2 ${form.color === c ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_preset} onChange={e => setForm({ ...form, is_preset: e.target.checked })} className="w-4 h-4 rounded" />
              <span className="text-sm">Preset</span>
            </label>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h4 className="font-medium text-sm mb-3">Risk Controls</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="label text-xs">Max Trades/Day</label>
                <input className="input" type="number" value={form.max_trades_per_day || ''} onChange={set('max_trades_per_day')} />
              </div>
              <div>
                <label className="label text-xs">Max Daily Loss ($)</label>
                <input className="input" type="number" step="any" value={form.max_daily_loss || ''} onChange={set('max_daily_loss')} />
              </div>
              <div>
                <label className="label text-xs">Max Daily Profit ($)</label>
                <input className="input" type="number" step="any" value={form.max_daily_profit || ''} onChange={set('max_daily_profit')} />
              </div>
              <div>
                <label className="label text-xs">Risk/Trade (%)</label>
                <input className="input" type="number" step="0.01" value={form.risk_per_trade || ''} onChange={set('risk_per_trade')} />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h4 className="font-medium text-sm mb-3">Trading Window</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">Start</label>
                <input className="input" type="time" value={form.trading_window_start || ''} onChange={set('trading_window_start')} />
              </div>
              <div>
                <label className="label text-xs">End</label>
                <input className="input" type="time" value={form.trading_window_end || ''} onChange={set('trading_window_end')} />
              </div>
              <div>
                <label className="label text-xs">Timezone</label>
                <select className="input" value={form.trading_window_tz || 'UTC'} onChange={set('trading_window_tz')}>
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="CST">CST</option>
                  <option value="PST">PST</option>
                  <option value="GMT">GMT</option>
                  <option value="CET">CET</option>
                  <option value="AEST">AEST</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h4 className="font-medium text-sm mb-3">Charting Process (numbered steps)</h4>
            <div className="flex gap-2 mb-2">
              <input className="input" value={stepInput} onChange={e => setStepInput(e.target.value)} placeholder="Add a step..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('charting_process', stepInput, setStepInput))} />
              <button type="button" onClick={() => addToList('charting_process', stepInput, setStepInput)} className="btn-secondary whitespace-nowrap text-sm">Add</button>
            </div>
            {(form.charting_process || []).map((step, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm mb-1">
                <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                <span className="flex-1">{step}</span>
                <button type="button" onClick={() => removeFromList('charting_process', i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h4 className="font-medium text-sm mb-3">Entry Criteria (checklist)</h4>
            <div className="flex gap-2 mb-2">
              <input className="input" value={criteriaInput} onChange={e => setCriteriaInput(e.target.value)} placeholder="Add criteria..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('entry_criteria', criteriaInput, setCriteriaInput))} />
              <button type="button" onClick={() => addToList('entry_criteria', criteriaInput, setCriteriaInput)} className="btn-secondary whitespace-nowrap text-sm">Add</button>
            </div>
            {(form.entry_criteria || []).map((c, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm mb-1">
                <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="flex-1">{c}</span>
                <button type="button" onClick={() => removeFromList('entry_criteria', i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Trade Management Rules</label>
              <textarea className="input h-28 resize-none" value={form.trade_management_rules || ''} onChange={set('trade_management_rules')}
                placeholder="Predefine risk before entry (fixed R, no resizing mid-trade)&#10;Set and Forget&#10;If invalidation hits, exit and reassess" />
            </div>
            <div>
              <label className="label">Exit Criteria</label>
              <textarea className="input h-28 resize-none" value={form.exit_criteria || ''} onChange={set('exit_criteria')}
                placeholder="Add your exit rules so you don't freestyle" />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h4 className="font-medium text-sm mb-3">Trading Notes (bullet points)</h4>
            <div className="flex gap-2 mb-2">
              <input className="input" value={noteInput} onChange={e => setNoteInput(e.target.value)} placeholder="Add a note..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addToList('trading_notes', noteInput, setNoteInput))} />
              <button type="button" onClick={() => addToList('trading_notes', noteInput, setNoteInput)} className="btn-secondary whitespace-nowrap text-sm">Add</button>
            </div>
            {(form.trading_notes || []).map((n, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-sm mb-1">
                <span className="text-gray-400">•</span>
                <span className="flex-1">{n}</span>
                <button type="button" onClick={() => removeFromList('trading_notes', i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Plan</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function timeSince(dateStr) {
  if (!dateStr) return null
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function Edge() {
  const [plans, setPlans] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editPlan, setEditPlan] = useState(null)
  const [checkedCriteria, setCheckedCriteria] = useState({})
  const fileRef = useRef()

  const loadPlans = async () => {
    setLoading(true)
    try {
      const data = await api.getEdgePlans()
      setPlans(data)
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadPlans() }, [])

  const selected = plans.find(p => p.id === selectedId)

  const handleSave = async (data) => {
    if (editPlan) {
      await api.updateEdgePlan(editPlan.id, data)
    } else {
      await api.createEdgePlan(data)
    }
    setShowModal(false)
    setEditPlan(null)
    loadPlans()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return
    await api.deleteEdgePlan(id)
    if (selectedId === id) setSelectedId(null)
    loadPlans()
  }

  const handleReview = async () => {
    if (!selected) return
    await api.reviewEdgePlan(selected.id)
    setCheckedCriteria({})
    loadPlans()
  }

  const handleScreenshot = async (e) => {
    const file = e.target.files[0]
    if (!file || !selected) return
    await api.uploadEdgeScreenshot(selected.id, file)
    loadPlans()
  }

  const toggleCriteria = (idx) => {
    setCheckedCriteria(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const myPlans = plans.filter(p => !p.is_preset)
  const presets = plans.filter(p => p.is_preset)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-48px)] -m-4 md:-m-6">
      {/* Left sidebar - plan list */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <span className="font-semibold text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">My Plans</span>
          <button onClick={() => { setEditPlan(null); setShowModal(true) }} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-primary-600">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {myPlans.map(plan => (
            <button key={plan.id} onClick={() => { setSelectedId(plan.id); setCheckedCriteria({}) }}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800/50 transition-colors ${
                selectedId === plan.id ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: plan.color }} />
                <span className={`font-medium text-sm ${selectedId === plan.id ? 'text-primary-700 dark:text-primary-400' : ''}`}>{plan.name}</span>
                {plan.is_active && <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">Active</span>}
              </div>
              {plan.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-4">{plan.subtitle}</p>}
            </button>
          ))}

          {presets.length > 0 && (
            <>
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Presets</span>
              </div>
              {presets.map(plan => (
                <button key={plan.id} onClick={() => { setSelectedId(plan.id); setCheckedCriteria({}) }}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800/50 transition-colors ${
                    selectedId === plan.id ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: plan.color }} />
                    <span className="font-medium text-sm">{plan.name}</span>
                  </div>
                  {plan.subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-4">{plan.subtitle}</p>}
                </button>
              ))}
            </>
          )}

          {plans.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              <p className="mb-3">No plans yet</p>
              <button onClick={() => { setEditPlan(null); setShowModal(true) }} className="btn-primary text-sm">Create First Plan</button>
            </div>
          )}
        </div>
      </div>

      {/* Right content - plan detail */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        {selected ? (
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selected.color }} />
                <h2 className="text-2xl font-bold">{selected.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditPlan(selected); setShowModal(true) }} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Active toggle + Plan type */}
            <div className="flex items-center gap-4 mb-6">
              <button className="flex items-center gap-2" onClick={async () => {
                await api.updateEdgePlan(selected.id, { is_active: !selected.is_active })
                loadPlans()
              }}>
                <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${selected.is_active ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${selected.is_active ? 'left-5' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-medium">{selected.is_active ? 'Active' : 'Inactive'}</span>
              </button>
            </div>

            {selected.plan_type && (
              <div className="mb-6">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Plan Type</span>
                <p className="font-medium">{selected.plan_type}</p>
              </div>
            )}

            {/* Stats + Risk Controls row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Plan Stats */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Plan Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-2xl font-bold">{selected.trades_taken}</p>
                    <p className="text-xs text-gray-500">Trades Taken</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selected.win_rate.toFixed(2)}%</p>
                    <p className="text-xs text-gray-500">Win Rate</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${selected.net_pnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(selected.net_pnl)}</p>
                    <p className="text-xs text-gray-500">Net P&L</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selected.compliance.toFixed(2)}%</p>
                    <p className="text-xs text-gray-500">Compliance</p>
                  </div>
                </div>
              </div>

              {/* Risk Controls */}
              <div>
                <div className="card p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Risk Controls</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-lg font-bold">{selected.max_trades_per_day ?? '-'}</p>
                      <p className="text-xs text-gray-500">Max trades per day</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{selected.max_daily_loss ? formatCurrency(selected.max_daily_loss) : '-'}</p>
                      <p className="text-xs text-gray-500">Max daily loss</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{selected.max_daily_profit ? formatCurrency(selected.max_daily_profit) : '-'}</p>
                      <p className="text-xs text-gray-500">Max daily profit</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{selected.risk_per_trade ? `${selected.risk_per_trade}%` : '-'}</p>
                      <p className="text-xs text-gray-500">Risk per trade</p>
                    </div>
                  </div>
                </div>

                {(selected.trading_window_start || selected.trading_window_end) && (
                  <div className="card p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Trading Window</span>
                    </div>
                    <p className="font-bold mt-2">{selected.trading_window_start} - {selected.trading_window_end} ({selected.trading_window_tz})</p>
                  </div>
                )}
              </div>
            </div>

            {/* Charting Process */}
            {selected.charting_process.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  <span>📊</span> Charting Process
                </h3>
                <div className="card p-4 space-y-2">
                  {selected.charting_process.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <p className="text-sm pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Entry Criteria */}
            {selected.entry_criteria.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  <span>🎯</span> Entry Criteria
                </h3>
                <div className="card p-4 space-y-2">
                  {selected.entry_criteria.map((c, i) => (
                    <button key={i} onClick={() => toggleCriteria(i)} className="flex items-center gap-3 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg px-2 py-1 -mx-2">
                      {checkedCriteria[i] ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600 shrink-0" />
                      )}
                      <span className={`text-sm ${checkedCriteria[i] ? 'line-through text-gray-400' : ''}`}>{i + 1}. {c}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Entry Models / Screenshots */}
            {selected.entry_model_screenshots.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    <span>📈</span> Entry Models
                  </h3>
                  <button onClick={() => fileRef.current?.click()} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                    <Upload className="w-3 h-3" /> Add Image
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selected.entry_model_screenshots.map((ss, i) => (
                    <div key={i} className="card overflow-hidden">
                      <img src={`/uploads/${ss.filename}`} alt={ss.label || 'Entry model'} className="w-full" />
                      {ss.label && <p className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-800">{ss.label}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.entry_model_screenshots.length === 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  <span>📈</span> Entry Models
                </h3>
                <div className="card p-6 text-center">
                  <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm flex items-center gap-2 mx-auto">
                    <Upload className="w-4 h-4" /> Upload Setup Screenshots
                  </button>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />

            {/* Trade Management Rules */}
            {selected.trade_management_rules && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  <span>📋</span> Trade Management Rules
                </h3>
                <div className="card p-4">
                  <p className="text-sm whitespace-pre-wrap">{selected.trade_management_rules}</p>
                </div>
              </div>
            )}

            {/* Exit Criteria */}
            {selected.exit_criteria && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  <span>🚪</span> Exit Criteria
                </h3>
                <div className="card p-4">
                  <p className="text-sm whitespace-pre-wrap">{selected.exit_criteria}</p>
                </div>
              </div>
            )}

            {/* Trading Notes */}
            {selected.trading_notes.length > 0 && (
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                  <span>🔥</span> Trading Notes
                </h3>
                <div className="card p-4 space-y-2">
                  {selected.trading_notes.map((note, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <p>{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mark as reviewed */}
            <div className="flex items-center justify-center gap-3 py-6">
              <button onClick={handleReview} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors">
                <Check className="w-5 h-5" />
                Mark as reviewed
              </button>
              {selected.last_reviewed && (
                <span className="text-xs text-gray-500">Last reviewed {timeSince(selected.last_reviewed)}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select a plan or create a new one</p>
          </div>
        )}
      </div>

      {showModal && <PlanModal plan={editPlan} onClose={() => { setShowModal(false); setEditPlan(null) }} onSave={handleSave} />}
    </div>
  )
}
