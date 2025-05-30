"use client"

import type React from "react"
import { useState } from "react"
import { PlusCircle, Calendar, FileText, Download } from "lucide-react"
import { useRoadmap } from "../context/RoadmapContext"
import { formatDate, exportRoadmapAsJson } from "../utils/helpers"
import NewRoadmapDialog from "./NewRoadmapDialog"

const Dashboard: React.FC = () => {
  const { roadmaps, setCurrentRoadmap, deleteRoadmap } = useRoadmap()
  const [isNewRoadmapDialogOpen, setIsNewRoadmapDialogOpen] = useState(false)

  const handleOpenRoadmap = (id: string) => {
    const roadmap = roadmaps.find((r) => r.id === id)
    if (roadmap) {
      setCurrentRoadmap(roadmap)
    }
  }

  const handleExportRoadmap = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const roadmap = roadmaps.find((r) => r.id === id)
    if (roadmap) {
      exportRoadmapAsJson(roadmap)
    }
  }

  const handleDeleteRoadmap = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this roadmap? This action cannot be undone.")) {
      deleteRoadmap(id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your Roadmaps</h1>
        <button
          onClick={() => setIsNewRoadmapDialogOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          New Roadmap
        </button>
      </div>

      {roadmaps.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-8 text-center transition-colors duration-200">
          <div className="max-w-md mx-auto">
            <Calendar className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No roadmaps yet</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Create your first roadmap to start planning your projects, career, or product development.
            </p>
            <button
              onClick={() => setIsNewRoadmapDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Create Your First Roadmap
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmaps.map((roadmap) => (
            <div
              key={roadmap.id}
              onClick={() => handleOpenRoadmap(roadmap.id)}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02] flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{roadmap.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                      {roadmap.description}
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0" />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <div>
                    <span className="font-medium">{roadmap.items.length}</span> items
                  </div>
                  <div>Updated {formatDate(roadmap.updatedAt)}</div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {roadmap.categories.slice(0, 3).map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {category}
                    </span>
                  ))}
                  {roadmap.categories.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                      +{roadmap.categories.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 px-5 py-2 flex justify-between items-center transition-colors">
                <button
                  onClick={(e) => handleDeleteRoadmap(e, roadmap.id)}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => handleExportRoadmap(e, roadmap.id)}
                  className="text-xs font-medium text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center transition-colors"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </button>
              </div>
            </div>
          ))}

          {/* "Create new" card */}
          <div
            onClick={() => setIsNewRoadmapDialogOpen(true)}
            className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors min-h-[200px]"
          >
            <PlusCircle className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-3" />
            <p className="text-slate-600 dark:text-slate-400 text-center">Create a new roadmap</p>
          </div>
        </div>
      )}

      <NewRoadmapDialog isOpen={isNewRoadmapDialogOpen} onClose={() => setIsNewRoadmapDialogOpen(false)} />
    </div>
  )
}

export default Dashboard
