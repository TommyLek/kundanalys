import type { SalesKPI } from '../types'

interface KPICardsProps {
  kpis: SalesKPI
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

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      label: 'Total forsaljning',
      value: formatCurrency(kpis.totalForsaljning),
      color: 'bg-blue-500',
    },
    {
      label: 'Antal ordrar',
      value: kpis.antalOrdrar.toLocaleString('sv-SE'),
      color: 'bg-green-500',
    },
    {
      label: 'Snitt ordervarde',
      value: formatCurrency(kpis.snittOrdervarde),
      color: 'bg-purple-500',
    },
    {
      label: 'Marginal',
      value: formatCurrency(kpis.marginal),
      subValue: formatPercent(kpis.marginalProcent),
      color: 'bg-amber-500',
      sensitive: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
        >
          <div className="flex items-center gap-3">
            <div className={`w-2 h-10 rounded-full ${card.color}`} />
            <div>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                {card.label}
                {card.sensitive && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                    Intern
                  </span>
                )}
              </p>
              <p className="text-xl font-semibold text-gray-900">{card.value}</p>
              {card.subValue && (
                <p className="text-sm text-gray-500">{card.subValue}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
