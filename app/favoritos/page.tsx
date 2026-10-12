'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Package, Trash2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { createClient } from '@/lib/supabase/client'

type Listing = {
  id: string
  title: string
  price_gs: number
  condition: string
  faculty: string | null
  image_url: string | null
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

export default function FavoritosPage() {
  const supabase = createClient()
  const [favorites, setFavorites] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFavs() {
      setLoading(true)
      const { data } = await supabase.from('listings').select('*').limit(4)
      if (data) setFavorites(data)
      setLoading(false)
    }
    loadFavs()
  }, [])

  return (
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
          Artículos que te interesaron para coordinar en el campus.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {favorites.map((item) => (
            <div
              key={item.id}
              className="flex gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
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
                  <p className="text-[10px] text-slate-400">{item.faculty || 'UCSI San Ignacio'}</p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/producto/${item.id}`}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Ver detalles →
                  </Link>
                  <button
                    onClick={() => setFavorites((prev) => prev.filter((f) => f.id !== item.id))}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
