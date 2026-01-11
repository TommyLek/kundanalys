import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Artikel, ArtikelInsert, ArtikelUpdate, ArtikelMap } from '../types/supabase'

interface UseArtiklarResult {
  artiklar: Artikel[]
  artikelMap: ArtikelMap
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createArtikel: (data: ArtikelInsert) => Promise<Artikel | null>
  updateArtikel: (artikelnummer: string, data: ArtikelUpdate) => Promise<Artikel | null>
  deleteArtikel: (artikelnummer: string) => Promise<boolean>
  getArtikelText: (artikelnummer: string) => string
  getArtikelLabel: (artikelnummer: string) => string
  searchArtiklar: (query: string, limit?: number) => Promise<Artikel[]>
}

export function useArtiklar(): UseArtiklarResult {
  const [artiklar, setArtiklar] = useState<Artikel[]>([])
  const [artikelMap, setArtikelMap] = useState<ArtikelMap>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchArtiklar = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all artiklar using pagination (Supabase limits to 1000 per request)
      const allRows: Artikel[] = []
      const pageSize = 1000
      let page = 0
      let hasMore = true

      while (hasMore) {
        const from = page * pageSize
        const to = from + pageSize - 1

        const { data, error: fetchError } = await supabase
          .from('artikel')
          .select('*')
          .order('artikelnummer')
          .range(from, to)

        if (fetchError) throw fetchError

        const rows = (data || []) as Artikel[]
        allRows.push(...rows)

        hasMore = rows.length === pageSize
        page++
      }

      setArtiklar(allRows)

      // Build lookup map
      const map = new Map<string, Artikel>()
      allRows.forEach((a) => map.set(a.artikelnummer, a))
      setArtikelMap(map)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch artiklar')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArtiklar()
  }, [fetchArtiklar])

  const createArtikel = async (data: ArtikelInsert): Promise<Artikel | null> => {
    if (!supabase) return null

    const { data: created, error: createError } = await supabase
      .from('artikel')
      .insert(data as unknown as Record<string, unknown>)
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      return null
    }

    await fetchArtiklar()
    return created as Artikel
  }

  const updateArtikel = async (artikelnummer: string, data: ArtikelUpdate): Promise<Artikel | null> => {
    if (!supabase) return null

    const { data: updated, error: updateError } = await supabase
      .from('artikel')
      .update(data as unknown as Record<string, unknown>)
      .eq('artikelnummer', artikelnummer)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }

    await fetchArtiklar()
    return updated as Artikel
  }

  const deleteArtikel = async (artikelnummer: string): Promise<boolean> => {
    if (!supabase) return false

    const { error: deleteError } = await supabase
      .from('artikel')
      .delete()
      .eq('artikelnummer', artikelnummer)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    await fetchArtiklar()
    return true
  }

  const getArtikelText = useCallback(
    (artikelnummer: string): string => {
      const artikel = artikelMap.get(artikelnummer)
      return artikel ? artikel.artikeltext : artikelnummer
    },
    [artikelMap]
  )

  const getArtikelLabel = useCallback(
    (artikelnummer: string): string => {
      const artikel = artikelMap.get(artikelnummer)
      return artikel ? `${artikelnummer} - ${artikel.artikeltext}` : artikelnummer
    },
    [artikelMap]
  )

  const searchArtiklar = useCallback(
    async (query: string, limit: number = 20): Promise<Artikel[]> => {
      if (!supabase || !query.trim()) return []

      const { data, error: searchError } = await supabase
        .from('artikel')
        .select('*')
        .or(`artikelnummer.ilike.%${query}%,artikeltext.ilike.%${query}%`)
        .limit(limit)

      if (searchError) {
        console.error('Search error:', searchError)
        return []
      }

      return (data || []) as Artikel[]
    },
    []
  )

  return {
    artiklar,
    artikelMap,
    isLoading,
    error,
    refetch: fetchArtiklar,
    createArtikel,
    updateArtikel,
    deleteArtikel,
    getArtikelText,
    getArtikelLabel,
    searchArtiklar,
  }
}
