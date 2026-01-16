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

  return (
    <div className="space-y-2">
      {stalleSummaries.map((stalle) => (
        <div
          key={stalle.stalle}
          className={`grid gap-4 ${showInternalData ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}
        >
          {/* Försäljning per ställe */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-blue-400" />
              <div>
                <p className="text-xs text-gray-500">
                  Ställe {stalle.stalle} - Försäljning
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stalle.totalForsaljning)}
                </p>
              </div>
            </div>
          </div>

          {/* Antal ordrar per ställe */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-green-400" />
              <div>
                <p className="text-xs text-gray-500">
                  Ställe {stalle.stalle} - Antal ordrar
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {stalle.antalOrdrar.toLocaleString('sv-SE')}
                </p>
              </div>
            </div>
          </div>

          {/* Snitt ordervärde per ställe */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 rounded-full bg-purple-400" />
              <div>
                <p className="text-xs text-gray-500">
                  Ställe {stalle.stalle} - Snitt ordervärde
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(stalle.snittOrdervarde)}
                </p>
              </div>
            </div>
          </div>

          {/* Marginal per ställe - endast i internläge */}
          {showInternalData && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 rounded-full bg-amber-400" />
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    Ställe {stalle.stalle} - Marginal
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      Intern
                    </span>
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(stalle.marginal)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatPercent(stalle.marginalProcent)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
