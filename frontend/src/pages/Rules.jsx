import { useState, useEffect } from 'react'
import { Plus, X, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../utils/api'

function RuleModal({ onClose, onSave, rule }) {
  const [form, setForm] = useState(
    rule || {
      name: '', description: '', category: 'risk',
      is_active: true, max_daily_loss: '', max_daily_trades: '',
      max_position_size: '', max_risk_per_trade: '', allowed_sessions: [],
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form }
    data.max_daily_loss = data.max_daily_loss ? parseFloat(data.max_daily_loss) : null
    data.max_daily_trades = data.max_daily_trades ? parseInt(data.max_daily_trades) : null
    data.max_position_size = data.max_position_size ? parseFloat(data.max_position_size) : null
    data.max_risk_per_trade = data.max_risk_per_trade ? parseFloat(data.max_risk_per_trade) : null
    await onSave(data)
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{rule ? 'Edit Rule' : 'New Rule'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Rule Name</label>
            <input className="input" value={form.name} onChange={set('name')} placeholder="Max 2% risk per trade" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description || ''} onChange={set('description')} placeholder="Describe this rule..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category || 'risk'} onChange={set('category')}>
                <option value="risk">Risk Management</option>
                <option value="entry">Entry Rules</option>
                <option value="exit">Exit Rules</option>
                <option value="mindset">Mindset</option>
                <option value="time">Time/Session</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm">Active</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max Daily Loss ($)</label>
              <input className="input" type="number" step="any" value={form.max_daily_loss || ''} onChange={set('max_daily_loss')} />
            </div>
            <div>
              <label className="label">Max Daily Trades</label>
              <input className="input" type="number" value={form.max_daily_trades || ''} onChange={set('max_daily_trades')} />
            </div>
            <div>
              <label className="label">Max Position Size</label>
              <input className="input" type="number" step="0.01" value={form.max_position_size || ''} onChange={set('max_position_size')} />
            </div>
            <div>
              <label className="label">Max Risk/Trade (%)</label>
              <input className="input" type="number" step="0.1" value={form.max_risk_per_trade || ''} onChange={set('max_risk_per_trade')} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Rule</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Rules() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editRule, setEditRule] = useState(null)

  const loadRules = () => {
    setLoading(true)
    api.getRules()
      .then(setRules)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadRules() }, [])

  const handleSave = async (data) => {
    if (editRule) {
      await api.updateRule(editRule.id, data)
    } else {
      await api.createRule(data)
    }
    setShowModal(false)
    setEditRule(null)
    loadRules()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this rule?')) return
    await api.deleteRule(id)
    loadRules()
  }

  const categories = {
    risk: { label: 'Risk Management', color: 'text-red-500' },
    entry: { label: 'Entry Rules', color: 'text-emerald-500' },
    exit: { label: 'Exit Rules', color: 'text-blue-500' },
    mindset: { label: 'Mindset', color: 'text-purple-500' },
    time: { label: 'Time/Session', color: 'text-amber-500' },
  }

  const grouped = rules.reduce((acc, rule) => {
    const cat = rule.category || 'risk'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(rule)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trading Rules</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your trading discipline framework</p>
        </div>
        <button onClick={() => { setEditRule(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : rules.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, catRules]) => (
            <div key={cat}>
              <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${categories[cat]?.color || 'text-gray-500'}`}>
                {categories[cat]?.label || cat}
              </h3>
              <div className="space-y-2">
                {catRules.map(rule => (
                  <div key={rule.id} className="card px-5 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {rule.is_active ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          {rule.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{rule.description}</p>}
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            {rule.max_daily_loss && <span>Max Loss: ${rule.max_daily_loss}</span>}
                            {rule.max_daily_trades && <span>Max Trades: {rule.max_daily_trades}</span>}
                            {rule.max_position_size && <span>Max Size: {rule.max_position_size}</span>}
                            {rule.max_risk_per_trade && <span>Max Risk: {rule.max_risk_per_trade}%</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => { setEditRule(rule); setShowModal(true) }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(rule.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No trading rules defined yet</p>
          <button onClick={() => { setEditRule(null); setShowModal(true) }} className="btn-primary">Add Your First Rule</button>
        </div>
      )}

      {showModal && <RuleModal rule={editRule} onClose={() => { setShowModal(false); setEditRule(null) }} onSave={handleSave} />}
    </div>
  )
}
