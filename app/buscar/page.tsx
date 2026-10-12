'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  Filter,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  Plus,
  Search,
  Sparkles,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { PublishModal } from '@/components/publish-modal'
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
  status: string
  image_url: string | null
  distance_campus?: string
}

const CATEGORIES = [
  { id: 'all', label: 'Todas las categorías' },
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

const CAMPUS_DISTANCES = [
  'A 40m en Biblioteca UCSI',
  'A 80m en Cantina de la Facu',
  'A 120m en Acceso Principal',
  'A 50m en Patio Central',
  'A 90m en Hall de Aulas',
]

export default function BuscarPage() {
  const supabase = createClient()

  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState('all')
  const [selectedCareer, setSelectedCareer] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCondition, setSelectedCondition] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [liked, setLiked] = useState<string[]>([])
  const [publishOpen, setPublishOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        const enriched = data.map((item, idx) => ({
          ...item,
          distance_campus: CAMPUS_DISTANCES[idx % CAMPUS_DISTANCES.length],
        }))
        setListings(enriched)
      }
      setLoading(false)
    }

    loadData()
  }, [])

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        search.trim() === '' ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        (item.faculty && item.faculty.toLowerCase().includes(search.toLowerCase())) ||
        (item.meeting_point && item.meeting_point.toLowerCase().includes(search.toLowerCase()))

      const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory
      const matchesCond = selectedCondition === 'all' || item.condition === selectedCondition

      const price = item.price_gs
      const matchesMin = minPrice === '' || price >= Number(minPrice)
      const matchesMax = maxPrice === '' || price <= Number(maxPrice)

      const matchesUniv =
        selectedUniversity === 'all' ||
        (item.faculty && item.faculty.toLowerCase().includes('ucsi'))

      return matchesSearch && matchesCat && matchesCond && matchesMin && matchesMax && matchesUniv
    })
  }, [listings, search, selectedCategory, selectedCondition, minPrice, maxPrice, selectedUniversity])

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-950 md:pb-12">
      <Navbar onOpenPublish={() => setPublishOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
            Filtros Avanzados
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl text-slate-900">
            Buscar en el Campus
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Encuentra materiales por facultad, carrera, estado y distancia en UCSI San Ignacio.
          </p>
        </div>

        {/* Filter Panel */}
        <div className="mt-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          {/* Active Search Input */}
          <div className="relative flex items-center rounded-2xl border border-blue-200 bg-blue-50/30 px-4 py-3">
            <Search className="size-5 text-blue-600" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por libro, apuntes, calculadora, laptop..."
              className="w-full bg-transparent px-3 text-sm font-medium outline-none placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-[11px] font-bold text-slate-600">Universidad / Sede</label>
              <select
                value={selectedUniversity}
                onChange={(e) => setSelectedUniversity(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-blue-600"
              >
                <option value="all">Todas las sedes</option>
                <option value="ucsi">UCSI Campus San Ignacio</option>
                <option value="uca">UCA Asunción</option>
                <option value="una">UNA San Lorenzo</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-blue-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600">Estado del artículo</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-blue-600"
              >
                <option value="all">Cualquier estado</option>
                <option value="like_new">Como nuevo</option>
                <option value="new">Nuevo en caja</option>
                <option value="good">Buen estado</option>
                <option value="fair">Aceptable</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600">Rango de precio (Gs.)</label>
              <div className="mt-1 flex items-center gap-1.5">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Mín"
                  className="h-10 w-full rounded-xl border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-600"
                />
                <span className="text-slate-300">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Máx"
                  className="h-10 w-full rounded-xl border border-slate-200 px-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <p>
            Resultados encontrados: <strong>{filtered.length}</strong> productos
          </p>
          {(search ||
            selectedCategory !== 'all' ||
            selectedCondition !== 'all' ||
            minPrice ||
            maxPrice) && (
            <button
              onClick={() => {
                setSearch('')
                setSelectedCategory('all')
                setSelectedCondition('all')
                setMinPrice('')
                setMaxPrice('')
              }}
              className="font-bold text-blue-600 hover:underline"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

        {/* Results Grid */}
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const isFav = liked.includes(item.id)
            return (
              <Link
                key={item.id}
                href={`/producto/${item.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  {/* Photo */}
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

                  {/* Campus Distance Badge */}
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5 w-fit">
                    <Navigation className="size-3" />
                    <span>{item.distance_campus}</span>
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                    {item.faculty || 'UCSI Campus San Ignacio'}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
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
      </main>

      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} />
      <BottomNav onOpenPublish={() => setPublishOpen(true)} />
    </div>
  )
}
