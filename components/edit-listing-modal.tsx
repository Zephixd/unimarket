'use client'

import { FormEvent, useEffect, useState } from 'react'
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  X,
  Trash2,
  AlertTriangle,
  ArrowRightLeft,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { OFFICIAL_CATEGORIES } from '@/lib/categories'

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
  publication_type?: string | null
  exchange_for?: string | null
  accepts_exchange?: boolean
}

type EditListingModalProps = {
  isOpen: boolean
  onClose: () => void
  listing: Listing | null
  onSuccess?: () => void
}

export function EditListingModal({ isOpen, onClose, listing, onSuccess }: EditListingModalProps) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(OFFICIAL_CATEGORIES[0].id)
  const [condition, setCondition] = useState('good')
  const [publicationType, setPublicationType] = useState<'sale' | 'exchange' | 'both'>('sale')
  const [exchangeFor, setExchangeFor] = useState('')
  const [status, setStatus] = useState('active') // active, reserved, sold
  const [faculty, setFaculty] = useState('UCSI Campus San Ignacio')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (listing) {
      setTitle(listing.title || '')
      setPrice(String(listing.price_gs || ''))
      setCategory(listing.category_id || OFFICIAL_CATEGORIES[0].id)
      setCondition(listing.condition || 'good')
      setPublicationType(
        (listing.publication_type as 'sale' | 'exchange' | 'both') ||
          (listing.accepts_exchange ? 'both' : 'sale')
      )
      setExchangeFor(listing.exchange_for || '')
      setStatus(listing.status || 'active')
      setFaculty(listing.faculty || 'UCSI Campus San Ignacio')
      setMeetingPoint(listing.meeting_point || '')
      setDescription(listing.description || '')
      setImageUrl(listing.image_url || '')
      setConfirmDelete(false)
    }
  }, [listing])

  if (!isOpen || !listing) return null

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
          price_gs: publicationType === 'exchange' ? 0 : numericPrice || 50000,
          category_id: category,
          condition,
          publication_type: publicationType,
          exchange_for: publicationType !== 'sale' ? exchangeFor : null,
          accepts_exchange: publicationType === 'exchange' || publicationType === 'both',
          status,
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

  async function handleDelete() {
    setDeleting(true)
    try {
      const { error } = await supabase.from('listings').delete().eq('id', listing!.id)
      if (error) {
        setErrorMsg('Error al eliminar: ' + error.message)
      } else {
        setConfirmDelete(false)
        onClose()
        onSuccess?.()
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="my-6 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Gestión de Publicación
            </span>
            <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Editar Producto</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-4">
          {/* Disponibilidad: Disponible, Reservado, Vendido */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Disponibilidad del Producto
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('active')}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  status === 'active'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Disponible
              </button>
              <button
                type="button"
                onClick={() => setStatus('reserved')}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  status === 'reserved'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Reservado
              </button>
              <button
                type="button"
                onClick={() => setStatus('sold')}
                className={`rounded-xl py-2 text-xs font-bold transition ${
                  status === 'sold'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Vendido
              </button>
            </div>
          </div>

          {/* Tipo de publicación */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Tipo de Publicación
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPublicationType('sale')}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-bold transition ${
                  publicationType === 'sale'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Tag className="size-3.5" />
                Venta
              </button>
              <button
                type="button"
                onClick={() => setPublicationType('exchange')}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-bold transition ${
                  publicationType === 'exchange'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowRightLeft className="size-3.5" />
                Intercambio
              </button>
              <button
                type="button"
                onClick={() => setPublicationType('both')}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs font-bold transition ${
                  publicationType === 'both'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="size-3.5" />
                Ambos
              </button>
            </div>
          </div>

          {/* Conditional field for exchange */}
          {(publicationType === 'exchange' || publicationType === 'both') && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3">
              <label className="text-xs font-bold text-purple-900">
                ¿Qué te gustaría recibir a cambio?
              </label>
              <input
                value={exchangeFor}
                onChange={(e) => setExchangeFor(e.target.value)}
                placeholder="ej. Calculadora científica, libro de Anatomía o uniforme"
                className="mt-1.5 h-9 w-full rounded-xl border border-purple-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-purple-600"
              />
            </div>
          )}

          {/* Image Upload & Preview */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Foto del producto
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-400">
                    <ImageIcon className="size-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                  <Camera className="size-3.5 text-blue-600" />
                  Subir foto
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
                  placeholder="URL de la imagen..."
                  className="mt-1.5 h-8 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Título *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Precio (Gs.) *
              </label>
              <input
                required={publicationType !== 'exchange'}
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none focus:border-blue-600"
              >
                {OFFICIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Estado Físico
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-800 outline-none focus:border-blue-600"
              >
                <option value="new">Nuevo (Sin uso)</option>
                <option value="like_new">Muy buen estado</option>
                <option value="good">Buen estado</option>
                <option value="fair">Aceptable</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Punto de Entrega
              </label>
              <input
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="Biblioteca UCSI"
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Descripción
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>

            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
              >
                <Trash2 className="size-4" />
                Eliminar Publicación
              </button>
            ) : (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-3.5 text-center">
                <AlertTriangle className="mx-auto size-5 text-rose-600" />
                <p className="mt-1 text-xs font-bold text-rose-900">
                  ¿Seguro que deseas eliminar este producto?
                </p>
                <p className="text-[11px] text-rose-700">Esta acción no se puede deshacer.</p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                  >
                    {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
