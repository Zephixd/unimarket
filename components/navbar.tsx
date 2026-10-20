'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Gift,
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Trophy,
  User,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type NavbarProps = {
  onOpenPublish?: () => void
  onOpenAuth?: (mode: 'login' | 'signup') => void
}

export function Navbar({ onOpenPublish, onOpenAuth }: NavbarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profileName, setProfileName] = useState<string>('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email })
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile?.full_name) {
              setProfileName(profile.full_name)
            }
          })
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
      } else {
        setUser(null)
        setProfileName('')
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  const isLanding = pathname === '/'

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-[13px] bg-blue-600 text-white shadow-sm shadow-blue-200">
            <ShoppingBag className="size-5" strokeWidth={2.5} />
          </div>
          <span className="text-[1.15rem] font-bold tracking-[-0.04em] text-slate-950">
            Uni<span className="text-blue-600">Market</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:gap-6 md:flex">
          <Link
            href="/"
            className={`transition-colors hover:text-blue-600 ${
              pathname === '/' ? 'font-bold text-blue-600' : ''
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/inicio"
            className={`transition-colors hover:text-blue-600 ${
              pathname === '/inicio' ? 'font-bold text-blue-600' : ''
            }`}
          >
            Campus Feed
          </Link>
          <Link
            href="/productos"
            className={`transition-colors hover:text-blue-600 ${
              pathname.startsWith('/productos') || pathname.startsWith('/buscar') ? 'font-bold text-blue-600' : ''
            }`}
          >
            Catálogo
          </Link>
          <Link
            href="/ranking"
            className={`flex items-center gap-1.5 transition-colors hover:text-blue-600 ${
              pathname.startsWith('/ranking') ? 'font-bold text-blue-600' : ''
            }`}
          >
            <Trophy className="size-4 text-amber-500" />
            <span>Ranking</span>
          </Link>
          <Link
            href="/favoritos"
            className={`flex items-center gap-1.5 transition-colors hover:text-blue-600 ${
              pathname.startsWith('/favoritos') ? 'font-bold text-blue-600' : ''
            }`}
          >
            <Heart className="size-4 text-rose-500 fill-rose-500/20" />
            <span>Favoritos</span>
          </Link>
          <Link
            href="/mensajes"
            className={`flex items-center gap-1.5 transition-colors hover:text-blue-600 ${
              pathname.startsWith('/mensajes') ? 'font-bold text-blue-600' : ''
            }`}
          >
            <MessageCircle className="size-4" />
            <span>Chat</span>
          </Link>
          <Link
            href="/invitar"
            className={`flex items-center gap-1.5 transition-colors hover:text-blue-600 ${
              pathname.startsWith('/invitar') ? 'font-bold text-blue-600' : ''
            }`}
          >
            <Gift className="size-4 text-indigo-500" />
            <span>Invitar</span>
          </Link>
          <Link
            href="/notificaciones"
            className={`flex items-center gap-1.5 transition-colors hover:text-blue-600 ${
              pathname.startsWith('/notificaciones') ? 'font-bold text-blue-600' : ''
            }`}
          >
            <Bell className="size-4 text-blue-500" />
            <span>Notificaciones</span>
          </Link>
          {user && (
            <Link
              href="/perfil"
              className={`flex items-center gap-1.5 transition-colors hover:text-blue-600 ${
                pathname.startsWith('/perfil') ? 'font-bold text-blue-600' : ''
              }`}
            >
              <User className="size-4" />
              <span>Mi Perfil</span>
            </Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-2.5 md:flex">
          {onOpenPublish && (
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth?.('login')
                  return
                }
                onOpenPublish()
              }}
              className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-orange-200 transition-all hover:bg-orange-600"
            >
              <Plus className="size-4" /> Publicar
            </button>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/favoritos"
                title="Mis Favoritos Guardados"
                className={`grid size-9 place-items-center rounded-xl border transition-colors ${
                  pathname === '/favoritos'
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
                }`}
              >
                <Heart className="size-4 fill-rose-500 text-rose-500" />
              </Link>
              <Link
                href="/notificaciones"
                title="Notificaciones"
                className={`relative grid size-9 place-items-center rounded-xl border transition-colors ${
                  pathname === '/notificaciones'
                    ? 'border-blue-300 bg-blue-50 text-blue-600'
                    : 'border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange-500 ring-2 ring-white" />
              </Link>
              <Link
                href="/perfil"
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
              >
                <div className="grid size-6 place-items-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                  {(profileName || user.email || 'U')[0].toUpperCase()}
                </div>
                <span className="max-w-[110px] truncate">
                  {profileName || user.email?.split('@')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-rose-600"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth?.('login')}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => onOpenAuth?.('signup')}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
              >
                Crear cuenta
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {onOpenPublish && (
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuth?.('login')
                  return
                }
                onOpenPublish()
              }}
              className="flex size-9 items-center justify-center rounded-xl bg-orange-500 text-white"
            >
              <Plus className="size-5" />
            </button>
          )}
          <button
            aria-label={mobileMenu ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMobileMenu(!mobileMenu)}
            className="grid size-10 place-items-center rounded-xl bg-slate-50 text-slate-700"
          >
            {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div className="border-t border-slate-100 bg-white px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setMobileMenu(false)}
              className="rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              Bienvenida (Landing)
            </Link>
            <Link
              href="/inicio"
              onClick={() => setMobileMenu(false)}
              className="rounded-xl px-3 py-2 font-semibold text-blue-600 hover:bg-slate-50"
            >
              Campus Feed (UCSI)
            </Link>
            <Link
              href="/productos"
              onClick={() => setMobileMenu(false)}
              className="rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              Explorar Catálogo
            </Link>
            <Link
              href="/ranking"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-amber-600 hover:bg-slate-50"
            >
              <Trophy className="size-4 text-amber-500" />
              <span>Ranking de Vendedores</span>
            </Link>
            <Link
              href="/mensajes"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              <MessageCircle className="size-4 text-blue-600" />
              <span>Mensajes y Chat</span>
            </Link>
            <Link
              href="/invitar"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              <Gift className="size-4 text-indigo-500" />
              <span>Invitar Amigos (Insignias)</span>
            </Link>
            <Link
              href="/favoritos"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              <span>Mis Favoritos</span>
            </Link>
            <Link
              href="/notificaciones"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-50"
            >
              <Bell className="size-4 text-blue-500" />
              <span>Notificaciones</span>
            </Link>
            {user ? (
              <>
                <Link
                  href="/perfil"
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 font-semibold text-slate-900 hover:bg-slate-50"
                >
                  <User className="size-4 text-slate-700" />
                  <span>Mi Perfil ({profileName || user.email?.split('@')[0]})</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenu(false)
                  }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-left font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="size-4" /> Cerrar sesión
                </button>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => {
                    setMobileMenu(false)
                    onOpenAuth?.('login')
                  }}
                  className="h-11 rounded-xl border border-slate-200 font-semibold text-slate-700"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => {
                    setMobileMenu(false)
                    onOpenAuth?.('signup')
                  }}
                  className="h-11 rounded-xl bg-blue-600 font-semibold text-white"
                >
                  Crear cuenta
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
