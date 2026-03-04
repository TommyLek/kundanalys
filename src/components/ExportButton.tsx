import { useState, useRef, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import type { CustomerSummary, BonusDetails } from '../types'
import { exportVisualPDF } from '../utils/pdfExport'
import { useVarugruppContext } from '../context/VarugruppContext'
import { useArtikelContext } from '../context/ArtikelContext'
import { PrintableDashboard } from './PrintableDashboard'

interface ExportButtonProps {
  summary: CustomerSummary
  showInternalData: boolean
  bonusDetails?: BonusDetails | null
  hideStalle800?: boolean
}

export function ExportButton({ summary, showInternalData, bonusDetails, hideStalle800 = false }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { getVarugruppLabel } = useVarugruppContext()
  const { getArtikelText } = useArtikelContext()
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleExport = useCallback(async (isInternal: boolean) => {
    setIsOpen(false)
    setIsExporting(true)

    try {
      // Create a hidden container
      const container = document.createElement('div')
      container.style.position = 'absolute'
      container.style.left = '-9999px'
      container.style.top = '0'
      document.body.appendChild(container)
      containerRef.current = container

      // Render PrintableDashboard into the container
      const root = createRoot(container)
      const dashboardRef = { current: null as HTMLDivElement | null }

      await new Promise<void>((resolve) => {
        root.render(
          <PrintableDashboard
            ref={(el) => {
              dashboardRef.current = el
              if (el) resolve()
            }}
            summary={summary}
            showInternalData={isInternal}
            getVarugruppLabel={getVarugruppLabel}
            getArtikelText={getArtikelText}
            bonusDetails={bonusDetails ?? undefined}
            hideStalle800={hideStalle800}
          />
        )
      })

      // Wait for Recharts SVGs to render
      await new Promise((r) => setTimeout(r, 500))

      if (dashboardRef.current) {
        await exportVisualPDF(dashboardRef.current, {
          kundnummer: summary.kundnummer,
          isInternal,
        })
      }

      // Cleanup
      root.unmount()
      document.body.removeChild(container)
      containerRef.current = null
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [summary, getVarugruppLabel, getArtikelText, bonusDetails, hideStalle800])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Exporterar...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportera PDF
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isExporting && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
            <button
              onClick={() => handleExport(false)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="font-medium text-gray-900">Kund-PDF</div>
              <div className="text-sm text-gray-500">Utan kanslig data (kostnad/marginal)</div>
            </button>
            {showInternalData && (
              <button
                onClick={() => handleExport(true)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  Arkiv-PDF
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                    Intern
                  </span>
                </div>
                <div className="text-sm text-gray-500">Komplett data for intern arkivering</div>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
