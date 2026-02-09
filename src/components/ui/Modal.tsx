'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen?: boolean
  open?: boolean  // alias for isOpen
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: string
  className?: string
}

export function Modal({ 
  isOpen, 
  open, 
  onClose, 
  title, 
  description,
  children, 
  maxWidth = '28rem',
  className 
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  
  // Support both isOpen and open props
  const isVisible = isOpen ?? open ?? false

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  // Parse maxWidth from className if provided (e.g., "max-w-xl")
  const classMaxWidth = className?.match(/max-w-(\w+)/)?.[0]
  const widthMap: Record<string, string> = {
    'max-w-sm': '24rem',
    'max-w-md': '28rem',
    'max-w-lg': '32rem',
    'max-w-xl': '36rem',
    'max-w-2xl': '42rem',
  }
  const finalMaxWidth = classMaxWidth ? widthMap[classMaxWidth] || maxWidth : maxWidth

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
          maxWidth: finalMaxWidth,
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div 
          className="px-6 py-4"
          style={{ 
            background: 'var(--gk-charcoal)',
            borderBottom: '1px solid var(--stone)'
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          {description && (
            <p className="mt-1 text-sm" style={{ color: 'var(--stone)' }}>
              {description}
            </p>
          )}
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
