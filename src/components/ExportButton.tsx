import { useState } from 'react'
import type { CustomerSummary } from '../types'
import { exportCustomerPDF, exportArchivePDF } from '../utils/pdfExport'
import { useVarugruppContext } from '../context/VarugruppContext'

interface ExportButtonProps {
  summary: CustomerSummary
  showInternalData: boolean
}

export function ExportButton({ summary, showInternalData }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { getVarugruppLabel } = useVarugruppContext()

  const handleCustomerExport = () => {
    exportCustomerPDF(summary, getVarugruppLabel)
    setIsOpen(false)
  }

  const handleArchiveExport = () => {
    exportArchivePDF(summary, getVarugruppLabel)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Exportera PDF
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <button
              onClick={handleCustomerExport}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="font-medium text-gray-900">Kund-PDF</div>
              <div className="text-sm text-gray-500">
                Utan kanslig data (kostnad/marginal)
              </div>
            </button>
            {showInternalData && (
              <button
                onClick={handleArchiveExport}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  Arkiv-PDF
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                    Intern
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Komplett data for intern arkivering
                </div>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
