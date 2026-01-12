import { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { ArtikelMap, Artikel } from '../types/supabase'

interface ArtikelContextValue {
  artikelMap: ArtikelMap
  getArtikelText: (artikelnummer: string) => string
  getArtikelLabel: (artikelnummer: string) => string
  fetchArtiklar: (artikelnummer: string[]) => Promise<void>
  isLoading: boolean
}

const ArtikelContext = createContext<ArtikelContextValue | null>(null)

export function ArtikelProvider({ children }: { children: ReactNode }) {
  const [artikelMap, setArtikelMap] = useState<ArtikelMap>(new Map())
  const [isLoading, setIsLoading] = useState(false)
  const pendingFetch = useRef<Set<string>>(new Set())

  // Fetch specific artiklar by artikelnummer
  const fetchArtiklar = useCallback(async (artikelnummer: string[]) => {
    if (!isSupabaseConfigured() || !supabase || artikelnummer.length === 0) return

    // Filter out already fetched and pending
    const toFetch = artikelnummer.filter(
      (nr) => nr && !artikelMap.has(nr) && !pendingFetch.current.has(nr)
    )

    if (toFetch.length === 0) return

    // Mark as pending
    toFetch.forEach((nr) => pendingFetch.current.add(nr))
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('artikel')
        .select('*')
        .in('artikelnummer', toFetch)

      if (error) {
        console.error('Failed to fetch artiklar:', error)
        return
      }

      const rows = (data || []) as Artikel[]

      setArtikelMap((prev) => {
        const newMap = new Map(prev)
        rows.forEach((a) => newMap.set(a.artikelnummer, a))
        return newMap
      })
    } finally {
      toFetch.forEach((nr) => pendingFetch.current.delete(nr))
      setIsLoading(false)
    }
  }, [artikelMap])

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

  return (
    <ArtikelContext.Provider value={{ artikelMap, getArtikelText, getArtikelLabel, fetchArtiklar, isLoading }}>
      {children}
    </ArtikelContext.Provider>
  )
}

export function useArtikelContext() {
  const context = useContext(ArtikelContext)
  if (!context) {
    return {
      artikelMap: new Map(),
      getArtikelText: (artikelnummer: string) => artikelnummer,
      getArtikelLabel: (artikelnummer: string) => artikelnummer,
      fetchArtiklar: async () => {},
      isLoading: false,
    }
  }
  return context
}
