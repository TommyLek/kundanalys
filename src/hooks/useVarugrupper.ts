import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Varugrupp, VarugruppInsert, VarugruppUpdate, VarugruppMap } from '../types/supabase'

interface UseVarugruppResult {
  varugrupper: Varugrupp[]
  varugruppMap: VarugruppMap
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createVarugrupp: (data: VarugruppInsert) => Promise<Varugrupp | null>
  updateVarugrupp: (id: string, data: VarugruppUpdate) => Promise<Varugrupp | null>
  deleteVarugrupp: (id: string) => Promise<boolean>
  getVarugruppNamn: (id: string) => string
  getVarugruppLabel: (id: string) => string
}

export function useVarugrupper(): UseVarugruppResult {
  const [varugrupper, setVarugrupper] = useState<Varugrupp[]>([])
  const [varugruppMap, setVarugruppMap] = useState<VarugruppMap>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVarugrupper = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch all varugrupper using pagination (Supabase limits to 1000 per request)
      const allRows: Varugrupp[] = []
      const pageSize = 1000
      let page = 0
      let hasMore = true

      while (hasMore) {
        const from = page * pageSize
        const to = from + pageSize - 1

        const { data, error: fetchError } = await supabase
          .from('varugrupp')
          .select('*')
          .order('varugrupp_id')
          .range(from, to)

        if (fetchError) throw fetchError

        const rows = (data || []) as Varugrupp[]
        allRows.push(...rows)

        hasMore = rows.length === pageSize
        page++
      }

      setVarugrupper(allRows)

      // Build lookup map
      const map = new Map<string, Varugrupp>()
      allRows.forEach((v) => map.set(v.varugrupp_id, v))
      setVarugruppMap(map)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch varugrupper')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVarugrupper()
  }, [fetchVarugrupper])

  const createVarugrupp = async (data: VarugruppInsert): Promise<Varugrupp | null> => {
    if (!supabase) return null

    const { data: created, error: createError } = await supabase
      .from('varugrupp')
      .insert(data as unknown as Record<string, unknown>)
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      return null
    }

    await fetchVarugrupper()
    return created as Varugrupp
  }

  const updateVarugrupp = async (id: string, data: VarugruppUpdate): Promise<Varugrupp | null> => {
    if (!supabase) return null

    const { data: updated, error: updateError } = await supabase
      .from('varugrupp')
      .update(data as unknown as Record<string, unknown>)
      .eq('varugrupp_id', id)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }

    await fetchVarugrupper()
    return updated as Varugrupp
  }

  const deleteVarugrupp = async (id: string): Promise<boolean> => {
    if (!supabase) return false

    const { error: deleteError } = await supabase
      .from('varugrupp')
      .delete()
      .eq('varugrupp_id', id)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    await fetchVarugrupper()
    return true
  }

  const getVarugruppNamn = useCallback(
    (id: string): string => {
      const varugrupp = varugruppMap.get(id)
      return varugrupp ? varugrupp.varugrupp_namn : id
    },
    [varugruppMap]
  )

  const getVarugruppLabel = useCallback(
    (id: string): string => {
      const varugrupp = varugruppMap.get(id)
      return varugrupp ? `${id} - ${varugrupp.varugrupp_namn}` : id
    },
    [varugruppMap]
  )

  return {
    varugrupper,
    varugruppMap,
    isLoading,
    error,
    refetch: fetchVarugrupper,
    createVarugrupp,
    updateVarugrupp,
    deleteVarugrupp,
    getVarugruppNamn,
    getVarugruppLabel,
  }
}
