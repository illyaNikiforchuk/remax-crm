import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatArea, MARKET_TYPE_LABELS, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_COLORS } from '@/lib/utils'
import { ArrowLeft, ExternalLink, MapPin, Building2, User, Phone, Edit, Calendar } from 'lucide-react'
import { DeletePropertyButton } from './DeletePropertyButton'

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [propertyRes, sessionRes] = await Promise.all([
    supabase.from('properties').select('*, districts(name), profiles!author_id(full_name, email, phone)').eq('id', id).single(),
    supabase.auth.getUser(),
  ])

  if (!propertyRes.data) notFound()
  const p = propertyRes.data as any

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', sessionRes.data.user?.id || '')
    .single()

  const canEdit = profile?.role === 'admin' || p.author_id === sessionRes.data.user?.id

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    value ? (
      <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
      </div>
    ) : null
  )

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/properties">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" />Назад</Button>
        </Link>
        {canEdit && (
          <div className="flex gap-2 ml-auto">
            <Link href={`/properties/${id}/edit`}>
              <Button size="sm"><Edit className="h-4 w-4" />Редактировать</Button>
            </Link>
            <DeletePropertyButton propertyId={id} />
          </div>
        )}
      </div>

      {/* Header card */}
      <div className="bg-white border rounded-xl p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PROPERTY_STATUS_COLORS[p.status as keyof typeof PROPERTY_STATUS_COLORS]}`}>
            {PROPERTY_STATUS_LABELS[p.status as keyof typeof PROPERTY_STATUS_LABELS]}
          </span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
            {MARKET_TYPE_LABELS[p.market_type as keyof typeof MARKET_TYPE_LABELS]}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
            {PROPERTY_TYPE_LABELS[p.property_type as keyof typeof PROPERTY_TYPE_LABELS]}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">{p.title || p.address || 'Без названия'}</h1>
        {p.districts?.name && (
          <p className="text-gray-500 flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5" />{p.districts.name}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-6">
          {p.price && (
            <div>
              <p className="text-xs text-gray-500">Цена</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(p.price)}</p>
              {p.price_per_sqm && <p className="text-sm text-gray-500">{formatPrice(p.price_per_sqm)}/м²</p>}
            </div>
          )}
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Параметры</h2>
        <InfoRow label="Площадь" value={formatArea(p.area)} />
        <InfoRow label="Комнат" value={p.rooms} />
        <InfoRow label="Этаж" value={p.floor && p.total_floors ? `${p.floor} из ${p.total_floors}` : p.floor} />
        <InfoRow label="Адрес" value={p.address} />
        {p.market_type === 'primary' && (
          <>
            <InfoRow label="Застройщик" value={p.developer} />
            <InfoRow label="Первый взнос" value={p.down_payment ? formatPrice(p.down_payment) : null} />
            <InfoRow label="Рассрочка" value={p.installment_months ? `${p.installment_months} мес.` : null} />
            <InfoRow label="Платёж/мес" value={p.monthly_payment ? formatPrice(p.monthly_payment) : null} />
          </>
        )}
        {p.market_type === 'secondary' && (
          <>
            <InfoRow label="Собственник" value={p.owner_name} />
            <InfoRow label="Телефон собственника" value={p.owner_phone} />
          </>
        )}
      </div>

      {/* Description */}
      {p.description && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Описание</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{p.description}</p>
        </div>
      )}

      {/* Drive links */}
      {p.drive_links?.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Материалы Google Drive</h2>
          <div className="flex flex-wrap gap-2">
            {p.drive_links.map((link: { url: string; label: string }, i: number) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Extra links */}
      {p.extra_links?.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Дополнительные ссылки</h2>
          <div className="flex flex-wrap gap-2">
            {p.extra_links.map((link: { url: string; label: string }, i: number) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Meta */}
      <div className="bg-white border rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Информация</h2>
        <InfoRow
          label="Добавил"
          value={p.profiles?.full_name || p.profiles?.email}
        />
        <InfoRow
          label="Дата добавления"
          value={new Date(p.created_at).toLocaleDateString('ru-RU')}
        />
        <InfoRow
          label="Последнее изменение"
          value={new Date(p.updated_at).toLocaleDateString('ru-RU')}
        />
      </div>
    </div>
  )
}
