export default function Badge({ status }) {
  const styles = {
    available: 'bg-emerald-100 text-emerald-700',
    borrowed: 'bg-amber-100 text-amber-700',
    returned: 'bg-slate-100 text-slate-600',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] ?? styles.returned}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'available' ? 'bg-emerald-500' :
        status === 'borrowed' ? 'bg-amber-500' : 'bg-slate-400'
      }`} />
      {status}
    </span>
  )
}
