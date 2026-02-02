"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, RefreshCw, X } from "lucide-react"

interface MediaViewerProps {
  isOpen: boolean
  onClose: () => void
  images: string[]
  initialIndex?: number
  albumName?: string
}

export default function MediaViewer({ isOpen, onClose, images, initialIndex = 0, albumName }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setScale(1)
      setRotation(0)
      setPan({ x: 0, y: 0 })
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
      } else if (e.key === "ArrowRight") {
        e.preventDefault()
        setCurrentIndex((prev) => (prev + 1) % images.length)
      } else if (e.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, images.length, onClose])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    setScale(1)
    setRotation(0)
    setPan({ x: 0, y: 0 })
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
    setScale(1)
    setRotation(0)
    setPan({ x: 0, y: 0 })
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/95">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Album Name */}
      {albumName && (
        <div className="absolute top-4 left-4 z-50 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
          {albumName}
        </div>
      )}

      {/* Main Image Area */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          draggable={false}
          className="absolute top-1/2 left-1/2 select-none"
          style={{
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${scale})`,
            transition: isDraggingRef.current ? "none" : "transform 120ms ease-out",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: scale === 1 && rotation % 180 === 0 ? "contain" : undefined,
          }}
          onLoad={() => {
            // Preload adjacent images
            const nextIdx = (currentIndex + 1) % images.length
            const prevIdx = (currentIndex - 1 + images.length) % images.length
            const preloadNext = new Image()
            preloadNext.src = images[nextIdx]
            const preloadPrev = new Image()
            preloadPrev.src = images[prevIdx]
          }}
          onPointerDown={(e) => {
            ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
            isDraggingRef.current = true
            dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
          }}
          onPointerMove={(e) => {
            if (!isDraggingRef.current || !dragStartRef.current) return
            setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y })
          }}
          onPointerUp={(e) => {
            ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
            isDraggingRef.current = false
            dragStartRef.current = null
          }}
          onDoubleClick={() => {
            if (scale !== 1 || rotation !== 0 || pan.x !== 0 || pan.y !== 0) {
              setScale(1)
              setRotation(0)
              setPan({ x: 0, y: 0 })
            } else {
              setScale(2)
            }
          }}
          onWheel={(e) => {
            e.preventDefault()
            const delta = Math.sign(e.deltaY)
            if (delta < 0) {
              setScale((s) => Math.min(5, +(s + 0.2).toFixed(2)))
            } else if (delta > 0) {
              setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))
            }
          }}
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-40"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-40"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Bottom Control Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur px-2 py-1.5">
          <button
            className="p-2 rounded-full hover:bg-white/10 text-white"
            onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))}
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10 text-white"
            onClick={() => setScale((s) => Math.min(5, +(s + 0.2).toFixed(2)))}
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <div className="mx-1 h-5 w-px bg-white/20" />
          <button
            className="p-2 rounded-full hover:bg-white/10 text-white"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            aria-label="Rotate"
          >
            <RotateCw className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full hover:bg-white/10 text-white"
            onClick={() => { setScale(1); setRotation(0); setPan({ x: 0, y: 0 }) }}
            aria-label="Reset"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <>
              <div className="mx-1 h-5 w-px bg-white/20" />
              <div className="px-2 text-white text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

