'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Handshake,
  MapPin,
  MessageCircle,
  Package,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { createClient } from '@/lib/supabase/client'

type OperationStatus = 'todas' | 'iniciada' | 'reservado' | 'acordada' | 'completada' | 'cancelada'

interface OperationItem {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  status: 'iniciada' | 'reservado' | 'acordada' | 'completada' | 'cancelada'
  payment_method: 'campus_cash' | 'processed'
  meeting_point?: string | null
  price_gs: number
  notes?: string | null
  created_at: string
  listings?: {
    id: string
    title: string
    image_url?: string | null
    price_gs: number
  } | null
  buyer?: {
    id: string
    full_name: string
    career_name?: string | null
    avatar_url?: string | null
  } | null
  seller?: {
    id: string
    full_name: string
    career_name?: string | null
    avatar_url?: string | null
  } | null
}

function formatPrice(value: number) {
  try {
    return `${new Intl.NumberFormat('es-PY').format(value || 0)} Gs.`
  } catch {
    return `${value} Gs.`
  }
}

export default function OperacionesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [operations, setOperations] = useState<OperationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<OperationStatus>('todas')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function loadOperations() {
      setLoading(true)
      const { data: authData } = await supabase.auth.getUser()
      const uid = authData.user?.id || '03d5a087-5423-4c25-8df1-91afbe92728b' // fallback demo
      setCurrentUserId(uid)

      const { data, error } = await supabase
        .from('operations')
        .select(`
          *,
          listings:listing_id (id, title, image_url, price_gs),
          buyer:buyer_id (id, full_name, career_name, avatar_url),
          seller:seller_id (id, full_name, career_name, avatar_url)
        `)
        .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setOperations(data as any)
      } else {
        // If empty, create initial sample operations so user sees all states in UCSI
        const { data: anyListing } = await supabase.from('listings').select('id, seller_id, price_gs').limit(1).maybeSingle()
        if (anyListing) {
          const sampleOps = [
            {
              listing_id: anyListing.id,
              buyer_id: uid,
              seller_id: anyListing.seller_id,
              status: 'iniciada',
              payment_method: 'campus_cash',
              meeting_point: 'Biblioteca Central UCSI Campus San Ignacio',
              price_gs: 85000,
              notes: 'Operación iniciada para acordar fecha y hora en el campus.',
            },
            {
              listing_id: anyListing.id,
              buyer_id: uid,
              seller_id: anyListing.seller_id,
              status: 'acordada',
              payment_method: 'campus_cash',
              meeting_point: 'Cantina de la Facultad UCSI',
              price_gs: 90000,
              notes: 'Encuentro acordado para el receso de las 18:30 hs.',
            },
            {
              listing_id: anyListing.id,
              buyer_id: uid,
              seller_id: anyListing.seller_id,
              status: 'completada',
              payment_method: 'campus_cash',
              meeting_point: 'Acceso Principal UCSI Campus San Ignacio',
              price_gs: 120000,
              notes: 'Material entregado satisfactoriamente y pago recibido en efectivo.',
            },
          ]
          await supabase.from('operations').insert(sampleOps)

          const { data: reloaded } = await supabase
            .from('operations')
            .select(`
              *,
              listings:listing_id (id, title, image_url, price_gs),
              buyer:buyer_id (id, full_name, career_name, avatar_url),
              seller:seller_id (id, full_name, career_name, avatar_url)
            `)
            .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
            .order('created_at', { ascending: false })

          if (reloaded) setOperations(reloaded as any)
        }
      }

      setLoading(false)
    }

    loadOperations()
  }, [])

  async function updateStatus(opId: string, newStatus: string) {
    setActionLoading(opId)
    await supabase.from('operations').update({ status: newStatus }).eq('id', opId)
    setOperations((prev) =>
      prev.map((o) => (o.id === opId ? { ...o, status: newStatus as any } : o))
    )
    setActionLoading(null)
  }

  const filteredOps = operations.filter((op) => {
    if (activeTab === 'todas') return true
    return op.status === activeTab
  })

  return (
    <AuthGuard moduleName="el historial de tus operaciones">
      <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
        <Navbar />

        <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Transacciones y Acuerdos
              </span>
              <h1 className="text-2xl font-black text-slate-900">Mis Operaciones</h1>
              <p className="mt-0.5 text-xs text-slate-500">
                Seguimiento de compras, ventas y trueques en UCSI Campus San Ignacio
              </p>
            </div>
            <Link
              href="/buscar"
              className="inline-flex items-center gap-1.5 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <Package className="size-4" />
              Explorar Catálogo
            </Link>
          </div>

          {/* Status Tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-200">
            <button
              onClick={() => setActiveTab('todas')}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'todas'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todas ({operations.length})
            </button>
            <button
              onClick={() => setActiveTab('iniciada')}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'iniciada'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Iniciadas ({operations.filter((o) => o.status === 'iniciada').length})
            </button>
            <button
              onClick={() => setActiveTab('reservado')}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'reservado'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Reservados ({operations.filter((o) => o.status === 'reservado').length})
            </button>
            <button
              onClick={() => setActiveTab('acordada')}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'acordada'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Acordadas ({operations.filter((o) => o.status === 'acordada').length})
            </button>
            <button
              onClick={() => setActiveTab('completada')}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'completada'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Completadas ({operations.filter((o) => o.status === 'completada').length})
            </button>
            <button
              onClick={() => setActiveTab('cancelada')}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'cancelada'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Canceladas ({operations.filter((o) => o.status === 'cancelada').length})
            </button>
          </div>

          {/* List of Operations */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              </div>
            ) : filteredOps.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <Handshake className="mx-auto size-12 text-slate-300" />
                <h3 className="mt-3 text-base font-bold text-slate-800">
                  No hay operaciones en esta sección
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Cuando acuerdes una compra o venta con otro estudiante de UCSI, aparecerá aquí.
                </p>
                <Link
                  href="/buscar"
                  className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                >
                  Explorar Productos
                </Link>
              </div>
            ) : (
              filteredOps.map((op) => {
                const isBuyer = currentUserId === op.buyer_id
                const otherUser = isBuyer ? op.seller : op.buyer
                const otherUserName = otherUser?.full_name || 'Estudiante UCSI'
                const otherUserRole = isBuyer ? 'Vendedor' : 'Comprador'
                const itemTitle = op.listings?.title || 'Material Académico UCSI'
                const itemImg = op.listings?.image_url

                return (
                  <div
                    key={op.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Left: Product & Counterparty info */}
                      <div className="flex items-start gap-4">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                          {itemImg ? (
                            <img
                              src={itemImg}
                              alt={itemTitle}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-slate-300">
                              <Package className="size-8" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Status badge */}
                            <span
                              className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                op.status === 'completada'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : op.status === 'acordada'
                                  ? 'bg-blue-100 text-blue-800'
                                  : op.status === 'reservado'
                                  ? 'bg-amber-100 text-amber-800'
                                  : op.status === 'cancelada'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {op.status === 'iniciada'
                                ? 'Iniciada'
                                : op.status === 'reservado'
                                ? 'Reservado'
                                : op.status === 'acordada'
                                ? 'Acordada'
                                : op.status === 'completada'
                                ? 'Completada'
                                : 'Cancelada'}
                            </span>

                            {/* Badge Distintivo: Campus Cash vs Pago Procesado */}
                            {op.payment_method === 'campus_cash' ? (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200">
                                <Handshake className="size-3" />
                                Acordado en campus (Pago en entrega)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                                <CreditCard className="size-3" />
                                Pago procesado
                              </span>
                            )}
                          </div>

                          <h3 className="mt-1.5 text-sm font-black text-slate-900">{itemTitle}</h3>
                          <p className="text-sm font-black text-blue-600">
                            {formatPrice(op.price_gs || op.listings?.price_gs || 0)}
                          </p>

                          {/* Counterparty row */}
                          <div className="mt-2.5 flex items-center gap-2">
                            <Link
                              href={`/perfil/${otherUser?.id || ''}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 transition"
                            >
                              <div className="grid size-5 place-items-center rounded-md bg-blue-100 text-[10px] font-bold text-blue-700">
                                {otherUserName.substring(0, 1).toUpperCase()}
                              </div>
                              <span>
                                {otherUserName} ({otherUserRole})
                              </span>
                            </Link>

                            <span className="text-slate-300">•</span>

                            <span className="text-[11px] text-slate-400">
                              {new Date(op.created_at).toLocaleDateString('es-PY')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Meeting Point & Actions */}
                      <div className="flex flex-col gap-2 sm:items-end">
                        <div className="rounded-xl bg-slate-50 p-2.5 text-right sm:max-w-xs border border-slate-100">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 justify-end">
                            <MapPin className="size-3.5 text-blue-600" />
                            <span>Punto de Encuentro:</span>
                          </div>
                          <p className="mt-0.5 text-xs font-semibold text-slate-800">
                            {op.meeting_point || 'Biblioteca Central UCSI Campus San Ignacio'}
                          </p>
                        </div>

                        {/* Interactive state transition buttons */}
                        <div className="mt-1 flex flex-wrap gap-2">
                          <Link
                            href="/mensajes"
                            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <MessageCircle className="size-3.5 text-blue-600" />
                            Chatear
                          </Link>

                          {op.status === 'iniciada' && (
                            <button
                              onClick={() => updateStatus(op.id, 'acordada')}
                              disabled={actionLoading === op.id}
                              className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                            >
                              Acordar Encuentro
                            </button>
                          )}

                          {op.status === 'acordada' && (
                            <button
                              onClick={() => updateStatus(op.id, 'completada')}
                              disabled={actionLoading === op.id}
                              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                            >
                              Completar Operación
                            </button>
                          )}

                          {op.status !== 'completada' && op.status !== 'cancelada' && (
                            <button
                              onClick={() => updateStatus(op.id, 'cancelada')}
                              disabled={actionLoading === op.id}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <BottomNav />
      </div>
    </AuthGuard>
  )
}
