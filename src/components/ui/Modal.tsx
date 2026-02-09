'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export function Modal({ isOpen, onClose, title, children, maxWidth = '28rem' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0"
        style={{ background: 'rgba(57, 57, 52, 0.6)' }}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative rounded-xl overflow-hidden shadow-xl"
        style={{ 
          background: 'var(--white)', 
          maxWidth,
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ 
            background: 'var(--gk-charcoal)',
            borderBottom: '1px solid var(--stone)'
          }}
        >
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors hover:bg-white/10"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
        
        {/* Body */}
        <div 
          className="p-6 overflow-y-auto"
          style={{ background: 'var(--cream-light)' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
