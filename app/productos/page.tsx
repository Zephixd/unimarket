'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpDown,
  BookOpen,
  Building2,
  Calculator,
  CheckCircle2,
  CheckSquare,
  Clock,
  Edit,
  Filter,
  Heart,
  Laptop,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  User,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PublishModal } from '@/components/publish-modal'
import { ReviewModal } from '@/components/review-modal'
import { AuthModal } from '@/components/auth-modal'
import { ProductModal } from '@/components/product-modal'
import { EditListingModal } from '@/components/edit-listing-modal'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { createClient } from '@/lib/supabase/client'
import { fetchUserFavorites, toggleFavoriteItem, getLocalFavorites } from '@/lib/favorites'

type Listing = {
  id: string
  title: string
  description: string
  price_gs: number
  condition: string
  faculty: string | null
  meeting_point: string | null
  category_id: string | null
  seller_id: string
  status: string
  accepts_exchange?: boolean
  image_url?: string | null
  created_at?: string
  seller_name?: string
  seller_faculty?: string
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

const CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'b954ecf7-3147-45f2-9b85-5da9b5bf6b6f', label: 'Libros' },
  { id: 'c513082e-2740-4e02-81f6-5cc14d5e1af6', label: 'Calculadoras' },
  { id: '71b04623-2815-4bb0-8e95-680bd135f650', label: 'Tecnología' },
  { id: 'd901a725-cf4d-4262-87b4-37d598634b81', label: 'Apuntes' },
  { id: '96d3f8c8-0e08-489a-9d77-dbcc4a6a1c61', label: 'Mochilas' },
  { id: 'fe8651ac-28d0-4617-8402-f04844a98743', label: 'Uniformes' },
]

function formatPrice(value: number | undefined | null) {
  try {
    const num = Number(value) || 0
    return `${new Intl.NumberFormat('es-PY').format(num)} Gs.`
  } catch {
    return '0 Gs.'
  }
}

export default function ProductosPage() {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [liked, setLiked] = useState<string[]>(() => getLocalFavorites())
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCondition, setSelectedCondition] = useState('all')
  const [onlyExchange, setOnlyExchange] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent')

  // Modals
  const [publishOpen, setPublishOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [selectedReviewListing, setSelectedReviewListing] = useState<Listing | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Listing | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedEditListing, setSelectedEditListing] = useState<Listing | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Load listings & user
  async function loadData() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      setCurrentUser({ id: userData.user.id, email: userData.user.email })
    }

    const favs = await fetchUserFavorites()
    if (favs) setLiked(favs)

    const { data, error } = await supabase
      .from('listings')
      .select('*, profiles:seller_id(id, full_name, career_name, university_name, rating, sales_count, avatar_url)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListings(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    const onFavChange = (e: any) => {
      if (e.detail) setLiked(e.detail)
    }
    window.addEventListener('unimarket_favorites_changed', onFavChange)
    return () => window.removeEventListener('unimarket_favorites_changed', onFavChange)
  }, [])

  // Toast auto-clear
  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 4000)
    return () => clearTimeout(t)
  }, [toastMsg])

  // Toggle favorite
  async function toggleFavorite(id: string) {
    const isNowFav = await toggleFavoriteItem(id)
    setLiked((prev) => (isNowFav ? Array.from(new Set([...prev, id])) : prev.filter((item) => item !== id)))
    setToastMsg(isNowFav ? '¡Guardado en favoritos!' : 'Eliminado de favoritos')
  }

  // Toggle mark as sold / reactivate
  async function toggleStatus(listing: Listing) {
    const newStatus = listing.status === 'sold' ? 'active' : 'sold'
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', listing.id)

    if (!error) {
      setListings((current) =>
        current.map((item) => (item.id === listing.id ? { ...item, status: newStatus } : item))
      )
      setToastMsg(
        newStatus === 'sold'
          ? '¡Producto marcado como VENDIDO!'
          : '¡Publicación reactivada como activa!'
      )
    } else {
      setToastMsg('No se pudo actualizar el estado: ' + error.message)
    }
  }

  // Start internal chat with seller
  async function startChat(listing: Listing) {
    if (!currentUser) {
      setAuthMode('login')
      setAuthOpen(true)
      return
    }

    if (currentUser.id === listing.seller_id) {
      setToastMsg('Este producto es tuyo. Puedes gestionarlo desde tu perfil.')
      return
    }

    // Check or create conversation in Supabase
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('listing_id', listing.id)
      .eq('buyer_id', currentUser.id)
      .single()

    if (existing?.id) {
      router.push(`/mensajes?conv=${existing.id}`)
    } else {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          listing_id: listing.id,
          buyer_id: currentUser.id,
          seller_id: listing.seller_id,
        })
        .select()
        .single()

      if (!error && newConv) {
        router.push(`/mensajes?conv=${newConv.id}`)
      } else {
        router.push('/mensajes')
      }
    }
  }

  // Filter listings
  const filtered = useMemo(() => {
    return listings
      .filter((item) => {
        const q = search.trim().toLowerCase()
        const matchesSearch =
          q === '' ||
          Boolean(item.title && item.title.toLowerCase().includes(q)) ||
          Boolean(item.description && item.description.toLowerCase().includes(q)) ||
          Boolean(item.faculty && item.faculty.toLowerCase().includes(q)) ||
          Boolean(item.meeting_point && item.meeting_point.toLowerCase().includes(q))

        const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory
        const matchesCond = selectedCondition === 'all' || item.condition === selectedCondition
        const matchesEx = !onlyExchange || item.accepts_exchange === true

        return matchesSearch && matchesCat && matchesCond && matchesEx
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return (a.price_gs || 0) - (b.price_gs || 0)
        if (sortBy === 'price_desc') return (b.price_gs || 0) - (a.price_gs || 0)
        return 0
      })
  }, [listings, search, selectedCategory, selectedCondition, onlyExchange, sortBy])

  return (
    <AuthGuard moduleName="el catálogo de productos de UniMarket">
      <div className="min-h-screen bg-slate-50/60 pb-20 text-slate-950">
      <Navbar
        onOpenPublish={() => setPublishOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode)
          setAuthOpen(true)
        }}
      />

      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-24 right-5 z-50 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-sm font-semibold shadow-2xl transition-all"
        >
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="size-4 shrink-0 text-blue-600" />
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="grid size-6 place-items-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header Banner */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/70 px-3 py-1 text-xs font-bold text-blue-700">
              <Sparkles className="size-3" /> Catálogo Universitario
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Marketplace de Estudiantes
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Compra, vende e intercambia dentro del campus con otros compañeros.
            </p>
          </div>

          <button
            onClick={() => setPublishOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-600"
          >
            <Plus className="size-4" /> Publicar producto
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-7 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Input */}
            <div className="relative flex flex-1 items-center rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
              <Search className="size-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por libro, calculadora, notebook, facultad..."
                className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Quick dropdown filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="all">Cualquier estado</option>
                <option value="like_new">Como nuevo</option>
                <option value="new">Nuevo</option>
                <option value="good">Buen estado</option>
                <option value="fair">Aceptable</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="recent">Más recientes</option>
                <option value="price_asc">Menor precio</option>
                <option value="price_desc">Mayor precio</option>
              </select>

              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={onlyExchange}
                  onChange={(e) => setOnlyExchange(e.target.checked)}
                  className="size-3.5 rounded text-blue-600"
                />
                <span>Intercambio</span>
              </label>
            </div>
          </div>

          {/* Categories Pill Horizontal Slider */}
          <div className="mt-4 flex gap-2 overflow-x-auto border-t border-slate-100 pt-3 pb-1">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando <strong>{filtered.length}</strong> productos disponibles
          </span>
          {(search || selectedCategory !== 'all' || selectedCondition !== 'all' || onlyExchange) && (
            <button
              onClick={() => {
                setSearch('')
                setSelectedCategory('all')
                setSelectedCondition('all')
                setOnlyExchange(false)
              }}
              className="font-semibold text-blue-600 hover:underline"
            >
              Restablecer filtros
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const isOwner = currentUser?.id === item.seller_id
            const isFav = liked.includes(item.id)
            const isSold = item.status === 'sold'
            const seller = item.profiles || null
            const sellerName = seller?.full_name || 'Estudiante UCSI'
            const sellerCareer = seller?.career_name || item.faculty || 'UCSI San Ignacio'
            const sellerRating = Number(seller?.rating ?? 4.8)

            return (
              <article
                key={item.id}
                onClick={() => {
                  setSelectedProduct(item)
                  setProductModalOpen(true)
                }}
                className={`group flex flex-col justify-between overflow-hidden rounded-2xl border bg-white cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${
                  isSold
                    ? 'border-slate-200/60 bg-slate-50/70 opacity-80'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Product Image Section */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-slate-300">
                      <Package className="size-10" />
                      <span className="text-[10px] text-slate-400">Sin foto</span>
                    </div>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5">
                    {isSold ? (
                      <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md">
                        VENDIDO
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md">
                        DISPONIBLE
                      </span>
                    )}

                    {item.faculty && (
                      <span className="rounded-full bg-blue-600/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        {item.faculty}
                      </span>
                    )}

                    {item.accepts_exchange && (
                      <span className="rounded-full bg-purple-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        Intercambio
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(item.id)
                    }}
                    aria-label="Favorito"
                    className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur-md transition-colors hover:bg-white hover:text-rose-500"
                  >
                    <Heart
                      className={`size-4 transition-colors ${
                        isFav ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Card Content */}
                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                      {item.description}
                    </p>

                    {/* VENDIDO POR - SELLER INFO WITH SVG */}
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="grid size-7 place-items-center rounded-lg bg-blue-600 text-[10px] font-black text-white shrink-0 shadow-xs">
                          {(sellerName || 'UC').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-800 truncate">
                            Vendido por: {sellerName}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {sellerCareer}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 border border-amber-200/80 text-[10px] font-black text-amber-800 shrink-0">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        <span>{(sellerRating || 4.8).toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Meeting point */}
                    {item.meeting_point && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <MapPin className="size-3.5 shrink-0 text-blue-500" />
                        <span className="truncate">{item.meeting_point}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Price & Actions */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-lg font-black text-blue-600">
                        {formatPrice(item.price_gs)}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {item.condition === 'like_new'
                          ? 'Como nuevo'
                          : item.condition === 'new'
                          ? 'Nuevo'
                          : item.condition === 'good'
                          ? 'Buen estado'
                          : 'Usado'}
                      </span>
                    </div>

                    {/* Action Buttons based on owner */}
                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedEditListing(item)
                            setEditOpen(true)
                          }}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white transition-colors hover:bg-slate-800"
                        >
                          <Edit className="size-3.5" />
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleStatus(item)
                          }}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-colors ${
                            isSold
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <RefreshCw className="size-3.5" />
                          {isSold ? 'Reactivar' : 'Vendido'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* Integrated Internal Chat */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            startChat(item)
                          }}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
                        >
                          <MessageCircle className="size-3.5" />
                          Chatear en web
                        </button>

                        {/* Review Seller Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedReviewListing(item)
                            setReviewOpen(true)
                          }}
                          title="Calificar a este vendedor"
                          className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-amber-500 transition-colors hover:bg-amber-50"
                        >
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}

          {filtered.length === 0 && !loading && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Package className="mx-auto size-12 text-slate-300 mb-3" />
              <p className="text-base font-bold text-slate-700">No encontramos ningún producto</p>
              <p className="mt-1 text-xs text-slate-400">
                Prueba cambiando los filtros o sé el primero en publicar uno.
              </p>
              <button
                onClick={() => setPublishOpen(true)}
                className="mt-4 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-orange-600"
              >
                + Publicar producto ahora
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setSelectedProduct(null)
        }}
        listing={selectedProduct}
        currentUserId={currentUser?.id}
        onOpenReview={(l) => {
          setSelectedReviewListing(l as unknown as Listing)
          setReviewOpen(true)
        }}
        onOpenEdit={(l) => {
          setSelectedEditListing(l as unknown as Listing)
          setEditOpen(true)
        }}
        onToggleStatus={(l) => toggleStatus(l as unknown as Listing)}
      />

      {/* Edit Listing Modal */}
      {selectedEditListing && (
        <EditListingModal
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false)
            setSelectedEditListing(null)
          }}
          listing={selectedEditListing}
          onSuccess={() => {
            setToastMsg('¡Producto actualizado correctamente!')
            loadData()
          }}
        />
      )}

      {/* Publish Modal */}
      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onSuccess={() => {
          setToastMsg('¡Tu producto fue publicado con éxito!')
          loadData()
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => loadData()}
      />

      {/* Review Modal */}
      {selectedReviewListing && (
        <ReviewModal
          isOpen={reviewOpen}
          onClose={() => {
            setReviewOpen(false)
            setSelectedReviewListing(null)
          }}
          sellerId={selectedReviewListing.seller_id}
          sellerName={selectedReviewListing.profiles?.full_name || 'Estudiante UniMarket'}
          listingId={selectedReviewListing.id}
          onSuccess={() => setToastMsg('¡Calificación enviada con éxito! Gracias por tu reseña.')}
        />
      )}

      <BottomNav />
    </div>
    </AuthGuard>
  )
}
