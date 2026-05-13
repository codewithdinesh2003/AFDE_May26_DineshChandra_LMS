export default function StatCard({ title, value, icon: Icon, color, subtitle }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
  }

  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color] ?? colorMap.indigo}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-display font-bold text-slate-800 mt-0.5">{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}
