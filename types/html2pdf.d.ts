declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: {
      type?: string
      quality?: number
    }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      logging?: boolean
      allowTaint?: boolean
      foreignObjectRendering?: boolean
    }
    jsPDF?: {
      unit?: string
      format?: string | number[]
      orientation?: 'portrait' | 'landscape'
    }
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf
    from(element: HTMLElement): Html2Pdf
    save(): Promise<void>
  }

  function html2pdf(): Html2Pdf

  export = html2pdf
}
