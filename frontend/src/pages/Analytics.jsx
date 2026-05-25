import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, Clock, Users, AlertTriangle, ArrowLeftRight, CheckCircle2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { getSummary, getPopularBooks, getCategoryWise, getMonthlyTrends, getOverdue } from '../services/analyticsService'

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

function SkeletonCard({ height = 'h-64' }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-xl ${height}`} />
  )
}

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [popularBooks, setPopularBooks] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [monthlyTrends, setMonthlyTrends] = useState([])
  const [overdue, setOverdue] = useState([])
  const [loading, setLoading] = useState({ summary: true, charts: true, overdue: true })

  useEffect(() => {
    getSummary()
      .then(r => setSummary(r.data))
      .finally(() => setLoading(p => ({ ...p, summary: false })))

    Promise.all([getPopularBooks(), getCategoryWise(), getMonthlyTrends()])
      .then(([pb, cw, mt]) => {
        setPopularBooks(pb.data.map(b => ({ ...b, title: b.title.length > 20 ? b.title.slice(0, 20) + '…' : b.title })))
        setCategoryData(cw.data)
        setMonthlyTrends(mt.data)
      })
      .finally(() => setLoading(p => ({ ...p, charts: false })))

    getOverdue()
      .then(r => setOverdue(r.data))
      .finally(() => setLoading(p => ({ ...p, overdue: false })))
  }, [])

  const summaryCards = summary
    ? [
        { title: 'Total Books', value: summary.total_books, icon: BookOpen, color: 'bg-indigo-50 text-indigo-600' },
        { title: 'Available', value: summary.available_books, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
        { title: 'Borrowed', value: summary.borrowed_books, icon: Clock, color: 'bg-amber-50 text-amber-600' },
        { title: 'Overdue', value: summary.overdue_count, icon: AlertTriangle, color: 'bg-rose-50 text-rose-600' },
        { title: 'Borrowers', value: summary.total_borrowers, icon: Users, color: 'bg-violet-50 text-violet-600' },
        { title: 'Transactions', value: summary.total_transactions, icon: ArrowLeftRight, color: 'bg-slate-100 text-slate-600' },
      ]
    : []

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Section 1 — Summary Bar */}
      {loading.summary ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} height="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {summaryCards.map(({ title, value, icon: Icon, color }) => (
            <div key={title} className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-display font-bold text-slate-800">{value ?? '—'}</p>
              <p className="text-xs text-slate-500 font-medium">{title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section 2 — Monthly Trends */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-display text-lg font-semibold text-slate-800 mb-4">Monthly Borrowing & Return Trends</h2>
        {loading.charts ? (
          <SkeletonCard height="h-64" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTrends} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBorrow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradReturn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month_label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="total_borrows" name="Borrows" stroke="#6366F1" strokeWidth={2} fill="url(#gradBorrow)" />
              <Area type="monotone" dataKey="total_returns" name="Returns" stroke="#10B981" strokeWidth={2} fill="url(#gradReturn)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Section 3 — Popular Books + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Most Popular Books (60%) */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-4">Most Borrowed Books</h2>
          {loading.charts ? (
            <SkeletonCard height="h-72" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={popularBooks} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#818CF8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="title" width={130} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="total_borrows" name="Borrows" fill="url(#barGrad)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Distribution (40%) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-display text-lg font-semibold text-slate-800 mb-4">Borrowing by Category</h2>
          {loading.charts ? (
            <SkeletonCard height="h-72" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="total_borrows"
                  nameKey="category"
                  cx="50%"
                  cy="44%"
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Section 4 — Overdue Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-display text-lg font-semibold text-slate-800">Overdue Transactions</h2>
          {!loading.overdue && (
            <span className="bg-rose-100 text-rose-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {overdue.length}
            </span>
          )}
        </div>

        {loading.overdue ? (
          <div className="animate-pulse space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded" />)}
          </div>
        ) : overdue.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-2 text-slate-400">
            <CheckCircle2 size={36} className="text-emerald-400" />
            <p className="text-sm font-medium">No overdue transactions</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Book Title', 'Borrower', 'Email', 'Borrow Date', 'Days Overdue', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdue.map(row => (
                  <tr key={row.overdue_id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.book_title}</td>
                    <td className="px-4 py-3 text-slate-600">{row.borrower_name}</td>
                    <td className="px-4 py-3 text-slate-500">{row.borrower_email}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(row.borrow_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-rose-600 font-semibold">{row.days_overdue}d</td>
                    <td className="px-4 py-3">
                      <span className="bg-rose-100 text-rose-600 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
