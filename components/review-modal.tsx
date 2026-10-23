'use client'

import { FormEvent, useState } from 'react'
import { Star, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ReviewModalProps = {
  isOpen: boolean
  onClose: () => void
  sellerId: string
  sellerName?: string
  listingId?: string
  onSuccess?: () => void
}

export function ReviewModal({
  isOpen,
  onClose,
  sellerId,
  sellerName = 'Vendedor',
  listingId,
  onSuccess,
}: ReviewModalProps) {
  const [stars, setStars] = useState<number>(5)
  const [hoverStars, setHoverStars] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  if (!isOpen) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        setErrorMsg('Debes iniciar sesión con tu cuenta para calificar a un compañero.')
        return
      }

      const reviewerId = authData.user.id
      if (reviewerId === sellerId) {
        setErrorMsg('No puedes calificarte a ti mismo.')
        return
      }

      // Upsert to handle both new reviews and updating existing ratings without duplicate key errors
      const reviewPayload = {
        reviewer_id: reviewerId,
        reviewed_id: sellerId,
        listing_id: listingId || null,
        stars,
        comment: comment || 'Excelente experiencia de trato en el campus.',
        created_at: new Date().toISOString(),
      }

      let { error } = await supabase.from('reviews').upsert(reviewPayload, {
        onConflict: 'listing_id,reviewer_id',
      })

      // If conflict fallback is needed (e.g. if listing_id is null)
      if (error) {
        let checkQuery = supabase.from('reviews').select('id').eq('reviewer_id', reviewerId)
        if (listingId) {
          checkQuery = checkQuery.eq('listing_id', listingId)
        } else {
          checkQuery = checkQuery.eq('reviewed_id', sellerId)
        }
        const { data: existing } = await checkQuery.maybeSingle()

        if (existing?.id) {
          const { error: updateError } = await supabase
            .from('reviews')
            .update({
              stars,
              comment: comment || 'Excelente experiencia de trato en el campus.',
              created_at: new Date().toISOString(),
            })
            .eq('id', existing.id)

          if (updateError) {
            setErrorMsg('Error al actualizar calificación: ' + updateError.message)
            return
          }
        } else {
          setErrorMsg('Error al enviar calificación: ' + error.message)
          return
        }
      }

      onClose()
      onSuccess?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Calificar a {sellerName}</h2>
            <p className="mt-1 text-xs text-slate-500">Ayuda a construir confianza en el campus</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-xs font-semibold text-slate-600">Puntaje</p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((val) => {
              const active = (hoverStars ?? stars) >= val
              return (
                <button
                  type="button"
                  key={val}
                  onMouseEnter={() => setHoverStars(val)}
                  onMouseLeave={() => setHoverStars(null)}
                  onClick={() => setStars(val)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`size-8 transition-colors ${
                      active
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-100 text-slate-300'
                    }`}
                  />
                </button>
              )
            })}
          </div>
          <span className="text-xs font-bold text-amber-600">
            {stars === 5
              ? 'Excelente (5 de 5)'
              : stars === 4
              ? 'Muy bueno (4 de 5)'
              : stars === 3
              ? 'Bueno (3 de 5)'
              : stars === 2
              ? 'Regular (2 de 5)'
              : 'Malo (1 de 5)'}
          </span>
        </div>

        <div className="mt-6">
          <label className="text-xs font-semibold text-slate-600">Comentario o reseña</label>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Fue puntual en el punto de encuentro? ¿El producto estaba como se describió?"
            className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar calificación'}
        </button>
      </form>
    </div>
  )
}
