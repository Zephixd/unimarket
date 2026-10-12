'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Bell,
  Heart,
  MessageCircle,
  Package,
  Sparkles,
  Star,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'

const NOTIFICATIONS = [
  {
    id: '1',
    icon: MessageCircle,
    color: 'text-blue-600 bg-blue-50',
    title: 'Nuevo mensaje de Jesus Gonzalez',
    desc: 'Hola! ¿Sigue disponible el libro? Podemos encontrarnos en la biblioteca.',
    time: 'Hace 5 minutos',
    unread: true,
  },
  {
    id: '2',
    icon: Heart,
    color: 'text-rose-500 bg-rose-50',
    title: 'A Belen Villalba le gustó tu publicación',
    desc: 'Tu artículo "Calculadora Científica Casio" recibió un like.',
    time: 'Hace 45 minutos',
    unread: true,
  },
  {
    id: '3',
    icon: Star,
    color: 'text-amber-500 bg-amber-50',
    title: '¡Recibiste una nueva calificación!',
    desc: 'Jennifer Fretes te calificó con 5 estrellas: "Puntual en la cantina UCSI."',
    time: 'Hace 2 horas',
    unread: false,
  },
  {
    id: '4',
    icon: Package,
    color: 'text-emerald-600 bg-emerald-50',
    title: 'Publicación activa',
    desc: 'Tu producto "Ambo Clínico Blanco" ya está visible en el campus.',
    time: 'Ayer',
    unread: false,
  },
]

export default function NotificacionesPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-950 md:pb-12">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" /> Volver al Inicio
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Notificaciones</h1>
            <p className="mt-1 text-xs text-slate-500">
              Mantente al tanto de la actividad de tus publicaciones y mensajes.
            </p>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:underline">
            Marcar todas como leídas
          </button>
        </div>

        <div className="mt-6 divide-y divide-slate-100 rounded-3xl border border-slate-200/80 bg-white p-2 shadow-sm">
          {NOTIFICATIONS.map((n) => {
            const Icon = n.icon
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3.5 p-4 transition-colors rounded-2xl ${
                  n.unread ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className={`grid size-10 shrink-0 place-items-center rounded-2xl ${n.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
