'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, UserCheck, UserX, Key, Loader2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Profile } from '@/types'

export function SellersClient({ sellers: initial }: { sellers: Profile[] }) {
  const [sellers, setSellers] = useState(initial)
  const [showCreate, setShowCreate] = useState(false)
  const [showReset, setShowReset] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', full_name: '', phone: '', role: 'seller', password: '' })
  const [newPassword, setNewPassword] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || 'Ошибка при создании')
      setLoading(false)
      return
    }

    toast.success('Пользователь создан')
    setSellers(prev => [data.profile, ...prev])
    setShowCreate(false)
    setForm({ email: '', full_name: '', phone: '', role: 'seller', password: '' })
    setLoading(false)
  }

  async function toggleStatus(seller: Profile) {
    const newStatus = seller.status === 'active' ? 'disabled' : 'active'
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', seller.id)

    if (error) {
      toast.error('Ошибка: ' + error.message)
      return
    }

    setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, status: newStatus } : s))
    toast.success(newStatus === 'active' ? 'Пользователь активирован' : 'Пользователь отключён')
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: showReset, newPassword }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || 'Ошибка')
      setLoading(false)
      return
    }

    toast.success('Пароль изменён')
    setShowReset(null)
    setNewPassword('')
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />Создать пользователя
        </Button>
      </div>

      {sellers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Нет пользователей</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl divide-y">
          {sellers.map(seller => (
            <div key={seller.id} className="flex items-center justify-between p-4 gap-3">
              <div className="min-w-0">
                <p className="font-medium text-gray-900">{seller.full_name || seller.email}</p>
                <p className="text-sm text-gray-500">{seller.email}</p>
                {seller.phone && <p className="text-sm text-gray-500">{seller.phone}</p>}
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${seller.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {seller.role === 'admin' ? 'Администратор' : 'Продавец'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${seller.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {seller.status === 'active' ? 'Активен' : 'Отключён'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setShowReset(seller.id); setNewPassword('') }}
                >
                  <Key className="h-4 w-4" />
                </Button>
                <Button
                  variant={seller.status === 'active' ? 'destructive' : 'default'}
                  size="sm"
                  onClick={() => toggleStatus(seller)}
                >
                  {seller.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create user dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать пользователя</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="agent@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label>ФИО *</Label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required placeholder="Иван Иванов" />
            </div>
            <div className="space-y-1.5">
              <Label>Телефон</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 999 123-45-67" />
            </div>
            <div className="space-y-1.5">
              <Label>Роль</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="seller">Продавец</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Временный пароль *</Label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Минимум 8 символов" minLength={8} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Создать
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Отмена</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset password dialog */}
      <Dialog open={!!showReset} onOpenChange={() => setShowReset(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сбросить пароль</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Новый пароль</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} placeholder="Минимум 8 символов" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Изменить пароль
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowReset(null)}>Отмена</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
