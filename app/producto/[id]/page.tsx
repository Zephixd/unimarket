'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Clock,
  Compass,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  User,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { EditListingModal } from '@/components/edit-listing-modal'
import { createClient } from '@/lib/supabase/client'

type ListingDetail = {
  id: string
  title: string
  description: string
  price_gs: number
  condition: string
  faculty: string | null
  meeting_point: string | null
  category_id: string | null
  status: string
  image_url: string | null
  created_at: string
  seller_id: string
  seller?: {
    full_name: string
    career_name: string | null
    university_name: string | null
    verified_email: boolean
    sales_count: number
    rating: number
  }
  images?: string[]
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

export default function ProductoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const supabase = createClient()

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  async function loadListing() {
    setLoading(true)
    const { data: authData } = await supabase.auth.getUser()
    if (authData.user) {
      setCurrentUser({ id: authData.user.id })
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      // Get seller profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.seller_id)
        .single()

      // Get images
      const { data: imgs } = await supabase
        .from('listing_images')
        .select('path')
        .eq('listing_id', data.id)

      const imageList = imgs && imgs.length > 0 ? imgs.map((i) => i.path) : [data.image_url]

      setListing({
        ...data,
        seller: profile || undefined,
        images: imageList.filter(Boolean),
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadListing()
  }, [id])

  async function toggleFavorite() {
    if (!currentUser) return
    setIsLiked(!isLiked)
    setToastMsg(isLiked ? 'Eliminado de favoritos' : '¡Guardado en favoritos!')
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: listing?.title || 'UniMarket',
        text: `Mira este artículo en UniMarket: ${listing?.title} (${formatPrice(
          listing?.price_gs || 0
        )})`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setToastMsg('¡Enlace copiado al portapapeles!')
    }
  }

  async function startChat() {
    if (!currentUser) {
      router.push('/registro')
      return
    }

    if (currentUser.id === listing?.seller_id) {
      setToastMsg('Este producto es tuyo.')
      return
    }

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing!.id)
      .eq('buyer_id', currentUser.id)
      .single()

    if (existing?.id) {
      router.push(`/mensajes?conv=${existing.id}`)
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing!.id,
          buyer_id: currentUser.id,
          seller_id: listing!.seller_id,
        })
        .select()
        .single()

      if (newConv) {
        router.push(`/mensajes?conv=${newConv.id}`)
      } else {
        router.push('/mensajes')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-semibold text-slate-400">Cargando publicación...</p>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-lg font-bold text-slate-800">Producto no encontrado</h2>
        <Link href="/productos" className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">
          Volver al marketplace
        </Link>
      </div>
    )
  }

  const isOwner = currentUser?.id === listing.seller_id
  const images = listing.images && listing.images.length > 0 ? listing.images : [listing.image_url]

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-950 md:pb-12">
      <Navbar />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-24 right-5 z-50 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl">
          {toastMsg}
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/productos"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" /> Volver a Productos
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column: Photo Gallery */}
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
              <img
                src={images[activeImageIndex] || listing.image_url || ''}
                alt={listing.title}
                className="h-full w-full object-cover"
              />
              {listing.status === 'sold' && (
                <div className="absolute inset-0 grid place-items-center bg-slate-950/50 backdrop-blur-[2px]">
                  <span className="rounded-2xl bg-white px-5 py-2 text-sm font-black tracking-widest text-slate-900 shadow-xl">
                    VENDIDO
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      activeImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Seller Card */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {listing.faculty || 'UCSI Campus San Ignacio'}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {listing.condition === 'like_new' ? 'Como nuevo' : 'Buen estado'}
                </span>
              </div>

              {/* Title & Price */}
              <h1 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl leading-tight">
                {listing.title}
              </h1>
              <p className="mt-2 text-3xl font-black text-blue-600">
                {formatPrice(listing.price_gs)}
              </p>

              {/* Description */}
              <div className="mt-5 rounded-2xl bg-white p-4 border border-slate-200/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Descripción</h3>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Conceptual Campus Meeting Map */}
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs mb-2">
                  <Compass className="size-4 text-blue-600" />
                  Punto de Encuentro en el Campus
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <MapPin className="size-4 text-red-500 shrink-0" />
                  <span>{listing.meeting_point || 'Biblioteca Central UCSI Campus San Ignacio'}</span>
                </div>
                <p className="mt-2 text-[11px] text-blue-700/80 flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-blue-600 shrink-0" />
                  <span>Zona segura y transitada recomendada para concretar la entrega e inspección del artículo.</span>
                </p>
              </div>

              {/* Seller Card */}
              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-2xl bg-blue-600 text-white font-extrabold text-base shadow-sm">
                      {(listing.seller?.full_name || 'E')[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900">
                          {listing.seller?.full_name || 'Estudiante UCSI'}
                        </p>
                        <ShieldCheck className="size-4 text-emerald-600" />
                      </div>
                      <p className="text-xs text-slate-400">
                        {listing.seller?.career_name || 'Campus San Ignacio'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-sm font-black text-amber-500">
                      <Star className="size-4 fill-amber-400" />
                      <span>{Number(listing.seller?.rating || 4.9).toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {listing.seller?.sales_count || 12} ventas
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                  <span>En UniMarket desde hace 8 meses</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Clock className="size-3" /> Última conexión hace 10 minutos
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              {isOwner ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex-1 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-md hover:bg-blue-700"
                  >
                    Editar publicación
                  </button>
                  <button
                    onClick={() => {
                      const nextStatus = listing.status === 'sold' ? 'active' : 'sold'
                      supabase
                        .from('listings')
                        .update({ status: nextStatus })
                        .eq('id', listing.id)
                        .then(() => loadListing())
                    }}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {listing.status === 'sold' ? 'Reactivar' : 'Marcar como vendido'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={startChat}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700"
                >
                  <MessageCircle className="size-4" /> Chatear con el vendedor
                </button>
              )}

              <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Heart className={`size-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  {isLiked ? 'Guardado' : 'Guardar'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Share2 className="size-4" /> Compartir
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <EditListingModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        listing={listing}
        onSuccess={() => {
          setToastMsg('¡Publicación actualizada!')
          loadListing()
        }}
      />

      <BottomNav />
    </div>
  )
}
