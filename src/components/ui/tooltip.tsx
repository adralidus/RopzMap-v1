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
  delay = 500,
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

    // Calculate position based on preferred side
    switch (side) {
      case "top":
        top = triggerRect.top + scrollY - tooltipRect.height - 8
        if (top < scrollY) {
          // Not enough space above, show below
          top = triggerRect.bottom + scrollY + 8
          finalSide = "bottom"
        }
        break
      case "bottom":
        top = triggerRect.bottom + scrollY + 8
        if (top + tooltipRect.height > viewportHeight + scrollY) {
          // Not enough space below, show above
          top = triggerRect.top + scrollY - tooltipRect.height - 8
          finalSide = "top"
        }
        break
      case "left":
        left = triggerRect.left + scrollX - tooltipRect.width - 8
        if (left < scrollX) {
          // Not enough space left, show right
          left = triggerRect.right + scrollX + 8
          finalSide = "right"
        }
        break
      case "right":
        left = triggerRect.right + scrollX + 8
        if (left + tooltipRect.width > viewportWidth + scrollX) {
          // Not enough space right, show left
          left = triggerRect.left + scrollX - tooltipRect.width - 8
          finalSide = "left"
        }
        break
    }

    // Calculate left/right position for top/bottom sides
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
      if (left < scrollX + 8) {
        left = scrollX + 8
      } else if (left + tooltipRect.width > viewportWidth + scrollX - 8) {
        left = viewportWidth + scrollX - tooltipRect.width - 8
      }
    }

    // Calculate top/bottom position for left/right sides
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
      if (top < scrollY + 8) {
        top = scrollY + 8
      } else if (top + tooltipRect.height > viewportHeight + scrollY - 8) {
        top = viewportHeight + scrollY - tooltipRect.height - 8
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
      calculatePosition()
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
            "fixed z-50 px-3 py-2 text-sm text-white bg-slate-900 dark:bg-slate-700 rounded-md shadow-lg pointer-events-none transition-opacity duration-200",
            "before:absolute before:w-2 before:h-2 before:bg-slate-900 dark:before:bg-slate-700 before:rotate-45",
            actualSide === "top" && "before:bottom-[-4px] before:left-1/2 before:-translate-x-1/2",
            actualSide === "bottom" && "before:top-[-4px] before:left-1/2 before:-translate-x-1/2",
            actualSide === "left" && "before:right-[-4px] before:top-1/2 before:-translate-y-1/2",
            actualSide === "right" && "before:left-[-4px] before:top-1/2 before:-translate-y-1/2",
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
