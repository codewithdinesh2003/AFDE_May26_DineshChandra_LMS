import { Inbox } from 'lucide-react'

export default function Table({ columns, data, loading }) {
  if (loading) {
    return (
      <div className="card overflow-hidden">
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-50">
              {columns.map((_, j) => (
                <div key={j} className="flex-1 h-4 bg-slate-100 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col) => (
                <th key={col.key} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Inbox size={36} strokeWidth={1.5} />
                    <p className="font-medium">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-3.5 text-slate-700 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
