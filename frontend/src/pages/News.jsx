import { useState, useEffect } from 'react'
import { RefreshCw, List, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'NZD', 'CAD']

const CURRENCY_FLAGS = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CHF: '🇨🇭',
  AUD: '🇦🇺', NZD: '🇳🇿', CAD: '🇨🇦', CNY: '🇨🇳',
}

const IMPACT_COLORS = {
  High: 'bg-red-500',
  Medium: 'bg-orange-400',
  Low: 'bg-yellow-400',
  Holiday: 'bg-gray-400',
}

export default function News() {
  const [events, setEvents] = useState([])
  const [grouped, setGrouped] = useState({})
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')
  const [selectedCurrencies, setSelectedCurrencies] = useState(new Set(CURRENCIES))
  const [selectedImpact, setSelectedImpact] = useState({ High: true, Medium: true, Low: true })
  const [refreshing, setRefreshing] = useState(false)

  const fetchNews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/news')
      const data = await res.json()
      setEvents(data.events || [])
      setGrouped(data.grouped || {})
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => { fetchNews() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchNews()
    setRefreshing(false)
  }

  const toggleCurrency = (cur) => {
    setSelectedCurrencies(prev => {
      const next = new Set(prev)
      if (next.has(cur)) next.delete(cur)
      else next.add(cur)
      return next
    })
  }

  const clearCurrencies = () => setSelectedCurrencies(new Set())
  const selectAllCurrencies = () => setSelectedCurrencies(new Set(CURRENCIES))

  const filteredEvents = events.filter(e => {
    if (!selectedCurrencies.has(e.country)) return false
    if (e.impact === 'High' && !selectedImpact.High) return false
    if (e.impact === 'Medium' && !selectedImpact.Medium) return false
    if (e.impact === 'Low' && !selectedImpact.Low) return false
    return true
  })

  const filteredGrouped = {}
  filteredEvents.forEach(e => {
    if (!filteredGrouped[e.date]) filteredGrouped[e.date] = []
    filteredGrouped[e.date].push(e)
  })

  const sortedDates = Object.keys(filteredGrouped).sort((a, b) => new Date(b) - new Date(a))

  const now = new Date()
  const hours = now.getUTCHours().toString().padStart(2, '0')
  const mins = now.getUTCMinutes().toString().padStart(2, '0')

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">News</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Key market events and data releases at your fingertips.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <button onClick={() => setView('list')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 ${view === 'list' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              <List className="w-3 h-3" /> List
            </button>
            <button onClick={() => setView('calendar')}
              className={`px-3 py-1.5 text-xs font-medium flex items-center gap-1 ${view === 'calendar' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              <Calendar className="w-3 h-3" /> Calendar
            </button>
          </div>
          <button onClick={handleRefresh} className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Left: Filters */}
        <div className="w-56 shrink-0 space-y-5">
          {/* Quick date links */}
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-primary-600 hover:underline cursor-pointer font-medium">Today</span>
            <span className="text-primary-600 hover:underline cursor-pointer">Tomorrow</span>
            <span className="text-primary-600 hover:underline cursor-pointer">This week</span>
            <span className="text-primary-600 hover:underline cursor-pointer">Next week</span>
            <span className="text-primary-600 hover:underline cursor-pointer">This month</span>
            <span className="text-primary-600 hover:underline cursor-pointer">Next month</span>
          </div>

          {/* Currencies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Currencies</span>
              <div className="flex gap-2">
                {selectedCurrencies.size === CURRENCIES.length
                  ? <button onClick={clearCurrencies} className="text-[10px] text-primary-600 hover:underline">Clear</button>
                  : <button onClick={selectAllCurrencies} className="text-[10px] text-primary-600 hover:underline">All selected</button>
                }
              </div>
            </div>
            <div className="space-y-1">
              {CURRENCIES.map(cur => (
                <label key={cur} className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input type="checkbox" checked={selectedCurrencies.has(cur)} onChange={() => toggleCurrency(cur)}
                    className="w-3.5 h-3.5 rounded text-primary-600" />
                  <span className="text-sm">{CURRENCY_FLAGS[cur] || '🏳️'} {cur}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Impact */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Impact</span>
            </div>
            <div className="space-y-1">
              {['High', 'Medium', 'Low'].map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input type="checkbox" checked={selectedImpact[level]}
                    onChange={() => setSelectedImpact(prev => ({ ...prev, [level]: !prev[level] }))}
                    className="w-3.5 h-3.5 rounded text-primary-600" />
                  <div className={`w-2.5 h-2.5 rounded-full ${IMPACT_COLORS[level]}`} />
                  <span className="text-sm">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Event list */}
        <div className="flex-1">
          {/* Time display */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><ChevronRight className="w-4 h-4" /></button>
              <span className="font-semibold">This Week & Next Week</span>
            </div>
            <span className="text-sm text-gray-500">{hours}:{mins} <span className="text-[10px]">(UTC)</span></span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No events match your filters</div>
          ) : (
            <div className="card overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[40px_60px_55px_40px_1fr_80px_80px_80px] px-3 py-2 text-[10px] text-gray-400 uppercase border-b border-gray-200 dark:border-gray-800 font-medium">
                <span></span>
                <span>Time</span>
                <span>Currency</span>
                <span>Impact</span>
                <span>Event</span>
                <span className="text-right">Actual</span>
                <span className="text-right">Forecast</span>
                <span className="text-right">Previous</span>
              </div>

              {sortedDates.map(date => (
                <div key={date}>
                  {/* Date header */}
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{date}</span>
                  </div>
                  {/* Events */}
                  {filteredGrouped[date].sort((a, b) => (b.time || '').localeCompare(a.time || '')).map((event, idx) => (
                    <div key={idx} className="grid grid-cols-[40px_60px_55px_40px_1fr_80px_80px_80px] px-3 py-2.5 border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 items-center text-sm">
                      <button className="text-gray-300 dark:text-gray-600 hover:text-primary-600"><Plus className="w-3.5 h-3.5" /></button>
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">{event.time || '-'}</span>
                      <span className="flex items-center gap-1 text-xs font-medium">
                        <span>{CURRENCY_FLAGS[event.country] || '🏳️'}</span>
                        <span>{event.country}</span>
                      </span>
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${IMPACT_COLORS[event.impact] || 'bg-gray-300'}`} />
                      </div>
                      <span className="text-sm">{event.title}</span>
                      <span className={`text-xs text-right font-medium ${event.actual ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>{event.actual || '-'}</span>
                      <span className="text-xs text-right text-gray-500">{event.forecast || '-'}</span>
                      <span className="text-xs text-right text-gray-500">{event.previous || '-'}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
