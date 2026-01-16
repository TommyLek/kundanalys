import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { CustomerSummary } from '../types'
import { KPICards } from './KPICards'
import { SalesChart } from './SalesChart'
import { CategoryBreakdown } from './CategoryBreakdown'
import { TopProducts } from './TopProducts'
import { ExportButton } from './ExportButton'
import { BonusCalculator } from './BonusCalculator'

interface DashboardProps {
  summary: CustomerSummary
  showInternalData: boolean
  showBonusCalculator: boolean
  onCloseBonusCalculator: () => void
}

export function Dashboard({ summary, showInternalData, showBonusCalculator, onCloseBonusCalculator }: DashboardProps) {
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
        <ExportButton summary={summary} showInternalData={showInternalData} />
      </div>

      <KPICards kpis={summary.kpis} showInternalData={showInternalData} />

      {showBonusCalculator && (
        <BonusCalculator
          totalForsaljning={summary.kpis.totalForsaljning}
          kundnummer={summary.kundnummer}
          onClose={onCloseBonusCalculator}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart monthlySales={summary.monthlySales} showInternalData={showInternalData} />
        <CategoryBreakdown categories={summary.topCategories} />
      </div>

      <TopProducts products={summary.topProducts} showInternalData={showInternalData} />
    </div>
  )
}
