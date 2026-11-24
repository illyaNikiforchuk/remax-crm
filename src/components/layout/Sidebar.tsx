'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, MapPin, LogOut, Menu, X, Sun, Moon, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Profile } from '@/types'
import { useTheme } from '@/providers/ThemeProvider'

interface SidebarProps {
  user: Profile
}

const navItems = [
  { href: '/dashboard', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/properties', label: 'Объекты', icon: Building2 },
  { href: '/clients', label: 'Клиенты', icon: UserRound },
]

const adminItems = [
  { href: '/sellers', label: 'Продавцы', icon: Users },
  { href: '/settings/districts', label: 'Районы', icon: MapPin },
]

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  async function handleLogout() {
    router.push('/api/logout')
  }

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        pathname === href || pathname.startsWith(href + '/')
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {label}
    </Link>
  )

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white dark:bg-gray-900">
      <div className="flex h-14 items-center border-b border-gray-200 dark:border-gray-800 px-4">
        <Building2 className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
        <span className="font-semibold text-gray-900 dark:text-gray-100">Batumi CRM</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => <NavLink key={item.href} {...item} />)}

        {user.role === 'admin' && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Администрирование</p>
            </div>
            {adminItems.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />
          }
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </button>

        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.full_name || user.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user.role === 'admin' ? 'Администратор' : 'Продавец'}</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
        className="fixed top-3 left-3 z-50 p-2 rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5 text-gray-700 dark:text-gray-300" /> : <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-64 shadow-xl transition-transform duration-300 md:hidden',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-gray-200 dark:border-gray-800">
        <SidebarContent />
      </aside>
    </>
  )
}
