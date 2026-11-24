import { createClient } from '@/lib/supabase/server'
import { Building2, TrendingUp, CheckCircle2, Archive } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { PROPERTY_STATUS_LABELS, MARKET_TYPE_LABELS } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [propertiesRes, recentRes] = await Promise.all([
    supabase.from('properties').select('status, market_type, district_id, districts(name)'),
    supabase.from('properties')
      .select('id, title, address, price, status, market_type, created_at, districts(name), profiles!author_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const properties = propertiesRes.data || []
  const recent = recentRes.data || []

  const stats = {
    total: properties.length,
    for_sale: properties.filter(p => p.status === 'for_sale').length,
    booked: properties.filter(p => p.status === 'booked').length,
    sold: properties.filter(p => p.status === 'sold').length,
    primary: properties.filter(p => p.market_type === 'primary').length,
    secondary: properties.filter(p => p.market_type === 'secondary').length,
  }

  const districtMap: Record<string, number> = {}
  properties.forEach(p => {
    const name = (p.districts as any)?.name
    if (name) districtMap[name] = (districtMap[name] || 0) + 1
  })
  const byDistrict = Object.entries(districtMap).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Дашборд</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Всего объектов" value={stats.total} icon={<Building2 className="h-5 w-5 text-blue-600" />} color="blue" />
        <StatCard label="В продаже" value={stats.for_sale} icon={<TrendingUp className="h-5 w-5 text-green-600" />} color="green" />
        <StatCard label="Бронь" value={stats.booked} icon={<CheckCircle2 className="h-5 w-5 text-yellow-600" />} color="yellow" />
        <StatCard label="Продано" value={stats.sold} icon={<Archive className="h-5 w-5 text-purple-600" />} color="purple" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Тип рынка</h2>
          <div className="space-y-3">
            {(['primary', 'secondary'] as const).map(type => (
              <div key={type} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{MARKET_TYPE_LABELS[type]}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stats[type]}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats.total ? (stats[type] / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">По районам</h2>
          {byDistrict.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Нет данных</p>
          ) : (
            <div className="space-y-2">
              {byDistrict.map(([district, count]) => (
                <div key={district} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{district}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Последние добавленные</h2>
          <Link href="/properties" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Все объекты</Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Объектов пока нет</p>
        ) : (
          <div className="space-y-1">
            {recent.map((p: any) => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{p.title || p.address || 'Без названия'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{(p.districts as any)?.name} · {MARKET_TYPE_LABELS[p.market_type as keyof typeof MARKET_TYPE_LABELS]}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatPrice(p.price)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{PROPERTY_STATUS_LABELS[p.status as keyof typeof PROPERTY_STATUS_LABELS]}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const bg = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
  }[color] || 'bg-gray-50 dark:bg-gray-800'

  return (
    <div className={`${bg} rounded-xl p-4 border border-transparent`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}
