import type { Roadmap, RoadmapItem } from "../types"

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Format date for display
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Create a new empty roadmap
export const createEmptyRoadmap = (title = "Untitled Roadmap"): Roadmap => {
  const now = new Date()
  return {
    id: generateId(),
    title,
    description: "",
    items: [],
    categories: ["Planning", "Development", "Testing", "Launch"], // Add default categories
    createdAt: now,
    updatedAt: now,
  }
}

// Create a roadmap from a template
export const createRoadmapFromTemplate = (title: string, description: string, categories: string[]): Roadmap => {
  const now = new Date()
  return {
    id: generateId(),
    title,
    description,
    items: [],
    categories,
    createdAt: now,
    updatedAt: now,
  }
}

// Get the earliest and latest dates in a roadmap
export const getRoadmapDateRange = (roadmap: Roadmap): { start: Date; end: Date } => {
  if (!roadmap.items.length) {
    const now = new Date()
    const threeMonthsLater = new Date(now)
    threeMonthsLater.setMonth(now.getMonth() + 3)
    return { start: now, end: threeMonthsLater }
  }

  const dates = roadmap.items.flatMap((item) => [item.startDate, item.endDate])
  const start = new Date(Math.min(...dates.map((date) => date.getTime())))
  const end = new Date(Math.max(...dates.map((date) => date.getTime())))
  return { start, end }
}

// Check if two date ranges overlap
const dateRangesOverlap = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
  return start1 <= end2 && start2 <= end1
}

// Assign rows to items to prevent overlaps (waterfall layout)
export const assignItemRows = (items: RoadmapItem[]): Array<RoadmapItem & { row: number }> => {
  if (items.length === 0) return []

  // Sort items by start date
  const sortedItems = [...items].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  const itemsWithRows: Array<RoadmapItem & { row: number }> = []
  const rows: Array<{ endDate: Date }> = []

  for (const item of sortedItems) {
    let assignedRow = 0

    // Find the first available row where this item doesn't overlap
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      if (item.startDate >= rows[rowIndex].endDate) {
        assignedRow = rowIndex
        break
      }
      assignedRow = rowIndex + 1
    }

    // Update or create the row
    if (assignedRow >= rows.length) {
      rows.push({ endDate: item.endDate })
    } else {
      rows[assignedRow] = { endDate: item.endDate }
    }

    itemsWithRows.push({ ...item, row: assignedRow })
  }

  return itemsWithRows
}

// Calculate item position on timeline with row offset
export const calculateItemPosition = (
  item: RoadmapItem & { row: number },
  timelineStart: Date,
  timelineDuration: number,
): { left: string; width: string; top: string } => {
  const itemStartTime = item.startDate.getTime()
  const itemEndTime = item.endDate.getTime()
  const timelineStartTime = timelineStart.getTime()

  const startPosition = ((itemStartTime - timelineStartTime) / timelineDuration) * 100
  const duration = ((itemEndTime - itemStartTime) / timelineDuration) * 100

  // Each row is 60px high with 16px gap
  const rowHeight = 60
  const rowGap = 16
  const topOffset = item.row * (rowHeight + rowGap)

  return {
    left: `${Math.max(0, Math.min(100, startPosition))}%`,
    width: `${Math.max(0, Math.min(100 - startPosition, duration))}%`,
    top: `${topOffset}px`,
  }
}

// Generate category colors
export const getCategoryColor = (category: string, index: number): string => {
  const colors = [
    "bg-blue-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-sky-500",
  ]

  // Use the index if available, otherwise hash the category string
  if (index >= 0) {
    return colors[index % colors.length]
  }

  // Simple hash function for strings
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash + category.charCodeAt(i)) % colors.length
  }

  return colors[hash]
}

// Export roadmap as JSON
export const exportRoadmapAsJson = (roadmap: Roadmap): void => {
  const dataStr = JSON.stringify(roadmap, null, 2)
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

  const exportFileDefaultName = `${roadmap.title.replace(/\s+/g, "-").toLowerCase()}-roadmap.json`

  const linkElement = document.createElement("a")
  linkElement.setAttribute("href", dataUri)
  linkElement.setAttribute("download", exportFileDefaultName)
  linkElement.click()
}
