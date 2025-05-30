"use client"

import type React from "react"
import { useState } from "react"
import { X, FileImage, Printer, Download, FileText } from "lucide-react"
import type { Roadmap } from "../types"
import { exportTimelineToImage, type ImageFormat } from "../utils/imageExport"
import { useToast } from "@/hooks/use-toast"

interface ExportDialogProps {
  roadmap: Roadmap
  isOpen: boolean
  onClose: () => void
}

const ExportDialog: React.FC<ExportDialogProps> = ({ roadmap, isOpen, onClose }) => {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<"pdf" | ImageFormat>("png")
  const [exportPage, setExportPage] = useState<"timeline" | "summary" | "both">("both")
  const [exportQuality, setExportQuality] = useState<"high" | "medium" | "low">("high")

  if (!isOpen) return null

  const handlePrintToPDF = (colorScheme: "color" | "grayscale") => {
    // Set print color scheme in localStorage for the PrintableRoadmap component to access
    localStorage.setItem("printColorScheme", colorScheme)
    localStorage.setItem("printPage", exportPage)

    // Small delay to ensure state is updated
    setTimeout(() => {
      window.print()

      toast({
        title: "Print Dialog Opened",
        description: "Use your browser's print dialog to save as PDF or print the roadmap.",
        className: "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-800",
      })
    }, 100)
  }

  const handleExportImage = async () => {
    if (isExporting) return

    setIsExporting(true)

    try {
      // Get quality setting
      const qualityMap = {
        high: { quality: 1.0, scale: 3 },
        medium: { quality: 0.9, scale: 2 },
        low: { quality: 0.8, scale: 1.5 },
      }
      const { quality, scale } = qualityMap[exportQuality]

      // Export the timeline view directly
      await exportTimelineToImage(roadmap, {
        format: exportFormat as ImageFormat,
        quality,
        scale,
        backgroundColor: "#ffffff",
      })

      toast({
        title: `${exportFormat.toUpperCase()} Export Successful`,
        description: `"${roadmap.title}" timeline has been exported successfully.`,
        className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
      })

      onClose()
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export Failed",
        description: `There was an error exporting to ${exportFormat.toUpperCase()}. Please try again.`,
        variant: "destructive",
        className: "bg-rose-50 dark:bg-rose-900 border-rose-200 dark:border-rose-800",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white">Export Roadmap</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat("png")}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  exportFormat === "png"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <FileImage className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">PNG Image</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-quality timeline</span>
              </button>

              <button
                onClick={() => setExportFormat("jpeg")}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  exportFormat === "jpeg"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <FileImage className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">JPEG Image</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Smaller file size</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                onClick={() => setExportFormat("svg")}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  exportFormat === "svg"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <FileImage className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">SVG Vector</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scalable timeline</span>
              </button>

              <button
                onClick={() => setExportFormat("pdf")}
                className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                  exportFormat === "pdf"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <FileText className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">PDF Document</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Print or save as PDF</span>
              </button>
            </div>
          </div>

          {/* PDF-specific options */}
          {exportFormat === "pdf" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">PDF Options</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Pages to Include</label>
                  <select
                    value={exportPage}
                    onChange={(e) => setExportPage(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="both">Timeline and Summary (Recommended)</option>
                    <option value="timeline">Timeline Only</option>
                    <option value="summary">Summary Only</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    onClick={() => handlePrintToPDF("color")}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Color PDF
                  </button>
                  <button
                    onClick={() => handlePrintToPDF("grayscale")}
                    className="flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Grayscale PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image-specific options */}
          {exportFormat !== "pdf" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Image Options</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Quality</label>
                  <select
                    value={exportQuality}
                    onChange={(e) => setExportQuality(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="high">High Quality (Larger File)</option>
                    <option value="medium">Medium Quality</option>
                    <option value="low">Low Quality (Smaller File)</option>
                  </select>
                </div>

                <button
                  onClick={handleExportImage}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                      Exporting Timeline...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Timeline as {exportFormat.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Export Tips
            </h4>
            <ul className="mt-2 text-xs text-blue-700 dark:text-blue-200 space-y-1 pl-5 list-disc">
              <li>Image exports capture the exact timeline view you see</li>
              <li>PNG offers the best quality for sharing and presentations</li>
              <li>JPEG has smaller file sizes but no transparency</li>
              <li>SVG is scalable and ideal for further editing</li>
              <li>PDF format includes detailed summary tables</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportDialog
