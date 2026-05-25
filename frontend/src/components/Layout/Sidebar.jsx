import { NavLink } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Users, ArrowLeftRight, Search, BookMarked, BarChart2 } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/books', label: 'Books', icon: BookOpen },
  { to: '/borrowers', label: 'Borrowers', icon: Users },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-navy-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-navy-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
            <BookMarked size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-display font-bold text-lg leading-none">LibraryOS</p>
            <p className="text-slate-400 text-xs mt-0.5">Management Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border-l-2 border-indigo-400 pl-[10px]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border-l-2 border-transparent pl-[10px]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-navy-700">
        <span className="text-xs text-slate-500 font-mono bg-navy-800 px-2 py-1 rounded">v1.0.0</span>
      </div>
    </aside>
  )
}
