'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Edit3,
  Heart,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { PublishModal } from '@/components/publish-modal'
import { AuthModal } from '@/components/auth-modal'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  verified_email: boolean
  academic_year: number | null
  created_at: string
}

type UserListing = {
  id: string
  title: string
  price_gs: number
  condition: string
  faculty: string | null
  meeting_point: string | null
  status: string
  created_at: string
}

type Review = {
  id: string
  stars: number
  comment: string
  created_at: string
  reviewer_name?: string
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

export default function PerfilPage() {
  const supabase = createClient()

  // State
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myListings, setMyListings] = useState<UserListing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<'publicaciones' | 'resenas'>('publicaciones')

  // Edit Mode
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)

  // Modals
  const [publishOpen, setPublishOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  async function loadProfile() {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      setAuthOpen(true)
      return
    }

    const currentUserId = authData.user.id
    setUser({ id: currentUserId, email: authData.user.email })

    // Load profile
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single()

    if (profData) {
      setProfile(profData)
      setEditName(profData.full_name || '')
      setEditBio(profData.bio || '')
      setEditPhone(profData.phone || '')
    } else {
      // Create empty profile record if missing
      const newProf = {
        id: currentUserId,
        full_name: authData.user.email?.split('@')[0] || 'Estudiante',
        verified_email: true,
      }
      await supabase.from('profiles').insert(newProf)
      setProfile(newProf as any)
      setEditName(newProf.full_name)
    }

    // Load user's listings
    const { data: listingsData } = await supabase
      .from('listings')
      .select('id,title,price_gs,condition,faculty,meeting_point,status,created_at')
      .eq('seller_id', currentUserId)
      .order('created_at', { ascending: false })

    if (listingsData) {
      setMyListings(listingsData)
    }

    // Load reviews received by user
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewed_id', currentUserId)
      .order('created_at', { ascending: false })

    if (reviewsData) {
      setReviews(reviewsData)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  // Auto clear toast
  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 4000)
    return () => clearTimeout(t)
  }, [toastMsg])

  // Save profile updates
  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editName,
        bio: editBio,
        phone: editPhone,
      })
      .eq('id', user.id)

    setSaving(false)
    if (!error) {
      setProfile((prev) => (prev ? { ...prev, full_name: editName, bio: editBio, phone: editPhone } : null))
      setEditing(false)
      setToastMsg('¡Perfil actualizado con éxito!')
    } else {
      setToastMsg('Error al guardar: ' + error.message)
    }
  }

  // Toggle listing status
  async function toggleListingStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'sold' ? 'active' : 'sold'
    const { error } = await supabase
      .from('listings')
      .update({ status: nextStatus })
      .eq('id', id)

    if (!error) {
      setMyListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      )
      setToastMsg(nextStatus === 'sold' ? 'Marcado como Vendido' : 'Publicación reactivada')
    } else {
      setToastMsg('Error al cambiar estado: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 text-slate-950">
      <Navbar onOpenPublish={() => setPublishOpen(true)} onOpenAuth={() => setAuthOpen(true)} />

      {/* Toast */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-24 right-5 z-50 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-sm font-semibold shadow-2xl transition-all"
        >
          <div className="flex items-center gap-2 text-slate-800">
            <Sparkles className="size-4 shrink-0 text-blue-600" />
            <span>{toastMsg}</span>
          </div>
          <button
            onClick={() => setToastMsg(null)}
            className="grid size-6 place-items-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="relative grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-extrabold text-white shadow-md shadow-blue-200 sm:size-24">
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                <div className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-emerald-500 text-white ring-4 ring-white">
                  <CheckCircle2 className="size-4" />
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-950">
                    {profile?.full_name || user?.email?.split('@')[0] || 'Estudiante'}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    <ShieldCheck className="size-3.5" /> Correo Verificado
                  </span>
                </div>

                <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="size-3.5" />
                  {user?.email || 'cargando...'}
                </p>

                {profile?.phone && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="size-3.5" />
                    {profile.phone}
                  </p>
                )}

                <p className="mt-3 max-w-lg text-sm text-slate-600 leading-relaxed">
                  {profile?.bio ||
                    'Estudiante universitario de Paraguay. Listo para intercambiar y vender libros y apuntes.'}
                </p>
              </div>
            </div>

            {/* Edit / Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Edit3 className="size-3.5" />
                {editing ? 'Cancelar edición' : 'Editar perfil'}
              </button>
            </div>
          </div>

          {/* Edit Form Drawer */}
          {editing && (
            <form
              onSubmit={handleSaveProfile}
              className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 transition-all"
            >
              <h3 className="text-sm font-bold text-blue-950">Editar información de tu perfil</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Nombre completo</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="ej. Ana Martínez"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Teléfono / WhatsApp</label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="ej. 0981 123 456"
                    className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-700">Biografía</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Cuéntale a tus compañeros qué estudias, tu sede habitual y horarios..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none focus:border-blue-600"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="size-3.5" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}

          {/* Stats Bar */}
          <div className="mt-7 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-5 text-center">
            <div>
              <p className="text-xl font-extrabold text-blue-600">{myListings.length}</p>
              <p className="text-[11px] font-medium text-slate-400">Publicaciones</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-emerald-600">
                {myListings.filter((l) => l.status === 'sold').length}
              </p>
              <p className="text-[11px] font-medium text-slate-400">Ventas cerradas</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-xl font-extrabold text-amber-500">
                {reviews.length > 0
                  ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length).toFixed(1)
                  : '5.0'}
                <Star className="size-4 fill-amber-400" />
              </p>
              <p className="text-[11px] font-medium text-slate-400">
                {reviews.length} Calificaciones
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex gap-3 border-b border-slate-200/80 pb-2">
          <button
            onClick={() => setActiveTab('publicaciones')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-bold transition-all ${
              activeTab === 'publicaciones'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="size-4" />
            Mis Publicaciones ({myListings.length})
          </button>
          <button
            onClick={() => setActiveTab('resenas')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-bold transition-all ${
              activeTab === 'resenas'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="size-4" />
            Calificaciones y Reseñas ({reviews.length})
          </button>
        </div>

        {/* Tab Content: Publicaciones */}
        {activeTab === 'publicaciones' && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {myListings.map((item) => {
              const isSold = item.status === 'sold'
              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-2xl border bg-white p-5 transition-all shadow-sm ${
                    isSold ? 'border-slate-200/60 bg-slate-50/70' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                          isSold
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isSold ? 'VENDIDO' : 'ACTIVO'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.created_at).toLocaleDateString('es-PY')}
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm font-extrabold text-blue-600">
                      {formatPrice(item.price_gs)}
                    </p>

                    {item.meeting_point && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="size-3.5 text-slate-400" />
                        {item.meeting_point}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => toggleListingStatus(item.id, item.status)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-colors ${
                        isSold
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <RefreshCw className="size-3.5" />
                      {isSold ? 'Reactivar producto' : 'Marcar como Vendido'}
                    </button>
                  </div>
                </div>
              )
            })}

            {myListings.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Package className="mx-auto size-10 text-slate-300 mb-2" />
                <p className="font-bold text-slate-700">Aún no has publicado ningún artículo</p>
                <p className="mt-1 text-xs text-slate-400">
                  Despeja tus apuntes o libros viejos y gana dinero en tu campus.
                </p>
                <button
                  onClick={() => setPublishOpen(true)}
                  className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
                >
                  + Publicar mi primer artículo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Reseñas */}
        {activeTab === 'resenas' && (
          <div className="mt-6 flex flex-col gap-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(r.created_at).toLocaleDateString('es-PY')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed font-medium">
                  "{r.comment}"
                </p>
                <p className="mt-2 text-[11px] font-semibold text-slate-400">
                  Reseña dejada por compañero universitario
                </p>
              </div>
            ))}

            {reviews.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <Star className="mx-auto size-10 text-slate-300 mb-2" />
                <p className="font-bold text-slate-700">Sin calificaciones aún</p>
                <p className="mt-1 text-xs text-slate-400">
                  Las calificaciones aparecerán aquí cuando concretes transacciones y tus compañeros te valoren.
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      <PublishModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onSuccess={() => {
          setToastMsg('¡Producto publicado con éxito!')
          loadProfile()
        }}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => loadProfile()}
      />
    </div>
  )
}
