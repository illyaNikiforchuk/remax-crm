'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { deletePropertyAction } from '../actions'

export function DeletePropertyButton({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const result = await deletePropertyAction(propertyId)
    if (result.error) {
      toast.error('Ошибка при удалении: ' + result.error)
      setLoading(false)
      return
    }
    toast.success('Объект удалён')
    router.push('/properties')
    router.refresh()
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" />Удалить
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить объект?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Это действие нельзя отменить. Объект будет удалён навсегда.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Удалить
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
