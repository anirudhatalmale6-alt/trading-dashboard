import { useState, useEffect } from 'react'
import { Plus, X, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { api } from '../utils/api'

function ModelModal({ onClose, onSave, model }) {
  const [form, setForm] = useState(
    model || {
      name: '', description: '', timeframe: '', conditions: [],
      entry_rules: '', exit_rules: '', stop_loss_rules: '',
      take_profit_rules: '', risk_per_trade: '', is_active: true,
    }
  )
  const [conditionInput, setConditionInput] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form }
    data.risk_per_trade = data.risk_per_trade ? parseFloat(data.risk_per_trade) : null
    await onSave(data)
  }

  const addCondition = () => {
    if (!conditionInput.trim()) return
    setForm({ ...form, conditions: [...(form.conditions || []), conditionInput.trim()] })
    setConditionInput('')
  }

  const removeCondition = (idx) => {
    setForm({ ...form, conditions: form.conditions.filter((_, i) => i !== idx) })
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold">{model ? 'Edit Entry Model' : 'New Entry Model'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Model Name</label>
              <input className="input" value={form.name} onChange={set('name')} placeholder="FVG Retest" required />
            </div>
            <div>
              <label className="label">Timeframe</label>
              <select className="input" value={form.timeframe || ''} onChange={set('timeframe')}>
                <option value="">Any</option>
                <option value="M1">M1</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="M30">M30</option>
                <option value="H1">H1</option>
                <option value="H4">H4</option>
                <option value="D1">D1</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input h-20 resize-none" value={form.description || ''} onChange={set('description')} placeholder="Describe this entry model..." />
          </div>
          <div>
            <label className="label">Entry Conditions</label>
            <div className="flex gap-2 mb-2">
              <input className="input" value={conditionInput} onChange={e => setConditionInput(e.target.value)} placeholder="Add a condition..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCondition())} />
              <button type="button" onClick={addCondition} className="btn-secondary whitespace-nowrap">Add</button>
            </div>
            {form.conditions && form.conditions.length > 0 && (
              <div className="space-y-1">
                {form.conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="flex-1">{c}</span>
                    <button type="button" onClick={() => removeCondition(i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Entry Rules</label>
              <textarea className="input h-20 resize-none" value={form.entry_rules || ''} onChange={set('entry_rules')} placeholder="When to enter..." />
            </div>
            <div>
              <label className="label">Exit Rules</label>
              <textarea className="input h-20 resize-none" value={form.exit_rules || ''} onChange={set('exit_rules')} placeholder="When to exit..." />
            </div>
            <div>
              <label className="label">Stop Loss Rules</label>
              <textarea className="input h-20 resize-none" value={form.stop_loss_rules || ''} onChange={set('stop_loss_rules')} placeholder="SL placement..." />
            </div>
            <div>
              <label className="label">Take Profit Rules</label>
              <textarea className="input h-20 resize-none" value={form.take_profit_rules || ''} onChange={set('take_profit_rules')} placeholder="TP placement..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Risk Per Trade (%)</label>
              <input className="input" type="number" step="0.1" value={form.risk_per_trade || ''} onChange={set('risk_per_trade')} placeholder="1.0" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded" />
                <span className="text-sm">Active Model</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Model</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function EntryModels() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editModel, setEditModel] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const loadModels = () => {
    setLoading(true)
    api.getEntryModels()
      .then(setModels)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadModels() }, [])

  const handleSave = async (data) => {
    if (editModel) {
      await api.updateEntryModel(editModel.id, data)
    } else {
      await api.createEntryModel(data)
    }
    setShowModal(false)
    setEditModel(null)
    loadModels()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry model?')) return
    await api.deleteEntryModel(id)
    loadModels()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Entry Models</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your trade setup templates</p>
        </div>
        <button onClick={() => { setEditModel(null); setShowModal(true) }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Model
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : models.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map(model => (
            <div key={model.id} className="card overflow-hidden">
              <div className="px-5 py-4 cursor-pointer" onClick={() => setExpanded(expanded === model.id ? null : model.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${model.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <h4 className="font-semibold">{model.name}</h4>
                    {model.timeframe && <span className="badge-gray">{model.timeframe}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); setEditModel(model); setShowModal(true) }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><Edit className="w-4 h-4" /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(model.id) }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {model.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{model.description}</p>}
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {model.risk_per_trade && <span>Risk: {model.risk_per_trade}%</span>}
                  <span>{model.total_trades} trades</span>
                  {model.win_rate != null && <span>Win: {model.win_rate}%</span>}
                </div>
              </div>

              {expanded === model.id && (
                <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                  {model.conditions && model.conditions.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Conditions</p>
                      <div className="space-y-1">
                        {model.conditions.map((c, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {model.entry_rules && <div><p className="text-xs font-medium text-gray-500 mb-1">Entry Rules</p><p className="text-sm whitespace-pre-wrap">{model.entry_rules}</p></div>}
                  {model.exit_rules && <div><p className="text-xs font-medium text-gray-500 mb-1">Exit Rules</p><p className="text-sm whitespace-pre-wrap">{model.exit_rules}</p></div>}
                  {model.stop_loss_rules && <div><p className="text-xs font-medium text-gray-500 mb-1">Stop Loss</p><p className="text-sm whitespace-pre-wrap">{model.stop_loss_rules}</p></div>}
                  {model.take_profit_rules && <div><p className="text-xs font-medium text-gray-500 mb-1">Take Profit</p><p className="text-sm whitespace-pre-wrap">{model.take_profit_rules}</p></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <p className="text-gray-400 mb-4">No entry models defined</p>
          <button onClick={() => { setEditModel(null); setShowModal(true) }} className="btn-primary">Create Your First Model</button>
        </div>
      )}

      {showModal && <ModelModal model={editModel} onClose={() => { setShowModal(false); setEditModel(null) }} onSave={handleSave} />}
    </div>
  )
}
