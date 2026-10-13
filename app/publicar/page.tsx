'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRightLeft,
  Camera,
  CheckCircle2,
  DollarSign,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { createClient } from '@/lib/supabase/client'
import { OFFICIAL_CATEGORIES } from '@/lib/categories'

export default function PublicarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(OFFICIAL_CATEGORIES[0].id)
  const [condition, setCondition] = useState('like_new')
  const [publicationType, setPublicationType] = useState<'sale' | 'exchange' | 'both'>('sale')
  const [exchangeFor, setExchangeFor] = useState('')
  const [availability, setAvailability] = useState<'active' | 'reserved' | 'sold'>('active')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [university, setUniversity] = useState('Universidad Católica Campus San Ignacio (UCSI)')
  const [faculty, setFaculty] = useState('Derecho y Ciencias Sociales (UCSI)')
  const [meetingPoint, setMeetingPoint] = useState('Biblioteca Central UCSI Campus San Ignacio')
  const [photos, setPhotos] = useState<string[]>([])
  const [photoUrl, setPhotoUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  function handleFileAdd(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || photos.length >= 5) return

    Array.from(files)
      .slice(0, 5 - photos.length)
      .forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPhotos((prev) => [...prev, reader.result as string].slice(0, 5))
        }
        reader.readAsDataURL(file)
      })
  }

  function handleAddUrl() {
    if (!photoUrl.trim() || photos.length >= 5) return
    setPhotos((prev) => [...prev, photoUrl.trim()].slice(0, 5))
    setPhotoUrl('')
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data: authData } = await supabase.auth.getUser()
      const sellerId = authData.user?.id || '03d5a087-5423-4c25-8df1-91afbe92728b' // Jesus Gonzalez fallback
      const numericPrice = Number(price.replace(/[^0-9]/g, ''))

      const mainImage =
        photos[0] ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'

      const { data: newListing, error } = await supabase
        .from('listings')
        .insert({
          seller_id: sellerId,
          title,
          category_id: category,
          condition,
          publication_type: publicationType,
          exchange_for: publicationType !== 'sale' ? exchangeFor : null,
          accepts_exchange: publicationType === 'exchange' || publicationType === 'both',
          price_gs: publicationType === 'exchange' ? 0 : numericPrice || 50000,
          description,
          faculty,
          meeting_point: meetingPoint,
          image_url: mainImage,
          status: availability,
        })
        .select()
        .single()

      if (error) {
        setErrorMsg('Error: ' + error.message)
      } else {
        if (newListing?.id && photos.length > 0) {
          for (let i = 0; i < photos.length; i++) {
            await supabase
              .from('listing_images')
              .insert({ listing_id: newListing.id, path: photos[i], position: i })
          }
        }
        setSuccess(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard moduleName="el formulario de publicación de UniMarket">
      <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
        <Navbar />

        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
          <Link
            href="/inicio"
            className="mb-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-200 hover:text-blue-600 transition"
          >
            <ArrowLeft className="size-4" /> Volver al Inicio
          </Link>

          {success ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                <CheckCircle2 className="size-8" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-900">
                ¡Publicación Creada con Éxito!
              </h2>
              <p className="mt-2 text-xs text-slate-600">
                Tu producto ya está visible para los compañeros de UCSI Campus San Ignacio.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href="/buscar"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                >
                  Ver en el catálogo
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false)
                    setTitle('')
                    setPrice('')
                    setDescription('')
                    setPhotos([])
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Publicar otro artículo
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                  Campus San Ignacio Misiones (UCSI)
                </span>
                <h1 className="text-2xl font-black text-slate-900">Publicar un Artículo</h1>
                <p className="mt-1 text-xs text-slate-500">
                  Ofrece tus libros, apuntes, calculadoras o uniformes a tus compañeros de facultad.
                </p>
              </div>

              {errorMsg && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                {/* Modalidad de publicación */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Modalidad de Publicación *
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

                {/* Conditional field for exchange */}
                {(publicationType === 'exchange' || publicationType === 'both') && (
                  <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-3.5">
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

                {/* Photos */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Fotos del producto ({photos.length}/5)
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2.5">
                    {photos.map((p, idx) => (
                      <div
                        key={idx}
                        className="relative size-20 overflow-hidden rounded-2xl border border-slate-200"
                      >
                        <img src={p} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ))}

                    {photos.length < 5 && (
                      <label className="flex size-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 text-slate-400 hover:text-blue-600 transition">
                        <Camera className="size-5" />
                        <span className="mt-1 text-[10px] font-bold">Subir</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileAdd}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Título del Producto *
                  </label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ej. Manual de Derecho Civil I o Calculadora Científica"
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                {/* Category & Condition */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                    >
                      {OFFICIAL_CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Estado Físico
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                    >
                      <option value="new">Nuevo (Sin uso)</option>
                      <option value="like_new">Muy buen estado</option>
                      <option value="good">Buen estado</option>
                      <option value="fair">Aceptable</option>
                    </select>
                  </div>
                </div>

                {/* Price & Availability */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Disponibilidad Inicial
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as any)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                    >
                      <option value="active">Disponible</option>
                      <option value="reserved">Reservado</option>
                      <option value="sold">Vendido</option>
                    </select>
                  </div>
                </div>

                {/* Meeting Point */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Punto de Entrega en UCSI
                  </label>
                  <input
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    placeholder="ej. Biblioteca Central, Cantina UCSI, Patio Central"
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Descripción Detallada
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Menciona si tiene apuntes, tomo o edición del libro, detalles de uso o estado..."
                    className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 h-12 w-full rounded-2xl bg-orange-500 font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? 'Creando publicación...' : 'Publicar Producto'}
                </button>
              </form>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
