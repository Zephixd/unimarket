'use client'

import { FormEvent, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PublishModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CATEGORIES = [
  { id: 'b954ecf7-3147-45f2-9b85-5da9b5bf6b6f', label: 'Libros' },
  { id: 'c513082e-2740-4e02-81f6-5cc14d5e1af6', label: 'Calculadoras' },
  { id: '71b04623-2815-4bb0-8e95-680bd135f650', label: 'Tecnología' },
  { id: 'd901a725-cf4d-4262-87b4-37d598634b81', label: 'Apuntes' },
  { id: '96d3f8c8-0e08-489a-9d77-dbcc4a6a1c61', label: 'Mochilas' },
  { id: 'fe8651ac-28d0-4617-8402-f04844a98743', label: 'Uniformes' },
]

export function PublishModal({ isOpen, onClose, onSuccess }: PublishModalProps) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [faculty, setFaculty] = useState('Facultad Politécnica (FPUNA)')
  const [condition, setCondition] = useState('like_new')
  const [meetingPoint, setMeetingPoint] = useState('Campus UNA San Lorenzo - Biblioteca Central')
  const [description, setDescription] = useState('')
  const [acceptsExchange, setAcceptsExchange] = useState(false)
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
      const sellerId = authData.user?.id || 'f6ae5678-deb4-43cb-95bc-a7974ca1ad63'
      const numericPrice = Number(price.replace(/[^0-9]/g, ''))

      const { error } = await supabase.from('listings').insert({
        seller_id: sellerId,
        title,
        description: description || 'Publicado por estudiante universitario en UniMarket.',
        price_gs: numericPrice || 50000,
        category_id: category,
        condition,
        faculty,
        meeting_point: meetingPoint,
        accepts_exchange: acceptsExchange,
        status: 'active',
      })

      if (error) {
        setErrorMsg('Error al publicar: ' + error.message)
      } else {
        onClose()
        onSuccess?.()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="my-8 w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Publicar en UniMarket</h2>
            <p className="mt-1 text-xs text-slate-500">
              Llega a miles de estudiantes de tu facultad y campus
            </p>
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

        <div className="mt-5 flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-600">¿Qué vendes o intercambias?</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Libro Cálculo Stewart 8va Edición"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Precio en Guaraníes (Gs.)</label>
              <input
                required
                type="number"
                min="0"
                step="5000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="ej. 80000"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Universidad / Facultad</label>
              <input
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="ej. FPUNA, FCM, FIUNA, UCA"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Estado del producto</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="like_new">Como nuevo</option>
                <option value="new">Nuevo en caja</option>
                <option value="good">Buen estado</option>
                <option value="fair">Aceptable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Punto de encuentro sugerido en el campus</label>
            <input
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              placeholder="ej. Biblioteca Central, Cantina de Poli, etc."
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Descripción detallada</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre el uso, edición, notas incluidas o si aceptas intercambio..."
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={acceptsExchange}
              onChange={(e) => setAcceptsExchange(e.target.checked)}
              className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-medium text-slate-700">
              Acepto intercambio por otros artículos universitarios
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-orange-500 font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar producto ahora'}
          </button>
        </div>
      </form>
    </div>
  )
}
