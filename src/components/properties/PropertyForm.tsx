'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createPropertyAction, updatePropertyAction } from '@/app/(dashboard)/properties/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { District, Property } from '@/types'
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/lib/utils'

const driveLinkSchema = z.object({
  url: z.string().url('Введите корректный URL'),
  label: z.string().min(1, 'Введите подпись'),
})

const schema = z.object({
  market_type: z.enum(['primary', 'secondary']),
  property_type: z.enum(['apartment', 'studio', 'apartments', 'house', 'commercial', 'land']),
  district_id: z.string().optional(),
  title: z.string().optional(),
  address: z.string().optional(),
  area: z.coerce.number().positive().optional().or(z.literal('')),
  price: z.coerce.number().positive().optional().or(z.literal('')),
  rooms: z.coerce.number().int().positive().optional().or(z.literal('')),
  floor: z.coerce.number().int().positive().optional().or(z.literal('')),
  total_floors: z.coerce.number().int().positive().optional().or(z.literal('')),
  status: z.enum(['for_sale', 'booked', 'sold', 'withdrawn']),
  developer: z.string().optional(),
  down_payment: z.coerce.number().positive().optional().or(z.literal('')),
  installment_months: z.coerce.number().int().positive().optional().or(z.literal('')),
  monthly_payment: z.coerce.number().positive().optional().or(z.literal('')),
  owner_name: z.string().optional(),
  owner_phone: z.string().optional(),
  description: z.string().optional(),
  drive_links: z.array(driveLinkSchema),
  extra_links: z.array(driveLinkSchema),
})

type FormData = z.infer<typeof schema>

interface Props {
  districts: District[]
  property?: Property
  mode: 'create' | 'edit'
}

export function PropertyForm({ districts, property, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      market_type: property?.market_type || 'secondary',
      property_type: property?.property_type || 'apartment',
      district_id: property?.district_id || undefined,
      title: property?.title || '',
      address: property?.address || '',
      area: property?.area || '',
      price: property?.price || '',
      rooms: property?.rooms || '',
      floor: property?.floor || '',
      total_floors: property?.total_floors || '',
      status: property?.status || 'for_sale',
      developer: property?.developer || '',
      down_payment: property?.down_payment || '',
      installment_months: property?.installment_months || '',
      monthly_payment: property?.monthly_payment || '',
      owner_name: property?.owner_name || '',
      owner_phone: property?.owner_phone || '',
      description: property?.description || '',
      drive_links: property?.drive_links || [],
      extra_links: property?.extra_links || [],
    },
  })

  const marketType = watch('market_type')

  const { fields: driveFields, append: appendDrive, remove: removeDrive } = useFieldArray({ control, name: 'drive_links' })
  const { fields: extraFields, append: appendExtra, remove: removeExtra } = useFieldArray({ control, name: 'extra_links' })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    setLoading(true)

    const payload = {
      market_type: data.market_type,
      property_type: data.property_type,
      district_id: data.district_id || null,
      title: data.title || null,
      address: data.address || null,
      area: data.area || null,
      price: data.price || null,
      rooms: data.rooms || null,
      floor: data.floor || null,
      total_floors: data.total_floors || null,
      status: data.status,
      developer: data.market_type === 'primary' ? data.developer || null : null,
      down_payment: data.market_type === 'primary' ? data.down_payment || null : null,
      installment_months: data.market_type === 'primary' ? data.installment_months || null : null,
      monthly_payment: data.market_type === 'primary' ? data.monthly_payment || null : null,
      owner_name: data.market_type === 'secondary' ? data.owner_name || null : null,
      owner_phone: data.market_type === 'secondary' ? data.owner_phone || null : null,
      description: data.description || null,
      drive_links: data.drive_links,
      extra_links: data.extra_links,
    }

    if (mode === 'create') {
      const result = await createPropertyAction(payload)
      if (result.error) {
        toast.error('Ошибка при создании: ' + result.error)
        setLoading(false)
        return
      }
      toast.success('Объект добавлен')
      router.push(`/properties/${result.id}`)
    } else {
      const result = await updatePropertyAction(property!.id, payload)
      if (result.error) {
        toast.error('Ошибка при сохранении: ' + result.error)
        setLoading(false)
        return
      }
      toast.success('Изменения сохранены')
      router.push(`/properties/${property!.id}`)
    }
    router.refresh()
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 space-y-4">
      <h2 className="font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 pb-3">{title}</h2>
      {children}
    </div>
  )

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-3xl">
      {/* Basic */}
      <Section title="Основная информация">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Тип рынка *">
            <Select value={watch('market_type')} onValueChange={v => setValue('market_type', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Первичка</SelectItem>
                <SelectItem value="secondary">Вторичка</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Тип объекта *">
            <Select value={watch('property_type')} onValueChange={v => setValue('property_type', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Район">
            <Select value={watch('district_id') || 'none'} onValueChange={v => setValue('district_id', v === 'none' ? undefined : v)}>
              <SelectTrigger><SelectValue placeholder="Выберите район" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не указан</SelectItem>
                {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Статус *">
            <Select value={watch('status')} onValueChange={v => setValue('status', v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PROPERTY_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Название / ЖК">
          <Input {...register('title')} placeholder="ЖК Морская жемчужина" />
        </Field>

        <Field label="Адрес">
          <Input {...register('address')} placeholder="ул. Горгиладзе 24" />
        </Field>
      </Section>

      {/* Params */}
      <Section title="Параметры">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Площадь (м²)" error={errors.area?.message}>
            <Input {...register('area')} type="number" step="0.01" placeholder="65" />
          </Field>
          <Field label="Цена ($)" error={errors.price?.message}>
            <Input {...register('price')} type="number" placeholder="85000" />
          </Field>
          <Field label="Комнат">
            <Input {...register('rooms')} type="number" placeholder="2" />
          </Field>
          <Field label="Этаж / Этажность">
            <div className="flex gap-2">
              <Input {...register('floor')} type="number" placeholder="5" />
              <Input {...register('total_floors')} type="number" placeholder="12" />
            </div>
          </Field>
        </div>
      </Section>

      {/* Primary market fields */}
      {marketType === 'primary' && (
        <Section title="Первичный рынок">
          <Field label="Застройщик">
            <Input {...register('developer')} placeholder="ООО СтройГрупп" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Первый взнос ($)">
              <Input {...register('down_payment')} type="number" placeholder="20000" />
            </Field>
            <Field label="Рассрочка (мес.)">
              <Input {...register('installment_months')} type="number" placeholder="24" />
            </Field>
            <Field label="Платёж/мес ($)">
              <Input {...register('monthly_payment')} type="number" placeholder="2500" />
            </Field>
          </div>
        </Section>
      )}

      {/* Secondary market fields */}
      {marketType === 'secondary' && (
        <Section title="Вторичный рынок — контакт собственника">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Имя собственника">
              <Input {...register('owner_name')} placeholder="Нодар Гамсахурдия" />
            </Field>
            <Field label="Телефон собственника">
              <Input {...register('owner_phone')} placeholder="+995 591 234567" />
            </Field>
          </div>
        </Section>
      )}

      {/* Description */}
      <Section title="Описание">
        <Textarea {...register('description')} rows={4} placeholder="Описание объекта..." />
      </Section>

      {/* Drive links */}
      <Section title="Google Drive — фото, документы, планировки">
        <div className="space-y-2">
          {driveFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <Input {...register(`drive_links.${i}.url`)} placeholder="https://drive.google.com/..." className="flex-1" />
              <Input {...register(`drive_links.${i}.label`)} placeholder="Фото" className="w-32" />
              <button type="button" onClick={() => removeDrive(i)} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendDrive({ url: '', label: '' })}>
            <Plus className="h-4 w-4" />Добавить ссылку
          </Button>
          {errors.drive_links && (
            <p className="text-xs text-red-600">Проверьте правильность ссылок</p>
          )}
        </div>
      </Section>

      {/* Extra links */}
      <Section title="Дополнительные ссылки">
        <div className="space-y-2">
          {extraFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <Input {...register(`extra_links.${i}.url`)} placeholder="https://..." className="flex-1" />
              <Input {...register(`extra_links.${i}.label`)} placeholder="Описание" className="w-32" />
              <button type="button" onClick={() => removeExtra(i)} className="text-red-500 hover:text-red-700 p-2">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => appendExtra({ url: '', label: '' })}>
            <Plus className="h-4 w-4" />Добавить ссылку
          </Button>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Добавить объект' : 'Сохранить изменения'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Отмена</Button>
      </div>
    </form>
  )
}
