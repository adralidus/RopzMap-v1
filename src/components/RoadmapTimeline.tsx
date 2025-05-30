"use client"

import type React from "react"
import { useState, useMemo, useRef } from "react"
import { Plus, X, FileImage } from "lucide-react"
import type { Roadmap, RoadmapItem as RoadmapItemType } from "../types"
import RoadmapItem from "./RoadmapItem"
import PrintableRoadmap from "./PrintableRoadmap"
import ExportDialog from "./ExportDialog"
import { getRoadmapDateRange, calculateItemPosition, getCategoryColor, assignItemRows } from "../utils/helpers"
import ItemFormModal from "./ItemFormModal"
import { useRoadmap } from "../context/RoadmapContext"
import { useToast } from "@/hooks/use-toast"

interface RoadmapTimelineProps {
  roadmap: Roadmap
}

const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({ roadmap }) => {
  const { updateRoadmap, updateRoadmapItem, deleteRoadmapItem, addRoadmapItem } = useRoadmap()
  const { toast } = useToast()
  const [editingItem, setEditingItem] = useState<RoadmapItemType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState("")
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Calculate date range for the timeline
  const { start: timelineStart, end: timelineEnd } = useMemo(() => getRoadmapDateRange(roadmap), [roadmap])

  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime()

  // Generate month labels for the timeline
  const monthLabels = useMemo(() => {
    const labels = []
    const currentDate = new Date(timelineStart)
    while (currentDate <= timelineEnd) {
      labels.push({
        date: new Date(currentDate),
        label: currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    return labels
  }, [timelineStart, timelineEnd])

  // Group items by category and assign rows to prevent overlaps
  const itemsByCategory = useMemo(() => {
    const groupedItems: Record<string, Array<RoadmapItemType & { row: number }>> = {}

    roadmap.categories.forEach((category) => {
      const categoryItems = roadmap.items.filter((item) => item.category === category)
      groupedItems[category] = assignItemRows(categoryItems)
    })

    return groupedItems
  }, [roadmap.items, roadmap.categories])

  // Calculate the height needed for each category based on number of rows
  const categoryHeights = useMemo(() => {
    const heights: Record<string, number> = {}

    roadmap.categories.forEach((category) => {
      const items = itemsByCategory[category] || []
      const maxRow = items.length > 0 ? Math.max(...items.map((item) => item.row)) : -1
      // Each row is 32px + 8px gap, minimum height is 40px
      heights[category] = Math.max(40, (maxRow + 1) * 40)
    })

    return heights
  }, [itemsByCategory, roadmap.categories])

  const handleAddItem = () => {
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const handleEditItem = (item: RoadmapItemType) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleSaveItem = (item: RoadmapItemType) => {
    if (editingItem) {
      updateRoadmapItem(item)
    } else {
      addRoadmapItem(item)
    }
    handleCloseModal()
  }

  const handleDeleteItem = (id: string) => {
    deleteRoadmapItem(id)
  }

  const handleDragUpdate = (item: RoadmapItemType, newStartDate: Date, newEndDate: Date) => {
    const updatedItem = {
      ...item,
      startDate: newStartDate,
      endDate: newEndDate,
    }
    updateRoadmapItem(updatedItem)
  }

  const handleDragOver = (e: React.DragEvent, category?: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (category) {
      setDragOverCategory(category)
    }
  }

  const handleDragLeave = () => {
    setDragOverCategory(null)
  }

  const handleDrop = (e: React.DragEvent, category: string) => {
    e.preventDefault()
    setDragOverCategory(null)

    const itemId = e.dataTransfer.getData("text/plain")
    const draggedItem = roadmap.items.find((item) => item.id === itemId)

    if (!draggedItem || !timelineRef.current) return

    const rect = e.currentTarget.getBoundingClientRect()
    const dropX = e.clientX - rect.left
    const containerWidth = rect.width

    // Calculate new position as percentage
    const newPositionPercent = Math.max(0, Math.min(100, (dropX / containerWidth) * 100))

    // Calculate item duration
    const itemDuration = draggedItem.endDate.getTime() - draggedItem.startDate.getTime()

    // Calculate new dates
    const newStartTime = timelineStart.getTime() + (timelineDuration * newPositionPercent) / 100
    const newStartDate = new Date(newStartTime)
    const newEndDate = new Date(newStartTime + itemDuration)

    // Update the item with new dates and potentially new category
    const updatedItem = {
      ...draggedItem,
      startDate: newStartDate,
      endDate: newEndDate,
      category: category,
    }

    updateRoadmapItem(updatedItem)
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategory.trim() && !roadmap.categories.includes(newCategory.trim())) {
      const updatedRoadmap = {
        ...roadmap,
        categories: [...roadmap.categories, newCategory.trim()],
      }
      updateRoadmap(updatedRoadmap)
      setNewCategory("")
    }
  }

  const handleRemoveCategory = (categoryToRemove: string) => {
    // Remove category and update items with this category to use the first available category
    const updatedCategories = roadmap.categories.filter((c) => c !== categoryToRemove)
    const defaultCategory = updatedCategories[0] || ""

    const updatedItems = roadmap.items.map((item) =>
      item.category === categoryToRemove ? { ...item, category: defaultCategory } : item,
    )

    const updatedRoadmap = {
      ...roadmap,
      categories: updatedCategories,
      items: updatedItems,
    }

    updateRoadmap(updatedRoadmap)
    if (selectedCategory === categoryToRemove) {
      setSelectedCategory(null)
    }
  }

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category)
  }

  return (
    <>
      {/* Add data attribute for export targeting */}
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-colors duration-200"
        data-timeline-container
      >
        {/* Timeline header with month labels */}
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{roadmap.title}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExportDialog(true)}
                disabled={roadmap.items.length === 0}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md transition-colors ${
                  roadmap.items.length === 0
                    ? "text-gray-400 bg-gray-300 cursor-not-allowed"
                    : "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
                title={roadmap.items.length === 0 ? "Add items to export roadmap" : "Export roadmap"}
              >
                <FileImage className="h-4 w-4 mr-1" />
                Export
              </button>

              <button
                onClick={handleAddItem}
                disabled={roadmap.categories.length === 0}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md transition-colors ${
                  roadmap.categories.length === 0
                    ? "text-gray-400 bg-gray-300 cursor-not-allowed"
                    : "text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
                title={
                  roadmap.categories.length === 0
                    ? "Add categories first before creating items"
                    : "Add new roadmap item"
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>
          </div>

          {/* Category management */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category"
                className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
              />
              <button
                onClick={handleAddCategory}
                className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {roadmap.categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`group relative px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedCategory === category
                      ? `${getCategoryColor(category, index).replace("bg-", "bg-opacity-100 text-white bg-")}`
                      : `${getCategoryColor(category, index).replace("bg-", "bg-opacity-10 text-")}`
                  }`}
                >
                  {category}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveCategory(category)
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </button>
              ))}
            </div>
          </div>

          {/* Month labels */}
          <div className="relative flex mt-6">
            {monthLabels.map((month, index) => (
              <div key={index} className="flex-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                {month.label}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline grid with swimlanes */}
        <div className="p-6" ref={timelineRef}>
          {/* Timeline background grid */}
          <div className="relative">
            <div className="absolute inset-0 grid grid-cols-12 gap-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="col-span-1 border-l border-slate-200 dark:border-slate-700 h-full" />
              ))}
            </div>

            {/* Swimlanes by category - only show categories with items */}
            <div className="relative space-y-8">
              {roadmap.categories
                .filter((category) => roadmap.items.some((item) => item.category === category))
                .map((category, categoryIndex) => (
                  <div key={category} className="relative">
                    <div className="flex items-center mb-2">
                      <div className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(category, categoryIndex)}`} />
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{category}</h3>
                    </div>

                    <div
                      className={`relative bg-slate-50 dark:bg-slate-900 rounded-md overflow-hidden transition-all duration-200 ${
                        dragOverCategory === category ? "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-400" : ""
                      }`}
                      style={{ height: `${Math.max(80, categoryHeights[category])}px` }}
                      onDragOver={(e) => handleDragOver(e, category)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, category)}
                    >
                      {itemsByCategory[category]?.map((item) => (
                        <RoadmapItem
                          key={item.id}
                          item={item}
                          style={calculateItemPosition(item, timelineStart, timelineDuration)}
                          categoryColor={getCategoryColor(category, categoryIndex)}
                          onEdit={handleEditItem}
                          onDelete={handleDeleteItem}
                          onDragUpdate={handleDragUpdate}
                          timelineStart={timelineStart}
                          timelineDuration={timelineDuration}
                        />
                      ))}

                      {/* Drop zone indicator */}
                      {dragOverCategory === category && (
                        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-md pointer-events-none flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-sm font-medium bg-white dark:bg-slate-800 px-2 py-1 rounded">
                            Drop here to move to {category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Item edit modal */}
        {isModalOpen && (
          <ItemFormModal
            item={editingItem}
            categories={roadmap.categories}
            onClose={handleCloseModal}
            onSave={handleSaveItem}
          />
        )}
      </div>

      {/* Hidden printable version */}
      <PrintableRoadmap roadmap={roadmap} />

      {/* Export dialog */}
      <ExportDialog roadmap={roadmap} isOpen={showExportDialog} onClose={() => setShowExportDialog(false)} />
    </>
  )
}

export default RoadmapTimeline
