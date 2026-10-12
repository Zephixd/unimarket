'use client'

import { FormEvent, useState } from 'react'
import { Check, ShieldCheck, Sparkles, User, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
  onSuccess?: () => void
}

const UCSI_DEMO_USERS = [
  { name: 'Jesus Gonzalez', email: 'jesus.gonzalez@uc.edu.py', role: 'Derecho UCSI · ⭐ 4.9' },
  { name: 'Belen Villalba', email: 'belen.villalba@uc.edu.py', role: 'Enfermería UCSI · ⭐ 4.8' },
  { name: 'Jennifer Fretes', email: 'jennifer.fretes@uc.edu.py', role: 'Administración UCSI · ⭐ 4.7' },
  { name: 'Luca Mosqueda', email: 'luca.mosqueda@uc.edu.py', role: 'Informática UCSI · ⭐ 4.6' },
]

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  if (!isOpen) return null

  // Validate allowed email domains: @uc.edu.py, @gmail.com, @pol.una.py, @uca.edu.py, etc.
  const isValidEmailDomain = (val: string) => {
    const trimmed = val.toLowerCase().trim()
    return (
      trimmed.endsWith('@uc.edu.py') ||
      trimmed.endsWith('@gmail.com') ||
      trimmed.endsWith('.edu.py') ||
      trimmed.endsWith('.una.py')
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (!isValidEmailDomain(email)) {
      setErrorMsg('El correo debe pertenecer a la universidad (@uc.edu.py) o ser una cuenta @gmail.com.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setErrorMsg('Error al iniciar sesión: ' + error.message)
        } else {
          onClose()
          onSuccess?.()
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              university: 'UCSI Campus San Ignacio',
            },
          },
        })
        if (error) {
          setErrorMsg('Error al registrar cuenta: ' + error.message)
        } else {
          if (data.user) {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              full_name: fullName || email.split('@')[0],
              university_name: 'Universidad Católica Campus San Ignacio (UCSI)',
              verified_email: true,
            })
          }
          onClose()
          onSuccess?.()
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleQuickLogin(targetEmail: string) {
    setLoading(true)
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: 'Password123!',
    })
    setLoading(false)
    if (!error) {
      onClose()
      onSuccess?.()
    } else {
      setErrorMsg('Error al iniciar: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="my-6 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-7">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
              <ShieldCheck className="size-3.5" /> UCSI Campus San Ignacio
            </span>
            <h2 className="text-2xl font-bold text-slate-950">
              {mode === 'login' ? 'Bienvenido a UniMarket' : 'Crea tu cuenta universitaria'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Quick UCSI Account Switcher */}
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5">
          <p className="mb-2 text-xs font-bold text-blue-900">
            ⚡ Iniciar como estudiante UCSI (1 Clic):
          </p>
          <div className="grid grid-cols-2 gap-2">
            {UCSI_DEMO_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => handleQuickLogin(u.email)}
                disabled={loading}
                className="flex flex-col items-start rounded-xl border border-blue-200 bg-white p-2 text-left shadow-sm transition-all hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50"
              >
                <span className="text-xs font-bold text-slate-900">{u.name}</span>
                <span className="text-[10px] text-blue-600 font-medium">{u.role}</span>
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-slate-600">Nombre Completo</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ej. Jesus Gonzalez"
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-600">Correo Electrónico</label>
              <span className="text-[10px] text-slate-400">Acepta @uc.edu.py y @gmail.com</span>
            </div>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.nombre@uc.edu.py o @gmail.com"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
            {email && isValidEmailDomain(email) && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <Check className="size-3" /> Dominio válido verificado
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Contraseña</label>
            <input
              required
              minLength={6}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear mi cuenta'}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-3 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            {mode === 'login' ? '¿Nuevo en UniMarket? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
