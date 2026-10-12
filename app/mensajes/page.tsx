'use client'

import { FormEvent, Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCheck,
  Clock,
  Coffee,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { AuthModal } from '@/components/auth-modal'
import { PublishModal } from '@/components/publish-modal'
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
  }
  other_user_name?: string
  last_message?: string
  last_message_time?: string
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
  return `${new Intl.NumberFormat('es-PY').format(value)} Gs.`
}

function ChatContent() {
  const searchParams = useSearchParams()
  const initialConvId = searchParams.get('conv')
  const supabase = createClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // State
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConv, setLoadingConv] = useState(true)
  const [sending, setSending] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversations
  async function loadConversations() {
    setLoadingConv(true)
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      setAuthOpen(true)
      setLoadingConv(false)
      return
    }

    const uid = authData.user.id
    setCurrentUser({ id: uid, email: authData.user.email })

    // Fetch conversations where user is buyer or seller
    const { data: convData, error } = await supabase
      .from('conversations')
      .select('id,listing_id,buyer_id,seller_id,created_at')
      .or(`buyer_id.eq.${uid},seller_id.eq.${uid}`)
      .order('created_at', { ascending: false })

    if (convData && convData.length > 0) {
      // Enrich conversations with listing info & last message
      const enriched: Conversation[] = []
      for (const conv of convData) {
        const { data: listingData } = await supabase
          .from('listings')
          .select('id,title,price_gs,status,meeting_point')
          .eq('id', conv.listing_id)
          .single()

        const { data: msgData } = await supabase
          .from('messages')
          .select('body,created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)

        enriched.push({
          ...conv,
          listing: listingData || undefined,
          other_user_name:
            conv.buyer_id === uid ? 'Vendedor del producto' : 'Comprador interesado',
          last_message: msgData?.[0]?.body || 'Conversación iniciada',
          last_message_time: msgData?.[0]?.created_at || conv.created_at,
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

    // Poll every 3 seconds for new messages if realtime is pending
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [activeConvId])

  // Send message
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

  const activeConversation = conversations.find((c) => c.id === activeConvId)

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col bg-slate-50/60 md:flex-row">
      {/* Sidebar: Conversations List */}
      <div
        className={`w-full border-r border-slate-200/80 bg-white md:w-80 lg:w-96 ${
          activeConvId ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Mensajes Universitarios</h2>
          </div>
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
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
                className={`flex w-full items-start gap-3 p-4 text-left transition-colors ${
                  isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-sm shadow-blue-200">
                  <Package className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {conv.listing?.title || 'Producto'}
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
                  <p className="mt-0.5 text-[11px] font-semibold text-blue-600">
                    {conv.listing ? formatPrice(conv.listing.price_gs) : ''}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">{conv.last_message}</p>
                </div>
              </button>
            )
          })}

          {conversations.length === 0 && !loadingConv && (
            <div className="p-8 text-center text-slate-400">
              <MessageCircle className="mx-auto size-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No tienes conversaciones activas</p>
              <p className="mt-1 text-xs">
                Inicia un chat con cualquier estudiante tocando "Chatear en web" en los productos.
              </p>
              <Link
                href="/productos"
                className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
              >
                Explorar productos
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div
        className={`flex-1 flex-col bg-slate-50/50 ${
          activeConvId ? 'flex' : 'hidden md:flex md:items-center md:justify-center'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Top Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="grid size-8 place-items-center rounded-lg bg-slate-50 text-slate-600 md:hidden"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <div className="grid size-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
                  <Package className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {activeConversation.listing?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-blue-600">
                      {activeConversation.listing
                        ? formatPrice(activeConversation.listing.price_gs)
                        : ''}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <ShieldCheck className="size-3" /> Estudiante Verificado
                    </span>
                  </div>
                </div>
              </div>

              {activeConversation.listing?.meeting_point && (
                <div className="hidden lg:flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                  <MapPin className="size-3.5 text-blue-600" />
                  <span className="max-w-[200px] truncate">
                    {activeConversation.listing.meeting_point}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Meetup Suggestions */}
            <div className="flex gap-2 overflow-x-auto border-b border-slate-200/40 bg-white/70 px-4 py-2 text-xs">
              <button
                type="button"
                onClick={() =>
                  setNewMessage('¡Hola! ¿Nos encontramos en la Biblioteca Central para la entrega?')
                }
                className="flex items-center gap-1.5 shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
              >
                <MapPin className="size-3 text-blue-600" />
                <span>Encontrarnos en Biblioteca</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewMessage('¡Buenas! ¿Está disponible? Puedo pasar por la Cantina de la facu.')
                }
                className="flex items-center gap-1.5 shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
              >
                <Coffee className="size-3 text-orange-600" />
                <span>Pasar por la Cantina</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setNewMessage('¡Hola! ¿Aceptas pago en efectivo o transferencia bancaria?')
                }
                className="flex items-center gap-1.5 shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
              >
                <Banknote className="size-3 text-emerald-600" />
                <span>Pago efectivo / transf.</span>
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
                      className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isMe
                          ? 'rounded-br-sm bg-blue-600 text-white'
                          : 'rounded-bl-sm bg-white text-slate-800 border border-slate-200/80'
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
              className="border-t border-slate-200/80 bg-white p-3 sm:p-4"
            >
              <div className="flex items-center gap-2">
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje al compañero de facultad..."
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="flex size-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200 transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center text-slate-400 p-8">
            <MessageCircle className="mx-auto size-14 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">Chat Integrado de UniMarket</h3>
            <p className="mt-1 text-xs text-slate-500">
              Selecciona una conversación a la izquierda para continuar chateando dentro del campus.
            </p>
          </div>
        )}
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => loadConversations()} />
      <PublishModal isOpen={publishOpen} onClose={() => setPublishOpen(false)} />
    </div>
  )
}

export default function MensajesPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-950">
      <Navbar />
      <Suspense
        fallback={
          <div className="grid h-[calc(100vh-72px)] place-items-center">
            <p className="text-sm text-slate-400 font-semibold">Cargando chat universitario...</p>
          </div>
        }
      >
        <ChatContent />
      </Suspense>
    </div>
  )
}
