'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  RefreshCw,
  Share2,
  ShieldCheck,
  Star,
  Tag,
  User,
  X,
  Edit,
  ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export type ProductModalListing = {
  id: string
  title: string
  description?: string
  price_gs: number
  condition: string
  faculty?: string | null
  meeting_point?: string | null
  image_url?: string | null
  seller_id: string
  status: string
  accepts_exchange?: boolean
  created_at?: string
  profiles?: {
    id?: string
    full_name?: string
    career_name?: string
    university_name?: string
    rating?: number
    sales_count?: number
    avatar_url?: string | null
  } | null
}

type ProductModalProps = {
  isOpen: boolean
  onClose: () => void
  listing: ProductModalListing | null
  currentUserId?: string | null
  onOpenReview?: (listing: ProductModalListing) => void
  onOpenEdit?: (listing: ProductModalListing) => void
  onToggleStatus?: (listing: ProductModalListing) => void
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

export function ProductModal({
  isOpen,
  onClose,
  listing,
  currentUserId,
  onOpenReview,
  onOpenEdit,
  onToggleStatus,
}: ProductModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [copied, setCopied] = useState(false)
  const [startingChat, setStartingChat] = useState(false)

  if (!isOpen || !listing) return null

  const isOwner = currentUserId === listing.seller_id
  const isSold = listing.status === 'sold'
  const seller = listing.profiles || null
  const sellerName = seller?.full_name || 'Estudiante UCSI'
  const sellerCareer = seller?.career_name || listing.faculty || 'Facultad UCSI San Ignacio'
  const sellerRating = seller?.rating ?? 4.8
  const sellerSales = seller?.sales_count ?? 12

  const conditionLabel =
    listing.condition === 'like_new'
      ? 'Como nuevo'
      : listing.condition === 'new'
      ? 'Nuevo'
      : listing.condition === 'good'
      ? 'Buen estado'
      : 'Usado'

  const handleShare = () => {
    const url = `${window.location.origin}/producto/${listing.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleStartChat = async () => {
    if (!currentUserId) {
      router.push(`/producto/${listing.id}`)
      return
    }

    setStartingChat(true)
    try {
      // Find or create conversation in Supabase
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', currentUserId)
        .maybeSingle()

      if (existingConv) {
        onClose()
        router.push(`/mensajes?conv=${existingConv.id}`)
        return
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          seller_id: listing.seller_id,
          buyer_id: currentUserId,
        })
        .select('id')
        .single()

      if (!error && newConv) {
        // Send initial greeting message
        await supabase.from('messages').insert({
          conversation_id: newConv.id,
          sender_id: currentUserId,
          body: `¡Hola! Me interesa tu publicación "${listing.title}" en UniMarket. ¿Sigue disponible para encontrarnos en el campus?`,
        })

        onClose()
        router.push(`/mensajes?conv=${newConv.id}`)
      } else {
        onClose()
        router.push('/mensajes')
      }
    } catch {
      onClose()
      router.push('/mensajes')
    } finally {
      setStartingChat(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-md transition-all hover:bg-slate-100 hover:text-slate-950"
        >
          <X className="size-5" />
        </button>

        {/* Product Image Section */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
              <Package className="size-16" strokeWidth={1.5} />
              <span className="mt-2 text-xs font-medium text-slate-400">Sin foto disponible</span>
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {isSold ? (
              <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
                Vendido
              </span>
            ) : (
              <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
                Disponible
              </span>
            )}
            <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
              {conditionLabel}
            </span>
            {listing.accepts_exchange && (
              <span className="rounded-full bg-purple-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                Acepta Intercambio
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7">
          {/* Header & Price */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl leading-tight">
              {listing.title}
            </h2>
            <div className="text-2xl font-black text-blue-600">
              {formatPrice(listing.price_gs)}
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Descripción</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {listing.description || 'Sin descripción detallada proporcionada por el vendedor.'}
            </p>
          </div>

          {/* Campus Meeting Point */}
          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
              <MapPin className="size-4 text-blue-600 shrink-0" />
              <span>Punto de entrega en Campus San Ignacio:</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-blue-950 pl-6">
              {listing.meeting_point || 'Biblioteca Central o Cantina - Campus San Ignacio (UCSI)'}
            </p>
            <p className="mt-1 text-[11px] text-blue-700/80 pl-6">
              Punto seguro verificado por los estudiantes de la universidad.
            </p>
          </div>

          {/* SELLER INFO CARD (Vendido por) */}
          <div className="mt-5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Información del Vendedor
            </span>

            <div className="mt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-blue-600 font-black text-white shadow-sm shadow-blue-300">
                  {sellerName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900">{sellerName}</span>
                    <span
                      title="Estudiante Verificado UCSI"
                      className="inline-flex items-center text-blue-600"
                    >
                      <ShieldCheck className="size-4 fill-blue-100 text-blue-600" />
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">{sellerCareer}</p>
                  <p className="text-[11px] text-slate-400">
                    Universidad Católica Campus San Ignacio (UCSI)
                  </p>
                </div>
              </div>

              {/* Rating box with SVG Star */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 border border-amber-200/80 font-black text-xs text-amber-800">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>{sellerRating.toFixed(1)}</span>
                </div>
                <span className="mt-1 text-[10px] font-bold text-slate-500">
                  {sellerSales} ventas
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            {isOwner ? (
              <>
                {onOpenEdit && (
                  <button
                    onClick={() => {
                      onClose()
                      onOpenEdit(listing)
                    }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition-all hover:bg-slate-800"
                  >
                    <Edit className="size-4" />
                    Editar Publicación
                  </button>
                )}

                {onToggleStatus && (
                  <button
                    onClick={() => {
                      onToggleStatus(listing)
                      onClose()
                    }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold transition-all ${
                      isSold
                        ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <RefreshCw className="size-4" />
                    {isSold ? 'Reactivar Producto' : 'Marcar como Vendido'}
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={handleStartChat}
                  disabled={startingChat || isSold}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  <MessageCircle className="size-4" />
                  {startingChat ? 'Abriendo Chat...' : 'Chatear con el Vendedor'}
                </button>

                {onOpenReview && (
                  <button
                    onClick={() => {
                      onClose()
                      onOpenReview(listing)
                    }}
                    title="Calificar a este vendedor"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs font-bold text-amber-600 transition-all hover:bg-amber-50"
                  >
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="hidden sm:inline">Calificar</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={handleShare}
              title="Copiar enlace del producto"
              className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50"
            >
              <Share2 className="size-4" />
            </button>

            <Link
              href={`/producto/${listing.id}`}
              onClick={onClose}
              title="Ver página completa"
              className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50"
            >
              <ExternalLink className="size-4" />
            </Link>
          </div>

          {copied && (
            <div className="mt-3 text-center text-xs font-semibold text-emerald-600">
              ¡Enlace del producto copiado al portapapeles!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
