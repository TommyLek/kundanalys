// Varugrupp types
export interface Varugrupp {
  varugrupp_id: string
  varugrupp_namn: string
  beskrivning: string | null
  aktiv: boolean
  created_at: string
  updated_at: string
}

export interface VarugruppInsert {
  varugrupp_id: string
  varugrupp_namn: string
  beskrivning?: string | null
  aktiv?: boolean
}

export interface VarugruppUpdate {
  varugrupp_namn?: string
  beskrivning?: string | null
  aktiv?: boolean
}

// Lookup map type for efficient code-to-name resolution
export type VarugruppMap = Map<string, Varugrupp>

// Database types for Supabase (simplified)
export interface Database {
  public: {
    Tables: {
      varugrupp: {
        Row: Varugrupp
        Insert: VarugruppInsert
        Update: VarugruppUpdate
      }
    }
  }
}
