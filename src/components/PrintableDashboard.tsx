import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import type { CustomerSummary, BonusDetails } from '../types'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import { forwardRef } from 'react'

interface PrintableDashboardProps {
  summary: CustomerSummary
  showInternalData: boolean
  getVarugruppLabel: (id: string) => string
  getArtikelText: (artikelnummer: string) => string
  bonusDetails?: BonusDetails
  hideStalle800?: boolean
}

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
]

function fmtCurrency(value: number, decimals = 0): string {
  return value.toLocaleString('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function fmtPercent(value: number): string {
  return value.toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
}

function fmtNumber(value: number): string {
  return value.toLocaleString('sv-SE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtAxisCurrency(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + ' M'
  if (value >= 1000) return (value / 1000).toFixed(0) + ' k'
  return value.toFixed(0)
}

export const PrintableDashboard = forwardRef<HTMLDivElement, PrintableDashboardProps>(
  function PrintableDashboard({ summary, showInternalData, getVarugruppLabel, getArtikelText, bonusDetails, hideStalle800 = false }, ref) {
    const bonusAmount = bonusDetails?.calculation.bonusAmount ?? 0
    const periodStart = format(summary.period.start, 'd MMM yyyy', { locale: sv })
    const periodEnd = format(summary.period.end, 'd MMM yyyy', { locale: sv })

    // KPI cards data
    const kpiCards: { label: string; value: string; subValue?: string; color: string }[] = [
      { label: 'Total försäljning', value: fmtCurrency(summary.kpis.totalForsaljning), color: '#3b82f6' },
      { label: 'Antal ordrar', value: summary.kpis.antalOrdrar.toLocaleString('sv-SE'), color: '#10b981' },
      { label: 'Snitt ordervärde', value: fmtCurrency(summary.kpis.snittOrdervarde), color: '#8b5cf6' },
    ]
    if (showInternalData) {
      const marginalAfterBonus = summary.kpis.marginal - bonusAmount
      const marginalPctAfterBonus = summary.kpis.totalForsaljning > 0
        ? (marginalAfterBonus / summary.kpis.totalForsaljning) * 100
        : 0
      const marginalValue = bonusAmount > 0
        ? `${fmtCurrency(summary.kpis.marginal)} (${fmtCurrency(marginalAfterBonus)})`
        : fmtCurrency(summary.kpis.marginal)
      const marginalSub = bonusAmount > 0
        ? `${fmtPercent(summary.kpis.marginalProcent)} (${fmtPercent(marginalPctAfterBonus)})`
        : fmtPercent(summary.kpis.marginalProcent)
      kpiCards.push({
        label: 'Marginal',
        value: marginalValue,
        subValue: marginalSub,
        color: '#f59e0b',
      })
    }

    // Chart data
    const chartData = summary.monthlySales.map((m) => {
      const marginal = m.forsaljning - m.kostnad
      return {
        name: `${m.month} ${m.year}`,
        forsaljning: m.forsaljning,
        marginal,
      }
    })

    // Pie data
    const sortedCategories = [...summary.topCategories].sort((a, b) => b.forsaljning - a.forsaljning)
    const topCats = sortedCategories.slice(0, 8)
    const othersTotal = sortedCategories.slice(8).reduce((sum, c) => sum + c.forsaljning, 0)
    const othersAntal = sortedCategories.slice(8).reduce((sum, c) => sum + c.antal, 0)
    const pieData = [
      ...topCats.map((c) => ({ name: getVarugruppLabel(c.varugrupp), value: c.forsaljning, antal: c.antal })),
      ...(othersTotal > 0 ? [{ name: 'Övriga', value: othersTotal, antal: othersAntal }] : []),
    ]

    // Stalle data
    const sortedStalle = [...summary.stalleSummaries]
      .filter((s) => !hideStalle800 || s.stalle !== 800)
      .sort((a, b) => a.stalle - b.stalle)

    return (
      <div
        ref={ref}
        style={{
          width: '800px',
          padding: '32px',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#111827',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
            {showInternalData ? 'Kundanalys' : 'Försäljningsstatistik'}
          </h1>
          {showInternalData && (
            <div style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px', marginTop: '4px' }}>
              INTERN - KONFIDENTIELL
            </div>
          )}
          <div style={{ fontSize: '16px', marginTop: '6px', color: '#374151' }}>
            Kundnummer: {summary.kundnummer}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
            Period: {periodStart} - {periodEnd}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          {kpiCards.map((card) => (
            <div
              key={card.label}
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div style={{ width: '4px', height: '36px', borderRadius: '4px', backgroundColor: card.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{card.label}</div>
                <div style={{ fontSize: card.subValue ? '13px' : '16px', fontWeight: 600, color: '#111827', whiteSpace: 'nowrap' }}>{card.value}</div>
                {card.subValue && (
                  <div style={{ fontSize: '11px', color: '#6b7280', whiteSpace: 'nowrap' }}>{card.subValue}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stalle table */}
        {sortedStalle.length > 0 && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Summering per ställe</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ textAlign: 'left', padding: '8px 16px', fontWeight: 500, color: '#6b7280' }}>Ställe</th>
                  <th style={{ textAlign: 'right', padding: '8px 16px', fontWeight: 500, color: '#6b7280' }}>Försäljning</th>
                  <th style={{ textAlign: 'right', padding: '8px 16px', fontWeight: 500, color: '#6b7280' }}>Ordrar</th>
                  <th style={{ textAlign: 'right', padding: '8px 16px', fontWeight: 500, color: '#6b7280' }}>Snitt order</th>
                  {showInternalData && (
                    <>
                      <th style={{ textAlign: 'right', padding: '8px 16px', fontWeight: 500, color: '#6b7280' }}>Marginal</th>
                      <th style={{ textAlign: 'right', padding: '8px 16px', fontWeight: 500, color: '#6b7280' }}>Marginal %</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedStalle.map((s) => (
                  <tr key={s.stalle} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 16px', fontWeight: 500 }}>{s.stalle}</td>
                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>{fmtCurrency(s.totalForsaljning)}</td>
                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>{s.antalOrdrar.toLocaleString('sv-SE')}</td>
                    <td style={{ padding: '8px 16px', textAlign: 'right' }}>{fmtCurrency(s.snittOrdervarde)}</td>
                    {showInternalData && (
                      <>
                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{fmtCurrency(s.marginal)}</td>
                        <td style={{ padding: '8px 16px', textAlign: 'right' }}>{fmtPercent(s.marginalProcent)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Bonus calculation */}
        {bonusDetails && bonusAmount > 0 && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Beräkning</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
              <span style={{ color: '#6b7280' }}>Totalbelopp:</span>
              <span>{fmtCurrency(bonusDetails.calculation.baseAmount)}</span>
            </div>
            {bonusDetails.bonusType === 'medAvdrag' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                  <span style={{ color: '#6b7280' }}>Avdrag:</span>
                  <span>- {fmtCurrency(bonusDetails.calculation.deductedAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
                  <span style={{ color: '#6b7280' }}>Beräkningsunderlag:</span>
                  <span>{fmtCurrency(bonusDetails.calculation.baseAmount - bonusDetails.calculation.deductedAmount)}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#6b7280' }}>
              <span>Procentsats:</span>
              <span>{bonusDetails.procent.toLocaleString('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %</span>
            </div>
            <div style={{ borderTop: '1px solid #d1d5db', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 600 }}>
              <span>Beräknat belopp:</span>
              <span>{fmtCurrency(bonusAmount)}</span>
            </div>
          </div>
        )}

        {/* Charts row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          {/* Bar chart */}
          <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Försäljning per månad</h3>
            <BarChart width={showInternalData ? 340 : 700} height={240} data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              <YAxis tickFormatter={fmtAxisCurrency} tick={{ fontSize: 10 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
              {showInternalData && (
                <Legend formatter={(v) => (v === 'forsaljning' ? 'Försäljning' : 'Marginal')} wrapperStyle={{ fontSize: '11px' }} />
              )}
              <Bar dataKey="forsaljning" fill="#3b82f6" radius={[3, 3, 0, 0]} name="forsaljning" isAnimationActive={false} />
              {showInternalData && (
                <Bar dataKey="marginal" fill="#94a3b8" radius={[3, 3, 0, 0]} name="marginal" isAnimationActive={false} />
              )}
            </BarChart>
          </div>

          {/* Pie chart - only show side by side if internal data (narrower bar chart) */}
          {showInternalData && (
            <div style={{ width: '340px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 8px 0' }}>Försäljning per varugrupp</h3>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <PieChart width={150} height={150}>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270} isAnimationActive={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '3px 4px', fontWeight: 500, color: '#6b7280' }}>Varugrupp</th>
                    <th style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 500, color: '#6b7280' }}>Försäljning</th>
                    <th style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 500, color: '#6b7280' }}>Andel</th>
                  </tr>
                </thead>
                <tbody>
                  {pieData.map((entry, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '3px 4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{entry.name}</span>
                      </td>
                      <td style={{ padding: '3px 4px', textAlign: 'right' }}>{fmtCurrency(entry.value)}</td>
                      <td style={{ padding: '3px 4px', textAlign: 'right', color: '#6b7280' }}>{summary.kpis.totalForsaljning > 0 ? ((entry.value / summary.kpis.totalForsaljning) * 100).toFixed(1) + '%' : '0%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie chart on its own row when not internal */}
        {!showInternalData && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 12px 0' }}>Försäljning per varugrupp</h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
              <div style={{ flexShrink: 0 }}>
                <PieChart width={200} height={220}>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={85} paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270} isAnimationActive={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </div>
              <table style={{ flex: 1, borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 500, color: '#6b7280' }}>Varugrupp</th>
                    <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 500, color: '#6b7280' }}>Försäljning</th>
                    <th style={{ textAlign: 'right', padding: '4px 8px', fontWeight: 500, color: '#6b7280' }}>Andel</th>
                  </tr>
                </thead>
                <tbody>
                  {pieData.map((entry, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '4px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                          <span>{entry.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '4px 8px', textAlign: 'right' }}>{fmtCurrency(entry.value)}</td>
                      <td style={{ padding: '4px 8px', textAlign: 'right', color: '#6b7280' }}>{summary.kpis.totalForsaljning > 0 ? ((entry.value / summary.kpis.totalForsaljning) * 100).toFixed(1) + '%' : '0%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Products table */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>Topp produkter</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500, color: '#6b7280' }}>Artikelnr</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500, color: '#6b7280' }}>Artikeltext</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 500, color: '#6b7280' }}>Varugrupp</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 500, color: '#6b7280' }}>Försäljning</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 500, color: '#6b7280' }}>Antal</th>
                {showInternalData && (
                  <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 500, color: '#6b7280' }}>Marginal</th>
                )}
              </tr>
            </thead>
            <tbody>
              {summary.topProducts.filter((p) => !p.varugrupp.startsWith('9')).slice(0, 15).map((p, i) => {
                const marginal = p.forsaljning - p.kostnad
                const marginalPct = p.forsaljning > 0 ? (marginal / p.forsaljning) * 100 : 0
                return (
                  <tr key={p.artikelnummer + i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '6px 12px', fontWeight: 500 }}>{p.artikelnummer || '-'}</td>
                    <td style={{ padding: '6px 12px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getArtikelText(p.artikelnummer)}
                    </td>
                    <td style={{ padding: '6px 12px', color: '#6b7280' }}>{getVarugruppLabel(p.varugrupp)}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right' }}>{fmtCurrency(p.forsaljning)}</td>
                    <td style={{ padding: '6px 12px', textAlign: 'right', color: '#6b7280' }}>{fmtNumber(p.antal)}</td>
                    {showInternalData && (
                      <td style={{ padding: '6px 12px', textAlign: 'right', color: marginal >= 0 ? '#059669' : '#dc2626' }}>
                        {fmtCurrency(marginal)} ({marginalPct.toFixed(1)}%)
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', fontSize: '10px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
          <span>Genererad {format(new Date(), 'd MMM yyyy HH:mm', { locale: sv })}{showInternalData ? ' - INTERN KOPIA' : ''}</span>
          <span>Kund {summary.kundnummer}</span>
        </div>
      </div>
    )
  }
)
