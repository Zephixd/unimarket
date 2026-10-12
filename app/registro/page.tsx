'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  XCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)

  // Step 1: Info
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  // Step 2: Password
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 3: University
  const [university, setUniversity] = useState(
    'Universidad Católica Nuestra Señora de la Asunción Campus San Ignacio (UCSI)'
  )
  const [career, setCareer] = useState('Derecho y Ciencias Sociales (UCSI)')
  const [academicYear, setAcademicYear] = useState('1er Año')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Validation helpers
  const isValidEmailDomain = (val: string) => {
    const trimmed = val.toLowerCase().trim()
    return (
      trimmed.endsWith('@uc.edu.py') ||
      trimmed.endsWith('@gmail.com') ||
      trimmed.endsWith('.edu.py') ||
      trimmed.endsWith('.una.py')
    )
  }

  const step1Valid = fullName.trim().length >= 3 && isValidEmailDomain(email)
  const step2Valid = password.length >= 6 && password === confirmPassword
  const step3Valid = university !== '' && career !== ''

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!step1Valid || !step2Valid || !step3Valid) return

    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            university_name: university,
            career_name: career,
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            university_name: university,
            career_name: career,
            verified_email: true,
          })
        }
        router.push('/productos')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50/60 p-4 text-slate-950 sm:p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-8">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600"
          >
            <ArrowLeft className="size-4" /> Volver
          </Link>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
            <ShieldCheck className="size-3.5" /> Registro UCSI
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-slate-900">Crear cuenta en UniMarket</h1>
        <p className="mt-1 text-xs text-slate-500">Paso {step} de 3 — Tu marketplace universitario seguro</p>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 flex flex-col gap-4">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
              <div>
                <label className="text-xs font-semibold text-slate-700">Nombre Completo</label>
                <div className="relative mt-1">
                  <User className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                  <input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ej. Jesus Gonzalez"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">Correo Electrónico</label>
                  <span className="text-[10px] text-slate-400">@uc.edu.py o @gmail.com</span>
                </div>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu.correo@uc.edu.py o @gmail.com"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {email.trim() && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                    {isValidEmailDomain(email) ? (
                      <span className="flex items-center gap-1 font-bold text-emerald-600">
                        <Check className="size-3.5" /> Correo válido
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-medium text-rose-500 text-[11px]">
                        <XCircle className="size-3.5" /> El correo debe pertenecer a una universidad o ser @gmail.com
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                Continuar al Paso 2 <ArrowRight className="size-4" />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
              <div>
                <label className="text-xs font-semibold text-slate-700">Contraseña</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-10 text-sm outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Confirmar Contraseña</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu contraseña"
                    className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm outline-none focus:border-blue-600"
                  />
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">Las contraseñas no coinciden.</p>
                )}
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 flex-1 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  disabled={!step2Valid}
                  onClick={() => setStep(3)}
                  className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
                >
                  Paso 3 <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">
              <div>
                <label className="text-xs font-semibold text-slate-700">Universidad / Sede</label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="Universidad Católica Nuestra Señora de la Asunción Campus San Ignacio (UCSI)">
                    Universidad Católica Campus San Ignacio (UCSI)
                  </option>
                  <option value="Universidad Católica Nuestra Señora de la Asunción (UCA Asunción)">
                    Universidad Católica (UCA Asunción)
                  </option>
                  <option value="Universidad Nacional de Asunción (UNA)">
                    Universidad Nacional de Asunción (UNA)
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Carrera Universitaria</label>
                <select
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="Derecho y Ciencias Sociales (UCSI)">Derecho y Ciencias Sociales (UCSI)</option>
                  <option value="Enfermería y Ciencias de la Salud (UCSI)">Enfermería y Ciencias de la Salud (UCSI)</option>
                  <option value="Administración de Empresas (UCSI)">Administración de Empresas (UCSI)</option>
                  <option value="Ciencias Contables (UCSI)">Ciencias Contables (UCSI)</option>
                  <option value="Análisis de Sistemas Informáticos (UCSI)">Análisis de Sistemas Informáticos (UCSI)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Año Académico</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600"
                >
                  <option value="1er Año">1er Año</option>
                  <option value="2do Año">2do Año</option>
                  <option value="3er Año">3er Año</option>
                  <option value="4to Año">4to Año</option>
                  <option value="5to Año">5to Año / Egresado</option>
                </select>
              </div>

              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-12 flex-1 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={!step3Valid || loading}
                  className="flex h-12 flex-1 items-center justify-center gap-1 rounded-xl bg-orange-500 font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link href="/productos" className="font-bold text-blue-600 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
