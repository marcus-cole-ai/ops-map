'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Modal } from './ui/Modal'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface ExportButtonProps {
  targetId: string
  filename: string
  title?: string
}

export function ExportButton({ targetId, filename, title }: ExportButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'png' | 'pdf') => {
    const element = document.getElementById(targetId)
    if (!element) return

    setExporting(true)
    const excluded = Array.from(
      element.querySelectorAll<HTMLElement>('[data-export-exclude=\"video\"]')
    )
    const previousDisplay = excluded.map((el) => el.style.display)
    excluded.forEach((el) => {
      el.style.display = 'none'
    })
    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
      })

      if (format === 'png') {
        const link = document.createElement('a')
        link.download = `${filename}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } else {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        })
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
        pdf.save(`${filename}.pdf`)
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      excluded.forEach((el, index) => {
        el.style.display = previousDisplay[index]
      })
      setExporting(false)
      setShowModal(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        Export
      </button>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={`Export ${title || 'View'}`}
        description="Choose a format to download"
      >
        <div className="space-y-3">
          <button
            onClick={() => handleExport('png')}
            disabled={exporting}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <div className="text-left">
              <p className="font-medium text-slate-900">PNG Image</p>
              <p className="text-sm text-slate-500">High-quality image for sharing</p>
            </div>
            <Download className="h-5 w-5 text-slate-400" />
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <div className="text-left">
              <p className="font-medium text-slate-900">PDF Document</p>
              <p className="text-sm text-slate-500">Printable document format</p>
            </div>
            <Download className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {exporting && (
          <div className="mt-4 text-center text-sm text-slate-500">
            Generating export...
          </div>
        )}
      </Modal>
    </>
  )
}
