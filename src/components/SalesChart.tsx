import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { MonthlySales } from '../types'

interface SalesChartProps {
  monthlySales: MonthlySales[]
  showInternalData: boolean
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + ' M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + ' k'
  }
  return value.toFixed(0)
}

export function SalesChart({ monthlySales, showInternalData }: SalesChartProps) {
  const data = monthlySales.map((m) => ({
    name: `${m.month} ${m.year}`,
    forsaljning: m.forsaljning,
    kostnad: m.kostnad,
    ordrar: m.ordrar,
  }))

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Forsaljning per manad
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              formatter={(value, name) => {
                const numValue = typeof value === 'number' ? value : 0
                const label = name === 'forsaljning' ? 'Forsaljning' : 'Kostnad'
                return [
                  numValue.toLocaleString('sv-SE', {
                    style: 'currency',
                    currency: 'SEK',
                  }),
                  label,
                ]
              }}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            />
            {showInternalData && (
              <Legend
                formatter={(value) =>
                  value === 'forsaljning' ? 'Forsaljning' : 'Kostnad (intern)'
                }
              />
            )}
            <Bar
              dataKey="forsaljning"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              name="forsaljning"
            />
            {showInternalData && (
              <Bar
                dataKey="kostnad"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
                name="kostnad"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
