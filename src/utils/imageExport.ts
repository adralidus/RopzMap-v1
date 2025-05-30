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
    // Create a temporary export-optimized timeline
    const exportContainer = await createExportOptimizedTimeline(roadmap)
    document.body.appendChild(exportContainer)

    // For SVG export
    if (format === "svg") {
      await exportTimelineToSVG(exportContainer, outputFilename, roadmap)
      document.body.removeChild(exportContainer)
      return
    }

    // For PNG and JPEG - capture the export-optimized timeline
    const canvas = await html2canvas(exportContainer, {
      scale: Math.max(scale, 3), // Minimum scale of 3 for better text readability
      backgroundColor,
      logging: false,
      allowTaint: true,
      useCORS: true,
      width: exportContainer.scrollWidth,
      height: exportContainer.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: exportContainer.scrollWidth,
      windowHeight: exportContainer.scrollHeight,
    })

    // Clean up the temporary container
    document.body.removeChild(exportContainer)

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
 * Creates an export-optimized timeline with larger text and better proportions
 */
const createExportOptimizedTimeline = async (roadmap: Roadmap): Promise<HTMLElement> => {
  // Import helper functions
  const { getRoadmapDateRange, assignItemRows, getCategoryColor } = await import("./helpers")

  const { start: timelineStart, end: timelineEnd } = getRoadmapDateRange(roadmap)
  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime()

  // Create container with export-optimized dimensions
  const container = document.createElement("div")
  container.style.cssText = `
    width: 1400px;
    min-height: 800px;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: absolute;
    top: -10000px;
    left: -10000px;
    padding: 40px;
    box-sizing: border-box;
  `

  // Create header
  const header = document.createElement("div")
  header.style.cssText = `
    margin-bottom: 40px;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 20px;
  `

  const title = document.createElement("h1")
  title.textContent = roadmap.title
  title.style.cssText = `
    font-size: 32px;
    font-weight: bold;
    color: #1e293b;
    margin: 0 0 16px 0;
  `

  const description = document.createElement("p")
  description.textContent = roadmap.description || ""
  description.style.cssText = `
    font-size: 16px;
    color: #64748b;
    margin: 0;
  `

  header.appendChild(title)
  if (roadmap.description) {
    header.appendChild(description)
  }

  // Create month labels
  const monthLabels = []
  const currentDate = new Date(timelineStart)
  while (currentDate <= timelineEnd) {
    monthLabels.push({
      date: new Date(currentDate),
      label: currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    })
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  const monthContainer = document.createElement("div")
  monthContainer.style.cssText = `
    display: flex;
    margin-bottom: 20px;
    padding-left: 200px;
  `

  monthLabels.forEach((month) => {
    const monthLabel = document.createElement("div")
    monthLabel.textContent = month.label
    monthLabel.style.cssText = `
      flex: 1;
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
    `
    monthContainer.appendChild(monthLabel)
  })

  // Create timeline content
  const timelineContainer = document.createElement("div")
  timelineContainer.style.cssText = `
    position: relative;
  `

  // Group items by category and assign rows
  const itemsByCategory: Record<string, Array<any>> = {}
  roadmap.categories.forEach((category) => {
    const categoryItems = roadmap.items.filter((item) => item.category === category)
    if (categoryItems.length > 0) {
      itemsByCategory[category] = assignItemRows(categoryItems)
    }
  })

  // Create category swimlanes
  let currentY = 0
  Object.entries(itemsByCategory).forEach(([category, items], categoryIndex) => {
    // Category header
    const categoryHeader = document.createElement("div")
    categoryHeader.style.cssText = `
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      margin-top: ${currentY > 0 ? "40px" : "0"};
    `

    const categoryDot = document.createElement("div")
    const categoryColor = getCategoryColor(category, categoryIndex)
    const colorMap: Record<string, string> = {
      "bg-blue-500": "#3b82f6",
      "bg-teal-500": "#14b8a6",
      "bg-indigo-500": "#6366f1",
      "bg-purple-500": "#8b5cf6",
      "bg-rose-500": "#f43f5e",
      "bg-amber-500": "#f59e0b",
      "bg-emerald-500": "#10b981",
      "bg-sky-500": "#0ea5e9",
    }

    categoryDot.style.cssText = `
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: ${colorMap[categoryColor] || "#3b82f6"};
      margin-right: 12px;
    `

    const categoryLabel = document.createElement("h3")
    categoryLabel.textContent = category
    categoryLabel.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin: 0;
    `

    categoryHeader.appendChild(categoryDot)
    categoryHeader.appendChild(categoryLabel)

    // Category swimlane
    const maxRow = items.length > 0 ? Math.max(...items.map((item: any) => item.row)) : 0
    const swimlaneHeight = Math.max(120, (maxRow + 1) * 100 + 40)

    const swimlane = document.createElement("div")
    swimlane.style.cssText = `
      position: relative;
      height: ${swimlaneHeight}px;
      background-color: #f8fafc;
      border-radius: 8px;
      margin-bottom: 20px;
      margin-left: 200px;
      border: 1px solid #e2e8f0;
    `

    // Add grid lines
    for (let i = 1; i < monthLabels.length; i++) {
      const gridLine = document.createElement("div")
      gridLine.style.cssText = `
        position: absolute;
        left: ${(i / (monthLabels.length - 1)) * 100}%;
        top: 0;
        bottom: 0;
        width: 1px;
        background-color: #e2e8f0;
      `
      swimlane.appendChild(gridLine)
    }

    // Add items
    items.forEach((item: any) => {
      const itemStartTime = item.startDate.getTime()
      const itemEndTime = item.endDate.getTime()
      const timelineStartTime = timelineStart.getTime()

      const startPosition = ((itemStartTime - timelineStartTime) / timelineDuration) * 100
      const duration = ((itemEndTime - itemStartTime) / timelineDuration) * 100

      const itemElement = document.createElement("div")
      itemElement.style.cssText = `
        position: absolute;
        left: ${Math.max(0, Math.min(100, startPosition))}%;
        width: ${Math.max(5, Math.min(100 - startPosition, duration))}%;
        top: ${item.row * 100 + 20}px;
        height: 80px;
        background-color: ${colorMap[categoryColor] || "#3b82f6"};
        border-radius: 8px;
        padding: 12px 16px;
        color: white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-width: 200px;
        overflow: hidden;
      `

      const itemTitle = document.createElement("div")
      itemTitle.textContent = item.title
      itemTitle.style.cssText = `
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `

      const itemDates = document.createElement("div")
      itemDates.textContent = `${item.startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} → ${item.endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`
      itemDates.style.cssText = `
        font-size: 12px;
        opacity: 0.9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `

      // Progress bar
      const progressBar = document.createElement("div")
      progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background-color: rgba(0, 0, 0, 0.2);
      `

      const progressFill = document.createElement("div")
      const progressColor = item.progress === 100 ? "#10b981" : item.progress > 0 ? "#f59e0b" : "#ef4444"
      progressFill.style.cssText = `
        height: 100%;
        width: ${item.progress}%;
        background-color: ${progressColor};
      `

      progressBar.appendChild(progressFill)
      itemElement.appendChild(itemTitle)
      itemElement.appendChild(itemDates)
      itemElement.appendChild(progressBar)
      swimlane.appendChild(itemElement)
    })

    // Position category header
    categoryHeader.style.marginLeft = "0"

    timelineContainer.appendChild(categoryHeader)
    timelineContainer.appendChild(swimlane)
    currentY += swimlaneHeight + 60
  })

  container.appendChild(header)
  container.appendChild(monthContainer)
  container.appendChild(timelineContainer)

  return container
}

/**
 * Exports the timeline to SVG format
 */
const exportTimelineToSVG = async (element: HTMLElement, filename: string, roadmap: Roadmap): Promise<void> => {
  try {
    // Get the element's dimensions and styles
    const width = element.scrollWidth
    const height = element.scrollHeight

    // Create a serialized version of the element
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
