import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import type { CategorySales } from '../types'
import { useVarugruppContext } from '../context/VarugruppContext'

interface CategoryBreakdownProps {
  categories: CategorySales[]
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
  '#f97316',
  '#6366f1',
]

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const { getVarugruppLabel } = useVarugruppContext()

  // Sort categories by sales (forsaljning) in descending order
  const sortedCategories = [...categories].sort(
    (a, b) => b.forsaljning - a.forsaljning
  )

  const topCategories = sortedCategories.slice(0, 8)
  const othersTotal = sortedCategories
    .slice(8)
    .reduce((sum, c) => sum + c.forsaljning, 0)

  const data = [
    ...topCategories.map((c) => ({
      name: getVarugruppLabel(c.varugrupp),
      value: c.forsaljning,
    })),
    ...(othersTotal > 0
      ? [{ name: 'Ovriga', value: othersTotal }]
      : []),
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Forsaljning per varugrupp
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const numValue = typeof value === 'number' ? value : 0
                return numValue.toLocaleString('sv-SE', {
                  style: 'currency',
                  currency: 'SEK',
                })
              }}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
