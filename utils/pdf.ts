export const downloadCertificatePDF = async () => {
    const element = document.getElementById('pdf-wrapper')
    if (!element) return

    const html2pdf = (await import('html2pdf.js')).default

    html2pdf()
        .set({
            margin: 0,
            filename: 'certificate.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save()
}