'use client'
import { useState } from 'react'
import { createClientAction, updateClientAction, deleteClientAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2, Users, Phone, Mail, DollarSign, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import type { Client, District, Profile, ClientStatus } from '@/types'
import { PROPERTY_TYPE_LABELS } from '@/lib/utils'

const STATUS_LABELS: Record<ClientStatus, string> = {
  new: 'Новый',
  active: 'В работе',
  closed: 'Закрыт',
  lost: 'Отказ',
}

const STATUS_COLORS: Record<ClientStatus, string> = {
  new: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  active: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  closed: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  lost: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
}

const PROPERTY_TYPES = Object.entries(PROPERTY_TYPE_LABELS)

type Seller = Pick<Profile, 'id' | 'full_name' | 'email' | 'role'>

interface Props {
  clients: Client[]
  sellers: Seller[]
  districts: District[]
  currentUserId: string
  isAdmin: boolean
}

type FormState = {
  full_name: string
  phone: string
  email: string
  budget_min: string
  budget_max: string
  assigned_to: string
  status: ClientStatus
  notes: string
  property_types: string[]
  district_ids: string[]
}

const emptyForm = (defaultAssignee = ''): FormState => ({
  full_name: '',
  phone: '',
  email: '',
  budget_min: '',
  budget_max: '',
  assigned_to: defaultAssignee,
  status: 'new',
  notes: '',
  property_types: [],
  district_ids: [],
})

function formToPayload(f: FormState) {
  return {
    full_name: f.full_name,
    phone: f.phone || null,
    email: f.email || null,
    budget_min: f.budget_min ? Number(f.budget_min) : null,
    budget_max: f.budget_max ? Number(f.budget_max) : null,
    assigned_to: f.assigned_to || null,
    status: f.status,
    notes: f.notes || null,
    property_types: f.property_types.length ? f.property_types : null,
    district_ids: f.district_ids.length ? f.district_ids : null,
  }
}

function clientToForm(c: Client): FormState {
  return {
    full_name: c.full_name,
    phone: c.phone || '',
    email: c.email || '',
    budget_min: c.budget_min?.toString() || '',
    budget_max: c.budget_max?.toString() || '',
    assigned_to: c.assigned_to || '',
    status: c.status,
    notes: c.notes || '',
    property_types: c.property_types || [],
    district_ids: c.district_ids || [],
  }
}

interface ClientFormProps {
  form: FormState
  setForm: React.Dispatch<React.SetStateAction<FormState>>
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  title: string
  loading: boolean
  isAdmin: boolean
  sellers: Seller[]
  districts: District[]
}

function ClientForm({ form, setForm, onSubmit, onCancel, title, loading, isAdmin, sellers, districts }: ClientFormProps) {
  function togglePropType(type: string) {
    setForm(f => ({
      ...f,
      property_types: f.property_types.includes(type)
        ? f.property_types.filter(t => t !== type)
        : [...f.property_types, type],
    }))
  }

  function toggleDistrict(id: string) {
    setForm(f => ({
      ...f,
      district_ids: f.district_ids.includes(id)
        ? f.district_ids.filter(d => d !== id)
        : [...f.district_ids, id],
    }))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>ФИО *</Label>
          <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required placeholder="Иван Иванов" />
        </div>
        <div className="space-y-1.5">
          <Label>Телефон</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+995 591 234567" />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="client@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label>Статус</Label>
          <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ClientStatus }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Бюджет от ($)</Label>
          <Input type="number" value={form.budget_min} onChange={e => setForm(f => ({ ...f, budget_min: e.target.value }))} placeholder="50000" />
        </div>
        <div className="space-y-1.5">
          <Label>Бюджет до ($)</Label>
          <Input type="number" value={form.budget_max} onChange={e => setForm(f => ({ ...f, budget_max: e.target.value }))} placeholder="150000" />
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-1.5">
          <Label>Ответственный</Label>
          <Select value={form.assigned_to} onValueChange={v => setForm(f => ({ ...f, assigned_to: v }))}>
            <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
            <SelectContent>
              {sellers.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name || s.email}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {districts.length > 0 && (
        <div className="space-y-1.5">
          <Label>Интересующие районы</Label>
          <div className="flex flex-wrap gap-2">
            {districts.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDistrict(d.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  form.district_ids.includes(d.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
              >{d.name}</button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Тип объекта</Label>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map(([k, v]) => (
            <button
              key={k}
              type="button"
              onClick={() => togglePropType(k)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                form.property_types.includes(k)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >{v}</button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Заметки</Label>
        <textarea
          value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          rows={3}
          placeholder="Пожелания, детали..."
          className="flex w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {title}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>
      </div>
    </form>
  )
}

export function ClientsClient({ clients: initial, sellers, districts, currentUserId, isAdmin }: Props) {
  const [clients, setClients] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm(currentUserId))
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name.trim()) return
    setLoading(true)
    const result = await createClientAction(formToPayload(form))
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Клиент добавлен')
      setShowCreate(false)
      setForm(emptyForm(currentUserId))
      window.location.reload()
    }
    setLoading(false)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editId) return
    setLoading(true)
    const result = await updateClientAction(editId, formToPayload(form))
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Сохранено')
      setClients(prev => prev.map(c => c.id === editId ? { ...c, ...formToPayload(form) } : c))
      setEditId(null)
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)
    const result = await deleteClientAction(deleteId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Клиент удалён')
      setClients(prev => prev.filter(c => c.id !== deleteId))
      setDeleteId(null)
    }
    setLoading(false)
  }

  async function handleStatusChange(id: string, status: ClientStatus) {
    const result = await updateClientAction(id, { status })
    if (result.error) { toast.error(result.error); return }
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    toast.success('Статус обновлён')
  }

  function openEdit(c: Client) {
    setForm(clientToForm(c))
    setEditId(c.id)
  }

  const filtered = filterStatus === 'all' ? clients : clients.filter(c => c.status === filterStatus)

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'new', 'active', 'closed', 'lost'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {s === 'all' ? `Все (${clients.length})` : `${STATUS_LABELS[s as ClientStatus]} (${clients.filter(c => c.status === s).length})`}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm(currentUserId)); setShowCreate(true) }}>
          <Plus className="h-4 w-4" />Добавить клиента
        </Button>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <Users className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Нет клиентов</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800">
          {filtered.map(c => {
            const expanded = expandedId === c.id
            const assignedName = (c.assigned_profile as any)?.full_name || (c.assigned_profile as any)?.email || '—'
            return (
              <div key={c.id}>
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{c.full_name}</span>
                      <Select value={c.status} onValueChange={v => handleStatusChange(c.id, v as ClientStatus)}>
                        <SelectTrigger className={`h-6 text-xs px-2 w-auto border-0 shadow-none ${STATUS_COLORS[c.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                          <Phone className="h-3 w-3" />{c.phone}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600">
                          <Mail className="h-3 w-3" />{c.email}
                        </a>
                      )}
                      {(c.budget_min || c.budget_max) && (
                        <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-3 w-3" />
                          {c.budget_min?.toLocaleString() || '0'} — {c.budget_max?.toLocaleString() || '∞'}
                        </span>
                      )}
                    </div>

                    {/* Assigned + tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Ответственный: {assignedName}</span>
                    </div>

                    {/* Expanded details */}
                    {expanded && (
                      <div className="mt-3 space-y-2">
                        {c.property_types && c.property_types.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Тип объекта:</span>
                            {c.property_types.map(t => (
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{PROPERTY_TYPE_LABELS[t as keyof typeof PROPERTY_TYPE_LABELS] || t}</span>
                            ))}
                          </div>
                        )}
                        {c.district_ids && c.district_ids.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Районы:</span>
                            {/* district names would need to be passed down; show ids as fallback */}
                            <span className="text-xs text-gray-600 dark:text-gray-400">{c.district_ids.length} выбрано</span>
                          </div>
                        )}
                        {c.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">{c.notes}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setExpandedId(expanded ? null : c.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded"
                    >
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить клиента</DialogTitle>
          </DialogHeader>
          <ClientForm
            form={form} setForm={setForm}
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            title="Добавить"
            loading={loading}
            isAdmin={isAdmin}
            sellers={sellers}
            districts={districts}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={v => { if (!v) setEditId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать клиента</DialogTitle>
          </DialogHeader>
          <ClientForm
            form={form} setForm={setForm}
            onSubmit={handleEdit}
            onCancel={() => setEditId(null)}
            title="Сохранить"
            loading={loading}
            isAdmin={isAdmin}
            sellers={sellers}
            districts={districts}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить клиента?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 dark:text-gray-400">Это действие нельзя отменить.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Удалить
            </Button>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
