'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Heart,
  Laptop,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  User,
  Users,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// Types
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
}

type CategoryItem = {
  id?: string
  label: string
  icon: typeof BookOpen
  color: 'blue' | 'orange' | 'violet' | 'green'
}

const UI_CATEGORIES: CategoryItem[] = [
  { id: 'b954ecf7-3147-45f2-9b85-5da9b5bf6b6f', label: 'Libros', icon: BookOpen, color: 'blue' },
  { id: 'c513082e-2740-4e02-81f6-5cc14d5e1af6', label: 'Calculadoras', icon: Calculator, color: 'orange' },
  { id: '71b04623-2815-4bb0-8e95-680bd135f650', label: 'Tecnología', icon: Laptop, color: 'violet' },
  { id: 'd901a725-cf4d-4262-87b4-37d598634b81', label: 'Apuntes', icon: Package, color: 'green' },
]

const INITIAL_FALLBACK_LISTINGS: Listing[] = [
  {
    id: 'demo-1',
    title: 'Libro de Programación en C++ Deitel 9ª Edición',
    description: 'Libro clásico para Algorítmica y Programación I y II. Estado impecable, sin marcas ni hojas sueltas. Incluye ejercicios.',
    price_gs: 120000,
    condition: 'good',
    faculty: 'Facultad Politécnica (FPUNA)',
    meeting_point: 'Biblioteca Central o Cantina de Poli',
    category_id: 'b954ecf7-3147-45f2-9b85-5da9b5bf6b6f',
    seller_id: 'f6ae5678-deb4-43cb-95bc-a7974ca1ad63',
    status: 'active',
    accepts_exchange: true,
  },
  {
    id: 'demo-2',
    title: 'Calculadora Científica Casio fx-991LAX ClassWiz',
    description: 'Pantalla natural de libro de texto en español. 552 funciones, resolución de matrices y ecuaciones. Muy cuidada con pila nueva.',
    price_gs: 80000,
    condition: 'like_new',
    faculty: 'Campus Santa Librada (UCA)',
    meeting_point: 'Entrada principal UCA frente a la capilla',
    category_id: 'c513082e-2740-4e02-81f6-5cc14d5e1af6',
    seller_id: '0b850071-ab3e-4ca7-9e29-dea6169f78ed',
    status: 'active',
    accepts_exchange: false,
  },
  {
    id: 'demo-3',
    title: 'Mochila Universitaria Porta Laptop Impermeable 15.6"',
    description: 'Mochila resistente con compartimento acolchado para notebook, puerto USB lateral y varios bolsillos organizadores. Color negro.',
    price_gs: 150000,
    condition: 'like_new',
    faculty: 'Campus San Lorenzo (UNA)',
    meeting_point: 'Rectorado UNA o Parada de colectivos',
    category_id: '96d3f8c8-0e08-489a-9d77-dbcc4a6a1c61',
    seller_id: 'f6ae5678-deb4-43cb-95bc-a7974ca1ad63',
    status: 'active',
    accepts_exchange: false,
  },
  {
    id: 'demo-4',
    title: 'Notebook Lenovo ThinkPad Core i5 8GB RAM SSD 256GB',
    description: 'Excelente para proyectos de facultad, programación y ofimática. Batería con más de 3 horas de autonomía.',
    price_gs: 1850000,
    condition: 'good',
    faculty: 'Facultad de Ciencias y Tecnología (UCA)',
    meeting_point: 'Patio Central de UCA',
    category_id: '71b04623-2815-4bb0-8e95-680bd135f650',
    seller_id: '0b850071-ab3e-4ca7-9e29-dea6169f78ed',
    status: 'active',
    accepts_exchange: false,
  },
  {
    id: 'demo-5',
    title: 'Apuntes Completos de Anatomía Humana + Resúmenes Rouvière',
    description: 'Cuadernillo encuadernado a color con esquemas explicativos, tablas de inserción muscular y notas de cátedra.',
    price_gs: 45000,
    condition: 'good',
    faculty: 'Facultad de Ciencias Médicas (FCM-UNA)',
    meeting_point: 'Hospital de Clínicas / Aula Magna FCM',
    category_id: 'd901a725-cf4d-4262-87b4-37d598634b81',
    seller_id: 'f6ae5678-deb4-43cb-95bc-a7974ca1ad63',
    status: 'active',
    accepts_exchange: true,
  },
  {
    id: 'demo-6',
    title: 'Ambo Médico Blanco Talle M (Unisex)',
    description: 'Tela antimicrobiana de alta resistencia, dos bolsillos inferiores y uno superior. Usado un semestre en prácticas.',
    price_gs: 90000,
    condition: 'good',
    faculty: 'Facultad de Ciencias Médicas (FCM)',
    meeting_point: 'Entrada de Clínicas San Lorenzo',
    category_id: 'fe8651ac-28d0-4617-8402-f04844a98743',
    seller_id: 'f6ae5678-deb4-43cb-95bc-a7974ca1ad63',
    status: 'active',
    accepts_exchange: false,
  },
]

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="UniMarket">
      <div className="grid size-10 place-items-center rounded-[13px] bg-blue-600 text-white shadow-sm shadow-blue-200">
        <ShoppingBag className="size-5" strokeWidth={2.5} />
      </div>
      {!compact && (
        <span className="text-[1.1rem] font-bold tracking-[-0.04em] text-slate-950">
          Uni<span className="text-blue-600">Market</span>
        </span>
      )}
    </div>
  )
}

function ProductArtwork({ type }: { type: string }) {
  if (type === 'book' || type.includes('Libro') || type.includes('libro')) {
    return (
      <div className="product-art book-art">
        <BookOpen className="size-16 text-white/90" strokeWidth={1.2} />
        <span>
          PROGRAMACIÓN
          <br />
          DESDE CERO
        </span>
      </div>
    )
  }
  if (type === 'calc' || type.includes('Calculadora') || type.includes('calculadora')) {
    return (
      <div className="product-art calc-art">
        <Calculator className="size-16 text-slate-800" strokeWidth={1.2} />
        <div className="calc-dots">
          <i />
          <i />
          <i />
        </div>
      </div>
    )
  }
  if (type === 'laptop' || type.includes('Notebook') || type.includes('notebook')) {
    return (
      <div className="product-art category-violet">
        <Laptop className="size-16 text-violet-700" strokeWidth={1.2} />
      </div>
    )
  }
  return (
    <div className="product-art bag-art">
      <ShoppingBag className="size-16 text-white" strokeWidth={1.3} />
      <div className="bag-handle" />
    </div>
  )
}

export default function Page() {
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const [listings, setListings] = useState<Listing[]>(INITIAL_FALLBACK_LISTINGS)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [liked, setLiked] = useState<string[]>(['demo-2'])
  const [installMessage, setInstallMessage] = useState(false)

  // Auth state
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Publish state
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishTitle, setPublishTitle] = useState('')
  const [publishPrice, setPublishPrice] = useState('')
  const [publishCategory, setPublishCategory] = useState(UI_CATEGORIES[0].id)
  const [publishFaculty, setPublishFaculty] = useState('Facultad Politécnica (FPUNA)')
  const [publishMeetingPoint, setPublishMeetingPoint] = useState('Campus UNA San Lorenzo')
  const [publishCondition, setPublishCondition] = useState('like_new')
  const [publishDescription, setPublishDescription] = useState('')
  const [publishLoading, setPublishLoading] = useState(false)

  // Detail / Contact state
  const [activeProduct, setActiveProduct] = useState<Listing | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Initialize Supabase and fetch live listings
  useEffect(() => {
    const client = createClient()
    setSupabase(client)

    // Load active listings from Supabase
    client
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setListings(data)
        }
      })

    // Check current auth user
    client.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email })
      }
    })

    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
      } else {
        setUser(null)
      }
    })

    // Listen for Ctrl+K / Cmd+K to focus search
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('search-input')
        if (searchInput) {
          searchInput.focus()
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      authListener.subscription.unsubscribe()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Auto-hide toast
  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        search.trim() === '' ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase()) ||
        (item.faculty && item.faculty.toLowerCase().includes(search.toLowerCase())) ||
        (item.meeting_point && item.meeting_point.toLowerCase().includes(search.toLowerCase()))

      const matchesCategory =
        !selectedCategory ||
        item.category_id === selectedCategory ||
        (selectedCategory === UI_CATEGORIES[0].id && item.title.toLowerCase().includes('libro')) ||
        (selectedCategory === UI_CATEGORIES[1].id && item.title.toLowerCase().includes('calculadora')) ||
        (selectedCategory === UI_CATEGORIES[2].id && (item.title.toLowerCase().includes('notebook') || item.title.toLowerCase().includes('laptop') || item.title.toLowerCase().includes('computadora'))) ||
        (selectedCategory === UI_CATEGORIES[3].id && item.title.toLowerCase().includes('apuntes'))

      return matchesSearch && matchesCategory
    })
  }, [listings, search, selectedCategory])

  // Toggle favorite
  async function handleToggleFavorite(id: string) {
    const isLiked = liked.includes(id)
    const newLiked = isLiked ? liked.filter((itemId) => itemId !== id) : [...liked, id]
    setLiked(newLiked)

    if (user && supabase) {
      if (isLiked) {
        await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', id)
      } else {
        await supabase.from('favorites').upsert({ user_id: user.id, listing_id: id })
      }
    }

    setToastMessage(isLiked ? 'Eliminado de tus favoritos' : '¡Guardado en tus favoritos!')
  }

  // Handle Authentication
  async function handleAuthSubmit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setAuthLoading(true)

    try {
      if (authMode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })
        if (error) {
          setToastMessage('Error al iniciar sesión: ' + error.message)
        } else {
          setAuthOpen(false)
          setToastMessage('¡Bienvenido de vuelta a UniMarket!')
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        })
        if (error) {
          setToastMessage('Error al crear cuenta: ' + error.message)
        } else {
          setAuthOpen(false)
          setToastMessage('¡Cuenta creada exitosamente!')
        }
      }
    } finally {
      setAuthLoading(false)
    }
  }

  // Quick Demo Login
  async function handleDemoLogin() {
    if (!supabase) return
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: 'ana.martinez@pol.una.py',
      password: 'Password123!',
    })
    setAuthLoading(false)
    if (!error) {
      setAuthOpen(false)
      setToastMessage('Conectado como Ana Martínez (FPUNA)')
    } else {
      setUser({ id: 'f6ae5678-deb4-43cb-95bc-a7974ca1ad63', email: 'ana.martinez@pol.una.py' })
      setAuthOpen(false)
      setToastMessage('Sesión demo activa como Ana Martínez (FPUNA)')
    }
  }

  // Logout
  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUser(null)
    setToastMessage('Has cerrado sesión.')
  }

  // Publish Listing
  async function handlePublishSubmit(e: FormEvent) {
    e.preventDefault()
    if (!publishTitle || !publishPrice) {
      setToastMessage('Por favor completa el título y el precio.')
      return
    }

    setPublishLoading(true)
    const numericPrice = Number(publishPrice.replace(/[^0-9]/g, ''))

    const newListingData: Partial<Listing> = {
      title: publishTitle,
      description: publishDescription || 'Publicado por estudiante en UniMarket.',
      price_gs: numericPrice || 50000,
      condition: publishCondition,
      faculty: publishFaculty,
      meeting_point: publishMeetingPoint,
      category_id: publishCategory,
      seller_id: user?.id || 'f6ae5678-deb4-43cb-95bc-a7974ca1ad63',
      status: 'active',
    }

    if (supabase) {
      const { data, error } = await supabase.from('listings').insert(newListingData).select().single()
      if (!error && data) {
        setListings([data, ...listings])
      } else {
        // Fallback local insertion
        const localItem: Listing = {
          ...newListingData,
          id: 'item-' + Date.now(),
        } as Listing
        setListings([localItem, ...listings])
      }
    }

    setPublishLoading(false)
    setPublishOpen(false)
    setPublishTitle('')
    setPublishPrice('')
    setPublishDescription('')
    setToastMessage('¡Tu producto fue publicado exitosamente en UniMarket!')
    document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
  }

  // WhatsApp contact link
  function getWhatsAppUrl(product: Listing) {
    const text = encodeURIComponent(
      `¡Hola! Vi tu publicación en UniMarket: "${product.title}" (${formatPrice(product.price_gs)}). ¿Sigue disponible para coordinar en el campus?`
    )
    return `https://wa.me/595981123456?text=${text}`
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-24 left-5 right-5 z-50 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-sm font-medium shadow-2xl transition-all sm:left-auto sm:right-8 sm:w-[360px]"
        >
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="size-4 shrink-0 text-blue-600" />
            <span>{toastMessage}</span>
          </div>
          <button
            aria-label="Cerrar notificación"
            onClick={() => setToastMessage(null)}
            className="grid size-7 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="relative z-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 lg:flex">
            <a className="text-slate-950" href="#explorar">
              Explorar
            </a>
            <a href="#como-funciona" className="transition-colors hover:text-slate-950">
              Cómo funciona
            </a>
            <a href="#confianza" className="transition-colors hover:text-slate-950">
              Confianza y seguridad
            </a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  <User className="size-3.5" />
                  <span className="max-w-[130px] truncate">{user.email?.split('@')[0] || 'Estudiante'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-rose-600"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setAuthMode('login')
                    setAuthOpen(true)
                  }}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup')
                    setAuthOpen(true)
                  }}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md"
                >
                  Crear cuenta
                </button>
              </>
            )}
          </div>

          <button
            aria-label={mobileMenu ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMobileMenu(!mobileMenu)}
            className="grid size-11 place-items-center rounded-xl bg-slate-50 sm:hidden"
          >
            {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-3 sm:hidden">
            <div className="flex flex-col gap-1 text-sm font-medium">
              <a
                href="#explorar"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                Explorar
              </a>
              <a
                href="#como-funciona"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                Cómo funciona
              </a>
              <a
                href="#confianza"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                Confianza y seguridad
              </a>

              {user ? (
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-xs font-semibold text-slate-500">{user.email}</span>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenu(false)
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-rose-600"
                  >
                    <LogOut className="size-3.5" /> Salir
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setAuthMode('login')
                      setAuthOpen(true)
                      setMobileMenu(false)
                    }}
                    className="rounded-xl border border-slate-200 py-3 font-semibold text-slate-700"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup')
                      setAuthOpen(true)
                      setMobileMenu(false)
                    }}
                    className="rounded-xl bg-blue-600 py-3 font-semibold text-white"
                  >
                    Crear cuenta
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="hero-grid relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:flex lg:min-h-[600px] lg:items-center lg:gap-16 lg:px-10 lg:pb-20 lg:pt-16">
        <div className="relative z-10 max-w-xl lg:w-[48%]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <Sparkles className="size-3.5" /> Hecho para estudiantes de Paraguay
          </div>
          <h1 className="max-w-2xl text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.07em] text-slate-950">
            Tu campus.
            <br />
            <span className="text-blue-600">Tu mercado.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-500 sm:text-xl">
            Compra, vende e intercambia con estudiantes de tu universidad. Todo en un solo lugar, fácil y seguro.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              Empezar ahora <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => setInstallMessage(true)}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Instalar UniMarket
            </button>
          </div>

          <div className="mt-10 flex items-center gap-7 text-sm text-slate-500">
            <div className="flex -space-x-2">
              <span className="avatar avatar-a">M</span>
              <span className="avatar avatar-b">A</span>
              <span className="avatar avatar-c">L</span>
              <span className="avatar avatar-d">+</span>
            </div>
            <span>
              <strong className="font-semibold text-slate-800">2.500+</strong> estudiantes ya están aquí
            </span>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="hero-visual relative mt-16 flex-1 lg:mt-0">
          <div className="glow" />
          <div className="floating-note note-one">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Correo verificado</span>
          </div>
          <div className="floating-note note-two">
            <MessageCircle className="size-4 text-blue-600" />
            <span>Chat seguro</span>
          </div>

          <div className="phone-shell">
            <div className="phone-screen">
              <div className="flex items-center justify-between">
                <Logo compact />
                <div className="relative grid size-9 place-items-center rounded-full bg-slate-100">
                  <Bell className="size-4 text-slate-600" />
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-orange-500" />
                </div>
              </div>

              <div className="mt-7">
                <p className="text-xs font-medium text-slate-400">
                  {new Date().toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight">
                  Hola, {user ? user.email?.split('@')[0] : 'Martina'}
                </h2>
              </div>

              {/* Interactive search inside phone */}
              <div
                onClick={() => {
                  document.getElementById('search-input')?.focus()
                  document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="mt-5 flex h-12 cursor-pointer items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm text-slate-400 transition-colors hover:bg-slate-200/70"
              >
                <Search className="size-4" />
                <span>¿Qué estás buscando?</span>
              </div>

              {/* Categories inside phone */}
              <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
                {UI_CATEGORIES.map((category) => {
                  const Icon = category.icon
                  const isSelected = selectedCategory === category.id
                  return (
                    <button
                      key={category.label}
                      onClick={() => {
                        setSelectedCategory(isSelected ? null : category.id || null)
                        document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
                      }}
                      className="flex min-w-[72px] flex-col items-center gap-2"
                    >
                      <div
                        className={`grid size-12 place-items-center rounded-2xl category-${category.color} ${
                          isSelected ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                        }`}
                      >
                        <Icon className="size-5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">{category.label}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-7 flex items-center justify-between">
                <h3 className="text-sm font-bold">Cerca de ti</h3>
                <button
                  onClick={() => {
                    document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:underline"
                >
                  Ver todo
                </button>
              </div>

              {/* Products horizontal slider inside mockup */}
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {listings.slice(0, 4).map((product) => {
                  const isItemLiked = liked.includes(product.id)
                  return (
                    <div
                      key={product.id}
                      onClick={() => setActiveProduct(product)}
                      className="w-[126px] shrink-0 cursor-pointer"
                    >
                      <div className="relative overflow-hidden rounded-xl">
                        <ProductArtwork type={product.title} />
                        <button
                          aria-label={`Guardar ${product.title}`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleFavorite(product.id)
                          }}
                          className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 shadow-sm"
                        >
                          <Heart
                            className={`size-3.5 ${
                              isItemLiked ? 'fill-orange-500 text-orange-500' : 'text-slate-600'
                            }`}
                          />
                        </button>
                      </div>
                      <p className="mt-2 truncate text-[11px] font-semibold text-slate-800">{product.title}</p>
                      <p className="mt-0.5 text-[11px] font-bold text-blue-600">{formatPrice(product.price_gs)}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explorar" className="border-y border-slate-100 bg-slate-50/70 px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-orange-500">Explora sin límites</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
                Todo lo que necesitas,
                <br className="sm:hidden" /> a tu alcance.
              </h2>
            </div>

            <div className="relative flex h-12 w-full items-center rounded-xl border border-slate-200 bg-white px-4 sm:max-w-xs">
              <Search className="size-4 text-slate-400" />
              <input
                id="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar en UniMarket"
                className="w-full bg-transparent px-3 text-sm outline-none placeholder:text-slate-400"
              />
              <kbd className="hidden rounded-md bg-slate-100 px-1.5 py-1 text-[10px] text-slate-400 sm:block">⌘ K</kbd>
            </div>
          </div>

          {/* Category Cards Filter */}
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {UI_CATEGORIES.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              return (
                <button
                  key={category.label}
                  onClick={() => setSelectedCategory(isSelected ? null : category.id || null)}
                  className={`group flex items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${
                    isSelected
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : 'border-slate-200 hover:border-blue-200 hover:shadow-blue-100/50'
                  }`}
                >
                  <div className={`grid size-12 shrink-0 place-items-center rounded-xl category-${category.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{category.label}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {isSelected ? 'Filtro activo (clic para quitar)' : 'Encuentra el tuyo'}
                    </p>
                  </div>
                  <ChevronRight
                    className={`size-4 transition-transform group-hover:translate-x-1 ${
                      isSelected ? 'text-blue-600' : 'text-slate-300 group-hover:text-blue-600'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Active filter badge if filtering */}
          {(selectedCategory || search) && (
            <div className="mt-5 flex items-center justify-between rounded-xl bg-blue-50 px-4 py-2.5 text-xs text-blue-800">
              <span className="font-semibold">
                Mostrando resultados para:{' '}
                {selectedCategory ? UI_CATEGORIES.find((c) => c.id === selectedCategory)?.label : ''}{' '}
                {search ? `"${search}"` : ''} ({filteredListings.length} productos)
              </span>
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setSearch('')
                }}
                className="font-bold underline hover:text-blue-950"
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Product Grid */}
          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredListings.map((item) => {
              const isItemLiked = liked.includes(item.id)
              return (
                <article
                  key={item.id}
                  onClick={() => setActiveProduct(item)}
                  className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="grid size-12 place-items-center rounded-xl bg-orange-50 text-orange-600">
                        {item.title.toLowerCase().includes('libro') ? (
                          <BookOpen className="size-5" />
                        ) : item.title.toLowerCase().includes('calculadora') ? (
                          <Calculator className="size-5" />
                        ) : item.title.toLowerCase().includes('notebook') || item.title.toLowerCase().includes('laptop') ? (
                          <Laptop className="size-5" />
                        ) : (
                          <Package className="size-5" />
                        )}
                      </div>
                      <button
                        aria-label={`Guardar ${item.title}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(item.id)
                        }}
                        className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Heart
                          className={`size-5 transition-colors ${
                            isItemLiked ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {item.faculty && (
                      <span className="mt-4 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {item.faculty}
                      </span>
                    )}

                    <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {item.description || 'Publicado por un estudiante de la universidad.'}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <span className="text-lg font-bold text-blue-600">{formatPrice(item.price_gs)}</span>
                      {item.condition && (
                        <p className="text-[11px] text-slate-400">
                          {item.condition === 'like_new'
                            ? 'Como nuevo'
                            : item.condition === 'new'
                            ? 'Nuevo'
                            : item.condition === 'good'
                            ? 'Buen estado'
                            : 'Usado'}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveProduct(item)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-600 hover:text-white"
                    >
                      <MessageCircle className="size-3.5" /> Contactar
                    </button>
                  </div>
                </article>
              )
            })}

            {filteredListings.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
                <Package className="mx-auto size-10 text-slate-300 mb-3" />
                <p className="font-semibold text-slate-700">No encontramos productos con esa búsqueda</p>
                <p className="mt-1 text-sm text-slate-400">
                  Prueba buscando otros términos o publica el primero haciendo clic en "Publicar producto".
                </p>
                <button
                  onClick={() => {
                    setSearch('')
                    setSelectedCategory(null)
                  }}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-blue-600">Simple por diseño</p>
            <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-[-0.05em] sm:text-4xl">
              Del aula a tu nuevo dueño en tres pasos.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-slate-500">
              Una experiencia pensada para que encuentres lo que buscas y conectes con personas de confianza dentro de tu campus universitario.
            </p>
            <button
              onClick={() => {
                document.getElementById('confianza')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="mt-7 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
            >
              Conoce cómo funciona <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="step-card">
              <div className="step-number">01</div>
              <Tag className="size-6 text-blue-600" />
              <h3>Publica</h3>
              <p>Sube una foto, agrega los detalles y fija tu precio en Guaraníes.</p>
            </div>
            <div className="step-card step-highlight">
              <div className="step-number">02</div>
              <Search className="size-6 text-orange-500" />
              <h3>Encuentra</h3>
              <p>Filtra por facultad, carrera, estado y punto de encuentro.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <MessageCircle className="size-6 text-blue-600" />
              <h3>Conecta</h3>
              <p>Coordina la entrega directa en la biblioteca o cantina de tu sede.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section
        id="confianza"
        className="trust-section mx-5 mb-10 overflow-hidden rounded-[28px] bg-blue-600 px-6 py-12 text-white sm:mx-8 sm:px-12 lg:mx-auto lg:max-w-7xl lg:px-16 lg:py-14"
      >
        <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-center">
          <div>
            <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-white/15">
              <ShieldCheck className="size-6" />
            </div>
            <h2 className="max-w-lg text-3xl font-bold tracking-[-0.05em] sm:text-4xl">
              Compra con confianza.
              <br />
              Vende con orgullo.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-blue-100">
              Perfiles verificados con correo institucional (@pol.una.py, @med.una.py, @uca.edu.py), reputación transparente y encuentros seguros dentro de tu universidad.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-7 sm:grid-cols-4 lg:min-w-[470px]">
            <div>
              <p className="text-3xl font-bold">2.5k+</p>
              <p className="mt-1 text-sm text-blue-100">Estudiantes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">12</p>
              <p className="mt-1 text-sm text-blue-100">Universidades</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-3xl font-bold">
                4.9 <Star className="size-5 fill-orange-400 text-orange-400" />
              </p>
              <p className="mt-1 text-sm text-blue-100">Calificación</p>
            </div>
            <div>
              <p className="text-3xl font-bold">100%</p>
              <p className="mt-1 text-sm text-blue-100">Paraguayo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>© 2025 UniMarket. Hecho para estudiantes, por estudiantes de Paraguay.</p>
          <div className="flex gap-5">
            <a href="#confianza" className="hover:text-slate-700">
              Privacidad
            </a>
            <a href="#confianza" className="hover:text-slate-700">
              Ayuda
            </a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button
        aria-label="Publicar un producto"
        onClick={() => setPublishOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-14 items-center gap-2 rounded-2xl bg-orange-500 px-5 font-semibold text-white shadow-xl shadow-orange-200 transition-all hover:-translate-y-1 hover:bg-orange-600 sm:bottom-8 sm:right-8"
      >
        <Plus className="size-5" /> <span className="hidden sm:inline">Publicar producto</span>
      </button>

      {/* Install PWA Prompt Banner */}
      {installMessage && (
        <div
          role="status"
          className="fixed bottom-24 left-5 right-5 z-40 flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-white p-4 text-sm shadow-2xl sm:left-auto sm:right-8 sm:w-[380px]"
        >
          <div>
            <p className="font-semibold text-slate-900">Instala UniMarket PWA</p>
            <p className="mt-1 text-slate-500">
              En tu iPhone toca <strong>Compartir</strong> y luego <strong>"Añadir a pantalla de inicio"</strong>. En Android toca los tres puntos y <strong>"Instalar aplicación"</strong>.
            </p>
          </div>
          <button
            aria-label="Cerrar aviso"
            onClick={() => setInstallMessage(false)}
            className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400 hover:text-slate-700"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* AUTH MODAL */}
      {authOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleAuthSubmit}
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  {authMode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta universitaria'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">Marketplace exclusivo para estudiantes de Paraguay</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthOpen(false)}
                className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Demo 1-Click Login Button */}
            <div className="mt-5 rounded-2xl bg-blue-50/80 p-3.5 border border-blue-100">
              <p className="text-xs font-semibold text-blue-900 mb-2">⚡ Acceso Rápido para Demostración</p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full rounded-xl bg-white py-2 text-xs font-bold text-blue-600 shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors"
              >
                Entrar como Ana Martínez (FPUNA)
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600">Correo Institucional</label>
                <input
                  required
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="ejemplo@pol.una.py o @uca.edu.py"
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Contraseña</label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="mt-1 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="mt-2 h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {authLoading
                  ? 'Procesando...'
                  : authMode === 'login'
                  ? 'Iniciar sesión'
                  : 'Registrarme con correo institucional'}
              </button>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                {authMode === 'login'
                  ? '¿No tienes cuenta? Regístrate aquí'
                  : '¿Ya tienes cuenta? Inicia sesión aquí'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PUBLISH MODAL */}
      {publishOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handlePublishSubmit}
            className="my-8 w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">Publicar en UniMarket</h2>
                <p className="mt-1 text-xs text-slate-500">Llega a miles de estudiantes de tu misma universidad</p>
              </div>
              <button
                type="button"
                onClick={() => setPublishOpen(false)}
                className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600">¿Qué vendes o intercambias?</label>
                <input
                  required
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  placeholder="ej. Libro Cálculo Stewart 8va Edición"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Precio en Guaraníes (Gs.)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="5000"
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(e.target.value)}
                    placeholder="ej. 80000"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Categoría</label>
                  <select
                    value={publishCategory}
                    onChange={(e) => setPublishCategory(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    {UI_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Universidad / Facultad</label>
                  <input
                    value={publishFaculty}
                    onChange={(e) => setPublishFaculty(e.target.value)}
                    placeholder="ej. FPUNA, FCM, UCA"
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Estado del producto</label>
                  <select
                    value={publishCondition}
                    onChange={(e) => setPublishCondition(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="like_new">Como nuevo</option>
                    <option value="new">Nuevo en caja</option>
                    <option value="good">Buen estado</option>
                    <option value="fair">Aceptable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Punto de encuentro sugerido</label>
                <input
                  value={publishMeetingPoint}
                  onChange={(e) => setPublishMeetingPoint(e.target.value)}
                  placeholder="ej. Biblioteca Central UNA o Cantina"
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Descripción detallada</label>
                <textarea
                  rows={3}
                  value={publishDescription}
                  onChange={(e) => setPublishDescription(e.target.value)}
                  placeholder="Detalles sobre el uso, edición, accesorios incluidos o si aceptas intercambio..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={publishLoading}
                className="mt-2 h-12 w-full rounded-xl bg-orange-500 font-semibold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 disabled:opacity-50"
              >
                {publishLoading ? 'Publicando...' : 'Publicar producto ahora'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRODUCT DETAILS / CONTACT MODAL */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl transition-all">
            <div className="flex items-start justify-between">
              <div>
                {activeProduct.faculty && (
                  <span className="inline-block rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 mb-2">
                    {activeProduct.faculty}
                  </span>
                )}
                <h2 className="text-2xl font-bold text-slate-950">{activeProduct.title}</h2>
              </div>
              <button
                onClick={() => setActiveProduct(null)}
                className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-blue-600">{formatPrice(activeProduct.price_gs)}</span>
              {activeProduct.condition && (
                <span className="text-xs font-medium text-slate-500">
                  (
                  {activeProduct.condition === 'like_new'
                    ? 'Como nuevo'
                    : activeProduct.condition === 'new'
                    ? 'Nuevo'
                    : activeProduct.condition === 'good'
                    ? 'Buen estado'
                    : 'Usado'}
                  )
                </span>
              )}
            </div>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{activeProduct.description}</p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Punto de encuentro:</strong> {activeProduct.meeting_point || 'Campus Universitario'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Estudiante verificado:</strong> Cuenta vinculada con correo institucional
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <a
                href={getWhatsAppUrl(activeProduct)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-semibold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition-all"
              >
                <MessageCircle className="size-4" /> Contactar por WhatsApp
              </a>

              <button
                onClick={() => {
                  handleToggleFavorite(activeProduct.id)
                }}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Heart
                  className={`size-4 ${
                    liked.includes(activeProduct.id) ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
                {liked.includes(activeProduct.id) ? 'Guardado en favoritos' : 'Guardar en favoritos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
