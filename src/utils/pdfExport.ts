import jsPDF from 'jspdf'
import html2canvas from 'html2canvas-pro'
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'

// Inline all computed styles on every element inside an SVG
// so that when we serialize and re-render, fills/strokes are preserved.
const SVG_STYLE_PROPS = [
  'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity',
  'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline',
  'visibility', 'display',
]

function inlineStyles(source: SVGElement, target: SVGElement) {
  const computed = window.getComputedStyle(source)
  for (const prop of SVG_STYLE_PROPS) {
    const value = computed.getPropertyValue(prop)
    if (value) {
      ;(target as unknown as SVGElement).style.setProperty(prop, value)
    }
  }

  const sourceChildren = source.children
  const targetChildren = target.children
  for (let i = 0; i < sourceChildren.length; i++) {
    if (sourceChildren[i] instanceof SVGElement && targetChildren[i] instanceof SVGElement) {
      inlineStyles(sourceChildren[i] as SVGElement, targetChildren[i] as SVGElement)
    }
  }
}

// Convert all SVG elements inside a container to canvas elements
// so html2canvas can capture them correctly
async function convertSvgsToCanvas(container: HTMLElement): Promise<() => void> {
  const svgs = container.querySelectorAll('svg')
  const restorations: (() => void)[] = []

  for (const svg of svgs) {
    const parent = svg.parentElement
    if (!parent) continue

    const svgRect = svg.getBoundingClientRect()
    if (svgRect.width === 0 || svgRect.height === 0) continue

    // Deep clone + inline all computed styles from the live DOM
    const svgClone = svg.cloneNode(true) as SVGSVGElement
    inlineStyles(svg as unknown as SVGElement, svgClone as unknown as SVGElement)

    svgClone.setAttribute('width', String(svgRect.width))
    svgClone.setAttribute('height', String(svgRect.height))
    if (!svgClone.getAttribute('xmlns')) {
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    }

    const svgData = new XMLSerializer().serializeToString(svgClone)
    // Use data URI with encodeURIComponent to preserve UTF-8 characters (å, ä, ö)
    const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)

    const img = new Image()
    img.width = svgRect.width
    img.height = svgRect.height

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = dataUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = svgRect.width * 2
    canvas.height = svgRect.height * 2
    canvas.style.width = svgRect.width + 'px'
    canvas.style.height = svgRect.height + 'px'

    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)
    ctx.drawImage(img, 0, 0, svgRect.width, svgRect.height)

    // Replace SVG with canvas
    const originalDisplay = svg.style.display
    svg.style.display = 'none'
    parent.insertBefore(canvas, svg.nextSibling)

    restorations.push(() => {
      svg.style.display = originalDisplay
      canvas.remove()
    })
  }

  return () => restorations.forEach((r) => r())
}

export async function exportVisualPDF(
  element: HTMLElement,
  options: {
    kundnummer: number
    isInternal: boolean
  }
): Promise<void> {
  // Convert SVGs (Recharts) to canvas so html2canvas can capture them
  const restoreSvgs = await convertSvgsToCanvas(element)

  // A4 dimensions in mm
  const pdfWidth = 210
  const pdfHeight = 297
  const margin = 10
  const contentWidth = pdfWidth - margin * 2
  const footerHeight = 12
  const usableHeight = pdfHeight - margin * 2 - footerHeight

  // Capture each direct child section as a separate image
  const sections: { canvas: HTMLCanvasElement; heightMm: number }[] = []

  for (const child of element.children) {
    if (!(child instanceof HTMLElement)) continue
    const rect = child.getBoundingClientRect()
    if (rect.height === 0) continue

    const sectionCanvas = await html2canvas(child, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    // Convert pixel height to mm at the same scale as contentWidth
    const heightMm = (sectionCanvas.height / sectionCanvas.width) * contentWidth

    sections.push({ canvas: sectionCanvas, heightMm })
  }

  restoreSvgs()

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = margin
  const gap = 3 // mm gap between sections

  for (const section of sections) {
    // If this section doesn't fit on the current page, start a new page
    if (yPos > margin && yPos + section.heightMm > margin + usableHeight) {
      doc.addPage()
      yPos = margin
    }

    const imgData = section.canvas.toDataURL('image/png')
    doc.addImage(imgData, 'PNG', margin, yPos, contentWidth, section.heightMm)
    yPos += section.heightMm + gap
  }

  // Watermark for internal PDFs
  if (options.isInternal) {
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(48)
      doc.setTextColor(240, 200, 200)
      doc.setFont('helvetica', 'bold')
      doc.text('INTERN', pageWidth / 2, pdfHeight / 2, {
        align: 'center',
        angle: 45,
      })
    }
  }

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'normal')
    const footerText = options.isInternal
      ? `Genererad ${format(new Date(), 'd MMM yyyy HH:mm', { locale: sv })} - INTERN KOPIA`
      : `Genererad ${format(new Date(), 'd MMM yyyy HH:mm', { locale: sv })}`
    doc.text(footerText, margin, pdfHeight - 6)
    doc.text(`Sida ${i} av ${totalPages}`, pageWidth - margin, pdfHeight - 6, { align: 'right' })
  }

  const suffix = options.isInternal ? '_INTERN' : ''
  const fileName = `kundanalys_${options.kundnummer}_${format(new Date(), 'yyyyMMdd')}${suffix}.pdf`
  doc.save(fileName)
}
