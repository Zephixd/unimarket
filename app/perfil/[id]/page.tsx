'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  ShieldAlert,
  ShieldCheck,
  Star,
  User,
  UserCheck,
  UserX,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { ReviewModal } from '@/components/review-modal'
import { ReportModal } from '@/components/report-modal'
import { ProductModal, ProductModalListing } from '@/components/product-modal'
import { createClient } from '@/lib/supabase/client'

interface ProfileData {
  id: string
  full_name: string
  avatar_url?: string | null
  career_name?: string | null
  university_name?: string | null
  bio?: string | null
  phone?: string | null
  rating?: number
  sales_count?: number
  academic_year?: string | null
  created_at?: string
  points?: number
}

interface ListingItem {
  id: string
  title: string
  description?: string
  price_gs: number
  condition: string
  faculty?: string | null
  meeting_point?: string | null
  category_id?: string | null
  seller_id: string
  status: string
  image_url: string | null
  accepts_exchange?: boolean
  publication_type?: string | null
  exchange_for?: string | null
  created_at?: string
}

interface ReviewItem {
  id: string
  rating: number
  comment?: string | null
  created_at: string
  reviewer?: {
    full_name?: string
    avatar_url?: string | null
  } | null
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const profileId = params?.id as string
  const supabase = createClient()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [listings, setListings] = useState<ListingItem[]>([])
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings')
  const [isBlocked, setIsBlocked] = useState(false)

  // Modals
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductModalListing | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [startingChat, setStartingChat] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      if (!profileId) return
      setLoading(true)

      const { data: authData } = await supabase.auth.getUser()
      const myId = authData.user?.id || null
      setCurrentUserId(myId)

      // Fetch Profile
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .maybeSingle()

      if (profData) {
        setProfile(profData)
      }

      // Check if blocked
      if (myId) {
        const { data: blockData } = await supabase
          .from('blocked_users')
          .select('id')
          .eq('user_id', myId)
          .eq('blocked_id', profileId)
          .maybeSingle()
        if (blockData) setIsBlocked(true)
      }

      // Fetch active listings
      const { data: listData } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', profileId)
        .order('created_at', { ascending: false })

      if (listData) setListings(listData)

      // Fetch reviews
      const { data: revData } = await supabase
        .from('reviews')
        .select(`
          id,
          stars,
          comment,
          created_at,
          reviewer:reviewer_id(full_name, avatar_url)
        `)
        .eq('reviewed_id', profileId)
        .order('created_at', { ascending: false })

      if (revData) {
        setReviews(
          revData.map((r: any) => ({
            id: r.id,
            rating: r.stars,
            comment: r.comment,
            created_at: r.created_at,
            reviewer: r.reviewer,
          }))
        )
      }

      setLoading(false)
    }

    loadProfile()
  }, [profileId])

  async function handleToggleBlock() {
    if (!currentUserId) return
    if (isBlocked) {
      await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', currentUserId)
        .eq('blocked_id', profileId)
      setIsBlocked(false)
    } else {
      await supabase.from('blocked_users').insert({
        user_id: currentUserId,
        blocked_id: profileId,
      })
      setIsBlocked(true)
    }
  }

  async function handleContactSeller() {
    if (!currentUserId) return
    setStartingChat(true)

    try {
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(seller_id.eq.${profileId},buyer_id.eq.${currentUserId}),and(seller_id.eq.${currentUserId},buyer_id.eq.${profileId})`)
        .maybeSingle()

      if (existingConv) {
        router.push(`/mensajes?conv=${existingConv.id}`)
        return
      }

      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          seller_id: profileId,
          buyer_id: currentUserId,
        })
        .select('id')
        .single()

      if (newConv) {
        await supabase.from('messages').insert({
          conversation_id: newConv.id,
          sender_id: currentUserId,
          body: `¡Hola ${profile?.full_name || ''}! Te contacto desde tu perfil de UniMarket en UCSI Campus San Ignacio.`,
        })
        router.push(`/mensajes?conv=${newConv.id}`)
      } else {
        router.push('/mensajes')
      }
    } catch {
      router.push('/mensajes')
    } finally {
      setStartingChat(false)
    }
  }

  return (
    <AuthGuard moduleName="el perfil de este estudiante">
      <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
        <Navbar />

        <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="size-4" />
            Volver
          </button>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : !profile ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Package className="mx-auto size-12 text-slate-300" />
              <h2 className="mt-3 text-lg font-bold text-slate-800">Estudiante no encontrado</h2>
              <p className="mt-1 text-xs text-slate-500">
                El perfil que buscas no existe o ha sido dado de baja.
              </p>
              <Link
                href="/inicio"
                className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
              >
                Ir al Inicio
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Header Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-2xl font-black">
                          {profile.full_name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                          {profile.full_name}
                        </h1>
                        <span title="Estudiante Verificado UCSI">
                          <ShieldCheck className="size-5 fill-blue-100 text-blue-600" />
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                        <GraduationCap className="size-4" />
                        <span>{profile.career_name || 'Estudiante UCSI Campus San Ignacio'}</span>
                      </div>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {profile.university_name ||
                          'Universidad Católica Campus San Ignacio (UCSI)'}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span>{(Number(profile.rating) || 5.0).toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">
                            ({reviews.length} reseñas)
                          </span>
                        </div>

                        <div className="rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                          {profile.sales_count ?? listings.filter((l) => l.status === 'sold').length}{' '}
                          operaciones
                        </div>

                        {profile.academic_year && (
                          <div className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                            {profile.academic_year}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for other user */}
                  {currentUserId !== profile.id && (
                    <div className="flex flex-col gap-2 sm:items-end">
                      <button
                        onClick={handleContactSeller}
                        disabled={startingChat}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        <MessageCircle className="size-4" />
                        {startingChat ? 'Abriendo Chat...' : 'Contactar Vendedor'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setReviewOpen(true)}
                          className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-amber-600 hover:bg-amber-50 transition"
                        >
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          Calificar
                        </button>

                        <button
                          onClick={() => setReportOpen(true)}
                          title="Reportar usuario"
                          className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <ShieldAlert className="size-4" />
                        </button>

                        <button
                          onClick={handleToggleBlock}
                          title={isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario'}
                          className={`grid size-9 place-items-center rounded-xl border transition ${
                            isBlocked
                              ? 'border-rose-300 bg-rose-50 text-rose-700'
                              : 'border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <UserX className="size-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-600 leading-relaxed">{profile.bio}</p>
                  </div>
                )}
              </div>

              {/* Tabs: Publicaciones Activas vs Calificaciones */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeTab === 'listings'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Package className="size-4" />
                  Publicaciones ({listings.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeTab === 'reviews'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Star className="size-4" />
                  Reseñas y Reputación ({reviews.length})
                </button>
              </div>

              {/* Tab 1: Listings */}
              {activeTab === 'listings' && (
                <div>
                  {listings.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                      <Package className="mx-auto size-10" />
                      <p className="mt-2 text-xs font-medium">Este estudiante aún no tiene publicaciones activas.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {listings.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => {
                            setSelectedProduct({
                              ...l,
                              profiles: profile,
                            })
                            setProductModalOpen(true)
                          }}
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                        >
                          <div className="relative aspect-[4/3] w-full bg-slate-100">
                            {l.image_url ? (
                              <img
                                src={l.image_url}
                                alt={l.title}
                                className="h-full w-full object-cover transition group-hover:scale-105"
                              />
                            ) : (
                              <div className="grid h-full w-full place-items-center text-slate-300">
                                <Package className="size-8" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1">
                              {l.status === 'sold' ? (
                                <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-white">
                                  Vendido
                                </span>
                              ) : (
                                <span className="rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
                                  Disponible
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="p-3.5">
                            <h3 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600">
                              {l.title}
                            </h3>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-black text-blue-600">
                                {formatPrice(l.price_gs)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {l.faculty || 'UCSI'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                      <Star className="mx-auto size-10" />
                      <p className="mt-2 text-xs font-medium">Aún no hay reseñas registradas para este vendedor.</p>
                    </div>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="grid size-8 place-items-center rounded-xl bg-blue-100 text-xs font-black text-blue-700">
                              {(rev.reviewer?.full_name || 'Estudiante').substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900">
                                {rev.reviewer?.full_name || 'Estudiante de UCSI'}
                              </span>
                              <p className="text-[10px] text-slate-400">
                                {new Date(rev.created_at).toLocaleDateString('es-PY')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`size-3.5 ${
                                  star <= rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {rev.comment && (
                          <p className="mt-2.5 text-xs text-slate-700 leading-relaxed pl-10">
                            «{rev.comment}»
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {selectedProduct && (
          <ProductModal
            isOpen={productModalOpen}
            onClose={() => setProductModalOpen(false)}
            listing={selectedProduct}
            currentUserId={currentUserId}
            onOpenReview={() => setReviewOpen(true)}
          />
        )}

        <ReviewModal
          isOpen={reviewOpen}
          onClose={() => setReviewOpen(false)}
          sellerId={profileId}
          sellerName={profile?.full_name || 'Vendedor'}
          onSuccess={() => {
            // refresh profile
            window.location.reload()
          }}
        />

        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="user"
          targetId={profileId}
          targetTitle={profile?.full_name}
        />

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
