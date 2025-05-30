"use client"

import type React from "react"
import { useState } from "react"
import { Edit, Trash, CheckCircle, GripVertical, Calendar, User, BarChart3 } from "lucide-react"
import type { RoadmapItem as RoadmapItemType } from "../types"
import { formatDate } from "../utils/helpers"
import { Tooltip } from "./ui/tooltip"

interface RoadmapItemProps {
  item: RoadmapItemType & { row: number }
  style: {
    left: string
    width: string
    top: string
  }
  categoryColor: string
  onEdit: (item: RoadmapItemType) => void
  onDelete: (id: string) => void
  onDragUpdate: (item: RoadmapItemType, newStartDate: Date, newEndDate: Date) => void
  timelineStart: Date
  timelineDuration: number
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({
  item,
  style,
  categoryColor,
  onEdit,
  onDelete,
  onDragUpdate,
  timelineStart,
  timelineDuration,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)

  const progressColorClass =
    item.progress === 100
      ? "bg-green-500"
      : item.progress > 50
        ? "bg-blue-500"
        : item.progress > 25
          ? "bg-amber-500"
          : "bg-rose-500"

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)

    // Calculate the offset from the mouse position to the left edge of the item
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    setDragOffset(offsetX)

    // Set drag data
    e.dataTransfer.setData("text/plain", item.id)
    e.dataTransfer.effectAllowed = "move"

    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement
    dragImage.style.opacity = "0.8"
    dragImage.style.transform = "rotate(2deg)"
    document.body.appendChild(dragImage)
    e.dataTransfer.setDragImage(dragImage, offsetX, 20)

    // Clean up the drag image after a short delay
    setTimeout(() => {
      if (document.body.contains(dragImage)) {
        document.body.removeChild(dragImage)
      }
    }, 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Calculate duration in days
  const durationMs = item.endDate.getTime() - item.startDate.getTime()
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

  // Create detailed tooltip content
  const tooltipContent = (
    <div className="max-w-xs">
      <div className="font-semibold text-white mb-2">{item.title}</div>

      {item.description && <div className="text-slate-200 mb-3 text-sm leading-relaxed">{item.description}</div>}

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center text-slate-300">
          <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
          <span>
            {formatDate(item.startDate)} → {formatDate(item.endDate)}
          </span>
        </div>

        <div className="flex items-center text-slate-300">
          <BarChart3 className="h-3 w-3 mr-1.5 flex-shrink-0" />
          <span>Progress: {item.progress}%</span>
        </div>

        <div className="flex items-center text-slate-300">
          <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
          <span>Category: {item.category}</span>
        </div>

        <div className="flex items-center text-slate-300">
          <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
          <span>
            Duration: {durationDays} day{durationDays !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <Tooltip content={tooltipContent} side="top" align="center" delay={300}>
      <div
        className={`absolute ${categoryColor} rounded-md p-2 shadow-md transition-all duration-200 transform hover:scale-[1.02] hover:z-10 cursor-move overflow-hidden ${
          isDragging ? "opacity-50 scale-105 rotate-1 z-20" : ""
        }`}
        style={{
          left: style.left,
          width: style.width,
          top: style.top,
          height: "32px",
          minWidth: "120px",
          maxWidth: "100%",
        }}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between h-full text-white">
          <div className="flex items-center flex-1 min-w-0">
            <GripVertical className="h-3 w-3 mr-1 opacity-60 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-xs truncate leading-tight">{item.title}</h3>
              <div className="text-xs opacity-75 flex items-center leading-tight">
                <span className="truncate">{formatDate(item.startDate)}</span>
                <span className="mx-1">→</span>
                <span className="truncate">{formatDate(item.endDate)}</span>
              </div>
            </div>
          </div>

          {isHovered && !isDragging && (
            <div className="flex space-x-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(item)
                }}
                className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                title="Edit item"
              >
                <Edit className="h-2.5 w-2.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(item.id)
                }}
                className="p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                title="Delete item"
              >
                <Trash className="h-2.5 w-2.5" />
              </button>
            </div>
          )}

          {/* Progress indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20">
            <div
              className={`h-full ${progressColorClass} transition-all duration-300 ease-out`}
              style={{ width: `${item.progress}%` }}
            />
          </div>

          {item.progress === 100 && <CheckCircle className="absolute top-0.5 right-0.5 h-3 w-3 text-white" />}
        </div>
      </div>
    </Tooltip>
  )
}

export default RoadmapItem
