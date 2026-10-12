'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  BookOpen,
  Calculator,
  Heart,
  Laptop,
  Package,
  Plus,
  Search,
  Shirt,
  Sparkles,
  User,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { PublishModal } from '@/components/publish-modal'
import { createClient } from '@/lib/supabase/client'

type Listing = {
  id: string
  title: string
  price_gs: number
  condition: string
  faculty: string | null
  image_url: string | null
  status: string
}

const CATEGORIES = [
  { id: 'b954ecf7-3147-45f2-9b85-5da9b5bf6b6f', label: 'Libros', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
  { id: 'c513082e-2740-4e02-81f6-5cc14d5e1af6', label: 'Calculadoras', icon: Calculator, color: 'bg-orange-50 text-orange-600' },
  { id: 'fe8651ac-28d0-4617-8402-f04844a98743', label: 'Uniformes', icon: Shirt, color: 'bg-emerald-50 text-emerald-600' },
  { id: '71b04623-2815-4bb0-8e95-680bd135f650', label: 'Tecnología', icon: Laptop, color: 'bg-purple-50 text-purple-600' },
  { id: '96d3f8c8-0e08-489a-9d77-dbcc4a6a1c61', label: 'Mochilas', icon: Package, color: 'bg-pink-50 text-pink-600' },
  { id: 'd901a725-cf4d-4262-87b4-37d598634b81', label: 'Apuntes', icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
]

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

export default function InicioPage() {
  const supabase = createClient()
  const [listings, setListings] = useState<Listing[]>([])
  const [liked, setLiked] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [publishOpen, setPublishOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ email: data.user.email })
    })

    supabase
      .from('listings')
      .select('id,title,price_gs,condition,faculty,image_url,status')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setListings(data)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-950 md:pb-12">
      {/* Top Header with small logo, notifications bell, and profile picture */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-blue-600 text-white font-black text-sm">
              UM
            </div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight">
              Uni<span className="text-blue-600">Market</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/notificaciones"
              className="relative grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
            </Link>

            <Link
              href="/perfil"
              className="grid size-9 place-items-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs ring-2 ring-blue-200"
            >
              {user?.email ? user.email[0].toUpperCase() : <User className="size-4" />}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Big Search Bar */}
        <Link
          href="/buscar"
          className="flex h-13 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
        >
          <Search className="size-5 text-blue-600" />
          <span className="text-sm font-medium">¿Qué necesitas para tus clases en UCSI?</span>
        </Link>

        {/* Categories Carousel */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Categorías</h2>
            <Link href="/buscar" className="text-xs font-bold text-blue-600 hover:underline">
              Ver todas
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.id}
                  href={`/buscar?cat=${cat.id}`}
                  className="flex min-w-[84px] flex-col items-center gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 text-center shadow-xs transition-transform hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`grid size-12 place-items-center rounded-2xl ${cat.color}`}>
                    <Icon className="size-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">{cat.label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Productos Recientes */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Productos recientes</h2>
              <p className="text-xs text-slate-500">Publicados recientemente en Campus San Ignacio</p>
            </div>
            <Link href="/productos" className="text-xs font-bold text-blue-600 hover:underline">
              Ver catálogo completo →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((item) => {
              const isFav = liked.includes(item.id)
              return (
                <Link
                  key={item.id}
                  href={`/producto/${item.id}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 mb-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-slate-300">
                          <Package className="size-8" />
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          setLiked((prev) =>
                            isFav ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          )
                        }}
                        className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 shadow-sm"
                      >
                        <Heart
                          className={`size-3.5 ${
                            isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                          }`}
                        />
                      </button>
                    </div>

                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {item.faculty || 'UCSI San Ignacio'}
                    </span>
                    <h3 className="mt-1.5 text-sm font-bold text-slate-900 group-hover:text-blue-600 line-clamp-1">
                      {item.title}
                    </h3>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="text-base font-black text-blue-600">
                      {formatPrice(item.price_gs)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {item.condition === 'like_new' ? 'Como nuevo' : 'Buen estado'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>

      {/* Floating Orange Publish Button */}
      <Link
        href="/publicar"
        className="fixed bottom-20 right-5 z-40 flex h-14 items-center gap-2 rounded-2xl bg-orange-500 px-5 font-bold text-white shadow-xl shadow-orange-300 transition-all hover:bg-orange-600 sm:bottom-8 sm:right-8"
      >
        <Plus className="size-5" />
        <span>+ Publicar</span>
      </Link>

      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} />
      <BottomNav onOpenPublish={() => setPublishOpen(true)} />
    </div>
  )
}
