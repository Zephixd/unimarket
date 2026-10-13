'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Lock,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  User,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { AuthModal } from '@/components/auth-modal'

type AuthGuardProps = {
  children: React.ReactNode
  moduleName?: string
}

const UCSI_DEMO_USERS = [
  { name: 'Jesus Gonzalez', email: 'jesus.gonzalez@uc.edu.py', faculty: 'Derecho UCSI', rating: '4.9' },
  { name: 'Belen Villalba', email: 'belen.villalba@uc.edu.py', faculty: 'Enfermería UCSI', rating: '4.8' },
  { name: 'Jennifer Fretes', email: 'jennifer.fretes@uc.edu.py', faculty: 'Administración UCSI', rating: '4.7' },
  { name: 'Luca Mosqueda', email: 'luca.mosqueda@uc.edu.py', faculty: 'Informática UCSI', rating: '4.6' },
]

export function AuthGuard({ children, moduleName = 'este módulo' }: AuthGuardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [quickLoading, setQuickLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        setAuthOpen(true)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true)
        setAuthOpen(false)
      } else {
        setIsAuthenticated(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleQuickLogin = async (email: string) => {
    setQuickLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'Password123!',
      })
      if (!error && data.session) {
        setIsAuthenticated(true)
        setAuthOpen(false)
      }
    } finally {
      setQuickLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
        <div className="grid size-14 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 animate-pulse">
          <ShoppingBag className="size-7" />
        </div>
        <p className="mt-4 text-xs font-bold tracking-wider uppercase text-slate-400">
          Verificando sesión universitaria...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
            <Lock className="size-8" />
          </div>

          <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 border border-amber-200/80">
            <ShieldAlert className="size-3.5" /> Autenticación Requerida
          </span>

          <h1 className="mt-3 text-xl sm:text-2xl font-black text-slate-950">
            Acceso exclusivo a {moduleName}
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Por seguridad de la comunidad estudiantil de la UC Campus San Ignacio, debes iniciar sesión con tu cuenta verificada para interactuar en la plataforma.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setAuthMode('login')
                setAuthOpen(true)
              }}
              className="w-full rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Iniciar sesión con correo
            </button>
            <button
              onClick={() => {
                setAuthMode('signup')
                setAuthOpen(true)
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
            >
              Registrarse en 3 pasos
            </button>
          </div>

          {/* Quick 1-click login for test users */}
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-left">
            <p className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2.5">
              <Zap className="size-3.5 text-amber-500 fill-amber-400" />
              <span>Acceso de prueba rápido (1 Clic):</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {UCSI_DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleQuickLogin(u.email)}
                  disabled={quickLoading}
                  className="flex flex-col items-start rounded-xl border border-blue-200 bg-white p-2 text-left shadow-xs transition-all hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
                >
                  <span className="text-xs font-bold text-slate-900 truncate w-full">{u.name}</span>
                  <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                    <span className="truncate">{u.faculty.split(' ')[0]}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-amber-700 font-bold">
                      <Star className="size-2.5 fill-amber-400 text-amber-400" />
                      {u.rating}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700"
            >
              <ArrowLeft className="size-4" /> Volver a la página principal
            </Link>
          </div>
        </div>

        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          initialMode={authMode}
          onSuccess={() => setIsAuthenticated(true)}
        />
      </div>
    )
  }

  return <>{children}</>
}
