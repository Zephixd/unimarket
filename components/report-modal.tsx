'use client'

import { FormEvent, useState } from 'react'
import { AlertCircle, CheckCircle2, Flag, ShieldAlert, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ReportModalProps = {
  isOpen: boolean
  onClose: () => void
  targetType: 'listing' | 'user'
  targetId: string
  targetTitle?: string
}

const REPORT_REASONS = [
  'Contenido fraudulento o engañoso',
  'Precio falso o sospechoso',
  'No es material universitario de UCSI',
  'Producto prohibido o inapropiado',
  'Comportamiento sospechoso o acoso',
  'Cuenta falsa o suplantación',
  'Otro motivo',
]

export function ReportModal({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0])
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  if (!isOpen) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const reporterId = authData.user?.id || null

      const { error } = await supabase.from('reports').insert({
        reporter_id: reporterId,
        target_type: targetType,
        target_id: targetId,
        reason,
        details,
      })

      if (error) {
        setErrorMsg('Error al enviar el reporte: ' + error.message)
      } else {
        setSubmitted(true)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setSubmitted(false)
    setDetails('')
    setErrorMsg('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="size-5" />
            <span className="text-xs font-black uppercase tracking-wider">
              Seguridad UniMarket UCSI
            </span>
          </div>
          <button
            onClick={handleClose}
            className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-950">
              Reporte Recibido Correctamente
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Gracias por colaborar con la seguridad de la comunidad de UCSI Campus San Ignacio. El
              equipo de moderación revisará la publicación de inmediato.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 h-11 w-full rounded-xl bg-slate-900 font-bold text-white transition hover:bg-slate-800"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                {targetType === 'listing' ? 'Reportar Publicación' : 'Reportar Usuario'}
              </h2>
              {targetTitle && (
                <p className="mt-0.5 text-xs text-slate-500 font-medium truncate">
                  «{targetTitle}»
                </p>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Motivo del reporte
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-rose-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Detalles adicionales (opcional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explica qué problema encontraste o qué sucedió..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none focus:border-rose-500"
              />
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="h-11 flex-1 rounded-xl bg-rose-600 text-xs font-black text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
