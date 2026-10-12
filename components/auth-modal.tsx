'use client'

import { FormEvent, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
  onSuccess?: () => void
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  if (!isOpen) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setErrorMsg(error.message)
        } else {
          onClose()
          onSuccess?.()
          window.location.href = '/productos'
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) {
          setErrorMsg(error.message)
        } else {
          onClose()
          onSuccess?.()
          window.location.href = '/productos'
        }
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDemoLogin() {
    setLoading(true)
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithPassword({
      email: 'ana.martinez@pol.una.py',
      password: 'Password123!',
    })
    setLoading(false)
    if (!error) {
      onClose()
      onSuccess?.()
      window.location.href = '/productos'
    } else {
      setErrorMsg('Error al iniciar como demo: ' + error.message)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              {mode === 'login' ? 'Bienvenido a UniMarket' : 'Crea tu cuenta universitaria'}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Marketplace exclusivo para estudiantes de Paraguay</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 1-Click Demo Login */}
        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/80 p-3.5">
          <p className="mb-2 text-xs font-semibold text-blue-900">⚡ Acceso Rápido para Demostración</p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full rounded-xl border border-blue-200 bg-white py-2.5 text-xs font-bold text-blue-600 shadow-sm transition-colors hover:bg-blue-50 disabled:opacity-50"
          >
            Entrar como Ana Martínez (FPUNA)
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-600">Correo Institucional</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="mt-1 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarme'}
          </button>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí'}
          </button>
        </div>
      </form>
    </div>
  )
}
