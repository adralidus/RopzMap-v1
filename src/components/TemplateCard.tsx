"use client"

import type React from "react"
import type { RoadmapTemplate } from "../types"

interface TemplateCardProps {
  template: RoadmapTemplate
  onSelect: (template: RoadmapTemplate) => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  return (
    <div
      className="relative group overflow-hidden rounded-lg shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:scale-[1.02]"
      onClick={() => onSelect(template)}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70 z-10"></div>

      <img
        src={template.image || "/placeholder.svg"}
        alt={template.name}
        className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <h3 className="text-white text-lg font-bold mb-1">{template.name}</h3>
        <p className="text-white text-sm opacity-90">{template.description}</p>

        <div className="mt-3 flex flex-wrap gap-1">
          {template.categories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white"
            >
              {category}
            </span>
          ))}
          {template.categories.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
              +{template.categories.length - 3} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TemplateCard
