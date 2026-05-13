import { useState, useEffect } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import Table from '../components/UI/Table'
import Modal from '../components/UI/Modal'
import Badge from '../components/UI/Badge'
import Button from '../components/UI/Button'
import transactionService from '../services/transactionService'
import bookService from '../services/bookService'
import borrowerService from '../services/borrowerService'

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
      ${type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
      {message}
    </div>
  )
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [availableBooks, setAvailableBooks] = useState([])
  const [borrowers, setBorrowers] = useState([])
  const [form, setForm] = useState({ book_id: '', borrower_id: '' })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await transactionService.getAll()
      setTransactions(res.data.reverse())
    } catch {
      showToast('Failed to load transactions', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openBorrowModal = async () => {
    try {
      const [booksRes, borRes] = await Promise.all([bookService.getAll(), borrowerService.getAll()])
      setAvailableBooks(booksRes.data.filter(b => b.availability_status === 'available'))
      setBorrowers(borRes.data)
    } catch {
      showToast('Failed to load data', 'error')
      return
    }
    setForm({ book_id: '', borrower_id: '' })
    setErrors({})
    setModalOpen(true)
  }

  const showToast = (message, type = 'success') => setToast({ message, type })

  const validate = () => {
    const e = {}
    if (!form.book_id) e.book_id = 'Select a book'
    if (!form.borrower_id) e.borrower_id = 'Select a borrower'
    return e
  }

  const handleBorrow = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      await transactionService.borrow({ book_id: Number(form.book_id), borrower_id: Number(form.borrower_id) })
      showToast('Book borrowed successfully')
      setModalOpen(false)
      load()
    } catch (err) {
      showToast(err.response?.data?.detail ?? 'Failed to borrow', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReturn = async (tx) => {
    if (!confirm(`Return "${tx.book?.title ?? 'this book'}"?`)) return
    try {
      await transactionService.returnBook({ transaction_id: tx.transaction_id })
      showToast('Book returned successfully')
      load()
    } catch (err) {
      showToast(err.response?.data?.detail ?? 'Failed to return', 'error')
    }
  }

  const columns = [
    { key: 'transaction_id', label: 'ID', render: (r) => <span className="font-mono text-xs text-slate-400">#{r.transaction_id}</span> },
    { key: 'book', label: 'Book', render: (r) => <span className="font-medium text-slate-800">{r.book?.title ?? `Book #${r.book_id}`}</span> },
    { key: 'borrower', label: 'Borrower', render: (r) => r.borrower?.borrower_name ?? `Borrower #${r.borrower_id}` },
    { key: 'borrow_date', label: 'Borrowed', render: (r) => new Date(r.borrow_date).toLocaleDateString() },
    { key: 'return_date', label: 'Returned', render: (r) => r.return_date ? new Date(r.return_date).toLocaleDateString() : '—' },
    { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      key: 'action', label: 'Action', render: (r) => r.status === 'borrowed' ? (
        <button
          onClick={() => handleReturn(r)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium transition-colors"
        >
          <RotateCcw size={13} /> Return
        </button>
      ) : null,
    },
  ]

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-end">
        <Button onClick={openBorrowModal}><Plus size={16} /> Borrow Book</Button>
      </div>

      <Table columns={columns} data={transactions} loading={loading} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Borrow a Book">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Book</label>
            <select
              className="input-field"
              value={form.book_id}
              onChange={(e) => setForm({ ...form, book_id: e.target.value })}
            >
              <option value="">Select an available book</option>
              {availableBooks.map(b => (
                <option key={b.book_id} value={b.book_id}>{b.title} — {b.author}</option>
              ))}
            </select>
            {errors.book_id && <p className="text-rose-500 text-xs mt-1">{errors.book_id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Borrower</label>
            <select
              className="input-field"
              value={form.borrower_id}
              onChange={(e) => setForm({ ...form, borrower_id: e.target.value })}
            >
              <option value="">Select a borrower</option>
              {borrowers.map(b => (
                <option key={b.borrower_id} value={b.borrower_id}>{b.borrower_name} — {b.email}</option>
              ))}
            </select>
            {errors.borrower_id && <p className="text-rose-500 text-xs mt-1">{errors.borrower_id}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleBorrow} disabled={saving}>{saving ? 'Processing…' : 'Confirm Borrow'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
