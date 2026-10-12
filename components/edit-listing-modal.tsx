'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Camera, Image as ImageIcon, Sparkles, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Listing = {
  id: string
  title: string
  description: string
  price_gs: number
  condition: string
  faculty: string | null
  meeting_point: string | null
  category_id: string | null
  status: string
  image_url?: string | null
}

type EditListingModalProps = {
  isOpen: boolean
  onClose: () => void
  listing: Listing | null
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

export function EditListingModal({ isOpen, onClose, listing, onSuccess }: EditListingModalProps) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [condition, setCondition] = useState('good')
  const [faculty, setFaculty] = useState('UCSI Campus San Ignacio')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (listing) {
      setTitle(listing.title || '')
      setPrice(String(listing.price_gs || ''))
      setCategory(listing.category_id || CATEGORIES[0].id)
      setCondition(listing.condition || 'good')
      setFaculty(listing.faculty || 'UCSI Campus San Ignacio')
      setMeetingPoint(listing.meeting_point || '')
      setDescription(listing.description || '')
      setImageUrl(listing.image_url || '')
    }
  }, [listing])

  if (!isOpen || !listing) return null

  // File upload simulation (reads as base64 or object URL)
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
      const numericPrice = Number(price.replace(/[^0-9]/g, ''))

      const { error } = await supabase
        .from('listings')
        .update({
          title,
          price_gs: numericPrice || 50000,
          category_id: category,
          condition,
          faculty,
          meeting_point: meetingPoint,
          description,
          image_url: imageUrl,
        })
        .eq('id', listing!.id)

      if (error) {
        setErrorMsg('Error al actualizar: ' + error.message)
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
        className="my-6 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Editar Publicación
            </span>
            <h2 className="text-2xl font-bold text-slate-950">Modificar Producto</h2>
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
          {/* Image Upload & Preview */}
          <div>
            <label className="text-xs font-semibold text-slate-600">Foto del producto</label>
            <div className="mt-1 flex items-center gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-400">
                    <ImageIcon className="size-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                  <Camera className="size-4 text-blue-600" />
                  Subir nueva imagen
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
                  placeholder="O pega el enlace de la imagen..."
                  className="mt-2 h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Título</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600">Precio (Gs.)</label>
              <input
                required
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
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
              <label className="text-xs font-semibold text-slate-600">Facultad / Sede</label>
              <input
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="ej. Derecho (UCSI)"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Estado</label>
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
            <label className="text-xs font-semibold text-slate-600">Punto de encuentro sugerido</label>
            <input
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              placeholder="ej. Biblioteca Central UCSI Campus San Ignacio"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Descripción</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando cambios...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}
