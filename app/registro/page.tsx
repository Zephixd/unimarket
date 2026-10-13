'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
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

  // Step 1: Datos Personales
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  // Step 2: Seguridad
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 3: Datos Académicos
  const [university, setUniversity] = useState(
    'Universidad Católica Nuestra Señora de la Asunción Campus San Ignacio (UCSI)'
  )
  const [faculty, setFaculty] = useState('Facultad de Ciencias Jurídicas y Sociales')
  const [career, setCareer] = useState('Derecho y Ciencias Sociales (UCSI)')
  const [academicPeriod, setAcademicPeriod] = useState('1er Año / 2do Semestre')

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

  const step1Valid = firstName.trim().length >= 2 && lastName.trim().length >= 2
  const step2Valid = isValidEmailDomain(email) && password.length >= 6 && password === confirmPassword
  const step3Valid = university.trim() !== '' && career.trim() !== ''

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!step1Valid || !step2Valid || !step3Valid) return

    setLoading(true)
    setErrorMsg('')

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
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
        setLoading(false)
        return
      }

      if (data.user) {
        // Upsert student profile
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          university_name: university,
          career_name: career,
          academic_year: academicPeriod,
          avatar_url: avatarUrl || null,
        })

        router.push('/productos')
      }
    } catch {
      setErrorMsg('Error al conectar con la base de datos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        {/* Top Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="size-4" /> Volver al Inicio
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl sm:p-8">
          <div className="text-center">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <ShieldCheck className="size-3.5" /> Registro en 3 Pasos
            </span>
            <h1 className="mt-2 text-2xl font-black text-slate-900">Crear cuenta en UniMarket</h1>
            <p className="mt-1 text-xs text-slate-500">
              Comunidad estudiantil Universidad Católica Campus San Ignacio
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex flex-1 items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-black ${
                  step >= 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-400'
                }`}
              >
                1
              </div>
              <div className={`h-1 flex-1 mx-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`} />
            </div>

            <div className="flex flex-1 items-center">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-black ${
                  step >= 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-400'
                }`}
              >
                2
              </div>
              <div className={`h-1 flex-1 mx-2 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-slate-100'}`} />
            </div>

            <div
              className={`flex size-8 items-center justify-center rounded-full text-xs font-black ${
                step >= 3 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-400'
              }`}
            >
              3
            </div>
          </div>

          <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-500 px-1">
            <span className={step === 1 ? 'text-blue-600' : ''}>1. Personales</span>
            <span className={step === 2 ? 'text-blue-600' : ''}>2. Seguridad</span>
            <span className={step === 3 ? 'text-blue-600' : ''}>3. Académicos</span>
          </div>

          {errorMsg && (
            <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="mt-6">
            {/* STEP 1: DATOS PERSONALES */}
            {step === 1 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex flex-col items-center justify-center mb-2">
                  <div className="relative group cursor-pointer">
                    <div className="grid size-20 place-items-center rounded-full bg-blue-50 border-2 border-dashed border-blue-200 overflow-hidden text-blue-600">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="size-8 text-blue-400" />
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold cursor-pointer transition-opacity">
                      Subir foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="mt-1 text-[11px] text-slate-400 font-medium">
                    Foto de perfil (opcional)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Nombre</label>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="ej. Jesus"
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Apellido</label>
                    <input
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="ej. Gonzalez"
                      className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!step1Valid}
                  onClick={() => setStep(2)}
                  className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  Continuar a Seguridad <ArrowRight className="size-4" />
                </button>
              </div>
            )}

            {/* STEP 2: SEGURIDAD */}
            {step === 2 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
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
                          <Check className="size-3.5" /> Correo válido verificado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-rose-500 text-[11px]">
                          <XCircle className="size-3.5" /> Debe terminar en @uc.edu.py, .edu.py o @gmail.com
                        </span>
                      )}
                    </div>
                  )}
                </div>

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
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite tu contraseña"
                      className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-10 text-sm outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
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
                    className="h-12 flex-1 rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700 disabled:opacity-50"
                  >
                    Continuar al Paso 3
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DATOS ACADÉMICOS */}
            {step === 3 && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Universidad</label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Universidad Católica Nuestra Señora de la Asunción Campus San Ignacio (UCSI)">
                      Universidad Católica (UCSI Campus San Ignacio)
                    </option>
                    <option value="Universidad Nacional de Asunción (UNA)">
                      Universidad Nacional de Asunción (UNA)
                    </option>
                    <option value="Universidad Católica Asunción (UCA)">
                      Universidad Católica Asunción (UCA)
                    </option>
                    <option value="Universidad Americana">Universidad Americana</option>
                    <option value="Universidad Columbia del Paraguay">Universidad Columbia</option>
                    <option value="Otra Universidad">Otra Universidad de Paraguay</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Facultad</label>
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Facultad de Ciencias Jurídicas y Sociales">Facultad de Ciencias Jurídicas</option>
                    <option value="Facultad de Ciencias de la Salud">Facultad de Ciencias de la Salud</option>
                    <option value="Facultad de Ciencias Contables y Administrativas">Facultad de Ciencias Contables y Administrativas</option>
                    <option value="Facultad de Ciencias y Tecnología">Facultad de Ciencias y Tecnología</option>
                    <option value="Otra Facultad">Otra Facultad</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Carrera</label>
                  <select
                    value={career}
                    onChange={(e) => setCareer(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="Derecho y Ciencias Sociales (UCSI)">Derecho (UCSI)</option>
                    <option value="Licenciatura en Enfermería (UCSI)">Lic. en Enfermería (UCSI)</option>
                    <option value="Administración de Empresas (UCSI)">Administración de Empresas (UCSI)</option>
                    <option value="Contabilidad Pública (UCSI)">Contabilidad Pública (UCSI)</option>
                    <option value="Ingeniería Informática / Sistemas (UCSI)">Ingeniería Informática (UCSI)</option>
                    <option value="Medicina">Medicina</option>
                    <option value="Arquitectura y Diseño">Arquitectura y Diseño</option>
                    <option value="Otra Carrera">Otra Carrera</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Año o Semestre Académico</label>
                  <select
                    value={academicPeriod}
                    onChange={(e) => setAcademicPeriod(e.target.value)}
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="1er Año / 1er Semestre">1er Año · 1er Semestre</option>
                    <option value="1er Año / 2do Semestre">1er Año · 2do Semestre</option>
                    <option value="2do Año / 3er Semestre">2do Año · 3er Semestre</option>
                    <option value="2do Año / 4to Semestre">2do Año · 4to Semestre</option>
                    <option value="3er Año / 5to Semestre">3er Año · 5to Semestre</option>
                    <option value="3er Año / 6to Semestre">3er Año · 6to Semestre</option>
                    <option value="4to Año / 7mo Semestre">4to Año · 7mo Semestre</option>
                    <option value="4to Año / 8vo Semestre">4to Año · 8vo Semestre</option>
                    <option value="5to Año / 9no Semestre">5to Año · 9no Semestre</option>
                    <option value="5to Año / 10mo Semestre">5to Año · 10mo Semestre</option>
                    <option value="Tesista / Último Semestre">Tesista · Último Semestre</option>
                    <option value="Egresado / Graduado">Egresado / Graduado</option>
                  </select>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="h-12 flex-1 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !step3Valid}
                    className="h-12 flex-1 rounded-xl bg-orange-500 font-bold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:opacity-50"
                  >
                    {loading ? 'Creando cuenta...' : 'Finalizar Registro'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link href="/productos" className="font-bold text-blue-600 hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
