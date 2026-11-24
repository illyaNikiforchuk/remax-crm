'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, MapPin, LogOut, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Profile } from '@/types'

interface SidebarProps {
  user: Profile
}

const navItems = [
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/properties', label: 'Объекты', icon: Building2 },
]

const adminItems = [
  { href: '/sellers', label: 'Продавцы', icon: Users },
  { href: '/settings/districts', label: 'Районы', icon: MapPin },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        pathname === href || pathname.startsWith(href + '/')
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </Link>
  )

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Building2 className="h-5 w-5 text-blue-600 mr-2" />
        <span className="font-semibold text-gray-900">Batumi CRM</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => <NavLink key={item.href} {...item} />)}

        {user.role === 'admin' && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Администрирование</p>
            </div>
            {adminItems.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 px-3 py-2">
          <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || user.email}</p>
          <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Администратор' : 'Продавец'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-3 left-3 z-50 p-2 rounded-md bg-white border shadow-sm md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r shadow-lg transition-transform md:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r">
        <SidebarContent />
      </aside>
    </>
  )
}
