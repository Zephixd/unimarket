'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Package, Star, Trash2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { ProductModal, ProductModalListing } from '@/components/product-modal'
import { createClient } from '@/lib/supabase/client'

import { fetchUserFavorites, toggleFavoriteItem } from '@/lib/favorites'

type Listing = {
  id: string
  title: string
  description?: string
  price_gs: number
  condition: string
  faculty: string | null
  meeting_point?: string | null
  image_url: string | null
  seller_id: string
  status: string
  accepts_exchange?: boolean
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
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

export default function FavoritosPage() {
  const supabase = createClient()
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Listing | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  async function loadFavs() {
    setLoading(true)
    const favIds = await fetchUserFavorites()
    if (favIds.length === 0) {
      setFavorites([])
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('listings')
      .select('*, profiles:seller_id(id, full_name, career_name, university_name, rating, sales_count, avatar_url)')
      .in('id', favIds)

    if (data) {
      setFavorites(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })

    loadFavs()

    const onFavChange = () => loadFavs()
    window.addEventListener('unimarket_favorites_changed', onFavChange)
    return () => window.removeEventListener('unimarket_favorites_changed', onFavChange)
  }, [])

  const handleRemoveFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleFavoriteItem(id)
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <AuthGuard moduleName="tus publicaciones guardadas">
      <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-950 md:pb-12">
        <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Link
          href="/productos"
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft className="size-4" /> Volver a Productos
        </Link>

        <div className="flex items-center gap-2">
          <Heart className="size-6 text-rose-500 fill-rose-500" />
          <h1 className="text-2xl font-black text-slate-900">Mis Favoritos Guardados</h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Artículos que te interesaron para coordinar en el Campus San Ignacio (UCSI).
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {favorites.map((item) => {
            const sellerName = item.profiles?.full_name || 'Estudiante UCSI'
            const sellerCareer = item.profiles?.career_name || item.faculty || 'UCSI San Ignacio'
            const sellerRating = item.profiles?.rating ?? 4.8

            return (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedProduct(item)
                  setProductModalOpen(true)
                }}
                className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-blue-300"
              >
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-slate-300">
                      <Package className="size-6" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 truncate">{item.title}</h3>
                    <p className="text-xs font-black text-blue-600">{formatPrice(item.price_gs)}</p>

                    {/* VENDIDO POR */}
                    <div className="mt-1 flex items-center justify-between text-[10px]">
                      <span className="truncate text-slate-600 font-medium">
                        Vendido por: <strong className="text-slate-900">{sellerName}</strong>
                      </span>
                      <span className="flex items-center gap-0.5 font-bold text-amber-700 shrink-0">
                        <Star className="size-2.5 fill-amber-400 text-amber-400" />
                        {sellerRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-blue-600">Ver información modal →</span>
                      <button
                        onClick={(e) => handleRemoveFavorite(item.id, e)}
                        title="Eliminar de favoritos"
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {!loading && favorites.length === 0 && (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-rose-50 text-rose-500 mb-3">
                <Heart className="size-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Aún no tienes favoritos guardados</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Explora las publicaciones del campus y toca el corazón para guardar libros, apuntes o materiales y verlos aquí.
              </p>
              <Link
                href="/productos"
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Explorar Catálogo
              </Link>
            </div>
          )}
        </main>

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setSelectedProduct(null)
        }}
        listing={selectedProduct}
        currentUserId={currentUserId}
      />

      <BottomNav />
    </div>
    </AuthGuard>
  )
}
