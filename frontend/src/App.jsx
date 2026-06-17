import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useTheme } from './hooks/useTheme'
import Dashboard from './pages/Dashboard'
import TradeJournal from './pages/TradeJournal'
import TradeDetail from './pages/TradeDetail'
import EntryModels from './pages/EntryModels'
import Charts from './pages/Charts'
import Rules from './pages/Rules'
import {
  LayoutDashboard,
  BookOpen,
  Target,
  LineChart,
  Shield,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/journal', icon: BookOpen, label: 'Trade Journal' },
  { to: '/entry-models', icon: Target, label: 'Entry Models' },
  { to: '/charts', icon: LineChart, label: 'Charts' },
  { to: '/rules', icon: Shield, label: 'Rules' },
]

export default function App() {
  const { isDark, toggle } = useTheme()

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">TradeDash</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Trading Dashboard</p>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={toggle}
              className="sidebar-link-inactive w-full"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </aside>

        {/* Mobile header */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">TradeDash</span>
            </div>
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </header>

          {/* Mobile bottom nav */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/journal" element={<TradeJournal />} />
              <Route path="/journal/:id" element={<TradeDetail />} />
              <Route path="/entry-models" element={<EntryModels />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/rules" element={<Rules />} />
            </Routes>
          </main>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center py-2 text-[10px] ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-500 dark:text-gray-400'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </BrowserRouter>
  )
}
