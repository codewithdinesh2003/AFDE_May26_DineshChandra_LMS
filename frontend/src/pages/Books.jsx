import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import Table from '../components/UI/Table'
import Modal from '../components/UI/Modal'
import Badge from '../components/UI/Badge'
import Button from '../components/UI/Button'
import bookService from '../services/bookService'

const EMPTY_FORM = { title: '', author: '', category: '', isbn: '', availability_status: 'available' }

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all
      ${type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
      {message}
    </div>
  )
}

export default function Books() {
  const [books, setBooks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await bookService.getAll()
      setBooks(res.data)
      setFiltered(res.data)
    } catch {
      showToast('Failed to load books', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(books.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    ))
  }, [search, books])

  const showToast = (message, type = 'success') => setToast({ message, type })

  const openAdd = () => { setEditBook(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  const openEdit = (book) => { setEditBook(book); setForm({ ...book }); setErrors({}); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.author.trim()) e.author = 'Author is required'
    if (!form.category.trim()) e.category = 'Category is required'
    if (!form.isbn.trim()) e.isbn = 'ISBN is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editBook) {
        await bookService.update(editBook.book_id, form)
        showToast('Book updated successfully')
      } else {
        await bookService.create(form)
        showToast('Book added successfully')
      }
      closeModal()
      load()
    } catch (err) {
      showToast(err.response?.data?.detail ?? 'Failed to save book', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (book) => {
    if (!confirm(`Delete "${book.title}"?`)) return
    try {
      await bookService.delete(book.book_id)
      showToast('Book deleted')
      load()
    } catch (err) {
      showToast(err.response?.data?.detail ?? 'Failed to delete book', 'error')
    }
  }

  const columns = [
    { key: 'title', label: 'Title', render: (r) => <span className="font-medium text-slate-800">{r.title}</span> },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { key: 'isbn', label: 'ISBN', render: (r) => <span className="font-mono text-xs text-slate-500">{r.isbn}</span> },
    { key: 'availability_status', label: 'Status', render: (r) => <Badge status={r.availability_status} /> },
    {
      key: 'actions', label: 'Actions', render: (r) => (
        <div className="flex items-center gap-1.5">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
            <Pencil size={15} />
          </button>
          <button onClick={() => handleDelete(r)} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-sm"
        />
        <div className="sm:ml-auto">
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Book
          </Button>
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={loading} />

      <Modal isOpen={modalOpen} onClose={closeModal} title={editBook ? 'Edit Book' : 'Add New Book'}>
        <div className="space-y-4">
          {[
            { field: 'title', label: 'Title', placeholder: 'e.g. The Great Gatsby' },
            { field: 'author', label: 'Author', placeholder: 'e.g. F. Scott Fitzgerald' },
            { field: 'category', label: 'Category', placeholder: 'e.g. Fiction' },
            { field: 'isbn', label: 'ISBN', placeholder: 'e.g. 978-3-16-148410-0' },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input
                className="input-field"
                placeholder={placeholder}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
              {errors[field] && <p className="text-rose-500 text-xs mt-1">{errors[field]}</p>}
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Availability</label>
            <select
              className="input-field"
              value={form.availability_status}
              onChange={(e) => setForm({ ...form, availability_status: e.target.value })}
            >
              <option value="available">Available</option>
              <option value="borrowed">Borrowed</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editBook ? 'Update' : 'Add Book'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
