import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Table from '../components/UI/Table'
import Modal from '../components/UI/Modal'
import Button from '../components/UI/Button'
import borrowerService from '../services/borrowerService'

const EMPTY_FORM = { borrower_name: '', email: '', phone: '' }

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium
      ${type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
      {message}
    </div>
  )
}

export default function Borrowers() {
  const [borrowers, setBorrowers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editBorrower, setEditBorrower] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await borrowerService.getAll()
      setBorrowers(res.data)
      setFiltered(res.data)
    } catch {
      showToast('Failed to load borrowers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(borrowers.filter(b =>
      b.borrower_name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.phone.includes(q)
    ))
  }, [search, borrowers])

  const showToast = (message, type = 'success') => setToast({ message, type })
  const openAdd = () => { setEditBorrower(null); setForm(EMPTY_FORM); setErrors({}); setModalOpen(true) }
  const openEdit = (b) => { setEditBorrower(b); setForm({ borrower_name: b.borrower_name, email: b.email, phone: b.phone }); setErrors({}); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setErrors({}) }

  const validate = () => {
    const e = {}
    if (!form.borrower_name.trim()) e.borrower_name = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      if (editBorrower) {
        await borrowerService.update(editBorrower.borrower_id, form)
        showToast('Borrower updated')
      } else {
        await borrowerService.create(form)
        showToast('Borrower registered')
      }
      closeModal()
      load()
    } catch (err) {
      showToast(err.response?.data?.detail ?? 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (b) => {
    if (!confirm(`Delete borrower "${b.borrower_name}"?`)) return
    try {
      await borrowerService.delete(b.borrower_id)
      showToast('Borrower removed')
      load()
    } catch (err) {
      showToast(err.response?.data?.detail ?? 'Failed to delete', 'error')
    }
  }

  const columns = [
    { key: 'borrower_name', label: 'Name', render: (r) => <span className="font-medium text-slate-800">{r.borrower_name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'created_at', label: 'Registered', render: (r) => new Date(r.created_at).toLocaleDateString() },
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
          placeholder="Search borrowers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-sm"
        />
        <div className="sm:ml-auto">
          <Button onClick={openAdd}><Plus size={16} /> Add Borrower</Button>
        </div>
      </div>

      <Table columns={columns} data={filtered} loading={loading} />

      <Modal isOpen={modalOpen} onClose={closeModal} title={editBorrower ? 'Edit Borrower' : 'Register Borrower'}>
        <div className="space-y-4">
          {[
            { field: 'borrower_name', label: 'Full Name', placeholder: 'e.g. Jane Doe' },
            { field: 'email', label: 'Email', placeholder: 'e.g. jane@example.com' },
            { field: 'phone', label: 'Phone', placeholder: 'e.g. +1 555 123 4567' },
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
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editBorrower ? 'Update' : 'Register'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
