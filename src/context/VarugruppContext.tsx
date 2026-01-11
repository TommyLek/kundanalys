import { createContext, useContext, ReactNode } from 'react'
import { useVarugrupper } from '../hooks/useVarugrupper'
import type { VarugruppMap } from '../types/supabase'

interface VarugruppContextValue {
  varugruppMap: VarugruppMap
  getVarugruppNamn: (id: string) => string
  getVarugruppLabel: (id: string) => string
  isLoading: boolean
}

const VarugruppContext = createContext<VarugruppContextValue | null>(null)

export function VarugruppProvider({ children }: { children: ReactNode }) {
  const { varugruppMap, getVarugruppNamn, getVarugruppLabel, isLoading } = useVarugrupper()

  return (
    <VarugruppContext.Provider value={{ varugruppMap, getVarugruppNamn, getVarugruppLabel, isLoading }}>
      {children}
    </VarugruppContext.Provider>
  )
}

export function useVarugruppContext() {
  const context = useContext(VarugruppContext)
  if (!context) {
    // Return fallback if provider not present
    return {
      varugruppMap: new Map(),
      getVarugruppNamn: (id: string) => id,
      getVarugruppLabel: (id: string) => id,
      isLoading: false,
    }
  }
  return context
}
