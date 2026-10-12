'use client'

import { FormEvent, useState } from 'react'
import { Camera, Image as ImageIcon, Sparkles, X } from 'lucide-react'
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
  const [faculty, setFaculty] = useState('Derecho (UCSI Campus San Ignacio)')
  const [condition, setCondition] = useState('like_new')
  const [meetingPoint, setMeetingPoint] = useState('Biblioteca Central UCSI Campus San Ignacio')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [acceptsExchange, setAcceptsExchange] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  if (!isOpen) return null

  // File upload simulation (reads as base64 preview)
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const sellerId = authData.user?.id || '03d5a087-5423-4c25-8df1-91afbe92728b' // Jesus Gonzalez fallback
      const numericPrice = Number(price.replace(/[^0-9]/g, ''))

      const { data: newListing, error } = await supabase
        .from('listings')
        .insert({
          seller_id: sellerId,
          title,
          description: description || 'Publicado por estudiante en UCSI Campus San Ignacio.',
          price_gs: numericPrice || 50000,
          category_id: category,
          condition,
          faculty,
          meeting_point: meetingPoint,
          accepts_exchange: acceptsExchange,
          status: 'active',
          image_url:
            imageUrl ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        })
        .select()
        .single()

      if (error) {
        setErrorMsg('Error al publicar: ' + error.message)
      } else {
        if (newListing?.id && imageUrl) {
          await supabase
            .from('listing_images')
            .insert({ listing_id: newListing.id, path: imageUrl, position: 0 })
        }
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
        className="my-6 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
              Campus San Ignacio Misiones (UCSI)
            </span>
            <h2 className="text-2xl font-bold text-slate-950">Publicar en UniMarket</h2>
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
          {/* Image Upload Box */}
          <div>
            <label className="text-xs font-semibold text-slate-600">Fotos del producto (hasta 5)</label>
            <div className="mt-1 flex items-center gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-400">
                    <ImageIcon className="size-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                  <Camera className="size-4 text-blue-600" />
                  Subir foto desde dispositivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="O pega el enlace de imagen..."
                  className="mt-2 h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Nombre del producto</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Manual de Derecho Civil o Calculadora Casio"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
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
                placeholder="ej. 85000"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
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
              <label className="text-xs font-semibold text-slate-600">Facultad / Carrera</label>
              <input
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="ej. Derecho (UCSI) o Enfermería"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Estado del producto</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600"
              >
                <option value="like_new">Como nuevo</option>
                <option value="new">Nuevo en caja</option>
                <option value="good">Buen estado</option>
                <option value="fair">Aceptable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Punto de encuentro en el campus</label>
            <input
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              placeholder="ej. Biblioteca Central, Cantina UCSI, Patio Central"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Descripción detallada</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles sobre uso, edición, notas o accesorios incluidos..."
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-600"
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
              Acepto intercambio por otros materiales en UCSI
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-orange-500 font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar producto'}
          </button>
        </div>
      </form>
    </div>
  )
}
