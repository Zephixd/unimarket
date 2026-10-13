'use client'

import { FormEvent, useEffect, useState } from 'react'
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  X,
  ArrowRightLeft,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock,
  LogIn,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { OFFICIAL_CATEGORIES } from '@/lib/categories'

type PublishModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PublishModal({ isOpen, onClose, onSuccess }: PublishModalProps) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState(OFFICIAL_CATEGORIES[0].id)
  const [faculty, setFaculty] = useState('Derecho (UCSI Campus San Ignacio)')
  const [condition, setCondition] = useState('like_new') // new, like_new, good, fair
  const [publicationType, setPublicationType] = useState<'sale' | 'exchange' | 'both'>('sale')
  const [exchangeFor, setExchangeFor] = useState('')
  const [availability, setAvailability] = useState<'active' | 'reserved' | 'sold'>('active')
  const [meetingPoint, setMeetingPoint] = useState('Biblioteca Central UCSI Campus San Ignacio')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      setCheckingAuth(true)
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          setCurrentUser({ id: data.user.id, email: data.user.email })
        } else {
          setCurrentUser(null)
        }
        setCheckingAuth(false)
      })
    }
  }, [isOpen])

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
      if (!authData.user) {
        setErrorMsg('Debes iniciar sesión para publicar un producto.')
        return
      }
      const sellerId = authData.user.id
      const numericPrice = Number(price.replace(/[^0-9]/g, ''))

      const { data: newListing, error } = await supabase
        .from('listings')
        .insert({
          seller_id: sellerId,
          title,
          description: description || 'Material académico de UCSI Campus San Ignacio.',
          price_gs: publicationType === 'exchange' ? 0 : numericPrice || 50000,
          category_id: category,
          condition,
          faculty,
          meeting_point: meetingPoint,
          accepts_exchange: publicationType === 'exchange' || publicationType === 'both',
          publication_type: publicationType,
          exchange_for: publicationType !== 'sale' ? exchangeFor : null,
          status: availability,
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

  if (!checkingAuth && !currentUser) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-center sm:p-8 animate-in fade-in">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
            <Lock className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-black text-slate-950">Acceso Requerido</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Debes iniciar sesión con tu cuenta de UCSI Campus San Ignacio para publicar artículos en el marketplace.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose()
                window.location.href = '/registro'
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <LogIn className="size-4" /> Iniciar Sesión / Registrarme
            </button>
            <button
              onClick={onClose}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="my-6 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Campus San Ignacio Misiones (UCSI)
            </span>
            <h2 className="text-xl font-black text-slate-950 sm:text-2xl">Nueva Publicación</h2>
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
          {/* Tipo de publicación: Venta / Intercambio / Venta e Intercambio */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Tipo de Publicación
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPublicationType('sale')}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition ${
                  publicationType === 'sale'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Tag className="size-4" />
                Venta
              </button>
              <button
                type="button"
                onClick={() => setPublicationType('exchange')}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition ${
                  publicationType === 'exchange'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowRightLeft className="size-4" />
                Intercambio
              </button>
              <button
                type="button"
                onClick={() => setPublicationType('both')}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-xs font-bold transition ${
                  publicationType === 'both'
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="size-4" />
                Venta y Trueque
              </button>
            </div>
          </div>

          {/* Conditional field: ¿Qué te gustaría recibir a cambio? */}
          {(publicationType === 'exchange' || publicationType === 'both') && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5 transition">
              <label className="text-xs font-bold text-purple-900">
                ¿Qué te gustaría recibir a cambio? *
              </label>
              <input
                required
                value={exchangeFor}
                onChange={(e) => setExchangeFor(e.target.value)}
                placeholder="ej. Calculadora científica, libro de Anatomía o uniforme"
                className="mt-1.5 h-10 w-full rounded-xl border border-purple-200 bg-white px-3 text-xs text-slate-800 outline-none focus:border-purple-600"
              />
            </div>
          )}

          {/* Image Upload Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Fotos del producto
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-slate-400">
                    <ImageIcon className="size-6" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition">
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
                  placeholder="O pega URL de imagen..."
                  className="mt-2 h-8 w-full rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Nombre del producto *
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ej. Código Civil Paraguayo Comentado o Calculadora Casio fx-991LA"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {publicationType === 'exchange' ? 'Valor estimado (Gs.)' : 'Precio (Gs.) *'}
              </label>
              <input
                required={publicationType !== 'exchange'}
                type="number"
                min="0"
                step="5000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="ej. 85000"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600"
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
            {/* Estado físico: Nuevo, Muy buen estado, Buen estado, Aceptable */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Estado Físico
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600"
              >
                <option value="new">Nuevo (Sin uso)</option>
                <option value="like_new">Muy buen estado</option>
                <option value="good">Buen estado</option>
                <option value="fair">Aceptable</option>
              </select>
            </div>

            {/* Disponibilidad inicial */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Disponibilidad
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as 'active' | 'reserved' | 'sold')}
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-blue-600"
              >
                <option value="active">Disponible</option>
                <option value="reserved">Reservado</option>
                <option value="sold">Vendido</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Carrera / Facultad
              </label>
              <input
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="ej. Derecho (UCSI)"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Punto de Entrega
              </label>
              <input
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                placeholder="ej. Biblioteca UCSI"
                className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs text-slate-900 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Descripción Detallada
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade detalles sobre la edición del libro, notas, año de cursado o condiciones de entrega en campus..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-2xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Publicando...' : 'Publicar Producto'}
          </button>
        </div>
      </form>
    </div>
  )
}
