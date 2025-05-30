import jsPDF from "jspdf"
import "jspdf-autotable"
import type { Roadmap } from "../types"
import { formatDate, getRoadmapDateRange, assignItemRows } from "./helpers"

// Extend jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface PDFExportOptions {
  includeDescription?: boolean
  pageOrientation?: "portrait" | "landscape"
  colorScheme?: "color" | "grayscale"
}

export const exportRoadmapToPDF = async (roadmap: Roadmap, options: PDFExportOptions = {}): Promise<void> => {
  const { includeDescription = true, pageOrientation = "landscape", colorScheme = "color" } = options

  // Create PDF document
  const pdf = new jsPDF({
    orientation: pageOrientation,
    unit: "mm",
    format: "a4",
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  const contentHeight = pageHeight - margin * 2

  // Color palette
  const colors = {
    primary: colorScheme === "color" ? [59, 130, 246] : [100, 100, 100],
    secondary: colorScheme === "color" ? [148, 163, 184] : [150, 150, 150],
    success: colorScheme === "color" ? [34, 197, 94] : [120, 120, 120],
    warning: colorScheme === "color" ? [251, 191, 36] : [140, 140, 140],
    danger: colorScheme === "color" ? [239, 68, 68] : [80, 80, 80],
    text: [30, 30, 30],
    lightGray: [245, 245, 245],
    white: [255, 255, 255],
  }

  // Helper function to add header
  const addHeader = (title: string, pageNum?: number) => {
    pdf.setFontSize(20)
    pdf.setTextColor(...colors.primary)
    pdf.text(title, margin, margin + 10)

    if (pageNum) {
      pdf.setFontSize(10)
      pdf.setTextColor(...colors.secondary)
      pdf.text(`Page ${pageNum}`, pageWidth - margin - 20, margin + 5)
    }

    // Add line under header
    pdf.setDrawColor(...colors.secondary)
    pdf.setLineWidth(0.5)
    pdf.line(margin, margin + 15, pageWidth - margin, margin + 15)
  }

  // Calculate project statistics
  const { start: projectStart, end: projectEnd } = getRoadmapDateRange(roadmap)
  const totalItems = roadmap.items.length
  const completedItems = roadmap.items.filter((item) => item.progress === 100).length
  const inProgressItems = roadmap.items.filter((item) => item.progress > 0 && item.progress < 100).length
  const notStartedItems = roadmap.items.filter((item) => item.progress === 0).length
  const overallProgress =
    totalItems > 0 ? Math.round(roadmap.items.reduce((sum, item) => sum + item.progress, 0) / totalItems) : 0

  // Calculate project status
  const today = new Date()
  const isOverdue = projectEnd < today && overallProgress < 100
  const isOnTrack = !isOverdue && overallProgress >= 50
  const projectStatus = isOverdue ? "Overdue" : isOnTrack ? "On Track" : "At Risk"

  // Page 1: Timeline Visualization
  addHeader(`${roadmap.title} - Timeline`, 1)

  // Add roadmap description
  if (roadmap.description) {
    pdf.setFontSize(12)
    pdf.setTextColor(...colors.text)
    const descriptionLines = pdf.splitTextToSize(roadmap.description, contentWidth)
    pdf.text(descriptionLines, margin, margin + 25)
  }

  // Timeline setup
  const timelineY = margin + 50
  const timelineHeight = contentHeight - 100
  const timelineWidth = contentWidth - 100
  const timelineX = margin + 50

  // Draw timeline background
  pdf.setFillColor(...colors.lightGray)
  pdf.rect(timelineX, timelineY, timelineWidth, timelineHeight, "F")

  // Calculate timeline scale
  const timelineDuration = projectEnd.getTime() - projectStart.getTime()
  const itemsWithRows = assignItemRows(roadmap.items)
  const maxRow = itemsWithRows.length > 0 ? Math.max(...itemsWithRows.map((item) => item.row)) : 0
  const rowHeight = Math.min(20, timelineHeight / (maxRow + 2))

  // Draw month labels
  pdf.setFontSize(8)
  pdf.setTextColor(...colors.text)
  const currentDate = new Date(projectStart)
  const monthPositions: { date: Date; x: number; label: string }[] = []

  while (currentDate <= projectEnd) {
    const position = ((currentDate.getTime() - projectStart.getTime()) / timelineDuration) * timelineWidth
    const label = currentDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" })

    monthPositions.push({
      date: new Date(currentDate),
      x: timelineX + position,
      label,
    })

    // Draw month line
    pdf.setDrawColor(...colors.secondary)
    pdf.setLineWidth(0.3)
    pdf.line(timelineX + position, timelineY, timelineX + position, timelineY + timelineHeight)

    // Add month label
    pdf.text(label, timelineX + position - 8, timelineY - 5)

    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  // Draw category swimlanes and items
  let currentY = timelineY + 10
  const categoryColors = [
    colors.primary,
    [16, 185, 129], // emerald
    [139, 92, 246], // violet
    [236, 72, 153], // pink
    [245, 158, 11], // amber
    [239, 68, 68], // red
    [6, 182, 212], // cyan
    [132, 204, 22], // lime
  ]

  roadmap.categories.forEach((category, categoryIndex) => {
    const categoryItems = itemsWithRows.filter((item) => item.category === category)

    if (categoryItems.length === 0) return

    // Draw category label
    pdf.setFontSize(10)
    pdf.setTextColor(...colors.text)
    pdf.text(category, margin, currentY + 5)

    // Draw category items
    categoryItems.forEach((item) => {
      const itemStartPos = ((item.startDate.getTime() - projectStart.getTime()) / timelineDuration) * timelineWidth
      const itemDuration = ((item.endDate.getTime() - item.startDate.getTime()) / timelineDuration) * timelineWidth
      const itemY = currentY + item.row * (rowHeight + 2)

      // Draw item background
      const itemColor =
        colorScheme === "color" ? categoryColors[categoryIndex % categoryColors.length] : [120, 120, 120]

      pdf.setFillColor(...itemColor)
      pdf.rect(timelineX + itemStartPos, itemY, Math.max(itemDuration, 10), rowHeight - 2, "F")

      // Draw progress bar
      if (item.progress > 0) {
        const progressColor = item.progress === 100 ? colors.success : colors.warning
        pdf.setFillColor(...progressColor)
        const progressWidth = (itemDuration * item.progress) / 100
        pdf.rect(timelineX + itemStartPos, itemY + rowHeight - 4, progressWidth, 2, "F")
      }

      // Add item text
      pdf.setFontSize(7)
      pdf.setTextColor(...colors.white)
      const itemText = pdf.splitTextToSize(item.title, Math.max(itemDuration - 2, 20))
      pdf.text(itemText[0] || "", timelineX + itemStartPos + 2, itemY + 8)
    })

    const maxRowInCategory = categoryItems.length > 0 ? Math.max(...categoryItems.map((item) => item.row)) : 0
    currentY += (maxRowInCategory + 1) * (rowHeight + 2) + 10
  })

  // Add legend
  const legendY = timelineY + timelineHeight + 10
  pdf.setFontSize(8)
  pdf.setTextColor(...colors.text)
  pdf.text("Legend:", margin, legendY)

  // Progress indicators
  pdf.setFillColor(...colors.success)
  pdf.rect(margin + 30, legendY - 3, 8, 3, "F")
  pdf.text("Completed", margin + 42, legendY)

  pdf.setFillColor(...colors.warning)
  pdf.rect(margin + 90, legendY - 3, 8, 3, "F")
  pdf.text("In Progress", margin + 102, legendY)

  // Page 2: Summary Table
  pdf.addPage()
  addHeader(`${roadmap.title} - Project Summary`, 2)

  // Project Overview Table
  const overviewData = [
    ["Project Title", roadmap.title],
    ["Description", roadmap.description || "No description provided"],
    ["Start Date", formatDate(projectStart)],
    ["End Date", formatDate(projectEnd)],
    ["Total Duration", `${Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))} days`],
    ["Project Status", projectStatus],
    ["Overall Progress", `${overallProgress}%`],
    ["Last Updated", formatDate(roadmap.updatedAt)],
  ]

  pdf.autoTable({
    startY: margin + 30,
    head: [["Project Information", "Details"]],
    body: overviewData,
    theme: "grid",
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.white,
      fontSize: 12,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
      textColor: colors.text,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 120 },
    },
    margin: { left: margin, right: margin },
  })

  // Items Summary Table
  const itemsData = roadmap.items.map((item) => [
    item.title,
    item.category,
    formatDate(item.startDate),
    formatDate(item.endDate),
    `${item.progress}%`,
    item.progress === 100 ? "Completed" : item.progress > 0 ? "In Progress" : "Not Started",
  ])

  pdf.autoTable({
    startY: (pdf as any).lastAutoTable.finalY + 20,
    head: [["Item", "Category", "Start Date", "End Date", "Progress", "Status"]],
    body: itemsData,
    theme: "grid",
    headStyles: {
      fillColor: colors.primary,
      textColor: colors.white,
      fontSize: 10,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: colors.text,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
    },
    margin: { left: margin, right: margin },
  })

  // Statistics Summary
  const statsData = [
    ["Total Items", totalItems.toString()],
    ["Completed Items", completedItems.toString()],
    ["In Progress Items", inProgressItems.toString()],
    ["Not Started Items", notStartedItems.toString()],
    ["Categories", roadmap.categories.length.toString()],
    ["Completion Rate", `${Math.round((completedItems / totalItems) * 100)}%`],
  ]

  pdf.autoTable({
    startY: (pdf as any).lastAutoTable.finalY + 20,
    head: [["Statistics", "Count"]],
    body: statsData,
    theme: "grid",
    headStyles: {
      fillColor: colors.secondary,
      textColor: colors.white,
      fontSize: 12,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
      textColor: colors.text,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 40 },
    },
    margin: { left: margin, right: margin },
  })

  // Add footer with generation date
  const footerY = pageHeight - 10
  pdf.setFontSize(8)
  pdf.setTextColor(...colors.secondary)
  pdf.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, footerY)
  pdf.text("Created with RoadMapper", pageWidth - margin - 40, footerY)

  // Save the PDF
  const fileName = `${roadmap.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_roadmap.pdf`
  pdf.save(fileName)
}
