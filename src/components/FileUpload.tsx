import { useState, useRef } from 'react'
import type { OrderRow } from '../types'
import { parseCSV } from '../utils/csvParser'

interface FileUploadProps {
  onDataLoaded: (rows: OrderRow[]) => void
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Var god valj en CSV-fil')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const rows = await parseCSV(file)
      if (rows.length === 0) {
        setError('Filen innehaller inga giltiga orderrader')
        return
      }
      onDataLoaded(rows)
    } catch (err) {
      setError('Kunde inte lasa filen. Kontrollera att det ar en giltig CSV-fil.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className={`w-full max-w-xl p-8 border-2 border-dashed rounded-xl transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>

          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Ladda upp orderdata
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Dra och slapp en CSV-fil har, eller
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />

          <button
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Laddar...' : 'Valj fil'}
          </button>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <p className="mt-4 text-xs text-gray-400">
            Stodjer CSV-filer med orderrader (semikolonseparerad)
          </p>
        </div>
      </div>
    </div>
  )
}
