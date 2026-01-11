import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { supabase } from '../../lib/supabase'
import type { ArtikelInsert } from '../../types/supabase'

interface ArtikelImportProps {
  onImportComplete: () => void
}

interface CsvRow {
  'Varugrupp, sökning': string
  'Artikelnummer, sökning': string
  'Artikeltext.': string
  'Leverantör kontonummer.': string
}

export function ArtikelImport({ onImportComplete }: ArtikelImportProps) {
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [result, setResult] = useState<{ success: number; errors: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastBatchError, setLastBatchError] = useState<string | null>(null)
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

        // Process in batches of 500 (larger batches for artiklar)
        const batchSize = 500
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize)

          const artiklarRaw: ArtikelInsert[] = batch
            .filter((row) => row['Artikelnummer, sökning']?.trim())
            .map((row) => ({
              artikelnummer: row['Artikelnummer, sökning'].trim(),
              varugrupp_id: row['Varugrupp, sökning']?.trim() || null,
              artikeltext: row['Artikeltext.']?.trim() || '',
              leverantor_kontonummer: row['Leverantör kontonummer.']
                ? parseInt(row['Leverantör kontonummer.'].trim(), 10) || null
                : null,
              aktiv: true,
            }))

          // Remove duplicates within batch (keep last occurrence)
          const artikelMap = new Map<string, ArtikelInsert>()
          artiklarRaw.forEach((a) => artikelMap.set(a.artikelnummer, a))
          const artiklar = Array.from(artikelMap.values())

          if (artiklar.length > 0) {
            const { error: insertError } = await supabase
              .from('artikel')
              .upsert(artiklar as unknown as Record<string, unknown>[], {
                onConflict: 'artikelnummer',
              })

            if (insertError) {
              errors += artiklar.length
              const errorMsg = `${insertError.message} | ${insertError.details || ''} | ${insertError.hint || ''}`
              console.error('Batch error:', errorMsg)
              setLastBatchError(errorMsg)
            } else {
              success += artiklar.length
            }
          }

          setProgress({
            current: Math.min(i + batchSize, rows.length),
            total: rows.length,
          })
        }

        setResult({ success, errors })
        setIsImporting(false)

        if (success > 0) {
          onImportComplete()
        }
      },
      error: (parseError) => {
        setError(`Kunde inte lasa filen: ${parseError.message}`)
        setIsImporting(false)
      },
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Importera artiklar
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Ladda upp en CSV-fil med artiklar. Filen ska ha kolumnerna
        "Artikelnummer, sokning", "Artikeltext.", "Varugrupp, sokning" och
        "Leverantor kontonummer."
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div
          className={`mb-4 p-3 rounded-lg border ${
            result.errors === 0
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <p
            className={`text-sm ${
              result.errors === 0 ? 'text-green-700' : 'text-yellow-700'
            }`}
          >
            Importerade {result.success.toLocaleString('sv-SE')} artiklar
            {result.errors > 0 &&
              `, ${result.errors.toLocaleString('sv-SE')} fel`}
          </p>
          {lastBatchError && (
            <p className="text-xs text-red-600 mt-2 font-mono break-all">
              Fel: {lastBatchError}
            </p>
          )}
        </div>
      )}

      {isImporting ? (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Importerar...</span>
            <span>
              {progress.current.toLocaleString('sv-SE')} /{' '}
              {progress.total.toLocaleString('sv-SE')}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(progress.current / progress.total) * 100}%`,
              }}
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
            Valj CSV-fil
          </button>
        </>
      )}
    </div>
  )
}
