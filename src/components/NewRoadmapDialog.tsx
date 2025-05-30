"use client"

import type React from "react"
import { useState } from "react"
import { X, Plus, Trash, AlertCircle } from "lucide-react"
import type { RoadmapTemplate } from "../types"
import TemplateCard from "./TemplateCard"
import { createRoadmapFromTemplate } from "../utils/helpers"
import { useRoadmap } from "../context/RoadmapContext"
import { roadmapTemplates } from "../data/templates"
import { useToast } from "@/hooks/use-toast"

interface NewRoadmapDialogProps {
  isOpen: boolean
  onClose: () => void
}

const NewRoadmapDialog: React.FC<NewRoadmapDialogProps> = ({ isOpen, onClose }) => {
  const { addRoadmap } = useRoadmap()
  const { toast } = useToast()
  const [selectedTemplate, setSelectedTemplate] = useState<RoadmapTemplate | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categories: [] as string[],
  })
  const [newCategory, setNewCategory] = useState("")
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleTemplateSelect = (template: RoadmapTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      title: template.name,
      description: template.description,
      categories: [...template.categories],
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()],
      }))
      setNewCategory("")
    }
  }

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault() // Prevent form submission
      handleAddCategory(e as any) // Call the existing add category logic
    }
  }

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }))
  }

  const handleClearCategories = () => {
    setShowClearConfirm(true)
  }

  const confirmClearCategories = () => {
    setFormData((prev) => ({
      ...prev,
      categories: [],
    }))
    setShowClearConfirm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTemplate) return

    // Validate that categories exist
    if (formData.categories.length === 0) {
      toast({
        title: "Categories Required",
        description: "Please add at least one category before creating a roadmap.",
        variant: "destructive",
        className: "bg-rose-50 dark:bg-rose-900 border-rose-200 dark:border-rose-800",
      })
      return
    }

    const newRoadmap = createRoadmapFromTemplate(formData.title, formData.description, formData.categories)

    addRoadmap(newRoadmap)
    toast({
      title: "Roadmap Created",
      description: `"${formData.title}" has been created successfully.`,
      className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Create New Roadmap</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          {!selectedTemplate ? (
            <>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Choose a template to get started with your roadmap.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roadmapTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} onSelect={handleTemplateSelect} />
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Roadmap Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categories</label>
                    <span className="ml-1 text-xs text-rose-500 dark:text-rose-400">*</span>
                  </div>
                  {formData.categories.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCategories}
                      className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-500 dark:hover:text-rose-400 flex items-center"
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Clear All
                    </button>
                  )}
                </div>

                {formData.categories.length === 0 && (
                  <div className="mb-3 p-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-md flex items-start">
                    <AlertCircle className="h-4 w-4 text-amber-500 dark:text-amber-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      At least one category is required to create a roadmap.
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={handleCategoryKeyDown}
                    placeholder="Add a category"
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Back to Templates
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    formData.categories.length === 0 ? "bg-blue-400 hover:bg-blue-500" : "bg-blue-600 hover:bg-blue-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  Create Roadmap
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Clear All Categories?</h4>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to remove all categories? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmClearCategories}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NewRoadmapDialog
