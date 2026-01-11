import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type {
  OrderRow,
  SalesKPI,
  MonthlySales,
  CategorySales,
  ProductSales,
  CustomerSummary,
} from '../types'

export function calculateKPIs(rows: OrderRow[]): SalesKPI {
  const totalForsaljning = rows.reduce((sum, row) => sum + row.faktureratBelopp, 0)
  const totalKostnad = rows.reduce((sum, row) => sum + row.kostbelopp, 0)
  const uniqueOrders = new Set(rows.map((row) => row.ordernummer))
  const antalOrdrar = uniqueOrders.size
  const antalOrderrader = rows.length
  const snittOrdervarde = antalOrdrar > 0 ? totalForsaljning / antalOrdrar : 0
  const marginal = totalForsaljning - totalKostnad
  const marginalProcent = totalForsaljning > 0 ? (marginal / totalForsaljning) * 100 : 0

  return {
    totalForsaljning,
    antalOrdrar,
    antalOrderrader,
    snittOrdervarde,
    totalKostnad,
    marginal,
    marginalProcent,
  }
}

export function calculateMonthlySales(rows: OrderRow[]): MonthlySales[] {
  const monthlyMap = new Map<string, MonthlySales>()

  for (const row of rows) {
    const date = row.fakturadatum
    const year = date.getFullYear()
    const monthNum = date.getMonth() + 1
    const key = `${year}-${monthNum.toString().padStart(2, '0')}`
    const monthName = format(date, 'MMM', { locale: sv })

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        month: monthName,
        year,
        monthNum,
        forsaljning: 0,
        kostnad: 0,
        ordrar: 0,
      })
    }

    const data = monthlyMap.get(key)!
    data.forsaljning += row.faktureratBelopp
    data.kostnad += row.kostbelopp
  }

  // Count unique orders per month
  const ordersByMonth = new Map<string, Set<number>>()
  for (const row of rows) {
    const date = row.fakturadatum
    const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    if (!ordersByMonth.has(key)) {
      ordersByMonth.set(key, new Set())
    }
    ordersByMonth.get(key)!.add(row.ordernummer)
  }

  for (const [key, orders] of ordersByMonth) {
    if (monthlyMap.has(key)) {
      monthlyMap.get(key)!.ordrar = orders.size
    }
  }

  return Array.from(monthlyMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.monthNum - b.monthNum
  })
}

export function calculateCategorySales(rows: OrderRow[]): CategorySales[] {
  const categoryMap = new Map<string, CategorySales>()

  for (const row of rows) {
    const key = row.varugrupp || 'Okänd'

    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        varugrupp: key,
        forsaljning: 0,
        antal: 0,
        kostnad: 0,
        marginal: 0,
      })
    }

    const data = categoryMap.get(key)!
    data.forsaljning += row.faktureratBelopp
    data.antal += row.antal
    data.kostnad += row.kostbelopp
  }

  // Calculate margins
  for (const data of categoryMap.values()) {
    data.marginal = data.forsaljning - data.kostnad
  }

  return Array.from(categoryMap.values())
    .sort((a, b) => b.forsaljning - a.forsaljning)
    .slice(0, 10)
}

export function calculateProductSales(rows: OrderRow[]): ProductSales[] {
  const productMap = new Map<string, ProductSales>()

  for (const row of rows) {
    const key = row.artikelnummer || 'Okänd'

    if (!productMap.has(key)) {
      productMap.set(key, {
        artikelnummer: key,
        varugrupp: row.varugrupp,
        forsaljning: 0,
        antal: 0,
        kostnad: 0,
      })
    }

    const data = productMap.get(key)!
    data.forsaljning += row.faktureratBelopp
    data.antal += row.antal
    data.kostnad += row.kostbelopp
  }

  return Array.from(productMap.values())
    .sort((a, b) => b.forsaljning - a.forsaljning)
    .slice(0, 15)
}

export function calculateCustomerSummary(
  rows: OrderRow[],
  kundnummer: number
): CustomerSummary {
  const dates = rows.map((row) => row.fakturadatum)
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  return {
    kundnummer,
    period: {
      start: minDate,
      end: maxDate,
    },
    kpis: calculateKPIs(rows),
    monthlySales: calculateMonthlySales(rows),
    topCategories: calculateCategorySales(rows),
    topProducts: calculateProductSales(rows),
  }
}

// For PDF export - exclude sensitive data (kostnad, marginal)
export interface PublicKPI {
  totalForsaljning: number
  antalOrdrar: number
  antalOrderrader: number
  snittOrdervarde: number
}

export interface PublicCategorySales {
  varugrupp: string
  forsaljning: number
  antal: number
}

export interface PublicProductSales {
  artikelnummer: string
  varugrupp: string
  forsaljning: number
  antal: number
}

export interface PublicMonthlySales {
  month: string
  year: number
  forsaljning: number
  ordrar: number
}

export interface PublicCustomerSummary {
  kundnummer: number
  period: {
    start: Date
    end: Date
  }
  kpis: PublicKPI
  monthlySales: PublicMonthlySales[]
  topCategories: PublicCategorySales[]
  topProducts: PublicProductSales[]
}

export function toPublicSummary(summary: CustomerSummary): PublicCustomerSummary {
  return {
    kundnummer: summary.kundnummer,
    period: summary.period,
    kpis: {
      totalForsaljning: summary.kpis.totalForsaljning,
      antalOrdrar: summary.kpis.antalOrdrar,
      antalOrderrader: summary.kpis.antalOrderrader,
      snittOrdervarde: summary.kpis.snittOrdervarde,
    },
    monthlySales: summary.monthlySales.map((m) => ({
      month: m.month,
      year: m.year,
      forsaljning: m.forsaljning,
      ordrar: m.ordrar,
    })),
    topCategories: summary.topCategories.map((c) => ({
      varugrupp: c.varugrupp,
      forsaljning: c.forsaljning,
      antal: c.antal,
    })),
    topProducts: summary.topProducts.map((p) => ({
      artikelnummer: p.artikelnummer,
      varugrupp: p.varugrupp,
      forsaljning: p.forsaljning,
      antal: p.antal,
    })),
  }
}
