'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  Download,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Users,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

export default function BannerSemPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 text-slate-950">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" /> Volver a UniMarket
        </Link>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
            Pieza Gráfica SEM / Promocional
          </span>
          <h1 className="mt-1 text-2xl font-black text-slate-900">Banner Publicitario</h1>
          <p className="mt-1 text-xs text-slate-500">
            Diseño publicitario listo para campañas digitales de adquisición en campus universitarios.
          </p>
        </div>

        {/* The Banner (Wide Format) */}
        <div className="mt-6 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 text-white shadow-2xl sm:p-12">
          {/* Decorative Background Glows */}
          <div className="absolute -right-16 -top-16 size-64 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -left-16 -bottom-16 size-64 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-lg">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
                <Sparkles className="size-3.5 text-orange-300" />
                Exclusivo para Universitarios
              </div>

              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                ¿Buscas libros más baratos?
              </h2>

              <p className="mt-3 text-lg font-bold text-blue-100">
                “Compra y vende entre estudiantes.”
              </p>

              <p className="mt-2 text-xs text-blue-200/90 leading-relaxed max-w-md">
                Ahorra hasta un 70% en libros de texto, calculadoras científicas, uniformes y tecnología dentro de tu propio campus.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/productos"
                  className="flex items-center gap-2 rounded-2xl bg-orange-500 px-7 py-4 text-sm font-black text-white shadow-xl shadow-orange-950/20 transition-all hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  <Download className="size-4" /> Descárgala ahora
                </Link>
                <Link
                  href="/"
                  className="rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20"
                >
                  Saber más
                </Link>
              </div>
            </div>

            {/* Visual Icons Cluster */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-72">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-5 text-center backdrop-blur-md border border-white/10">
                <BookOpen className="size-8 text-orange-300 mb-2" />
                <span className="text-xs font-bold">Libros</span>
                <span className="text-[10px] text-blue-200">-50% de precio</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-5 text-center backdrop-blur-md border border-white/10">
                <Calculator className="size-8 text-emerald-300 mb-2" />
                <span className="text-xs font-bold">Calculadoras</span>
                <span className="text-[10px] text-blue-200">Casio / Texas</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-5 text-center backdrop-blur-md border border-white/10">
                <MessageCircle className="size-8 text-blue-300 mb-2" />
                <span className="text-xs font-bold">Chat Seguro</span>
                <span className="text-[10px] text-blue-200">En el campus</span>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl bg-white/10 p-5 text-center backdrop-blur-md border border-white/10">
                <Users className="size-8 text-purple-300 mb-2" />
                <span className="text-xs font-bold">Estudiantes</span>
                <span className="text-[10px] text-blue-200">Verificados</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
