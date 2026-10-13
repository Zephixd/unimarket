'use client'

import { FormEvent, useState } from 'react'
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  X,
  Zap,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup' | 'recovery'
  onSuccess?: () => void
}

const UCSI_DEMO_USERS = [
  { name: 'Jesus Gonzalez', email: 'jesus.gonzalez@uc.edu.py', faculty: 'Derecho UCSI', rating: '4.9' },
  { name: 'Belen Villalba', email: 'belen.villalba@uc.edu.py', faculty: 'Enfermería UCSI', rating: '4.8' },
  { name: 'Jennifer Fretes', email: 'jennifer.fretes@uc.edu.py', faculty: 'Administración UCSI', rating: '4.7' },
  { name: 'Luca Mosqueda', email: 'luca.mosqueda@uc.edu.py', faculty: 'Informática UCSI', rating: '4.6' },
]

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'recovery'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const supabase = createClient()

  if (!isOpen) return null

  const isValidEmailDomain = (val: string) => {
    const trimmed = val.toLowerCase().trim()
    return (
      trimmed.endsWith('@uc.edu.py') ||
      trimmed.endsWith('@gmail.com') ||
      trimmed.endsWith('.edu.py') ||
      trimmed.endsWith('.una.py')
    )
  }

  const handleQuickLogin = async (targetEmail: string) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password: 'Password123!',
      })
      if (error) {
        setErrorMsg('Error al iniciar sesión: ' + error.message)
      } else if (data.session) {
        onSuccess?.()
        onClose()
      }
    } catch {
      setErrorMsg('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordRecovery = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (!isValidEmailDomain(email)) {
      setErrorMsg('Por favor ingresa un correo válido (@uc.edu.py o @gmail.com)')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/perfil?reset=true`,
      })
      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccessMsg(
          '¡Correo de recuperación enviado! Revisa tu bandeja de entrada para restablecer tu contraseña.'
        )
      }
    } catch {
      setErrorMsg('Error al solicitar recuperación de contraseña.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (mode === 'recovery') {
      return handlePasswordRecovery(e)
    }

    setErrorMsg('')
    setSuccessMsg('')

    if (!isValidEmailDomain(email)) {
      setErrorMsg(
        'Solo se permiten correos institucionales universitarios (@uc.edu.py, .edu.py) o cuentas verificadas de @gmail.com'
      )
      return
    }

    setLoading(true)

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) {
          setErrorMsg(
            error.message === 'Invalid login credentials'
              ? 'Correo o contraseña incorrectos. Puedes usar las cuentas demo con 1 clic arriba.'
              : error.message
          )
        } else if (data.session) {
          onSuccess?.()
          onClose()
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        })

        if (error) {
          setErrorMsg(error.message)
        } else if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName.trim() || email.split('@')[0],
            university_name: email.endsWith('@uc.edu.py')
              ? 'Universidad Católica Campus San Ignacio (UCSI)'
              : 'Universidad de Paraguay',
          })

          onSuccess?.()
          onClose()
        }
      }
    } catch {
      setErrorMsg('Ocurrió un error inesperado. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-900/10 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
              <ShieldCheck className="size-3.5" /> UniMarket Seguro
            </span>
            <h2 className="mt-2 text-xl font-black text-slate-900">
              {mode === 'login'
                ? 'Iniciar sesión'
                : mode === 'signup'
                ? 'Crear cuenta universitaria'
                : 'Recuperar contraseña'}
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

        {/* Quick UCSI Account Switcher (only for login) */}
        {mode === 'login' && (
          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-blue-900">
              <Zap className="size-3.5 text-amber-500 fill-amber-400" />
              <span>Iniciar como estudiante UCSI (1 Clic):</span>
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
                  <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                    <span>{u.faculty}</span>
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
        )}

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            {successMsg}
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
              <span className="text-[10px] text-slate-400">@uc.edu.py o @gmail.com</span>
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

          {mode !== 'recovery' && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600">Contraseña</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('recovery')
                      setErrorMsg('')
                      setSuccessMsg('')
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <input
                  required
                  minLength={6}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11 w-full rounded-xl border border-slate-200 pl-3.5 pr-10 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? 'Procesando...'
              : mode === 'login'
              ? 'Iniciar sesión'
              : mode === 'signup'
              ? 'Crear mi cuenta'
              : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-3 text-center">
          {mode === 'recovery' ? (
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              ← Volver a Iniciar sesión
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setErrorMsg('')
                setSuccessMsg('')
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              {mode === 'login'
                ? '¿No tienes cuenta? Regístrate aquí'
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
