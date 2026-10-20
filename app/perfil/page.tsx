'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Edit3,
  Gift,
  GraduationCap,
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
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  User,
  UserCheck,
  UserX,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { PublishModal } from '@/components/publish-modal'
import { EditListingModal } from '@/components/edit-listing-modal'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  bio: string | null
  verified_email: boolean
  career_name?: string | null
  university_name?: string | null
  academic_year?: string | null
  rating?: number
  sales_count?: number
  points?: number
  badges?: string[]
  created_at: string
}

type UserListing = {
  id: string
  title: string
  description?: string
  price_gs: number
  condition: string
  faculty: string | null
  meeting_point: string | null
  category_id?: string | null
  status: string
  image_url?: string | null
  publication_type?: string | null
  exchange_for?: string | null
  accepts_exchange?: boolean
  created_at: string
}

type Review = {
  id: string
  stars: number
  comment: string
  created_at: string
}

type BlockedUser = {
  id: string
  blocked_id: string
  created_at: string
  profile?: {
    full_name: string
    career_name?: string | null
  } | null
}

function formatPrice(value: number) {
  try {
    return `${new Intl.NumberFormat('es-PY').format(value || 0)} Gs.`
  } catch {
    return `${value} Gs.`
  }
}

export default function PerfilPage() {
  const router = useRouter()
  const supabase = createClient()

  // State
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [myListings, setMyListings] = useState<UserListing[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [activeTab, setActiveTab] = useState<'publicaciones' | 'resenas' | 'gamificacion' | 'seguridad'>('publicaciones')

  // Edit Mode
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCareer, setEditCareer] = useState('')
  const [editAcademicYear, setEditAcademicYear] = useState('')
  const [saving, setSaving] = useState(false)

  // Account deletion modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  // Modals
  const [publishOpen, setPublishOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEditListing, setSelectedEditListing] = useState<any>(null)
  const [listingToDelete, setListingToDelete] = useState<UserListing | null>(null)
  const [deletingListing, setDeletingListing] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  async function loadProfile() {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) return

    const currentUserId = authData.user.id
    setUser({ id: currentUserId, email: authData.user.email })

    // Load profile
    const { data: profData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .maybeSingle()

    if (profData) {
      setProfile(profData)
      setEditName(profData.full_name || '')
      setEditBio(profData.bio || '')
      setEditPhone(profData.phone || '')
      setEditCareer(profData.career_name || 'Derecho y Ciencias Sociales (UCSI)')
      setEditAcademicYear(profData.academic_year || '3er Año')
    }

    // Load listings
    const { data: listingsData } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', currentUserId)
      .order('created_at', { ascending: false })

    if (listingsData) {
      setMyListings(listingsData)
    }

    // Load reviews
    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('*')
      .eq('reviewed_id', currentUserId)
      .order('created_at', { ascending: false })

    if (reviewsData) {
      setReviews(reviewsData)
    }

    // Load blocked users
    const { data: blockedData } = await supabase
      .from('blocked_users')
      .select(`
        id,
        blocked_id,
        created_at,
        profile:blocked_id(full_name, career_name)
      `)
      .eq('user_id', currentUserId)

    if (blockedData) {
      setBlockedUsers(blockedData as any)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 4000)
    return () => clearTimeout(t)
  }, [toastMsg])

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
        career_name: editCareer,
        academic_year: editAcademicYear,
      })
      .eq('id', user.id)

    setSaving(false)
    if (!error) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: editName,
              bio: editBio,
              phone: editPhone,
              career_name: editCareer,
              academic_year: editAcademicYear,
            }
          : null
      )
      setEditing(false)
      setToastMsg('¡Perfil actualizado con éxito!')
    } else {
      setToastMsg('Error al guardar: ' + error.message)
    }
  }

  async function updateListingStatus(listingId: string, newStatus: string) {
    const { error } = await supabase.from('listings').update({ status: newStatus }).eq('id', listingId)
    if (!error) {
      setMyListings((prev) =>
        prev.map((item) => (item.id === listingId ? { ...item, status: newStatus } : item))
      )
      const label = newStatus === 'active' ? 'Disponible' : newStatus === 'reserved' ? 'Reservado' : 'Vendido'
      setToastMsg(`Estado actualizado a: ${label}`)
    }
  }

  async function handleDeleteListing() {
    if (!listingToDelete) return
    setDeletingListing(true)
    const { error } = await supabase.from('listings').delete().eq('id', listingToDelete.id)
    if (!error) {
      setMyListings((prev) => prev.filter((item) => item.id !== listingToDelete.id))
      setToastMsg('¡Publicación eliminada definitivamente!')
      setListingToDelete(null)
    } else {
      setToastMsg('Error al eliminar: ' + error.message)
    }
    setDeletingListing(false)
  }

  async function toggleListingStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'sold' ? 'active' : 'sold'
    const { error } = await supabase.from('listings').update({ status: nextStatus }).eq('id', id)

    if (!error) {
      setMyListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
      )
      setToastMsg(nextStatus === 'sold' ? 'Marcado como Vendido' : 'Publicación reactivada')
    }
  }

  async function handleUnblock(blockedRecordId: string) {
    await supabase.from('blocked_users').delete().eq('id', blockedRecordId)
    setBlockedUsers((prev) => prev.filter((b) => b.id !== blockedRecordId))
    setToastMsg('Usuario desbloqueado')
  }

  async function handleDeleteAccount() {
    if (!user) return
    setDeletingAccount(true)
    try {
      // Clear user listings, profile, sign out
      await supabase.from('listings').delete().eq('seller_id', user.id)
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch {
      window.location.href = '/'
    } finally {
      setDeletingAccount(false)
    }
  }

  // Gamification badges calculation
  const totalPoints =
    (profile?.points || 180) +
    myListings.length * 30 +
    myListings.filter((l) => l.status === 'sold').length * 100

  return (
    <AuthGuard moduleName="tu perfil universitario">
      <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
        <Navbar />

        {/* Toast */}
        {toastMsg && (
          <div
            role="status"
            className="fixed bottom-24 right-5 z-50 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-4 text-xs font-bold shadow-2xl transition-all"
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
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Avatar */}
                <div className="relative grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-3xl font-black text-white shadow-md shadow-blue-500/20 sm:size-24">
                  {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
                  <div className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-emerald-500 text-white ring-4 ring-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black text-slate-900">
                      {profile?.full_name || user?.email?.split('@')[0] || 'Estudiante UCSI'}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="size-3.5" /> Correo Institucional Verificado
                    </span>
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                    <GraduationCap className="size-4" />
                    {profile?.career_name || 'Derecho (UCSI Campus San Ignacio)'} •{' '}
                    {profile?.academic_year || '3er Año'}
                  </p>

                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="size-3.5" />
                    {user?.email || 'cargando...'}
                  </p>

                  {profile?.phone && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="size-3.5" />
                      {profile.phone}
                    </p>
                  )}

                  <p className="mt-2.5 max-w-lg text-xs text-slate-600 leading-relaxed">
                    {profile?.bio ||
                      'Estudiante de UCSI Campus San Ignacio. Material académico listo para entrega en biblioteca.'}
                  </p>
                </div>
              </div>

              {/* Edit / Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
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
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-900">
                  Editar Datos Personales y Académicos
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700">Nombre Completo</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="ej. Jesús González"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Teléfono / WhatsApp</label>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="ej. 0981 123 456"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Carrera / Facultad</label>
                    <input
                      value={editCareer}
                      onChange={(e) => setEditCareer(e.target.value)}
                      placeholder="ej. Derecho y Ciencias Sociales (UCSI)"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700">Año o Semestre</label>
                    <input
                      value={editAcademicYear}
                      onChange={(e) => setEditAcademicYear(e.target.value)}
                      placeholder="ej. 3er Año o 6to Semestre"
                      className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-xs font-bold text-slate-700">Biografía</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Cuéntale a tus compañeros qué cursos tomas o tus puntos habituales en campus..."
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
            <div className="mt-7 grid grid-cols-4 divide-x divide-slate-100 border-t border-slate-100 pt-5 text-center">
              <div>
                <p className="text-xl font-black text-blue-600">{myListings.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Publicaciones</p>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-600">
                  {myListings.filter((l) => l.status === 'sold').length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operaciones</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-xl font-black text-amber-500">
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.stars, 0) / reviews.length).toFixed(1)
                    : '5.0'}
                  <Star className="size-4 fill-amber-400" />
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {reviews.length} Calificaciones
                </p>
              </div>
              <div>
                <p className="text-xl font-black text-purple-600">{totalPoints}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Puntos UCSI</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
            <button
              onClick={() => setActiveTab('publicaciones')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                activeTab === 'publicaciones'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Package className="size-4" />
              Mis Publicaciones ({myListings.length})
            </button>
            <Link
              href="/favoritos"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 shrink-0"
            >
              <Heart className="size-4 fill-rose-500 text-rose-500" />
              Mis Favoritos
            </Link>
            <Link
              href="/notificaciones"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 shrink-0"
            >
              <Bell className="size-4 text-blue-500" />
              Notificaciones
            </Link>
            <button
              onClick={() => setActiveTab('resenas')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                activeTab === 'resenas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className="size-4" />
              Calificaciones ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('gamificacion')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                activeTab === 'gamificacion'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Trophy className="size-4" />
              Puntos e Insignias
            </button>
            <Link
              href="/invitar"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 shrink-0"
            >
              <Gift className="size-4 text-indigo-500" />
              Invitar Amigos
            </Link>
            <button
              onClick={() => setActiveTab('seguridad')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shrink-0 ${
                activeTab === 'seguridad'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="size-4" />
              Seguridad y Bloqueos
            </button>
          </div>

          {/* Tab Content: Publicaciones */}
          {activeTab === 'publicaciones' && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {myListings.map((item) => {
                const isSold = item.status === 'sold'
                const isReserved = item.status === 'reserved'
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition ${
                      isSold ? 'border-slate-200 bg-slate-50' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            isSold
                              ? 'bg-slate-200 text-slate-700'
                              : isReserved
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isSold ? 'VENDIDO' : isReserved ? 'RESERVADO' : 'DISPONIBLE'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.created_at).toLocaleDateString('es-PY')}
                        </span>
                      </div>

                      <h3 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm font-black text-blue-600">
                        {formatPrice(item.price_gs)}
                      </p>

                      {item.meeting_point && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="size-3.5 text-slate-400" />
                          {item.meeting_point}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                      {/* Editar */}
                      <button
                        onClick={() => {
                          setSelectedEditListing(item)
                          setEditModalOpen(true)
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 px-3 text-xs font-bold text-white transition hover:bg-slate-800"
                      >
                        <Edit3 className="size-3.5" />
                        Editar
                      </button>

                      {/* Cambiar Estado */}
                      <select
                        value={item.status || 'active'}
                        onChange={(e) => updateListingStatus(item.id, e.target.value)}
                        className="h-8.5 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 outline-none hover:border-slate-300"
                      >
                        <option value="active">Disponible</option>
                        <option value="reserved">Reservado</option>
                        <option value="sold">Vendido</option>
                      </select>

                      {/* Eliminar con Confirmación */}
                      <button
                        onClick={() => setListingToDelete(item)}
                        className="grid size-8.5 place-items-center rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        title="Eliminar publicación"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}

              {myListings.length === 0 && (
                <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <Package className="mx-auto size-10 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">Aún no has publicado ningún artículo</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Sube libros, calculadoras o uniformes y conecta con compañeros de UCSI.
                  </p>
                  <button
                    onClick={() => setPublishOpen(true)}
                    className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition"
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
                <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                  <p className="mt-2 text-xs text-slate-700 font-medium">«{r.comment}»</p>
                  <p className="mt-2 text-[10px] font-semibold text-slate-400">
                    Calificación dejada por compañero en UCSI Campus San Ignacio
                  </p>
                </div>
              ))}

              {reviews.length === 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <Star className="mx-auto size-10 text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700">Sin calificaciones aún</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Aparecerán aquí cuando concretes operaciones y tus compañeros valoren el trato.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Gamificación y Comunidad (Sección 8) */}
          {activeTab === 'gamificacion' && (
            <div className="mt-6 space-y-6">
              {/* Points Overview Card */}
              <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-2xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                    <Trophy className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-purple-950">
                      Puntos UniMarket: {totalPoints} pts
                    </h2>
                    <p className="text-xs text-purple-700 font-medium">
                      Nivel: Estudiante Destacado UCSI
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-purple-100 bg-white p-4 text-center">
                    <span className="text-sm font-black text-purple-600">+50 Pts</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">Perfil Completo</p>
                    <p className="text-[10px] text-slate-400">Datos verificados en UCSI</p>
                  </div>
                  <div className="rounded-2xl border border-purple-100 bg-white p-4 text-center">
                    <span className="text-sm font-black text-purple-600">+30 Pts</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">Por Publicación</p>
                    <p className="text-[10px] text-slate-400">Compartir material académico</p>
                  </div>
                  <div className="rounded-2xl border border-purple-100 bg-white p-4 text-center">
                    <span className="text-sm font-black text-purple-600">+100 Pts</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">Por Operación</p>
                    <p className="text-[10px] text-slate-400">Trato cerrado en el campus</p>
                  </div>
                </div>
              </div>

              {/* Badges System */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                  Insignias Desbloqueadas
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="grid size-12 place-items-center rounded-2xl bg-blue-100 text-blue-600 mb-2">
                      <ShieldCheck className="size-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Perfil Completo</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1">Desbloqueada</span>
                  </div>

                  <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="grid size-12 place-items-center rounded-2xl bg-orange-100 text-orange-600 mb-2">
                      <Package className="size-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Primera Publicación</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1">Desbloqueada</span>
                  </div>

                  <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 mb-2">
                      <Award className="size-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Primera Operación</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1">Desbloqueada</span>
                  </div>

                  <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-600 mb-2">
                      <Star className="size-6 fill-amber-500 text-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-900">Vendedor Destacado</span>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1">Desbloqueada</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Seguridad y Bloqueos (Sección 5) */}
          {activeTab === 'seguridad' && (
            <div className="mt-6 space-y-6">
              {/* Administrador de usuarios bloqueados */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-slate-900">
                  <UserX className="size-5 text-rose-600" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Usuarios Bloqueados ({blockedUsers.length})
                  </h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Los usuarios bloqueados no pueden enviarte mensajes ni ver tus publicaciones.
                </p>

                <div className="mt-4 divide-y divide-slate-100">
                  {blockedUsers.length === 0 ? (
                    <p className="py-4 text-xs font-medium text-slate-400">
                      No tienes ningún usuario bloqueado actualmente.
                    </p>
                  ) : (
                    blockedUsers.map((b) => (
                      <div key={b.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="grid size-8 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
                            {(b.profile?.full_name || 'U').substring(0, 1)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">
                              {b.profile?.full_name || 'Usuario Bloqueado'}
                            </span>
                            <p className="text-[10px] text-slate-400">
                              {b.profile?.career_name || 'UCSI'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUnblock(b.id)}
                          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Desbloquear
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Botón de eliminación de cuenta con confirmación previa */}
              <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-rose-700">
                  <Trash2 className="size-5" />
                  <h3 className="text-sm font-black uppercase tracking-wider">
                    Eliminar Cuenta de UniMarket
                  </h3>
                </div>
                <p className="mt-1 text-xs text-rose-900/80">
                  Esta acción eliminará de forma irreversible tus publicaciones, historial de
                  operaciones y datos de perfil en UCSI Campus San Ignacio.
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="mt-4 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition"
                >
                  Solicitar Eliminación de Cuenta
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Delete Account Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="size-6" />
                </div>
                <h3 className="mt-3 text-lg font-black text-slate-900">
                  ¿Confirmas la eliminación de tu cuenta?
                </h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Tus datos asociados a la Universidad Católica Campus San Ignacio (UCSI), incluyendo
                  publicaciones y calificaciones recibidas, se borrarán de forma definitiva.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={deletingAccount}
                  onClick={handleDeleteAccount}
                  className="h-11 flex-1 rounded-xl bg-rose-600 text-xs font-black text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {deletingAccount ? 'Eliminando...' : 'Sí, eliminar cuenta'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Listing Modal */}
        {selectedEditListing && (
          <EditListingModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false)
              setSelectedEditListing(null)
            }}
            listing={selectedEditListing}
            onSuccess={() => {
              setToastMsg('¡Publicación actualizada con éxito!')
              loadProfile()
            }}
          />
        )}

        {/* Delete Listing Confirmation Modal */}
        {listingToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <AlertTriangle className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950">
                ¿Eliminar publicación?
              </h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                ¿Estás seguro de que deseas eliminar «{listingToDelete.title}»? Esta acción no se puede deshacer.
              </p>
              <div className="mt-6 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setListingToDelete(null)}
                  disabled={deletingListing}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteListing}
                  disabled={deletingListing}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 transition"
                >
                  {deletingListing ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <PublishModal
          isOpen={publishOpen}
          onClose={() => setPublishOpen(false)}
          onSuccess={() => {
            setToastMsg('¡Producto publicado con éxito!')
            loadProfile()
          }}
        />

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
