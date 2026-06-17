import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts'
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3,
  Activity, Award, AlertTriangle, Zap, Plus, Pencil, Trash2, X, Check,
} from 'lucide-react'
import { api } from '../utils/api'
import { formatCurrency, formatPercent, formatPnl, pnlColor, formatDateTime } from '../utils/format'

function AccountManager({ accounts, selectedId, onSelect, onRefresh }) {
  const [editing, setEditing] = useState(null)
  const [editName, setEditName] = useState('')
  const [editBalance, setEditBalance] = useState('')
  const [editEquity, setEditEquity] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newBalance, setNewBalance] = useState('')

  const startEdit = (acct) => {
    setEditing(acct.id)
    setEditName(acct.name)
    setEditBalance(String(acct.balance))
    setEditEquity(String(acct.equity))
  }

  const saveEdit = async () => {
    await api.updateAccount(editing, {
      name: editName,
      balance: parseFloat(editBalance) || 0,
      equity: parseFloat(editEquity) || 0,
    })
    setEditing(null)
    onRefresh()
  }

  const addAccount = async () => {
    await api.createAccount({
      name: newName || `Account ${String.fromCharCode(65 + accounts.length)}`,
      balance: parseFloat(newBalance) || 0,
      equity: parseFloat(newBalance) || 0,
    })
    setShowAdd(false)
    setNewName('')
    setNewBalance('')
    onRefresh()
  }

  const deleteAccount = async (id) => {
    if (accounts.length <= 1) return
    if (!confirm('Delete this account?')) return
    await api.deleteAccount(id)
    onRefresh()
  }

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Trading Accounts</h3>
        <button onClick={() => setShowAdd(true)} className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-xs font-medium">
          <Plus className="w-3.5 h-3.5" /> Add Account
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {accounts.map(acct => (
          <div key={acct.id} onClick={() => onSelect(acct.id)}
            className={`shrink-0 rounded-xl px-4 py-3 cursor-pointer border-2 transition-all min-w-[180px] ${
              selectedId === acct.id
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
            {editing === acct.id ? (
              <div className="space-y-2" onClick={e => e.stopPropagation()}>
                <input className="input text-xs py-1" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Account name" />
                <input className="input text-xs py-1" type="number" step="any" value={editBalance} onChange={e => setEditBalance(e.target.value)} placeholder="Balance" />
                <input className="input text-xs py-1" type="number" step="any" value={editEquity} onChange={e => setEditEquity(e.target.value)} placeholder="Equity" />
                <div className="flex gap-1">
                  <button onClick={saveEdit} className="text-emerald-600 p-0.5"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setEditing(null)} className="text-gray-400 p-0.5"><X className="w-4 h-4" /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{acct.name}</span>
                  <div className="flex gap-0.5">
                    <button onClick={e => { e.stopPropagation(); startEdit(acct) }} className="p-0.5 text-gray-400 hover:text-gray-600"><Pencil className="w-3 h-3" /></button>
                    {accounts.length > 1 && (
                      <button onClick={e => { e.stopPropagation(); deleteAccount(acct.id) }} className="p-0.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                </div>
                <p className="text-lg font-bold mt-1">{formatCurrency(acct.balance)}</p>
                <p className="text-[10px] text-gray-500">Equity: {formatCurrency(acct.equity)}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="mt-3 flex gap-2 items-end">
          <div>
            <label className="text-[10px] text-gray-500">Name</label>
            <input className="input text-xs py-1" value={newName} onChange={e => setNewName(e.target.value)} placeholder={`Account ${String.fromCharCode(65 + accounts.length)}`} />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Balance</label>
            <input className="input text-xs py-1" type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="10000" />
          </div>
          <button onClick={addAccount} className="btn-primary text-xs py-1.5">Add</button>
          <button onClick={() => setShowAdd(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadAll = async () => {
    try {
      const [dashData, acctData] = await Promise.all([api.getDashboard(), api.getAccounts()])
      setStats(dashData)
      setAccounts(acctData)
      if (!selectedAccount && acctData.length > 0) setSelectedAccount(acctData[0].id)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadAll() }, [])

  const activeAccount = accounts.find(a => a.id === selectedAccount)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!stats) return <div className="text-center py-12 text-gray-500">Failed to load dashboard</div>

  const balance = activeAccount?.balance ?? stats.balance
  const equity = activeAccount?.equity ?? stats.equity

  const statCards = [
    { label: 'Balance', value: formatCurrency(balance), icon: DollarSign, color: 'text-primary-600' },
    { label: 'Equity', value: formatCurrency(equity), icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Daily P&L', value: formatPnl(stats.daily_pnl), icon: stats.daily_pnl >= 0 ? TrendingUp : TrendingDown, color: stats.daily_pnl >= 0 ? 'text-emerald-500' : 'text-red-500' },
    { label: 'Win Rate', value: formatPercent(stats.win_rate).replace('+', ''), icon: Award, color: 'text-amber-500' },
    { label: 'Total Trades', value: stats.total_trades, icon: BarChart3, color: 'text-purple-500' },
    { label: 'Open Positions', value: stats.open_positions, icon: Activity, color: 'text-cyan-500' },
    { label: 'Profit Factor', value: stats.profit_factor ?? '-', icon: Zap, color: 'text-emerald-500' },
    { label: 'Max Drawdown', value: formatPercent(-stats.max_drawdown), icon: AlertTriangle, color: 'text-red-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Trading performance overview</p>
      </div>

      <AccountManager accounts={accounts} selectedId={selectedAccount} onSelect={setSelectedAccount} onRefresh={loadAll} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className={`stat-value ${label === 'Daily P&L' ? pnlColor(stats.daily_pnl) : ''}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Equity Curve</h3>
          {stats.equity_curve.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.equity_curve}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={v => [formatCurrency(v), 'Balance']} labelFormatter={d => new Date(d).toLocaleDateString()} />
                <Line type="monotone" dataKey="balance" stroke="#338bff" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">No trade data yet</div>
          )}
        </div>
        <div className="card p-4">
          <h3 className="font-semibold mb-4">Daily P&L</h3>
          {stats.daily_stats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.daily_stats}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={v => [formatCurrency(v), 'P&L']} />
                <Bar dataKey="net_pnl" fill="#338bff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-gray-400">No daily data yet</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold">Recent Trades</h3>
        </div>
        {stats.recent_trades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Volume</th>
                  <th className="px-4 py-3 font-medium">P&L</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_trades.map(trade => (
                  <tr key={trade.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{trade.symbol}</td>
                    <td className="px-4 py-3"><span className={trade.direction === 'BUY' ? 'badge-green' : 'badge-red'}>{trade.direction}</span></td>
                    <td className="px-4 py-3">{trade.volume}</td>
                    <td className={`px-4 py-3 font-medium ${pnlColor(trade.profit)}`}>{formatPnl(trade.profit)}</td>
                    <td className="px-4 py-3"><span className={trade.status === 'OPEN' ? 'badge-blue' : 'badge-gray'}>{trade.status}</span></td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(trade.open_time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-4 py-12 text-center text-gray-400">No trades yet. Add trades manually or sync from MT5.</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card"><span className="stat-label">Best Trade</span><span className={`stat-value ${pnlColor(stats.best_trade)}`}>{formatPnl(stats.best_trade)}</span></div>
        <div className="stat-card"><span className="stat-label">Worst Trade</span><span className={`stat-value ${pnlColor(stats.worst_trade)}`}>{formatPnl(stats.worst_trade)}</span></div>
        <div className="stat-card"><span className="stat-label">Current Streak</span><span className={`stat-value ${stats.streak > 0 ? 'text-emerald-500' : stats.streak < 0 ? 'text-red-500' : ''}`}>{stats.streak > 0 ? `${stats.streak}W` : stats.streak < 0 ? `${Math.abs(stats.streak)}L` : '-'}</span></div>
      </div>
    </div>
  )
}
