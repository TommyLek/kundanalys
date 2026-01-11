import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { CustomerSummary } from '../types'
import { KPICards } from './KPICards'
import { SalesChart } from './SalesChart'
import { CategoryBreakdown } from './CategoryBreakdown'
import { TopProducts } from './TopProducts'
import { ExportButton } from './ExportButton'

interface DashboardProps {
  summary: CustomerSummary
}

export function Dashboard({ summary }: DashboardProps) {
  const periodStart = format(summary.period.start, 'd MMM yyyy', { locale: sv })
  const periodEnd = format(summary.period.end, 'd MMM yyyy', { locale: sv })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Kund {summary.kundnummer}
          </h2>
          <p className="text-sm text-gray-500">
            Period: {periodStart} - {periodEnd}
          </p>
        </div>
        <ExportButton summary={summary} />
      </div>

      <KPICards kpis={summary.kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart monthlySales={summary.monthlySales} />
        <CategoryBreakdown categories={summary.topCategories} />
      </div>

      <TopProducts products={summary.topProducts} />
    </div>
  )
}
