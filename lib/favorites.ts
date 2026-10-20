'use client'

import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'unimarket_user_favorites'

export function getLocalFavorites(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveLocalFavorites(ids: string[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent('unimarket_favorites_changed', { detail: ids }))
  } catch {}
}

export async function fetchUserFavorites(): Promise<string[]> {
  const local = getLocalFavorites()
  const supabase = createClient()
  try {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return local

    const { data, error } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', auth.user.id)

    if (!error && data) {
      const dbIds = data.map((d: any) => d.listing_id).filter(Boolean)
      const merged = Array.from(new Set([...local, ...dbIds]))
      saveLocalFavorites(merged)
      return merged
    }
  } catch {
    // Fallback to local storage if supabase table doesn't exist
  }
  return local
}

export async function toggleFavoriteItem(listingId: string): Promise<boolean> {
  const current = getLocalFavorites()
  const exists = current.includes(listingId)
  const updated = exists ? current.filter((id) => id !== listingId) : [...current, listingId]
  saveLocalFavorites(updated)

  const supabase = createClient()
  try {
    const { data: auth } = await supabase.auth.getUser()
    if (auth.user) {
      if (exists) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', auth.user.id)
          .eq('listing_id', listingId)
      } else {
        await supabase
          .from('favorites')
          .upsert({ user_id: auth.user.id, listing_id: listingId })
      }
    }
  } catch {
    // If table write fails, local storage keeps state intact
  }

  return !exists
}
