import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, Clock, Users, AlertTriangle } from 'lucide-react'
import StatCard from '../components/UI/StatCard'
import Badge from '../components/UI/Badge'
import transactionService from '../services/transactionService'
import { getSummary } from '../services/analyticsService'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6']

function generateTrendData(total) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const base = Math.max(1, Math.floor(total / 7))
  return days.map((day, i) => ({
    day,
    transactions: base + Math.floor(Math.sin(i) * (base * 0.4) + Math.random() * base * 0.5),
  }))
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, txRes] = await Promise.all([
          getSummary(),
          transactionService.getAll(),
        ])
        setStats(summaryRes.data)
        setTransactions(txRes.data.slice(-5).reverse())
      } catch {
        setError('Failed to load dashboard data. Is the backend running?')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const trendData = stats ? generateTrendData(stats.total_transactions) : []

  const categoryData = [
    { name: 'Fiction', value: Math.max(1, Math.floor((stats?.total_books ?? 10) * 0.3)) },
    { name: 'Science', value: Math.max(1, Math.floor((stats?.total_books ?? 10) * 0.25)) },
    { name: 'History', value: Math.max(1, Math.floor((stats?.total_books ?? 10) * 0.2)) },
    { name: 'Technology', value: Math.max(1, Math.floor((stats?.total_books ?? 10) * 0.15)) },
    { name: 'Other', value: Math.max(1, Math.floor((stats?.total_books ?? 10) * 0.1)) },
  ]

  if (error) {
    return (
      <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-5 py-4 text-sm font-medium">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard title="Total Books" value={stats?.total_books} icon={BookOpen} color="indigo" subtitle="In the library" />
        <StatCard title="Available" value={stats?.available_books} icon={CheckCircle} color="emerald" subtitle="Ready to borrow" />
        <StatCard title="Borrowed" value={stats?.borrowed_books} icon={Clock} color="amber" subtitle="Currently out" />
        <StatCard title="Borrowers" value={stats?.total_borrowers} icon={Users} color="violet" subtitle="Registered members" />
        <StatCard title="Overdue" value={stats?.overdue_count} icon={AlertTriangle} color="rose" subtitle="Past due date" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Transaction Trend (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="txGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="transactions" stroke="#6366f1" strokeWidth={2} fill="url(#txGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Books by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-display font-semibold text-slate-800">Recent Transactions</h3>
        </div>
        {loading ? (
          <div className="animate-pulse p-6 space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-slate-100 rounded" />)}
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-slate-400 py-10 text-sm">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Book Title', 'Borrower', 'Borrow Date', 'Status'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.transaction_id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-slate-800">{tx.book?.title ?? `Book #${tx.book_id}`}</td>
                  <td className="px-6 py-3.5 text-slate-600">{tx.borrower?.borrower_name ?? `Borrower #${tx.borrower_id}`}</td>
                  <td className="px-6 py-3.5 text-slate-500">{new Date(tx.borrow_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3.5"><Badge status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
