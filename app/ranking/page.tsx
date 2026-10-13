'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  Crown,
  Medal,
  MessageCircle,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  User,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { BottomNav } from '@/components/bottom-nav'
import { AuthGuard } from '@/components/auth-guard'
import { createClient } from '@/lib/supabase/client'

type SellerRanking = {
  seller_id: string
  full_name: string
  avatar_url: string | null
  university_name: string | null
  career_name: string | null
  verified_email: boolean
  sales_count: number
  avg_rating: number | string
  review_count: number | string
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<SellerRanking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadRanking() {
      setLoading(true)
      const { data, error } = await supabase
        .from('seller_ranking')
        .select('*')
        .order('avg_rating', { ascending: false })
        .order('sales_count', { ascending: false })

      if (!error && data) {
        setRanking(data)
      }
      setLoading(false)
    }

    loadRanking()
  }, [])

  const top3 = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  return (
    <AuthGuard moduleName="el ranking de vendedores de UCSI">
      <div className="min-h-screen bg-slate-50/60 pb-24 text-slate-950 md:pb-12">
        <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            <Trophy className="size-3.5 text-amber-600" /> Reputación y Confianza en UCSI
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
            Ranking de Vendedores
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
            Los compañeros mejor valorados del Campus San Ignacio (Misiones). Compra con total confianza y tranquilidad.
          </p>
        </div>

        {/* Podium for Top 3 */}
        {top3.length >= 3 && (
          <div className="mt-10 grid grid-cols-3 items-end gap-2 sm:gap-4 max-w-2xl mx-auto pt-6">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="grid size-16 sm:size-20 place-items-center rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-xl font-bold text-slate-800 shadow-md">
                  {top3[1].full_name[0]}
                </div>
                <div className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-slate-300 text-xs font-black text-slate-800 shadow ring-2 ring-white">
                  2°
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 text-center truncate max-w-[100px] sm:max-w-[130px]">
                {top3[1].full_name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-amber-500 text-xs font-extrabold">
                <Star className="size-3.5 fill-amber-400" />
                <span>{Number(top3[1].avg_rating).toFixed(1)}</span>
              </div>
              <p className="text-[10px] text-slate-400">{top3[1].sales_count} ventas</p>
              <div className="mt-3 w-full h-24 rounded-t-2xl bg-slate-200/80 border-t-4 border-slate-300 flex items-center justify-center font-black text-slate-500 text-sm gap-1.5">
                <Medal className="size-4 text-slate-400" />
                <span>Plata · 2°</span>
              </div>
            </div>

            {/* 1st Place (Center / Tallest) */}
            <div className="flex flex-col items-center -mt-6">
              <div className="relative mb-2">
                <div className="grid size-20 sm:size-24 place-items-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-2xl font-black text-amber-950 shadow-lg ring-4 ring-amber-300/40">
                  {top3[0].full_name[0]}
                </div>
                <div className="absolute -top-3 -right-2 grid size-8 place-items-center rounded-full bg-amber-400 text-amber-950 shadow-md ring-2 ring-white">
                  <Crown className="size-4 fill-amber-950 text-amber-950" />
                </div>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 text-center truncate max-w-[120px] sm:max-w-[160px]">
                {top3[0].full_name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-amber-600 text-sm font-extrabold">
                <Star className="size-4 fill-amber-400" />
                <span>{Number(top3[0].avg_rating).toFixed(1)}</span>
              </div>
              <p className="text-[11px] font-bold text-slate-500">{top3[0].sales_count} ventas concretadas</p>
              <div className="mt-3 w-full h-32 rounded-t-2xl bg-amber-100 border-t-4 border-amber-400 flex flex-col items-center justify-center font-black text-amber-800 text-sm sm:text-base">
                <div className="flex items-center gap-1.5">
                  <Trophy className="size-4 text-amber-600 fill-amber-500" />
                  <span>1° Lugar (Oro)</span>
                </div>
                <span className="text-[10px] font-medium text-amber-600">Vendedor Destacado</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="grid size-16 sm:size-20 place-items-center rounded-2xl bg-gradient-to-tr from-amber-700/60 to-amber-500 text-xl font-bold text-white shadow-md">
                  {top3[2].full_name[0]}
                </div>
                <div className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-amber-600 text-xs font-black text-white shadow ring-2 ring-white">
                  3°
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 text-center truncate max-w-[100px] sm:max-w-[130px]">
                {top3[2].full_name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5 text-amber-500 text-xs font-extrabold">
                <Star className="size-3.5 fill-amber-400" />
                <span>{Number(top3[2].avg_rating).toFixed(1)}</span>
              </div>
              <p className="text-[10px] text-slate-400">{top3[2].sales_count} ventas</p>
              <div className="mt-3 w-full h-16 rounded-t-2xl bg-amber-50/80 border-t-4 border-amber-600/40 flex items-center justify-center font-black text-amber-800 text-xs gap-1">
                <Award className="size-3.5 text-amber-700" />
                <span>Bronce · 3°</span>
              </div>
            </div>
          </div>
        )}

        {/* Full Ranking Table / Cards */}
        <div className="mt-12 rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Medal className="size-5 text-blue-600" />
            Tabla General de Vendedores en UCSI
          </h2>

          <div className="divide-y divide-slate-100">
            {ranking.map((seller, idx) => (
              <div
                key={seller.seller_id}
                className="flex items-center justify-between py-4 transition-colors hover:bg-slate-50/50 rounded-xl px-2"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <span
                    className={`font-black text-sm sm:text-base w-6 text-center ${
                      idx === 0
                        ? 'text-amber-500 text-lg'
                        : idx === 1
                        ? 'text-slate-400 text-base'
                        : idx === 2
                        ? 'text-amber-700 text-base'
                        : 'text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-700 font-bold text-sm shadow-sm">
                    {seller.full_name[0]}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-900">{seller.full_name}</p>
                      {seller.verified_email && (
                        <ShieldCheck className="size-3.5 text-emerald-600" title="Verificado UCSI" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {seller.career_name || 'Estudiante UCSI Campus San Ignacio'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-sm font-black text-amber-500">
                      <Star className="size-4 fill-amber-400" />
                      <span>{Number(seller.avg_rating).toFixed(1)}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {seller.sales_count} ventas · {seller.review_count} reseñas
                    </p>
                  </div>

                  <Link
                    href={`/perfil/${seller.seller_id}`}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    <User className="size-3.5" /> Ver perfil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
    </AuthGuard>
  )
}
