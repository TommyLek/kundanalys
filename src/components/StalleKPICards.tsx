import type { StalleSummary } from '../types'

interface StalleKPICardsProps {
  stalleSummaries: StalleSummary[]
  showInternalData: boolean
}

function formatCurrency(value: number): string {
  return value.toLocaleString('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatPercent(value: number): string {
  return value.toLocaleString('sv-SE', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }) + '%'
}

export function StalleKPICards({ stalleSummaries, showInternalData }: StalleKPICardsProps) {
  if (stalleSummaries.length === 0) return null

  // Sort by ställe number ascending
  const sortedSummaries = [...stalleSummaries].sort((a, b) => a.stalle - b.stalle)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Summering per ställe</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-medium text-gray-600">Ställe</th>
              <th className="text-right py-2 px-4 font-medium text-gray-600">Försäljning</th>
              <th className="text-right py-2 px-4 font-medium text-gray-600">Ordrar</th>
              <th className="text-right py-2 px-4 font-medium text-gray-600">Snitt order</th>
              {showInternalData && (
                <>
                  <th className="text-right py-2 px-4 font-medium text-gray-600">Marginal</th>
                  <th className="text-right py-2 pl-4 font-medium text-gray-600">Marginal %</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {sortedSummaries.map((stalle) => (
              <tr key={stalle.stalle} className="border-b border-gray-100 last:border-b-0">
                <td className="py-2 pr-4 font-medium text-gray-900">{stalle.stalle}</td>
                <td className="text-right py-2 px-4 text-gray-900">{formatCurrency(stalle.totalForsaljning)}</td>
                <td className="text-right py-2 px-4 text-gray-900">{stalle.antalOrdrar.toLocaleString('sv-SE')}</td>
                <td className="text-right py-2 px-4 text-gray-900">{formatCurrency(stalle.snittOrdervarde)}</td>
                {showInternalData && (
                  <>
                    <td className="text-right py-2 px-4 text-gray-900">{formatCurrency(stalle.marginal)}</td>
                    <td className="text-right py-2 pl-4 text-gray-900">{formatPercent(stalle.marginalProcent)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
