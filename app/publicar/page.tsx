'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { id: 'b954ecf7-3147-45f2-9b85-5da9b5bf6b6f', label: 'Libros' },
  { id: 'c513082e-2740-4e02-81f6-5cc14d5e1af6', label: 'Calculadoras' },
  { id: '71b04623-2815-4bb0-8e95-680bd135f650', label: 'Tecnología' },
  { id: 'd901a725-cf4d-4262-87b4-37d598634b81', label: 'Apuntes' },
  { id: '96d3f8c8-0e08-489a-9d77-dbcc4a6a1c61', label: 'Mochilas' },
  { id: 'fe8651ac-28d0-4617-8402-f04844a98743', label: 'Uniformes' },
]

export default function PublicarPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0].id)
  const [condition, setCondition] = useState('like_new')
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
          price_gs: numericPrice || 50000,
          description,
          faculty,
          meeting_point: meetingPoint,
          image_url: mainImage,
          status: 'active',
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
    <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-950 md:pb-12">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Link
          href="/productos"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" /> Volver a Productos
        </Link>

        {success ? (
          <div className="my-10 rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              ¡Tu publicación fue creada correctamente!
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              Tu artículo ya es visible para todos los estudiantes de UCSI Campus San Ignacio.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href="/productos"
                className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700"
              >
                Ver en el marketplace
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setTitle('')
                  setPrice('')
                  setDescription('')
                  setPhotos([])
                }}
                className="rounded-xl border border-slate-200 px-6 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Publicar otro producto
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-500">
                Pantalla de Publicación
              </span>
              <h1 className="mt-1 text-2xl font-black text-slate-900">Publicar Producto</h1>
              <p className="mt-1 text-xs text-slate-500">
                Vende o intercambia materiales en UCSI Campus San Ignacio.
              </p>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              {/* Photo Upload Box (up to 5) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Agregar fotos del producto ({photos.length}/5)
                  </label>
                  <span className="text-[10px] text-slate-400">Hasta 5 imágenes</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2.5">
                  {photos.map((p, idx) => (
                    <div
                      key={idx}
                      className="relative size-20 overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                    >
                      <img src={p} alt={`Photo ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-slate-900/80 text-white"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 5 && (
                    <label className="grid size-20 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/40 text-blue-600 transition-colors hover:bg-blue-50">
                      <Camera className="size-6" />
                      <span className="text-[10px] font-bold">+ Foto</span>
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

                {photos.length < 5 && (
                  <div className="mt-2 flex gap-1.5">
                    <input
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="O pega enlace de foto web..."
                      className="h-8 flex-1 rounded-lg border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="rounded-lg bg-slate-100 px-3 text-xs font-bold text-slate-700 hover:bg-slate-200"
                    >
                      Añadir
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Nombre del producto</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Manual de Derecho Civil Personas y Familia"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-blue-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Estado</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-blue-600"
                  >
                    <option value="like_new">Como nuevo</option>
                    <option value="new">Nuevo en caja</option>
                    <option value="good">Buen estado</option>
                    <option value="fair">Aceptable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Precio en Guaraníes (Gs.)</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="5000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="ej. 85000"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Descripción</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica el estado, año, marcas, si incluye apuntes o si aceptas intercambio..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Universidad</label>
                  <input
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Facultad / Carrera</label>
                  <input
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="ej. Derecho (UCSI)"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Punto de encuentro sugerido</label>
                <input
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  placeholder="ej. Biblioteca Central UCSI Campus San Ignacio"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 h-12 w-full rounded-2xl bg-orange-500 font-black text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-600 disabled:opacity-50"
              >
                {loading ? 'Creando publicación...' : 'Publicar'}
              </button>
            </form>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
