'use client'

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Check,
  CheckCheck,
  Clock,
  Coffee,
  ExternalLink,
  Flag,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserX,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { ReportModal } from '@/components/report-modal'
import { createClient } from '@/lib/supabase/client'

type Conversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  listing?: {
    id: string
    title: string
    price_gs: number
    status: string
    meeting_point: string | null
    image_url?: string | null
  }
  other_user_id?: string
  other_user_name?: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
}

function formatPrice(value: number) {
  try {
    return `${new Intl.NumberFormat('es-PY').format(value || 0)} Gs.`
  } catch {
    return `${value} Gs.`
  }
}

function ChatContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialConvId = searchParams.get('conv')
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConv, setLoadingConv] = useState(true)
  const [sending, setSending] = useState(false)

  // Report & Block State
  const [reportOpen, setReportOpen] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadConversations() {
    setLoadingConv(true)
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      setLoadingConv(false)
      return
    }

    const uid = authData.user.id
    setCurrentUser({ id: uid, email: authData.user.email })

    const { data: convData } = await supabase
      .from('conversations')
      .select('id,listing_id,buyer_id,seller_id,created_at')
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order('created_at', { ascending: false })

    if (convData && convData.length > 0) {
      const enriched: Conversation[] = []
      for (const conv of convData) {
        const otherId = conv.buyer_id === uid ? conv.seller_id : conv.buyer_id

        const { data: listingData } = await supabase
          .from('listings')
          .select('id,title,price_gs,status,meeting_point,image_url')
          .eq('id', conv.listing_id)
          .maybeSingle()

        const { data: otherProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', otherId)
          .maybeSingle()

        const { data: msgData } = await supabase
          .from('messages')
          .select('body,created_at,read_at,sender_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)

        enriched.push({
          ...conv,
          listing: listingData || undefined,
          other_user_id: otherId,
          other_user_name: otherProfile?.full_name || 'Estudiante UCSI',
          last_message: msgData?.[0]?.body || 'Conversación iniciada',
          last_message_time: msgData?.[0]?.created_at || conv.created_at,
          unread_count: msgData?.[0] && msgData[0].sender_id !== uid && !msgData[0].read_at ? 1 : 0,
        })
      }
      setConversations(enriched)

      if (!activeConvId && enriched.length > 0) {
        setActiveConvId(enriched[0].id)
      }
    } else {
      setConversations([])
    }
    setLoadingConv(false)
  }

  useEffect(() => {
    loadConversations()
  }, [])

  // Check if other user is blocked
  const activeConversation = conversations.find((c) => c.id === activeConvId)

  useEffect(() => {
    if (activeConversation?.other_user_id && currentUser?.id) {
      supabase
        .from('blocked_users')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('blocked_id', activeConversation.other_user_id)
        .maybeSingle()
        .then(({ data }) => setIsBlocked(!!data))
    }
  }, [activeConversation, currentUser])

  // Load messages for active conversation
  useEffect(() => {
    if (!activeConvId) return

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeConvId)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data)
      }
    }

    loadMessages()
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [activeConvId])

  async function handleToggleBlock() {
    if (!currentUser?.id || !activeConversation?.other_user_id) return
    const otherId = activeConversation.other_user_id
    if (isBlocked) {
      await supabase
        .from('blocked_users')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('blocked_id', otherId)
      setIsBlocked(false)
    } else {
      await supabase.from('blocked_users').insert({
        user_id: currentUser.id,
        blocked_id: otherId,
      })
      setIsBlocked(true)
    }
  }

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !activeConvId || !currentUser) return

    const text = newMessage.trim()
    setNewMessage('')
    setSending(true)

    const tempMsg: Message = {
      id: 'temp-' + Date.now(),
      conversation_id: activeConvId,
      sender_id: currentUser.id,
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
    }
    setMessages((prev) => [...prev, tempMsg])

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConvId,
        sender_id: currentUser.id,
        body: text,
      })
      .select()
      .single()

    setSending(false)
    if (!error && data) {
      setMessages((prev) => prev.map((m) => (m.id === tempMsg.id ? data : m)))
    }
  }

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col bg-slate-50 md:flex-row">
      {/* Sidebar: Conversations List */}
      <div
        className={`w-full border-r border-slate-200 bg-white md:w-80 lg:w-96 ${
          activeConvId ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-blue-600" />
            <h2 className="text-base font-black text-slate-900">Mensajes en Campus</h2>
          </div>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700">
            {conversations.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConvId
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`flex w-full items-start gap-3 p-4 text-left transition-colors relative ${
                  isSelected ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                }`}
              >
                <div className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-blue-600 font-bold text-white shadow-sm shadow-blue-200">
                  {conv.listing?.image_url ? (
                    <img
                      src={conv.listing.image_url}
                      alt={conv.listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <Package className="size-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {conv.other_user_name || 'Estudiante'}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {conv.last_message_time
                        ? new Date(conv.last_message_time).toLocaleTimeString('es-PY', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-blue-600 truncate">
                    {conv.listing?.title || 'Material UCSI'}
                  </p>

                  <div className="mt-1 flex items-center justify-between">
                    <p className="truncate text-xs text-slate-500 max-w-[200px]">
                      {conv.last_message}
                    </p>
                    {/* Indicador de mensaje no leído */}
                    {(conv.unread_count || 0) > 0 && (
                      <span className="grid size-4.5 place-items-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}

          {conversations.length === 0 && !loadingConv && (
            <div className="p-8 text-center text-slate-400">
              <MessageCircle className="mx-auto size-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">Sin mensajes aún</p>
              <p className="mt-1 text-xs">
                Inicia un chat con cualquier compañero pulsando "Chatear" en el catálogo de productos.
              </p>
              <Link
                href="/buscar"
                className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm"
              >
                Explorar catálogo
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div
        className={`flex-1 flex-col bg-slate-50 ${
          activeConvId ? 'flex' : 'hidden md:flex md:items-center md:justify-center'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Top Header: Product Access, User Profile Access, Report, Block */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-600 md:hidden"
                >
                  <ArrowLeft className="size-4" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/perfil/${activeConversation.other_user_id || ''}`}
                      className="text-sm font-black text-slate-900 hover:text-blue-600 transition underline-offset-2 hover:underline"
                    >
                      {activeConversation.other_user_name}
                    </Link>
                    <span className="inline-flex items-center text-blue-600" title="Verificado UCSI">
                      <ShieldCheck className="size-4 fill-blue-100 text-blue-600" />
                    </span>
                  </div>

                  {activeConversation.listing && (
                    <Link
                      href={`/producto/${activeConversation.listing.id}`}
                      className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition"
                    >
                      <Package className="size-3.5 text-blue-600" />
                      <span className="font-semibold line-clamp-1">
                        {activeConversation.listing.title}
                      </span>
                      <span className="font-black text-blue-600">
                        ({formatPrice(activeConversation.listing.price_gs)})
                      </span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Chat action buttons: Go to Profile, Go to Product, Report, Block */}
              <div className="flex items-center gap-1.5">
                {activeConversation.listing && (
                  <Link
                    href={`/producto/${activeConversation.listing.id}`}
                    title="Ver detalle del producto"
                    className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Package className="size-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Producto</span>
                  </Link>
                )}

                {activeConversation.other_user_id && (
                  <Link
                    href={`/perfil/${activeConversation.other_user_id}`}
                    title="Ver perfil del estudiante"
                    className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  >
                    <User className="size-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Perfil</span>
                  </Link>
                )}

                <button
                  onClick={() => setReportOpen(true)}
                  title="Reportar usuario en chat"
                  className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <Flag className="size-4" />
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

            {/* Quick Meetup Suggestions */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() =>
                  setNewMessage('¡Hola! ¿Nos encontramos en la Biblioteca Central de UCSI para la entrega?')
                }
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 shadow-2xs"
              >
                <MapPin className="size-3 text-blue-600" />
                <span>Biblioteca UCSI</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewMessage('¡Hola! ¿Nos vemos en la Cantina durante el receso?')
                }
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 shadow-2xs"
              >
                <Coffee className="size-3 text-orange-600" />
                <span>Cantina de la facu</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewMessage('¡Buenas! ¿Aceptas efectivo o pago en entrega en el campus?')
                }
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 shadow-2xs"
              >
                <Banknote className="size-3 text-emerald-600" />
                <span>Pago efectivo / campus</span>
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isMe
                          ? 'rounded-br-sm bg-blue-600 text-white font-medium'
                          : 'rounded-bl-sm bg-white text-slate-900 border border-slate-200 font-medium'
                      }`}
                    >
                      {msg.body}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-slate-400">
                      {new Date(msg.created_at).toLocaleTimeString('es-PY', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Message Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-slate-200 bg-white p-3 sm:p-4"
            >
              <div className="flex items-center gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje para encontrarte en el campus..."
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs sm:text-sm font-medium outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center text-slate-400 p-8">
            <MessageCircle className="mx-auto size-14 text-slate-300 mb-3" />
            <h3 className="text-base font-black text-slate-700">Chat Integrado UniMarket UCSI</h3>
            <p className="mt-1 text-xs text-slate-500">
              Selecciona una conversación a la izquierda para continuar chateando dentro del campus.
            </p>
          </div>
        )}
      </div>

      {activeConversation?.other_user_id && (
        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="user"
          targetId={activeConversation.other_user_id}
          targetTitle={activeConversation.other_user_name}
        />
      )}
    </div>
  )
}

export default function MensajesPage() {
  return (
    <AuthGuard moduleName="el chat universitario de UniMarket">
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 md:pb-0">
        <Navbar />
        <Suspense
          fallback={
            <div className="grid h-[calc(100vh-72px)] place-items-center">
              <div className="size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          }
        >
          <ChatContent />
        </Suspense>
        <BottomNav />
      </div>
    </AuthGuard>
  )
}
