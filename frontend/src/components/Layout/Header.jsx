import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useState, useEffect } from 'react'

const titles = {
  '/': 'Dashboard',
  '/books': 'Books',
  '/borrowers': 'Borrowers',
  '/transactions': 'Transactions',
  '/search': 'Search',
}

export default function Header() {
  const { pathname } = useLocation()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  const title = titles[pathname] ?? 'Library OS'
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
      <h1 className="font-display font-bold text-xl text-slate-800">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">{dateStr}</span>
        <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
          <Bell size={18} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
        </button>
      </div>
    </header>
  )
}
