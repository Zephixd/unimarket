'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Compass,
  Home,
  MessageCircle,
  PlusCircle,
  Search,
  Trophy,
  User,
} from 'lucide-react'

type BottomNavProps = {
  onOpenPublish?: () => void
}

export function BottomNav({ onOpenPublish }: BottomNavProps) {
  const pathname = usePathname()

  const tabs = [
    { label: 'Inicio', href: '/', icon: Home, active: pathname === '/' || pathname === '/inicio' },
    { label: 'Buscar', href: '/buscar', icon: Search, active: pathname.startsWith('/buscar') },
    {
      label: 'Publicar',
      href: '/publicar',
      icon: PlusCircle,
      active: pathname.startsWith('/publicar'),
      isPublish: true,
    },
    { label: 'Chat', href: '/mensajes', icon: MessageCircle, active: pathname.startsWith('/mensajes') },
    { label: 'Ranking', href: '/ranking', icon: Trophy, active: pathname.startsWith('/ranking') },
    { label: 'Perfil', href: '/perfil', icon: User, active: pathname.startsWith('/perfil') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200/90 bg-white/95 px-2 pb-safe backdrop-blur-lg md:hidden">
      {tabs.map((tab) => {
        const Icon = tab.icon
        if (tab.isPublish && onOpenPublish) {
          return (
            <button
              key={tab.label}
              onClick={onOpenPublish}
              className="flex flex-col items-center justify-center text-orange-500 transition-transform active:scale-95"
            >
              <div className="grid size-9 place-items-center rounded-full bg-orange-500 text-white shadow-md shadow-orange-200">
                <PlusCircle className="size-5" />
              </div>
              <span className="text-[10px] font-bold text-orange-600">Publicar</span>
            </button>
          )
        }

        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 transition-colors ${
              tab.active ? 'font-bold text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className={`size-5 ${tab.active ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="mt-0.5 text-[10px]">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
