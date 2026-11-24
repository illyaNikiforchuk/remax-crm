'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, SlidersHorizontal, Building2, MapPin, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  formatPrice, formatArea,
  MARKET_TYPE_LABELS, PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_COLORS
} from '@/lib/utils'
import { Property, District, Profile } from '@/types'

interface Props {
  initialProperties: any[]
  districts: District[]
  sellers: Pick<Profile, 'id' | 'full_name' | 'email'>[]
  currentUserId: string
  userRole: string
}

export function PropertiesClient({ initialProperties, districts, sellers, currentUserId, userRole }: Props) {
  const [search, setSearch] = useState('')
  const [filterDistrict, setFilterDistrict] = useState('all')
  const [filterMarket, setFilterMarket] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterAuthor, setFilterAuthor] = useState('all')
  const [sortBy, setSortBy] = useState('created_at_desc')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 20

  const filtered = useMemo(() => {
    let list = [...initialProperties]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q)
      )
    }
    if (filterDistrict !== 'all') list = list.filter(p => p.district_id === filterDistrict)
    if (filterMarket !== 'all') list = list.filter(p => p.market_type === filterMarket)
    if (filterType !== 'all') list = list.filter(p => p.property_type === filterType)
    if (filterStatus !== 'all') list = list.filter(p => p.status === filterStatus)
    if (filterAuthor !== 'all') list = list.filter(p => p.author_id === filterAuthor)

    const [field, dir] = sortBy.split('_').reduce((acc, cur, i, arr) => {
      if (i === arr.length - 1) return [arr.slice(0, -1).join('_'), cur]
      return acc
    }, ['created_at', 'desc'] as [string, string])

    list.sort((a, b) => {
      const av = a[field] ?? 0
      const bv = b[field] ?? 0
      if (av < bv) return dir === 'asc' ? -1 : 1
      if (av > bv) return dir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [initialProperties, search, filterDistrict, filterMarket, filterType, filterStatus, filterAuthor, sortBy])

  const paged = filtered.slice(0, page * PER_PAGE)
  const hasMore = paged.length < filtered.length

  const hasActiveFilters = filterDistrict !== 'all' || filterMarket !== 'all' || filterType !== 'all' || filterStatus !== 'all' || filterAuthor !== 'all'

  function resetFilters() {
    setFilterDistrict('all')
    setFilterMarket('all')
    setFilterType('all')
    setFilterStatus('all')
    setFilterAuthor('all')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Объекты <span className="text-gray-400 font-normal text-lg">({filtered.length})</span></h1>
        <Link href="/properties/new">
          <Button size="sm"><Plus className="h-4 w-4" />Добавить</Button>
        </Link>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск по названию или адресу..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-1.5">
          <SlidersHorizontal className="h-4 w-4" />
          Фильтры
          {hasActiveFilters && <span className="bg-blue-600 text-white text-xs rounded-full px-1.5">!</span>}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Select value={filterDistrict} onValueChange={v => { setFilterDistrict(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Район" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все районы</SelectItem>
                {districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterMarket} onValueChange={v => { setFilterMarket(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Рынок" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="primary">Первичка</SelectItem>
                <SelectItem value="secondary">Вторичка</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={v => { setFilterType(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Тип" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                {Object.entries(PROPERTY_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterAuthor} onValueChange={v => { setFilterAuthor(v); setPage(1) }}>
              <SelectTrigger><SelectValue placeholder="Автор" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все авторы</SelectItem>
                {sellers.map(s => <SelectItem key={s.id} value={s.id}>{s.full_name || s.email}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue placeholder="Сортировка" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at_desc">Новые</SelectItem>
                <SelectItem value="created_at_asc">Старые</SelectItem>
                <SelectItem value="price_asc">Цена ↑</SelectItem>
                <SelectItem value="price_desc">Цена ↓</SelectItem>
                <SelectItem value="area_asc">Площадь ↑</SelectItem>
                <SelectItem value="area_desc">Площадь ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-sm text-red-600 hover:underline flex items-center gap-1">
              <X className="h-3 w-3" /> Сбросить фильтры
            </button>
          )}
        </div>
      )}

      {/* Properties list */}
      {paged.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Объекты не найдены</p>
          <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {paged.map((p: any) => (
            <PropertyRow
              key={p.id}
              property={p}
              canEdit={userRole === 'admin' || p.author_id === currentUserId}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center pt-2">
          <Button variant="outline" onClick={() => setPage(page + 1)}>
            Загрузить ещё ({filtered.length - paged.length})
          </Button>
        </div>
      )}
    </div>
  )
}

function PropertyRow({ property: p, canEdit }: { property: any; canEdit: boolean }) {
  return (
    <div className="bg-white border rounded-xl p-4 hover:border-blue-200 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PROPERTY_STATUS_COLORS[p.status as keyof typeof PROPERTY_STATUS_COLORS]}`}>
              {PROPERTY_STATUS_LABELS[p.status as keyof typeof PROPERTY_STATUS_LABELS]}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {MARKET_TYPE_LABELS[p.market_type as keyof typeof MARKET_TYPE_LABELS]}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {PROPERTY_TYPE_LABELS[p.property_type as keyof typeof PROPERTY_TYPE_LABELS]}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">
            {p.title || p.address || 'Без названия'}
          </h3>
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
            {p.districts?.name && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />{p.districts.name}
              </span>
            )}
            {p.area && <span>{formatArea(p.area)}</span>}
            {p.rooms && <span>{p.rooms} комн.</span>}
            {p.floor && p.total_floors && <span>{p.floor}/{p.total_floors} эт.</span>}
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(p.price)}</span>
          {p.price_per_sqm && (
            <span className="text-xs text-gray-500">{formatPrice(p.price_per_sqm)}/м²</span>
          )}
          <div className="flex gap-2">
            <Link href={`/properties/${p.id}`}>
              <Button variant="outline" size="sm">Просмотр</Button>
            </Link>
            {canEdit && (
              <Link href={`/properties/${p.id}/edit`}>
                <Button variant="secondary" size="sm">Изменить</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
