'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRightLeft,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  User,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { PublishModal } from '@/components/publish-modal'
import { ProductModal, ProductModalListing } from '@/components/product-modal'
import { ReviewModal } from '@/components/review-modal'
import { createClient } from '@/lib/supabase/client'
import { OFFICIAL_CATEGORIES } from '@/lib/categories'

type Listing = {
  id: string
  title: string
  description?: string
  price_gs: number
  condition: string
  faculty: string | null
  meeting_point: string | null
  category_id: string | null
  seller_id: string
  status: string
  image_url: string | null
  accepts_exchange?: boolean
  publication_type?: string | null
  exchange_for?: string | null
  created_at?: string
  distance_campus?: string
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

function formatPrice(value: number) {
  try {
    return `${new Intl.NumberFormat('es-PY').format(value || 0)} Gs.`
  } catch {
    return `${value} Gs.`
  }
}

export default function BuscarPage() {
  const supabase = createClient()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPubType, setSelectedPubType] = useState('all') // all, sale, exchange, both
  const [selectedCondition, setSelectedCondition] = useState('all') // all, new, like_new, good, fair
  const [selectedAvailability, setSelectedAvailability] = useState('all') // all, active, reserved, sold
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [liked, setLiked] = useState<string[]>([])

  // Modals
  const [publishOpen, setPublishOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Listing | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUser({ id: data.user.id, email: data.user.email })
    })

    async function loadData() {
      setLoading(true)
      const { data } = await supabase
        .from('listings')
        .select(`
          *,
          profiles:seller_id (
            id,
            full_name,
            career_name,
            university_name,
            rating,
            sales_count,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (data) {
        setListings(data as Listing[])
      }
      setLoading(false)
    }

    loadData()
  }, [])

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Search text
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchTitle = item.title?.toLowerCase().includes(query)
        const matchDesc = item.description?.toLowerCase().includes(query)
        const matchFaculty = item.faculty?.toLowerCase().includes(query)
        const matchSeller = item.profiles?.full_name?.toLowerCase().includes(query)
        if (!matchTitle && !matchDesc && !matchFaculty && !matchSeller) return false
      }

      // Category
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
        return false
      }

      // Publication Type: sale, exchange, both
      if (selectedPubType !== 'all') {
        if (selectedPubType === 'exchange') {
          if (item.publication_type !== 'exchange' && !item.accepts_exchange) return false
        } else if (selectedPubType === 'sale') {
          if (item.publication_type === 'exchange') return false
        } else if (selectedPubType === 'both') {
          if (item.publication_type !== 'both' && !item.accepts_exchange) return false
        }
      }

      // Physical Condition
      if (selectedCondition !== 'all' && item.condition !== selectedCondition) {
        return false
      }

      // Availability: active, reserved, sold
      if (selectedAvailability !== 'all') {
        const itemStatus = item.status || 'active'
        if (itemStatus !== selectedAvailability) return false
      }

      // Price Range
      const min = minPrice ? Number(minPrice) : 0
      const max = maxPrice ? Number(maxPrice) : Infinity
      if (item.price_gs < min || item.price_gs > max) return false

      return true
    })
  }, [
    listings,
    search,
    selectedCategory,
    selectedPubType,
    selectedCondition,
    selectedAvailability,
    minPrice,
    maxPrice,
  ])

  function toggleLike(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  function resetFilters() {
    setSelectedCategory('all')
    setSelectedPubType('all')
    setSelectedCondition('all')
    setSelectedAvailability('all')
    setMinPrice('')
    setMaxPrice('')
    setSearch('')
  }

  return (
    <AuthGuard moduleName="el catálogo y buscador de UniMarket">
      <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
        <Navbar />

        {/* Header Bar */}
        <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar libros, calculadoras, uniformes, apuntes..."
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-xs sm:text-sm font-medium outline-none transition focus:border-blue-600 focus:bg-white"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex h-11 items-center gap-1.5 rounded-2xl border px-3.5 text-xs font-bold transition sm:px-4 ${
                  showFilters ||
                  selectedCategory !== 'all' ||
                  selectedPubType !== 'all' ||
                  selectedCondition !== 'all' ||
                  selectedAvailability !== 'all'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className="size-4" />
                <span className="hidden sm:inline">Filtros</span>
              </button>

              <button
                onClick={() => setPublishOpen(true)}
                className="flex h-11 items-center gap-1.5 rounded-2xl bg-orange-500 px-3.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:bg-orange-600 transition sm:px-4"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Publicar</span>
              </button>
            </div>

            {/* Quick Category Chips */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({listings.length})
              </button>
              {OFFICIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Advanced Filters Expandable Panel */}
            {showFilters && (
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Filtros Avanzados
                  </span>
                  <button
                    onClick={resetFilters}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Restablecer todo
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {/* Tipo de publicación */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Modalidad
                    </label>
                    <select
                      value={selectedPubType}
                      onChange={(e) => setSelectedPubType(e.target.value)}
                      className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="all">Todas las modalidades</option>
                      <option value="sale">Solo Venta</option>
                      <option value="exchange">Solo Intercambio</option>
                      <option value="both">Venta e Intercambio</option>
                    </select>
                  </div>

                  {/* Estado Físico */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Estado Físico
                    </label>
                    <select
                      value={selectedCondition}
                      onChange={(e) => setSelectedCondition(e.target.value)}
                      className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="all">Cualquier estado</option>
                      <option value="new">Nuevo (Sin uso)</option>
                      <option value="like_new">Muy buen estado</option>
                      <option value="good">Buen estado</option>
                      <option value="fair">Aceptable</option>
                    </select>
                  </div>

                  {/* Disponibilidad */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Disponibilidad
                    </label>
                    <select
                      value={selectedAvailability}
                      onChange={(e) => setSelectedAvailability(e.target.value)}
                      className="mt-1 h-9 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="active">Solo Disponibles</option>
                      <option value="reserved">Reservados</option>
                      <option value="sold">Vendidos</option>
                    </select>
                  </div>

                  {/* Rango de precio */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                      Precio (Gs.)
                    </label>
                    <div className="mt-1 flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs font-medium outline-none"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="number"
                        placeholder="Máx"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-9 w-full rounded-xl border border-slate-200 bg-white px-2 text-xs font-medium outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Listings Grid */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {filteredListings.length}{' '}
              {filteredListings.length === 1 ? 'producto encontrado' : 'productos encontrados'} en UCSI
            </span>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <Package className="mx-auto size-12 text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-800">
                No encontramos productos con esos filtros
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Prueba borrando los filtros de búsqueda o publica lo que estás buscando.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredListings.map((listing) => {
                const isFavorite = liked.includes(listing.id)
                const isSold = listing.status === 'sold'
                const isReserved = listing.status === 'reserved'
                const sellerName = listing.profiles?.full_name || 'Estudiante UCSI'
                const sellerCareer = listing.profiles?.career_name || listing.faculty || 'UCSI'
                const sellerRating = listing.profiles?.rating ?? 4.9

                return (
                  <div
                    key={listing.id}
                    onClick={() => {
                      setSelectedProduct(listing)
                      setProductModalOpen(true)
                    }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                  >
                    {/* Top Image Box */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      {listing.image_url ? (
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-300">
                          <Package className="size-10" />
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                        {isSold ? (
                          <span className="rounded-lg bg-slate-900/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
                            Vendido
                          </span>
                        ) : isReserved ? (
                          <span className="rounded-lg bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
                            Reservado
                          </span>
                        ) : (
                          <span className="rounded-lg bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-sm">
                            Disponible
                          </span>
                        )}

                        {listing.accepts_exchange && (
                          <span className="rounded-lg bg-purple-600/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            Trueque
                          </span>
                        )}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleLike(listing.id, e)}
                        className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-xl bg-white/90 text-slate-700 shadow-sm backdrop-blur-sm transition hover:bg-white"
                      >
                        <Heart
                          className={`size-4 ${
                            isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 line-clamp-1">
                          {listing.faculty || 'UCSI Campus San Ignacio'}
                        </span>
                        <h3 className="mt-1 text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                          {listing.title}
                        </h3>
                      </div>

                      {/* Price & Modal Trigger */}
                      <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-base font-black text-slate-900">
                            {formatPrice(listing.price_gs)}
                          </span>
                          {listing.accepts_exchange && (
                            <p className="text-[10px] font-semibold text-purple-600">
                              O intercambio
                            </p>
                          )}
                        </div>
                        <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                          {listing.condition === 'new'
                            ? 'Nuevo'
                            : listing.condition === 'like_new'
                            ? 'Muy bueno'
                            : 'Usado'}
                        </span>
                      </div>

                      {/* Seller Card Snippet */}
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <div className="grid size-6 shrink-0 place-items-center rounded-lg bg-blue-600 text-[10px] font-black text-white">
                            {sellerName.substring(0, 1).toUpperCase()}
                          </div>
                          <span className="truncate text-[11px] font-bold text-slate-800">
                            {sellerName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span>{Number(sellerRating).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modals */}
        <PublishModal
          isOpen={publishOpen}
          onClose={() => setPublishOpen(false)}
          onSuccess={() => window.location.reload()}
        />

        {selectedProduct && (
          <ProductModal
            isOpen={productModalOpen}
            onClose={() => setProductModalOpen(false)}
            listing={selectedProduct}
            currentUserId={currentUser?.id}
            onOpenReview={() => setReviewOpen(true)}
          />
        )}

        {selectedProduct && (
          <ReviewModal
            isOpen={reviewOpen}
            onClose={() => setReviewOpen(false)}
            sellerId={selectedProduct.seller_id}
            sellerName={selectedProduct.profiles?.full_name || 'Vendedor'}
            listingId={selectedProduct.id}
          />
        )}

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
