import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'
import type { CustomerSummary } from '../types'
import { toPublicSummary } from './analytics'

function formatCurrency(value: number): string {
  return value.toLocaleString('sv-SE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' kr'
}

function formatNumber(value: number): string {
  return value.toLocaleString('sv-SE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

export function exportCustomerPDF(
  summary: CustomerSummary,
  getVarugruppLabel: (id: string) => string = (id) => id
): void {
  // Convert to public summary (removes sensitive data like kostnad, marginal)
  const publicSummary = toPublicSummary(summary)

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Kundanalys', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text(`Kundnummer: ${publicSummary.kundnummer}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 8

  doc.setFontSize(10)
  doc.setTextColor(100)
  const periodStart = format(publicSummary.period.start, 'd MMM yyyy', { locale: sv })
  const periodEnd = format(publicSummary.period.end, 'd MMM yyyy', { locale: sv })
  doc.text(`Period: ${periodStart} - ${periodEnd}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  doc.setTextColor(0)

  // KPI Summary
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Sammanfattning', 14, yPos)
  yPos += 8

  const kpiData = [
    ['Total forsaljning', formatCurrency(publicSummary.kpis.totalForsaljning)],
    ['Antal ordrar', publicSummary.kpis.antalOrdrar.toString()],
    ['Antal orderrader', publicSummary.kpis.antalOrderrader.toString()],
    ['Snitt ordervarde', formatCurrency(publicSummary.kpis.snittOrdervarde)],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: kpiData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'right', cellWidth: 60 },
    },
    margin: { left: 14 },
  })

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

  // Monthly Sales
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Forsaljning per manad', 14, yPos)
  yPos += 8

  const monthlyData = publicSummary.monthlySales.map((m) => [
    `${m.month} ${m.year}`,
    formatCurrency(m.forsaljning),
    m.ordrar.toString(),
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Manad', 'Forsaljning', 'Ordrar']],
    body: monthlyData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage()
    yPos = 20
  }

  // Top Categories
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Topp varugrupper', 14, yPos)
  yPos += 8

  const categoryData = publicSummary.topCategories.slice(0, 10).map((c) => [
    getVarugruppLabel(c.varugrupp),
    formatCurrency(c.forsaljning),
    formatNumber(c.antal),
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Varugrupp', 'Forsaljning', 'Antal']],
    body: categoryData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

  // Check if we need a new page
  if (yPos > 180) {
    doc.addPage()
    yPos = 20
  }

  // Top Products
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Topp produkter', 14, yPos)
  yPos += 8

  const productData = publicSummary.topProducts.slice(0, 10).map((p) => [
    p.artikelnummer,
    getVarugruppLabel(p.varugrupp),
    formatCurrency(p.forsaljning),
    formatNumber(p.antal),
  ])

  autoTable(doc, {
    startY: yPos,
    head: [['Artikelnr', 'Varugrupp', 'Forsaljning', 'Antal']],
    body: productData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 9 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Genererad ${format(new Date(), 'd MMM yyyy HH:mm', { locale: sv })}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    )
    doc.text(
      `Sida ${i} av ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    )
  }

  // Save
  const fileName = `kundanalys_${publicSummary.kundnummer}_${format(new Date(), 'yyyyMMdd')}.pdf`
  doc.save(fileName)
}

// Internal/Archive PDF - includes ALL data (cost, margin)
export function exportArchivePDF(
  summary: CustomerSummary,
  getVarugruppLabel: (id: string) => string = (id) => id
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Header with "INTERN" watermark
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Kundanalys', pageWidth / 2, yPos, { align: 'center' })
  yPos += 10

  doc.setFontSize(10)
  doc.setTextColor(200, 0, 0)
  doc.text('INTERN - KONFIDENTIELL', pageWidth / 2, yPos, { align: 'center' })
  yPos += 8

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0)
  doc.text(`Kundnummer: ${summary.kundnummer}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 8

  doc.setFontSize(10)
  doc.setTextColor(100)
  const periodStart = format(summary.period.start, 'd MMM yyyy', { locale: sv })
  const periodEnd = format(summary.period.end, 'd MMM yyyy', { locale: sv })
  doc.text(`Period: ${periodStart} - ${periodEnd}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 15

  doc.setTextColor(0)

  // KPI Summary - ALL data including margins
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Sammanfattning', 14, yPos)
  yPos += 8

  const marginalProcent = summary.kpis.marginalProcent.toFixed(1) + '%'
  const kpiData = [
    ['Total forsaljning', formatCurrency(summary.kpis.totalForsaljning)],
    ['Total kostnad', formatCurrency(summary.kpis.totalKostnad)],
    ['Marginal', `${formatCurrency(summary.kpis.marginal)} (${marginalProcent})`],
    ['Antal ordrar', summary.kpis.antalOrdrar.toString()],
    ['Antal orderrader', summary.kpis.antalOrderrader.toString()],
    ['Snitt ordervarde', formatCurrency(summary.kpis.snittOrdervarde)],
  ]

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: kpiData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { halign: 'right', cellWidth: 80 },
    },
    margin: { left: 14 },
  })

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

  // Monthly Sales with cost data
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Forsaljning per manad', 14, yPos)
  yPos += 8

  const monthlyData = summary.monthlySales.map((m) => {
    const marginal = m.forsaljning - m.kostnad
    const marginalPercent = m.forsaljning > 0 ? ((marginal / m.forsaljning) * 100).toFixed(1) + '%' : '0%'
    return [
      `${m.month} ${m.year}`,
      formatCurrency(m.forsaljning),
      formatCurrency(m.kostnad),
      `${formatCurrency(marginal)} (${marginalPercent})`,
      m.ordrar.toString(),
    ]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Manad', 'Forsaljning', 'Kostnad', 'Marginal', 'Ordrar']],
    body: monthlyData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 8 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

  // Check if we need a new page
  if (yPos > 200) {
    doc.addPage()
    yPos = 20
  }

  // Top Categories with cost and margin
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Topp varugrupper', 14, yPos)
  yPos += 8

  const categoryData = summary.topCategories.slice(0, 10).map((c) => {
    const marginalPercent = c.forsaljning > 0 ? ((c.marginal / c.forsaljning) * 100).toFixed(1) + '%' : '0%'
    return [
      getVarugruppLabel(c.varugrupp),
      formatCurrency(c.forsaljning),
      formatCurrency(c.kostnad),
      `${formatCurrency(c.marginal)} (${marginalPercent})`,
      formatNumber(c.antal),
    ]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Varugrupp', 'Forsaljning', 'Kostnad', 'Marginal', 'Antal']],
    body: categoryData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 8 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  yPos = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15

  // Check if we need a new page
  if (yPos > 160) {
    doc.addPage()
    yPos = 20
  }

  // Top Products with cost and margin
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Topp produkter', 14, yPos)
  yPos += 8

  const productData = summary.topProducts.slice(0, 10).map((p) => {
    const marginal = p.forsaljning - p.kostnad
    const marginalPercent = p.forsaljning > 0 ? ((marginal / p.forsaljning) * 100).toFixed(1) + '%' : '0%'
    return [
      p.artikelnummer,
      getVarugruppLabel(p.varugrupp),
      formatCurrency(p.forsaljning),
      formatCurrency(p.kostnad),
      `${formatCurrency(marginal)} (${marginalPercent})`,
      formatNumber(p.antal),
    ]
  })

  autoTable(doc, {
    startY: yPos,
    head: [['Artikelnr', 'Varugrupp', 'Forsaljning', 'Kostnad', 'Marginal', 'Antal']],
    body: productData,
    theme: 'striped',
    headStyles: { fillColor: [66, 66, 66] },
    styles: { fontSize: 7 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
    },
    margin: { left: 14, right: 14 },
  })

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Genererad ${format(new Date(), 'd MMM yyyy HH:mm', { locale: sv })} - INTERN KOPIA`,
      14,
      doc.internal.pageSize.getHeight() - 10
    )
    doc.text(
      `Sida ${i} av ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    )
  }

  // Save
  const fileName = `kundanalys_${summary.kundnummer}_${format(new Date(), 'yyyyMMdd')}_INTERN.pdf`
  doc.save(fileName)
}
