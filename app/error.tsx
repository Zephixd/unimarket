'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-100 shadow-xs">
          <AlertCircle className="size-8" />
        </div>

        <h1 className="mt-4 text-xl sm:text-2xl font-black text-slate-950">
          Algo no cargó correctamente
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
          Hubo un problema temporal al cargar esta sección. Puedes reintentar o volver al inicio universitario.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <RefreshCw className="size-4" /> Reintentar cargar
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ArrowLeft className="size-4" /> Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
