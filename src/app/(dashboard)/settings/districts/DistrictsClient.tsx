'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Pencil, Trash2, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { District } from '@/types'

export function DistrictsClient({ districts: initial }: { districts: District[] }) {
  const [districts, setDistricts] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('districts').insert({ name }).select().single()

    if (error) {
      toast.error('Ошибка: ' + (error.message.includes('unique') ? 'Район с таким названием уже существует' : error.message))
      setLoading(false)
      return
    }

    setDistricts(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    toast.success('Район добавлен')
    setShowAdd(false)
    setName('')
    setLoading(false)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editId) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('districts').update({ name }).eq('id', editId)

    if (error) {
      toast.error('Ошибка: ' + error.message)
      setLoading(false)
      return
    }

    setDistricts(prev => prev.map(d => d.id === editId ? { ...d, name } : d).sort((a, b) => a.name.localeCompare(b.name)))
    toast.success('Район обновлён')
    setEditId(null)
    setName('')
    setLoading(false)
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('districts').delete().eq('id', deleteId)

    if (error) {
      toast.error('Ошибка: ' + (error.message.includes('foreign') ? 'Нельзя удалить район, к которому привязаны объекты' : error.message))
      setLoading(false)
      return
    }

    setDistricts(prev => prev.filter(d => d.id !== deleteId))
    toast.success('Район удалён')
    setDeleteId(null)
    setLoading(false)
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setShowAdd(true); setName('') }}>
          <Plus className="h-4 w-4" />Добавить район
        </Button>
      </div>

      <div className="bg-white border rounded-xl divide-y">
        {districts.length === 0 ? (
          <div className="text-center py-10">
            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Районы не добавлены</p>
          </div>
        ) : districts.map(d => (
          <div key={d.id} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-gray-900">{d.name}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setEditId(d.id); setName(d.name) }}>
                <Pencil className="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setDeleteId(d.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Добавить район</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Название района" required />
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Добавить
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>Отмена</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editId} onOpenChange={() => setEditId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Редактировать район</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <Input value={name} onChange={e => setName(e.target.value)} required />
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Сохранить
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditId(null)}>Отмена</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Удалить район?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">Нельзя удалить район с привязанными объектами.</p>
          <div className="flex gap-3">
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
