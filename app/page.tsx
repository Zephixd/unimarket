'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Bell,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Heart,
  Laptop,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  User,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { AuthModal } from '@/components/auth-modal'
import { PublishModal } from '@/components/publish-modal'
import { createClient } from '@/lib/supabase/client'

const categories = [
  { label: 'Libros', icon: BookOpen, color: 'blue' },
  { label: 'Calculadoras', icon: Calculator, color: 'orange' },
  { label: 'Tecnología', icon: Laptop, color: 'violet' },
  { label: 'Apuntes', icon: Package, color: 'green' },
]

const products = [
  {
    name: 'Manual de Derecho Civil',
    detail: 'Derecho · UCSI San Ignacio',
    seller: 'Jesus Gonzalez',
    rating: 4.9,
    price: '85.000 Gs.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    liked: false,
  },
  {
    name: 'Ambo Clínico Blanco S',
    detail: 'Enfermería · UCSI San Ignacio',
    seller: 'Belen Villalba',
    rating: 4.8,
    price: '110.000 Gs.',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&auto=format&fit=crop&q=80',
    liked: true,
  },
  {
    name: 'ThinkPad T480 Core i5',
    detail: 'Informática · UCSI San Ignacio',
    seller: 'Luca Mosqueda',
    rating: 4.6,
    price: '1.850.000 Gs.',
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    liked: false,
  },
]

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
  if (type === 'book')
    return (
      <div className="product-art book-art">
        <BookOpen className="size-16 text-white/90" strokeWidth={1.2} />
        <span>
          PROGRAMACIÓN<br />DESDE CERO
        </span>
      </div>
    )
  if (type === 'calc')
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
  return (
    <div className="product-art bag-art">
      <ShoppingBag className="size-16 text-white" strokeWidth={1.3} />
      <div className="bag-handle" />
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [liked, setLiked] = useState(products.map((p) => p.liked))
  const [installMessage, setInstallMessage] = useState(false)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [publishOpen, setPublishOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email })
      } else {
        setUser(null)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  function handleOpenPublish() {
    if (!user) {
      setAuthMode('login')
      setAuthOpen(true)
      return
    }
    setPublishOpen(true)
  }

  function handleExploreClick(e: React.MouseEvent) {
    if (!user) {
      e.preventDefault()
      setAuthMode('login')
      setAuthOpen(true)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950">
      {/* Navbar with module links */}
      <Navbar
        onOpenPublish={handleOpenPublish}
        onOpenAuth={(mode) => {
          setAuthMode(mode)
          setAuthOpen(true)
        }}
      />

      {/* Banner if already logged in */}
      {user && (
        <div className="border-b border-blue-100 bg-blue-50/80 px-4 py-2.5 text-center text-xs text-blue-900">
          <span className="font-semibold">Sesión activa como {user.email?.split('@')[0]}</span>
          <span className="mx-2">·</span>
          <Link href="/productos" className="font-bold underline hover:text-blue-700">
            Ir al marketplace de productos →
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-grid relative mx-auto max-w-7xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:flex lg:min-h-[600px] lg:items-center lg:gap-16 lg:px-10 lg:pb-20 lg:pt-16">
        <div className="relative z-10 max-w-xl lg:w-[48%]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            <Sparkles className="size-3.5" /> Hecho para estudiantes de Paraguay
          </div>
          <h1 className="max-w-2xl text-[clamp(2.75rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.07em] text-slate-950">
            Tu campus.<br />
            <span className="text-blue-600">Tu mercado.</span>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-500 sm:text-xl">
            Compra, vende e intercambia con estudiantes de tu universidad. Todo en un solo lugar, fácil y seguro.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/productos"
              onClick={handleExploreClick}
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
            >
              Explorar Catálogo <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              onClick={handleOpenPublish}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Publicar producto
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

        {/* Hero visual phone shell */}
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
          {/* Hero visual phone shell (Mockup ilustrativo no interactivo) */}
          <div className="phone-shell pointer-events-none select-none" aria-hidden="true">
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
                  Hola, Martina (UCSI)
                </h2>
              </div>
              <div
                className="mt-5 flex h-12 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm text-slate-400"
              >
                <Search className="size-4" />
                <span>¿Qué necesitas para tus clases?</span>
              </div>
              <div className="mt-6 flex gap-2 overflow-hidden">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <div
                      key={category.label}
                      className="flex min-w-[72px] flex-col items-center gap-2"
                    >
                      <div className={`grid size-12 place-items-center rounded-2xl category-${category.color}`}>
                        <Icon className="size-5" />
                      </div>
                      <span className="text-[10px] font-medium text-slate-500">{category.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-7 flex items-center justify-between">
                <h3 className="text-sm font-bold">Cerca de ti en Campus San Ignacio</h3>
                <span className="text-[11px] font-semibold text-blue-600">
                  3 disponibles
                </span>
              </div>
              <div className="mt-3 flex gap-3 overflow-hidden">
                {products.map((product) => (
                  <div
                    key={product.name}
                    className="w-[136px] shrink-0 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xs"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="mt-1.5 truncate text-[11px] font-bold text-slate-900">{product.name}</p>
                    <div className="mt-0.5 flex items-center justify-between text-[10px]">
                      <span className="truncate text-slate-500 font-medium">{product.seller}</span>
                      <span className="flex items-center gap-0.5 font-bold text-amber-600">
                        <Star className="size-2.5 fill-amber-400 text-amber-400" />
                        {product.rating}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] font-black text-blue-600">{product.price}</p>
                  </div>
                ))}
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
                Todo lo que necesitas,<br className="sm:hidden" /> a tu alcance.
              </h2>
            </div>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
            >
              Ir al Marketplace Completo <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.label}
                  href="/productos"
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50"
                >
                  <div className={`grid size-12 shrink-0 place-items-center rounded-xl category-${category.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{category.label}</p>
                    <p className="mt-1 text-xs text-slate-400">Encuentra el tuyo</p>
                  </div>
                  <ChevronRight className="size-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                </Link>
              )
            })}
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
              Una experiencia pensada para que encuentres lo que buscas y conectes con personas de confianza dentro de tu campus.
            </p>
            <Link
              href="/productos"
              className="mt-7 inline-flex items-center gap-2 font-semibold text-blue-600 hover:text-blue-700"
            >
              Explorar productos disponibles <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="step-card">
              <div className="step-number">01</div>
              <Tag className="size-6 text-blue-600" />
              <h3>Publica</h3>
              <p>Sube una foto, agrega los detalles y listo.</p>
            </div>
            <div className="step-card step-highlight">
              <div className="step-number">02</div>
              <Search className="size-6 text-orange-500" />
              <h3>Encuentra</h3>
              <p>Filtra por universidad, carrera y precio.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <MessageCircle className="size-6 text-blue-600" />
              <h3>Conecta</h3>
              <p>Coordina el encuentro dentro del campus.</p>
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
              Compra con confianza.<br />
              Vende con orgullo.
            </h2>
            <p className="mt-4 max-w-md leading-7 text-blue-100">
              Perfiles verificados con correo institucional (@pol.una.py, @med.una.py, @uca.edu.py), chat integrado y encuentros seguros dentro de tu universidad.
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
            <a href="#confianza" className="hover:text-slate-700">Privacidad</a>
            <a href="#confianza" className="hover:text-slate-700">Ayuda</a>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <button
        aria-label="Publicar un producto"
        onClick={handleOpenPublish}
        className="fixed bottom-5 right-5 z-30 flex h-14 items-center gap-2 rounded-2xl bg-orange-500 px-5 font-semibold text-white shadow-xl shadow-orange-200 transition-all hover:-translate-y-1 hover:bg-orange-600 sm:bottom-8 sm:right-8"
      >
        <Plus className="size-5" /> <span className="hidden sm:inline">Publicar producto</span>
      </button>

      {/* Reusable Modals */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => router.push('/productos')}
      />

      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onSuccess={() => router.push('/productos')}
      />
    </main>
  )
}
