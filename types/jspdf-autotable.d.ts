declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf'

  interface UserOptions {
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    startY?: number
    margin?: {
      top?: number
      right?: number
      bottom?: number
      left?: number
    }
    styles?: {
      fontSize?: number
      cellPadding?: number
      textColor?: number[]
      fillColor?: number[]
      lineColor?: number[]
      lineWidth?: number
      font?: string
      fontStyle?: string
      halign?: 'left' | 'center' | 'right'
      valign?: 'top' | 'middle' | 'bottom'
    }
    headStyles?: {
      fillColor?: number[]
      textColor?: number[]
      fontStyle?: string
      fontSize?: number
      cellPadding?: number
      halign?: 'left' | 'center' | 'right'
      valign?: 'top' | 'middle' | 'bottom'
    }
    bodyStyles?: {
      fillColor?: number[]
      textColor?: number[]
      fontStyle?: string
      fontSize?: number
      cellPadding?: number
      halign?: 'left' | 'center' | 'right'
      valign?: 'top' | 'middle' | 'bottom'
    }
    footStyles?: {
      fillColor?: number[]
      textColor?: number[]
      fontStyle?: string
      fontSize?: number
      cellPadding?: number
      halign?: 'left' | 'center' | 'right'
      valign?: 'top' | 'middle' | 'bottom'
    }
    columnStyles?: {
      [key: number]: {
        cellWidth?: number
        halign?: 'left' | 'center' | 'right'
        valign?: 'top' | 'middle' | 'bottom'
        fillColor?: number[]
        textColor?: number[]
        fontStyle?: string
        fontSize?: number
      }
    }
    theme?: 'striped' | 'grid' | 'plain'
    didDrawPage?: (data: any) => void
    willDrawPage?: (data: any) => void
    didDrawCell?: (data: any) => void
    willDrawCell?: (data: any) => void
  }

  function autoTable(doc: jsPDF, options: UserOptions): void

  export default autoTable
}

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number
    }
  }
} 