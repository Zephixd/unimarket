'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Package, Star, Trash2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { ProductModal, ProductModalListing } from '@/components/product-modal'
import { createClient } from '@/lib/supabase/client'

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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })

    async function loadFavs() {
      setLoading(true)
      const { data } = await supabase
        .from('listings')
        .select('*, profiles:seller_id(id, full_name, career_name, university_name, rating, sales_count, avatar_url)')
        .limit(6)
      if (data) setFavorites(data)
      setLoading(false)
    }
    loadFavs()
  }, [])

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
                      onClick={(e) => {
                        e.stopPropagation()
                        setFavorites((prev) => prev.filter((f) => f.id !== item.id))
                      }}
                      title="Eliminar de favoritos"
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
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
