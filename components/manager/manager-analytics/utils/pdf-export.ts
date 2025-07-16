import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { DateRange } from 'react-day-picker'
import { ExportData, ExportOptions } from '../types/export-types'
import { formatGrowthRate, getDateRangeText } from './export-utils'

export const exportToPDF = (
  exportData: ExportData,
  dateInfo: string,
  exportOptions: ExportOptions,
  exportDateRange?: DateRange,
  exportTimeRange?: string,
  userName?: string
): void => {
  const doc = new jsPDF()

  addHeader(doc, exportDateRange, exportTimeRange)

  let yPos = 80

  if (exportOptions.category.checked && exportData.category.length > 0) {
    yPos = addCategoryTable(doc, exportData.category, yPos)
  }

  if (exportOptions.course.checked && exportData.course.length > 0) {
    yPos = addCourseTable(doc, exportData.course, yPos)
  }

  if (exportOptions.student.checked && exportData.student.length > 0) {
    yPos = addStudentTable(doc, exportData.student, yPos)
  }

  if (exportOptions.revenue.checked && exportData.revenue.length > 0) {
    yPos = addRevenueTable(doc, exportData.revenue, yPos)
  }

  addFooter(doc, userName)
  doc.save(`business-analytics-report-${dateInfo}.pdf`)
}

const addHeader = (
  doc: jsPDF,
  exportDateRange?: DateRange,
  exportTimeRange?: string
): void => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const currentDate = new Date()

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('BUSINESS ANALYTICS REPORT', pageWidth / 2, 25, { align: 'center' })

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Export Date: ${currentDate.toLocaleDateString('en-US')}`, 20, 45)
  doc.text(`Export Time: ${currentDate.toLocaleTimeString('en-US')}`, 20, 55)

  const dateRangeText = getDateRangeText(exportDateRange, exportTimeRange)
  doc.text(`Report Period: ${dateRangeText}`, 20, 65)
}

const TABLE_FONT_SIZE = 7
const TABLE_CELL_PADDING = 1
const TABLE_TOTAL_WIDTH = 190 // vừa khổ A4 ngang, không tràn

function getColumnWidths(
  numCols: number,
  nameColIdx: number = 1,
  moneyColIdxs: number[] = []
) {
  const base = Math.floor(TABLE_TOTAL_WIDTH / numCols)
  const widths = Array(numCols).fill(base)
  widths[0] = 12 // No.
  widths[nameColIdx] = base + 6 // Name col
  // Tăng width cho các cột số tiền vừa phải
  moneyColIdxs.forEach(idx => {
    widths[idx] += 12
  })
  // Giảm width các cột ít chữ
  if (numCols > 6) widths[numCols - 1] = 16 // Share %
  // Cân đối lại tổng
  const total = widths.reduce((a, b) => a + b, 0)
  widths[numCols - 1] += TABLE_TOTAL_WIDTH - total
  return widths
}

const COMMON_HEAD_STYLE = {
  fontSize: 7,
  fontStyle: 'bold',
  halign: 'center',
  valign: 'middle',
  overflow: 'visible',
  wordBreak: 'break-all',
  cellPadding: 1,
  minCellHeight: 10,
}

function getCenterMargin(doc: jsPDF) {
  const pageWidth = doc.internal.pageSize.getWidth()
  return (pageWidth - TABLE_TOTAL_WIDTH) / 2
}

function formatCurrencyUSD(amount: number) {
  return amount?.toLocaleString('en-US') + ' $'
}

const addCategoryTable = (doc: jsPDF, data: any[], yPos: number): number => {
  if (yPos > 180) {
    doc.addPage()
    yPos = 30
  }
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  const margin = getCenterMargin(doc)
  doc.text('CATEGORY PERFORMANCE ANALYSIS', margin, yPos)
  yPos += 10
  const tableData: any[][] = data.map((item, index) => [
    index + 1,
    item.name || '',
    item.courseCount || 0,
    item.totalStudents || 0,
    formatCurrencyUSD(item.totalRevenue || 0),
    (item.revenueProportion || 0).toFixed(2) + '%',
  ])
  const widths = getColumnWidths(6, 1, [4])
  // @ts-ignore
  autoTable(doc, {
    head: [
      ['No.', 'Category Name', 'Courses', 'Students', 'Revenue', 'Share %'],
    ],
    body: tableData,
    startY: yPos,
    styles: {
      fontSize: TABLE_FONT_SIZE,
      cellPadding: TABLE_CELL_PADDING,
      font: 'helvetica',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      ...COMMON_HEAD_STYLE,
      fillColor: [52, 152, 219],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: widths[0] },
      1: { halign: 'center', cellWidth: widths[1] },
      2: { halign: 'center', cellWidth: widths[2] },
      3: { halign: 'center', cellWidth: widths[3] },
      4: { halign: 'right', cellWidth: widths[4] },
      5: { halign: 'center', cellWidth: widths[5] },
    },
    margin: { left: margin, right: margin },
    tableWidth: TABLE_TOTAL_WIDTH,
  })
  return (doc as any).lastAutoTable.finalY + 20
}

const addCourseTable = (doc: jsPDF, data: any[], yPos: number): number => {
  if (yPos > 180) {
    doc.addPage()
    yPos = 30
  }
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  const margin = getCenterMargin(doc)
  doc.text('COURSE PERFORMANCE ANALYSIS', margin, yPos)
  yPos += 10
  const tableData: any[][] = data.map((item, index) => [
    index + 1,
    item.courseName || '',
    item.students || 0,
    (item.rating || 0).toFixed(1),
    formatCurrencyUSD(item.revenue || 0),
    (item.revenuePercent || 0).toFixed(2) + '%',
    item.reviews || 0,
    item.level || 'N/A',
  ])
  const widths = getColumnWidths(8, 1, [4])
  // @ts-ignore
  autoTable(doc, {
    head: [
      [
        'No.',
        'Course Name',
        'Students',
        'Rating',
        'Revenue',
        'Revenue %',
        'Reviews',
        'Level',
      ],
    ],
    body: tableData,
    startY: yPos,
    styles: {
      fontSize: TABLE_FONT_SIZE,
      cellPadding: TABLE_CELL_PADDING,
      font: 'helvetica',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      ...COMMON_HEAD_STYLE,
      fillColor: [46, 204, 113],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: widths[0] },
      1: { halign: 'center', cellWidth: widths[1] },
      2: { halign: 'center', cellWidth: widths[2] },
      3: { halign: 'center', cellWidth: widths[3] },
      4: { halign: 'right', cellWidth: widths[4] },
      5: { halign: 'center', cellWidth: widths[5] },
      6: { halign: 'center', cellWidth: widths[6] },
      7: { halign: 'center', cellWidth: widths[7] },
    },
    margin: { left: margin, right: margin },
    tableWidth: TABLE_TOTAL_WIDTH,
  })
  return (doc as any).lastAutoTable.finalY + 20
}

const addStudentTable = (doc: jsPDF, data: any[], yPos: number): number => {
  if (yPos > 180) {
    doc.addPage()
    yPos = 30
  }
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  const margin = getCenterMargin(doc)
  doc.text('STUDENT ACTIVITY ANALYSIS', margin, yPos)
  yPos += 10
  const tableData: any[][] = data.map((item, index) => [
    index + 1,
    item.courseName || '',
    item.newStudents || 0,
    item.previousCompletion || 0,
    formatGrowthRate(item.growth),
    item.reviews || 0,
    item.avgRating || 0,
  ])
  const widths = getColumnWidths(7, 1)
  // @ts-ignore
  autoTable(doc, {
    head: [
      [
        'No.',
        'Course Name',
        'New Students',
        'Previous',
        'Growth %',
        'Reviews',
        'Avg Rating',
      ],
    ],
    body: tableData,
    startY: yPos,
    styles: {
      fontSize: TABLE_FONT_SIZE,
      cellPadding: TABLE_CELL_PADDING,
      font: 'helvetica',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      ...COMMON_HEAD_STYLE,
      fillColor: [155, 89, 182],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: widths[0] },
      1: { halign: 'center', cellWidth: widths[1] },
      2: { halign: 'center', cellWidth: widths[2] },
      3: { halign: 'center', cellWidth: widths[3] },
      4: { halign: 'center', cellWidth: widths[4] },
      5: { halign: 'center', cellWidth: widths[5] },
      6: { halign: 'center', cellWidth: widths[6] },
    },
    margin: { left: margin, right: margin },
    tableWidth: TABLE_TOTAL_WIDTH,
  })
  return (doc as any).lastAutoTable.finalY + 20
}

const addRevenueTable = (doc: jsPDF, data: any[], yPos: number): number => {
  if (yPos > 180) {
    doc.addPage()
    yPos = 30
  }
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  const margin = getCenterMargin(doc)
  doc.text('REVENUE TRENDS ANALYSIS', margin, yPos)
  yPos += 10
  const tableData: any[][] = data.map((item, index) => [
    index + 1,
    item.courseName || '',
    formatCurrencyUSD(item.revenue || 0),
    formatCurrencyUSD(item.previousRevenue || 0),
    formatGrowthRate(item.growth),
    item.orders || 0,
    item.newStudents || 0,
    (item.revenueShare || 0) + '%',
  ])
  const widths = getColumnWidths(8, 1, [2, 3])
  // @ts-ignore
  autoTable(doc, {
    head: [
      [
        'No.',
        'Course Name',
        'Revenue',
        'Previous',
        'Growth %',
        'Orders',
        'New Students',
        'Share %',
      ],
    ],
    body: tableData,
    startY: yPos,
    styles: {
      fontSize: TABLE_FONT_SIZE,
      cellPadding: TABLE_CELL_PADDING,
      font: 'helvetica',
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      ...COMMON_HEAD_STYLE,
      fillColor: [241, 196, 15],
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: widths[0] },
      1: { halign: 'center', cellWidth: widths[1] },
      2: { halign: 'right', cellWidth: widths[2] },
      3: { halign: 'right', cellWidth: widths[3] },
      4: { halign: 'center', cellWidth: widths[4] },
      5: { halign: 'center', cellWidth: widths[5] },
      6: { halign: 'center', cellWidth: widths[6] },
      7: { halign: 'center', cellWidth: widths[7] },
    },
    margin: { left: margin, right: margin },
    tableWidth: TABLE_TOTAL_WIDTH,
  })
  return (doc as any).lastAutoTable.finalY + 20
}

const addFooter = (doc: jsPDF, userName?: string): void => {
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageWidth = doc.internal.pageSize.getWidth()
  // @ts-ignore
  const pageCount = doc.getNumberOfPages()

  // Add page numbers to all pages
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)

    // Page number at bottom center
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    })
  }

  // Go to last page for signature and footer
  doc.setPage(pageCount)

  // Signature section
  const reportX = pageWidth - 70
  const baseY = pageHeight - 80

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Report Generated By:', reportX, baseY)

  const reportWidth = doc.getTextWidth('Report Generated By:')
  const centerX = reportX + reportWidth / 2

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.text(
    `Date: ${new Date().toLocaleDateString('en-US')}`,
    centerX,
    baseY + 12,
    { align: 'center' }
  )

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(removeVietnameseTones(userName || ''), centerX, baseY + 28, {
    align: 'center',
  })

  // Footer on last page only
  doc.setFont('helvetica', 'normal')
  doc.text('IT4Beginner', 20, pageHeight - 20)
}

function removeVietnameseTones(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}
