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
  seller_id: string
  status: string
  accepts_exchange?: boolean
  created_at?: string
  seller_name?: string
  seller_faculty?: string
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

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

export default function ProductosPage() {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [liked, setLiked] = useState<string[]>([])
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
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // Load listings & user
  async function loadData() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      setCurrentUser({ id: userData.user.id, email: userData.user.email })

      // Load favorites for user
      const { data: favs } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', userData.user.id)
      if (favs) {
        setLiked(favs.map((f) => f.listing_id))
      }
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setListings(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Toast auto-clear
  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 4000)
    return () => clearTimeout(t)
  }, [toastMsg])

  // Toggle favorite
  async function toggleFavorite(id: string) {
    if (!currentUser) {
      setAuthMode('login')
      setAuthOpen(true)
      return
    }

    const isFav = liked.includes(id)
    const newLiked = isFav ? liked.filter((item) => item !== id) : [...liked, id]
    setLiked(newLiked)

    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', currentUser.id).eq('listing_id', id)
      setToastMsg('Eliminado de favoritos')
    } else {
      await supabase.from('favorites').upsert({ user_id: currentUser.id, listing_id: id })
      setToastMsg('¡Guardado en favoritos!')
    }
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
        const matchesSearch =
          search.trim() === '' ||
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase()) ||
          (item.faculty && item.faculty.toLowerCase().includes(search.toLowerCase())) ||
          (item.meeting_point && item.meeting_point.toLowerCase().includes(search.toLowerCase()))

        const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory
        const matchesCond = selectedCondition === 'all' || item.condition === selectedCondition
        const matchesEx = !onlyExchange || item.accepts_exchange === true

        return matchesSearch && matchesCat && matchesCond && matchesEx
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price_gs - b.price_gs
        if (sortBy === 'price_desc') return b.price_gs - a.price_gs
        return 0
      })
  }, [listings, search, selectedCategory, selectedCondition, onlyExchange, sortBy])

  return (
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

            return (
              <article
                key={item.id}
                className={`group flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl ${
                  isSold
                    ? 'border-slate-200/60 bg-slate-50/70 opacity-80'
                    : 'border-slate-200 hover:border-blue-200'
                }`}
              >
                <div>
                  {/* Top Badge & Like */}
                  <div className="flex items-start justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isSold ? (
                        <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-700">
                          VENDIDO
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          DISPONIBLE
                        </span>
                      )}

                      {item.faculty && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                          {item.faculty}
                        </span>
                      )}

                      {item.accepts_exchange && (
                        <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                          Intercambio
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => toggleFavorite(item.id)}
                      aria-label="Favorito"
                      className="rounded-full p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Heart
                        className={`size-5 transition-colors ${
                          isFav ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {item.description}
                  </p>

                  {/* Meeting point */}
                  {item.meeting_point && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <MapPin className="size-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{item.meeting_point}</span>
                    </div>
                  )}
                </div>

                {/* Footer Price & Actions */}
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-lg font-extrabold text-blue-600">
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
                        onClick={() => toggleStatus(item)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-colors ${
                          isSold
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <RefreshCw className="size-3.5" />
                        {isSold ? 'Reactivar producto' : 'Marcar como Vendido'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* Integrated Internal Chat */}
                      <button
                        onClick={() => startChat(item)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700"
                      >
                        <MessageCircle className="size-3.5" />
                        Chatear en web
                      </button>

                      {/* Review Seller Button */}
                      <button
                        onClick={() => {
                          setSelectedReviewListing(item)
                          setReviewOpen(true)
                        }}
                        title="Calificar a este vendedor"
                        className="flex size-9 items-center justify-center rounded-xl border border-slate-200 text-amber-500 transition-colors hover:bg-amber-50"
                      >
                        <Star className="size-4 fill-amber-400" />
                      </button>
                    </div>
                  )}
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

      {/* Reusable Modals */}
      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onSuccess={() => {
          setToastMsg('¡Tu producto fue publicado con éxito!')
          loadData()
        }}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => loadData()}
      />

      {selectedReviewListing && (
        <ReviewModal
          isOpen={reviewOpen}
          onClose={() => {
            setReviewOpen(false)
            setSelectedReviewListing(null)
          }}
          sellerId={selectedReviewListing.seller_id}
          sellerName="Estudiante UniMarket"
          listingId={selectedReviewListing.id}
          onSuccess={() => setToastMsg('¡Calificación enviada con éxito! Gracias por tu reseña.')}
        />
      )}
    </div>
  )
}
