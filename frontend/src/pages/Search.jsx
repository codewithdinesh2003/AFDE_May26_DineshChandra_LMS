import { useState, useRef } from 'react'
import { Search as SearchIcon, BookOpen } from 'lucide-react'
import Badge from '../components/UI/Badge'
import bookService from '../services/bookService'

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse space-y-3">
      <div className="h-5 bg-slate-100 rounded w-3/4" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
      <div className="h-4 bg-slate-100 rounded w-1/3" />
    </div>
  )
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  const doSearch = async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return }
    setLoading(true)
    setError(null)
    try {
      const res = await bookService.search(q)
      setResults(res.data)
      setSearched(true)
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 400)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current)
      doSearch(query)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search bar */}
      <div className="relative">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-12 pr-4 py-3.5 text-base border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all bg-white"
          placeholder="Search by title, author, or category…"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-5 py-3 text-sm">{error}</div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Results */}
      {!loading && searched && (
        results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <BookOpen size={48} strokeWidth={1} />
            <p className="text-lg font-medium">No books found</p>
            <p className="text-sm">Try a different title, author, or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((book) => (
              <div key={book.book_id} className="card p-5 hover:shadow-md transition-shadow space-y-3">
                <div>
                  <h3 className="font-display font-semibold text-slate-800 text-base leading-snug">{book.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{book.author}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">{book.category}</span>
                  <Badge status={book.availability_status} />
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Initial state */}
      {!loading && !searched && (
        <div className="flex flex-col items-center gap-3 py-20 text-slate-300">
          <SearchIcon size={48} strokeWidth={1} />
          <p className="text-lg font-medium text-slate-400">Start typing to search books</p>
        </div>
      )}
    </div>
  )
}
