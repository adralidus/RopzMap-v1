import html2canvas from "html2canvas"
import type { Roadmap } from "../types"

export type ImageFormat = "png" | "jpeg" | "svg"

interface ExportOptions {
  format: ImageFormat
  quality?: number
  scale?: number
  backgroundColor?: string
  filename?: string
}

/**
 * Exports the roadmap timeline view to an image file
 */
export const exportTimelineToImage = async (roadmap: Roadmap, options: ExportOptions): Promise<void> => {
  const { format, quality = 0.95, scale = 2, backgroundColor = "#ffffff", filename } = options

  // Default filename based on roadmap title and format
  const defaultFilename = `${roadmap.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_roadmap.${format}`
  const outputFilename = filename || defaultFilename

  try {
    // Find the timeline container element
    const timelineElement = document.querySelector("[data-timeline-container]") as HTMLElement

    if (!timelineElement) {
      throw new Error("Timeline container not found")
    }

    // For SVG export
    if (format === "svg") {
      await exportTimelineToSVG(timelineElement, outputFilename, roadmap)
      return
    }

    // For PNG and JPEG - capture the actual timeline view
    const canvas = await html2canvas(timelineElement, {
      scale,
      backgroundColor,
      logging: false,
      allowTaint: true,
      useCORS: true,
      width: timelineElement.scrollWidth,
      height: timelineElement.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: timelineElement.scrollWidth,
      windowHeight: timelineElement.scrollHeight,
    })

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob!)
        },
        `image/${format}`,
        quality,
      )
    })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = outputFilename
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting image:", error)
    throw new Error(`Failed to export as ${format.toUpperCase()}`)
  }
}

/**
 * Exports the timeline to SVG format
 */
const exportTimelineToSVG = async (element: HTMLElement, filename: string, roadmap: Roadmap): Promise<void> => {
  try {
    // Get the element's dimensions and styles
    const rect = element.getBoundingClientRect()
    const width = element.scrollWidth
    const height = element.scrollHeight

    // Create a serialized version of the element
    const serializer = new XMLSerializer()
    const clonedElement = element.cloneNode(true) as HTMLElement

    // Apply inline styles to ensure they're preserved in SVG
    applyInlineStyles(clonedElement, element)

    // Create SVG with foreign object containing the HTML
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <defs>
          <style>
            <![CDATA[
              * { box-sizing: border-box; }
              .bg-blue-500 { background-color: #3b82f6; }
              .bg-teal-500 { background-color: #14b8a6; }
              .bg-indigo-500 { background-color: #6366f1; }
              .bg-purple-500 { background-color: #8b5cf6; }
              .bg-rose-500 { background-color: #f43f5e; }
              .bg-amber-500 { background-color: #f59e0b; }
              .bg-emerald-500 { background-color: #10b981; }
              .bg-sky-500 { background-color: #0ea5e9; }
              .text-white { color: white; }
              .text-slate-900 { color: #0f172a; }
              .text-slate-700 { color: #334155; }
              .text-slate-500 { color: #64748b; }
              .text-slate-300 { color: #cbd5e1; }
              .bg-white { background-color: white; }
              .bg-slate-50 { background-color: #f8fafc; }
              .bg-slate-800 { background-color: #1e293b; }
              .bg-slate-900 { background-color: #0f172a; }
              .border-slate-200 { border-color: #e2e8f0; }
              .border-slate-700 { border-color: #334155; }
              .rounded-md { border-radius: 0.375rem; }
              .rounded-lg { border-radius: 0.5rem; }
              .shadow { box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); }
            ]]>
          </style>
        </defs>
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${clonedElement.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `

    // Create blob and download
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting SVG:", error)
    throw new Error("Failed to export as SVG")
  }
}

/**
 * Apply inline styles to preserve appearance in SVG
 */
const applyInlineStyles = (clonedElement: HTMLElement, originalElement: HTMLElement): void => {
  const computedStyle = window.getComputedStyle(originalElement)

  // Apply key styles inline
  clonedElement.style.cssText = `
    width: ${computedStyle.width};
    height: ${computedStyle.height};
    background-color: ${computedStyle.backgroundColor};
    color: ${computedStyle.color};
    font-family: ${computedStyle.fontFamily};
    font-size: ${computedStyle.fontSize};
    font-weight: ${computedStyle.fontWeight};
    padding: ${computedStyle.padding};
    margin: ${computedStyle.margin};
    border: ${computedStyle.border};
    border-radius: ${computedStyle.borderRadius};
    position: ${computedStyle.position};
  `

  // Recursively apply styles to children
  const originalChildren = originalElement.children
  const clonedChildren = clonedElement.children

  for (let i = 0; i < originalChildren.length; i++) {
    if (originalChildren[i] instanceof HTMLElement && clonedChildren[i] instanceof HTMLElement) {
      applyInlineStyles(clonedChildren[i] as HTMLElement, originalChildren[i] as HTMLElement)
    }
  }
}
