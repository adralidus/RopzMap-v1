"use client"

import type * as React from "react"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  delay?: number
  className?: string
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delay = 300,
  className,
  side = "top",
  align = "center",
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [actualSide, setActualSide] = useState(side)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    let top = 0
    let left = 0
    let finalSide = side

    // More aggressive detection for bottom positioning
    // If the trigger is in the bottom half of the viewport, prefer showing above
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top
    const tooltipHeight = tooltipRect.height || 120 // Estimate if not measured yet

    // Force tooltip above if there's not enough space below
    if (spaceBelow < tooltipHeight + 20 || triggerRect.bottom > viewportHeight * 0.6) {
      finalSide = "top"
    } else if (spaceAbove < tooltipHeight + 20) {
      finalSide = "bottom"
    } else {
      finalSide = side
    }

    // Calculate position based on determined side
    switch (finalSide) {
      case "top":
        top = triggerRect.top + scrollY - tooltipHeight - 16
        // Ensure it doesn't go above viewport
        if (top < scrollY + 10) {
          top = scrollY + 10
        }
        break
      case "bottom":
        top = triggerRect.bottom + scrollY + 16
        // Ensure it doesn't go below viewport
        if (top + tooltipHeight > viewportHeight + scrollY - 10) {
          top = viewportHeight + scrollY - tooltipHeight - 10
        }
        break
      case "left":
        left = triggerRect.left + scrollX - tooltipRect.width - 16
        if (left < scrollX + 10) {
          left = triggerRect.right + scrollX + 16
          finalSide = "right"
        }
        break
      case "right":
        left = triggerRect.right + scrollX + 16
        if (left + tooltipRect.width > viewportWidth + scrollX - 10) {
          left = triggerRect.left + scrollX - tooltipRect.width - 16
          finalSide = "left"
        }
        break
    }

    // Calculate horizontal position for top/bottom tooltips
    if (finalSide === "top" || finalSide === "bottom") {
      switch (align) {
        case "start":
          left = triggerRect.left + scrollX
          break
        case "end":
          left = triggerRect.right + scrollX - tooltipRect.width
          break
        case "center":
        default:
          left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2
          break
      }

      // Ensure tooltip doesn't go off screen horizontally
      const padding = 16
      if (left < scrollX + padding) {
        left = scrollX + padding
      } else if (left + tooltipRect.width > viewportWidth + scrollX - padding) {
        left = viewportWidth + scrollX - tooltipRect.width - padding
      }
    }

    // Calculate vertical position for left/right tooltips
    if (finalSide === "left" || finalSide === "right") {
      switch (align) {
        case "start":
          top = triggerRect.top + scrollY
          break
        case "end":
          top = triggerRect.bottom + scrollY - tooltipRect.height
          break
        case "center":
        default:
          top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2
          break
      }

      // Ensure tooltip doesn't go off screen vertically
      const padding = 16
      if (top < scrollY + padding) {
        top = scrollY + padding
      } else if (top + tooltipRect.height > viewportHeight + scrollY - padding) {
        top = viewportHeight + scrollY - tooltipRect.height - padding
      }
    }

    setPosition({ top, left })
    setActualSide(finalSide)
  }

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure tooltip is rendered before calculating position
      const timer = setTimeout(calculatePosition, 10)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  useEffect(() => {
    const handleScroll = () => {
      if (isVisible) {
        calculatePosition()
      }
    }

    const handleResize = () => {
      if (isVisible) {
        calculatePosition()
      }
    }

    window.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleResize)
    }
  }, [isVisible])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && content && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-[9999] px-4 py-3 text-sm text-white bg-slate-900 dark:bg-slate-800 rounded-lg shadow-xl border border-slate-700 pointer-events-none transition-opacity duration-200 max-w-sm",
            "before:absolute before:w-3 before:h-3 before:bg-slate-900 dark:before:bg-slate-800 before:border-slate-700 before:rotate-45",
            actualSide === "top" &&
              "before:bottom-[-6px] before:left-1/2 before:-translate-x-1/2 before:border-r before:border-b",
            actualSide === "bottom" &&
              "before:top-[-6px] before:left-1/2 before:-translate-x-1/2 before:border-l before:border-t",
            actualSide === "left" &&
              "before:right-[-6px] before:top-1/2 before:-translate-y-1/2 before:border-t before:border-r",
            actualSide === "right" &&
              "before:left-[-6px] before:top-1/2 before:-translate-y-1/2 before:border-b before:border-l",
            className,
          )}
          style={{
            top: position.top,
            left: position.left,
          }}
          role="tooltip"
          aria-hidden="true"
        >
          {content}
        </div>
      )}
    </>
  )
}
