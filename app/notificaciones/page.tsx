'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  CheckCircle2,
  Heart,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'

const INITIAL_NOTIFICATIONS = [
  {
    id: '1',
    icon: MessageCircle,
    color: 'text-blue-600 bg-blue-50',
    title: 'Nuevo mensaje de Jesus Gonzalez',
    desc: '¡Hola! ¿Sigue disponible el libro? Podemos encontrarnos en la biblioteca central de UCSI.',
    time: 'Hace 5 minutos',
    unread: true,
    link: '/mensajes',
  },
  {
    id: '2',
    icon: Heart,
    color: 'text-rose-500 bg-rose-50',
    title: 'A Belen Villalba le gustó tu publicación',
    desc: 'Tu artículo "Calculadora Científica Casio" recibió un like.',
    time: 'Hace 45 minutos',
    unread: true,
    link: '/buscar',
  },
  {
    id: '3',
    icon: Star,
    color: 'text-amber-500 bg-amber-50',
    title: '¡Recibiste una nueva calificación!',
    desc: 'Jennifer Fretes te calificó con 5 estrellas: "Puntual en la cantina UCSI."',
    time: 'Hace 2 horas',
    unread: true,
    link: '/perfil',
  },
  {
    id: '4',
    icon: Package,
    color: 'text-emerald-600 bg-emerald-50',
    title: 'Publicación activa',
    desc: 'Tu producto "Ambo Clínico Blanco" ya está visible en el campus San Ignacio.',
    time: 'Ayer',
    unread: false,
    link: '/buscar',
  },
  {
    id: '5',
    icon: ShieldCheck,
    color: 'text-purple-600 bg-purple-50',
    title: 'Perfil verificado con éxito',
    desc: 'Tu correo institucional @uc.edu.py ha sido verificado en la comunidad de UCSI.',
    time: 'Hace 2 días',
    unread: false,
    link: '/perfil',
  },
]

export default function NotificacionesPage() {
  const [readIds, setReadIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem('unimarket_read_notifications')
      if (stored) {
        setReadIds(JSON.parse(stored))
      }
    } catch {
      // fallback
    }
  }, [])

  const notifications = INITIAL_NOTIFICATIONS.map((n) => ({
    ...n,
    unread: mounted ? (readIds.includes(n.id) ? false : n.unread) : n.unread,
  }))

  const unreadCount = notifications.filter((n) => n.unread).length

  function markAllAsRead() {
    const allIds = INITIAL_NOTIFICATIONS.map((n) => n.id)
    setReadIds(allIds)
    try {
      localStorage.setItem('unimarket_read_notifications', JSON.stringify(allIds))
      window.dispatchEvent(new Event('unimarket_notifications_updated'))
    } catch {}
  }

  function markSingleAsRead(id: string) {
    if (readIds.includes(id)) return
    const updated = [...readIds, id]
    setReadIds(updated)
    try {
      localStorage.setItem('unimarket_read_notifications', JSON.stringify(updated))
      window.dispatchEvent(new Event('unimarket_notifications_updated'))
    } catch {}
  }

  return (
    <AuthGuard moduleName="tus notificaciones">
      <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
        <Navbar />

        <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Link
            href="/inicio"
            className="mb-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-200 hover:text-blue-600 transition"
          >
            <ArrowLeft className="size-4" /> Volver al Inicio
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl font-black text-slate-900">Notificaciones</h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  Actividad de tus publicaciones, mensajes y calificaciones en UCSI
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-black text-white shadow-sm shadow-blue-500/20">
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-blue-600 hover:underline transition"
              >
                <CheckCheck className="size-4" />
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="mt-6 divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
            {notifications.map((n) => {
              const Icon = n.icon
              return (
                <div
                  key={n.id}
                  onClick={() => markSingleAsRead(n.id)}
                  className={`flex items-start gap-3.5 p-4 transition-colors rounded-2xl cursor-pointer ${
                    n.unread ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className={`grid size-10 shrink-0 place-items-center rounded-2xl ${n.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                        {n.unread && (
                          <span className="size-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.desc}</p>
                    {n.link && (
                      <Link
                        href={n.link}
                        className="mt-2 inline-block text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Ver detalles →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </main>

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
