import type { CustomerSummary } from '../types'
import { exportCustomerPDF } from '../utils/pdfExport'

interface ExportButtonProps {
  summary: CustomerSummary
}

export function ExportButton({ summary }: ExportButtonProps) {
  const handleExport = () => {
    exportCustomerPDF(summary)
  }

  return (
    <button
      onClick={handleExport}
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
      Exportera PDF (utan kanslig data)
    </button>
  )
}
