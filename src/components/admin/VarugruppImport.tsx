import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { supabase } from '../../lib/supabase'
import type { VarugruppInsert } from '../../types/supabase'

interface VarugruppImportProps {
  onImportComplete: () => void
}

interface CsvRow {
  'Varugrupp, sökning': string
  'Artikeltext.': string
}

export function VarugruppImport({ onImportComplete }: VarugruppImportProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !supabase) return

    setIsImporting(true)
    setError(null)
    setResult(null)

    Papa.parse<CsvRow>(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: async (results) => {
        if (!supabase) return

        const rows = results.data
        setProgress({ current: 0, total: rows.length })

        let success = 0
        let errors = 0

        // Process in batches of 100
        const batchSize = 100
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize)

          const varugrupper: VarugruppInsert[] = batch
            .filter(row => row['Varugrupp, sökning'] && row['Artikeltext.'])
            .map(row => ({
              varugrupp_id: row['Varugrupp, sökning'].trim(),
              varugrupp_namn: row['Artikeltext.'].trim(),
              aktiv: true,
            }))

          if (varugrupper.length > 0) {
            const { error: insertError } = await supabase
              .from('varugrupp')
              .upsert(varugrupper as unknown as Record<string, unknown>[], {
                onConflict: 'varugrupp_id',
              })

            if (insertError) {
              errors += varugrupper.length
              console.error('Batch error:', insertError)
            } else {
              success += varugrupper.length
            }
          }

          setProgress({ current: Math.min(i + batchSize, rows.length), total: rows.length })
        }

        setResult({ success, errors })
        setIsImporting(false)

        if (success > 0) {
          onImportComplete()
        }
      },
      error: (parseError) => {
        setError(`Kunde inte läsa filen: ${parseError.message}`)
        setIsImporting(false)
      },
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Importera varugrupper</h3>
      <p className="text-sm text-gray-500 mb-4">
        Ladda upp en CSV-fil med varugrupper. Filen ska ha kolumnerna "Varugrupp, sökning" och "Artikeltext."
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className={`mb-4 p-3 rounded-lg border ${
          result.errors === 0
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <p className={`text-sm ${result.errors === 0 ? 'text-green-700' : 'text-yellow-700'}`}>
            Importerade {result.success} varugrupper
            {result.errors > 0 && `, ${result.errors} fel`}
          </p>
        </div>
      )}

      {isImporting ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Importerar...</span>
            <span>{progress.current} / {progress.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Välj CSV-fil
          </button>
        </>
      )}
    </div>
  )
}
