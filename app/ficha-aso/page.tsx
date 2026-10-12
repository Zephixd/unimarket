'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'

export default function FichaAsoPage() {
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

        {/* Store Card Header */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* App Icon */}
            <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200 sm:size-28">
              <ShoppingBag className="size-14" strokeWidth={2.2} />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">UniMarket: Campus Marketplace</h1>
              <p className="mt-1 text-sm font-semibold text-blue-600">
                UniMarket Paraguay · Educación & Comercio
              </p>
              <p className="text-xs text-slate-400">Contiene compras entre usuarios · Apta para todo público</p>

              {/* Metrics */}
              <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-slate-100 pt-3 text-center sm:text-left">
                <div>
                  <div className="flex items-center gap-1 font-black text-slate-900">
                    <span>4.9</span>
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-slate-400">2.1k reseñas</p>
                </div>

                <div className="h-6 w-px bg-slate-200" />

                <div>
                  <p className="font-black text-slate-900">10K+</p>
                  <p className="text-[10px] text-slate-400">Descargas</p>
                </div>

                <div className="h-6 w-px bg-slate-200" />

                <div>
                  <p className="font-black text-slate-900">PEGI 3</p>
                  <p className="text-[10px] text-slate-400">Para todos</p>
                </div>
              </div>
            </div>

            <div className="sm:self-center">
              <button
                onClick={() => alert('Instalando UniMarket PWA en tu dispositivo...')}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 sm:w-auto"
              >
                <Download className="size-4" /> Instalar Aplicación
              </button>
            </div>
          </div>

          {/* Screenshots Gallery */}
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Capturas de pantalla
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              <div className="relative w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-blue-600 p-4 text-white shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Inicio</span>
                <p className="mt-2 text-sm font-black">Tu campus. Tu mercado.</p>
                <div className="mt-8 rounded-xl bg-white/20 p-2 text-center text-xs">
                  Libros, calculadoras y apuntes en UCSI
                </div>
              </div>

              <div className="relative w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Búsqueda</span>
                <p className="mt-2 text-sm font-black">Filtros por campus y carrera</p>
                <div className="mt-8 rounded-xl bg-white/10 p-2 text-center text-xs">
                  A 40m en biblioteca central
                </div>
              </div>

              <div className="relative w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Chat</span>
                <p className="mt-2 text-sm font-black">Mensajería integrada</p>
                <div className="mt-8 rounded-xl bg-blue-50 p-2 text-center text-xs text-blue-700 font-semibold">
                  Coordinar entrega en cantina
                </div>
              </div>

              <div className="relative w-48 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-amber-500 p-4 text-white shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200">Ranking</span>
                <p className="mt-2 text-sm font-black">Vendedores destacados</p>
                <div className="mt-8 rounded-xl bg-white/20 p-2 text-center text-xs">
                  ⭐ 4.9 con insignia universitaria
                </div>
              </div>
            </div>
          </div>

          {/* Short Description */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h2 className="text-base font-bold text-slate-900">Información sobre esta app</h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              UniMarket es la primera plataforma móvil de compra, venta e intercambio exclusiva para estudiantes universitarios de Paraguay. Encuentra libros de texto, calculadoras científicas, uniformes, apuntes y laptops dentro de tu propio campus con perfiles verificados y chat interno seguro.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
              <span className="rounded-xl bg-slate-100 px-3 py-1.5">#MercadoUniversitario</span>
              <span className="rounded-xl bg-slate-100 px-3 py-1.5">#EstudiantesParaguay</span>
              <span className="rounded-xl bg-slate-100 px-3 py-1.5">#CampusSeguro</span>
              <span className="rounded-xl bg-slate-100 px-3 py-1.5">#UCSI</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
