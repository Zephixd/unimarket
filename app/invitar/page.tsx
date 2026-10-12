'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Award,
  Users,
  Sparkles,
  Gift,
  ExternalLink,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'

export default function InvitarPage() {
  const [copied, setCopied] = useState(false)
  const referralCode = 'UCSI-SANIGNACIO-2025'
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/registro?ref=${referralCode}` : `https://unimarket-development.vercel.app/registro?ref=${referralCode}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! Únete a UniMarket, la plataforma de compra, venta e intercambio para la UC Campus San Ignacio. Regístrate aquí: ${shareUrl}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-950 md:pb-12">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/perfil"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" /> Volver a Mi Perfil
        </Link>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl shadow-blue-500/10 sm:p-8">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Gift className="size-3.5" /> Programa de Referidos UCSI
            </span>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              Invita a tus compañeros y desbloquea insignias
            </h1>
            <p className="mt-2 text-sm text-blue-100">
              Comparte UniMarket con estudiantes de la Universidad Católica Campus San Ignacio. 
              Gana reputación instantánea y medallas destacadas en tu perfil de vendedor.
            </p>
          </div>
          <div className="absolute -bottom-6 -right-6 size-44 rounded-full bg-white/10 blur-2xl" />
        </div>

        {/* Referral Box */}
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900">Tu código personal de referido</h2>
          <p className="mt-1 text-xs text-slate-500">
            Tus compañeros pueden ingresarlo al registrarse o usar tu enlace directo.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center justify-between rounded-xl border border-dashed border-blue-400 bg-blue-50/50 px-4 py-3 font-mono font-bold text-blue-700">
              <span className="text-base sm:text-lg">{referralCode}</span>
              <span className="text-xs uppercase text-blue-500 font-sans font-medium">Activo</span>
            </div>

            <button
              onClick={copyToClipboard}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              {copied ? (
                <>
                  <Check className="size-4 text-emerald-300" /> ¡Enlace Copiado!
                </>
              ) : (
                <>
                  <Copy className="size-4" /> Copiar Enlace
                </>
              )}
            </button>

            <button
              onClick={shareViaWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <Share2 className="size-4" /> Compartir en WhatsApp
            </button>
          </div>
        </div>

        {/* Insignias Desbloqueables */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Award className="size-5 text-amber-500" /> Insignias por Invitaciones
            </h2>
            <span className="text-xs font-bold text-blue-600">2 de 4 completadas</span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* Tier 1 */}
            <div className="flex items-start gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/20">
                <Check className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Buen Compañero</h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Desbloqueado
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Invita a 1 estudiante al campus. Muestra que compartes recursos académicos.
                </p>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="flex items-start gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white font-black shadow-md shadow-blue-600/20">
                <Sparkles className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Pionero UCSI</h3>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Desbloqueado
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Invita a 3 compañeros. Otorga insignia azul destacada en tu perfil.
                </p>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-black shadow-md shadow-amber-500/20">
                <Award className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Embajador del Campus</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    Faltan 2 amigos
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Invita a 5 compañeros. Prioridad de visibilidad en el feed de búsqueda.
                </p>
              </div>
            </div>

            {/* Tier 4 */}
            <div className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-purple-600 text-white font-black shadow-md shadow-purple-600/20">
                <Users className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Leyenda Universitaria</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                    Faltan 7 amigos
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Invita a 10 estudiantes. Insignia dorada y mención en el ranking anual.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Amigos Registrados Recientemente */}
        <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-extrabold text-slate-900">Compañeros unidos recientemente</h2>
          <div className="mt-4 divide-y divide-slate-100">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                  JG
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Jesus Gonzalez</p>
                  <p className="text-[11px] text-slate-500">Derecho · UCSI San Ignacio</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                Activo
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-pink-100 text-xs font-black text-pink-700">
                  BV
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Belen Villalba</p>
                  <p className="text-[11px] text-slate-500">Enfermería · UCSI San Ignacio</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                Activo
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-700">
                  JF
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Jennifer Fretes</p>
                  <p className="text-[11px] text-slate-500">Administración · UCSI San Ignacio</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                Activo
              </span>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
