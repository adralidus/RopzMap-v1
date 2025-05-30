"use client"

import type React from "react"
import { useMemo, useEffect, useState } from "react"
import type { Roadmap } from "../types"
import { formatDate, getRoadmapDateRange, assignItemRows, getCategoryColor } from "../utils/helpers"

interface PrintableRoadmapProps {
  roadmap: Roadmap
}

const PrintableRoadmap: React.FC<PrintableRoadmapProps> = ({ roadmap }) => {
  // Get print settings from localStorage (set by ExportDialog)
  const [colorScheme, setColorScheme] = useState<"color" | "grayscale">("color")
  const [printPage, setPrintPage] = useState<"timeline" | "summary" | "both">("both")

  useEffect(() => {
    const storedColorScheme = localStorage.getItem("printColorScheme") as "color" | "grayscale" | null
    const storedPrintPage = localStorage.getItem("printPage") as "timeline" | "summary" | "both" | null

    if (storedColorScheme) {
      setColorScheme(storedColorScheme)
    }

    if (storedPrintPage) {
      setPrintPage(storedPrintPage)
    }
  }, [])

  // Calculate project statistics
  const { start: projectStart, end: projectEnd } = useMemo(() => getRoadmapDateRange(roadmap), [roadmap])
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

  // Generate timeline data
  const timelineDuration = projectEnd.getTime() - projectStart.getTime()
  const itemsWithRows = useMemo(() => {
    const groupedItems: Record<string, Array<any>> = {}
    roadmap.categories.forEach((category) => {
      const categoryItems = roadmap.items.filter((item) => item.category === category)
      groupedItems[category] = assignItemRows(categoryItems)
    })
    return groupedItems
  }, [roadmap.items, roadmap.categories])

  // Generate month labels
  const monthLabels = useMemo(() => {
    const labels = []
    const currentDate = new Date(projectStart)
    while (currentDate <= projectEnd) {
      labels.push({
        date: new Date(currentDate),
        label: currentDate.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        position: ((currentDate.getTime() - projectStart.getTime()) / timelineDuration) * 100,
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }
    return labels
  }, [projectStart, projectEnd, timelineDuration])

  const calculateItemPosition = (item: any) => {
    const startPosition = ((item.startDate.getTime() - projectStart.getTime()) / timelineDuration) * 100
    const duration = ((item.endDate.getTime() - item.startDate.getTime()) / timelineDuration) * 100
    return {
      left: `${Math.max(0, Math.min(100, startPosition))}%`,
      width: `${Math.max(2, Math.min(100 - startPosition, duration))}%`,
    }
  }

  const showTimeline = printPage === "timeline" || printPage === "both"
  const showSummary = printPage === "summary" || printPage === "both"

  return (
    <div className="print-container">
      {/* Page 1: Timeline */}
      {showTimeline && (
        <div className="print-page">
          <div className="print-header">
            <h1 className="print-title">{roadmap.title}</h1>
            <div className="print-subtitle">Project Timeline</div>
          </div>

          {roadmap.description && (
            <div className="print-description">
              <p>{roadmap.description}</p>
            </div>
          )}

          {/* Timeline Section */}
          <div className="timeline-container">
            {/* Month labels */}
            <div className="timeline-months">
              {monthLabels.map((month, index) => (
                <div key={index} className="month-label" style={{ left: `${month.position}%` }}>
                  {month.label}
                </div>
              ))}
            </div>

            {/* Timeline grid */}
            <div className="timeline-grid">
              {monthLabels.map((_, index) => (
                <div
                  key={index}
                  className="timeline-grid-line"
                  style={{ left: `${(index / (monthLabels.length - 1)) * 100}%` }}
                />
              ))}
            </div>

            {/* Category swimlanes */}
            <div className="timeline-swimlanes">
              {roadmap.categories.map((category, categoryIndex) => {
                const categoryItems = itemsWithRows[category] || []
                const maxRow = categoryItems.length > 0 ? Math.max(...categoryItems.map((item) => item.row)) : 0
                const categoryHeight = Math.max(60, (maxRow + 1) * 40 + 20)

                return (
                  <div key={category} className="swimlane" style={{ height: `${categoryHeight}px` }}>
                    <div className="swimlane-header">
                      <div
                        className={`category-indicator ${colorScheme === "grayscale" ? "grayscale" : ""}`}
                        style={{
                          backgroundColor:
                            colorScheme === "color"
                              ? getCategoryColor(category, categoryIndex)
                                  .replace("bg-", "")
                                  .replace("blue", "#3b82f6")
                                  .replace("teal", "#14b8a6")
                                  .replace("indigo", "#6366f1")
                                  .replace("purple", "#8b5cf6")
                                  .replace("rose", "#f43f5e")
                                  .replace("amber", "#f59e0b")
                                  .replace("emerald", "#10b981")
                                  .replace("sky", "#0ea5e9")
                                  .replace("-500", "")
                              : "#666",
                        }}
                      />
                      <span className="category-name">{category}</span>
                    </div>
                    <div className="swimlane-content">
                      {categoryItems.map((item) => {
                        const position = calculateItemPosition(item)
                        const categoryColor =
                          colorScheme === "color" ? getCategoryColor(category, categoryIndex) : "bg-gray-500"

                        return (
                          <div
                            key={item.id}
                            className={`timeline-item ${categoryColor} ${colorScheme === "grayscale" ? "grayscale" : ""}`}
                            style={{
                              left: position.left,
                              width: position.width,
                              top: `${item.row * 40 + 10}px`,
                            }}
                          >
                            <div className="item-content">
                              <div className="item-title">{item.title}</div>
                              <div className="item-dates">
                                {formatDate(item.startDate)} → {formatDate(item.endDate)}
                              </div>
                            </div>
                            <div className="progress-bar">
                              <div
                                className={`progress-fill ${item.progress === 100 ? "completed" : item.progress > 0 ? "in-progress" : "not-started"}`}
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="timeline-legend">
            <div className="legend-title">Legend:</div>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color completed"></div>
                <span>Completed</span>
              </div>
              <div className="legend-item">
                <div className="legend-color in-progress"></div>
                <span>In Progress</span>
              </div>
              <div className="legend-item">
                <div className="legend-color not-started"></div>
                <span>Not Started</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page 2: Summary Tables */}
      {showSummary && (
        <div className={`print-page ${showTimeline ? "print-page-break" : ""}`}>
          <div className="print-header">
            <h1 className="print-title">{roadmap.title}</h1>
            <div className="print-subtitle">Project Summary</div>
          </div>

          {/* Project Overview */}
          <div className="summary-section">
            <h2 className="section-title">Project Information</h2>
            <table className="summary-table">
              <tbody>
                <tr>
                  <td className="table-label">Project Title</td>
                  <td className="table-value">{roadmap.title}</td>
                </tr>
                <tr>
                  <td className="table-label">Description</td>
                  <td className="table-value">{roadmap.description || "No description provided"}</td>
                </tr>
                <tr>
                  <td className="table-label">Start Date</td>
                  <td className="table-value">{formatDate(projectStart)}</td>
                </tr>
                <tr>
                  <td className="table-label">End Date</td>
                  <td className="table-value">{formatDate(projectEnd)}</td>
                </tr>
                <tr>
                  <td className="table-label">Total Duration</td>
                  <td className="table-value">
                    {Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))} days
                  </td>
                </tr>
                <tr>
                  <td className="table-label">Project Status</td>
                  <td className={`table-value status-${projectStatus.toLowerCase().replace(" ", "-")}`}>
                    {projectStatus}
                  </td>
                </tr>
                <tr>
                  <td className="table-label">Overall Progress</td>
                  <td className="table-value">{overallProgress}%</td>
                </tr>
                <tr>
                  <td className="table-label">Last Updated</td>
                  <td className="table-value">{formatDate(roadmap.updatedAt)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Items Summary */}
          <div className="summary-section">
            <h2 className="section-title">Roadmap Items</h2>
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {roadmap.items.map((item) => (
                  <tr key={item.id}>
                    <td className="item-name">{item.title}</td>
                    <td>{item.category}</td>
                    <td>{formatDate(item.startDate)}</td>
                    <td>{formatDate(item.endDate)}</td>
                    <td>{item.progress}%</td>
                    <td
                      className={`status-${item.progress === 100 ? "completed" : item.progress > 0 ? "in-progress" : "not-started"}`}
                    >
                      {item.progress === 100 ? "Completed" : item.progress > 0 ? "In Progress" : "Not Started"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Statistics */}
          <div className="summary-section">
            <h2 className="section-title">Project Statistics</h2>
            <table className="summary-table">
              <tbody>
                <tr>
                  <td className="table-label">Total Items</td>
                  <td className="table-value">{totalItems}</td>
                </tr>
                <tr>
                  <td className="table-label">Completed Items</td>
                  <td className="table-value">{completedItems}</td>
                </tr>
                <tr>
                  <td className="table-label">In Progress Items</td>
                  <td className="table-value">{inProgressItems}</td>
                </tr>
                <tr>
                  <td className="table-label">Not Started Items</td>
                  <td className="table-value">{notStartedItems}</td>
                </tr>
                <tr>
                  <td className="table-label">Categories</td>
                  <td className="table-value">{roadmap.categories.length}</td>
                </tr>
                <tr>
                  <td className="table-label">Completion Rate</td>
                  <td className="table-value">
                    {totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="print-footer">
            <div>
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </div>
            <div>Created with RoadMapper</div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx>{`
        .print-container {
          display: none;
        }

        @media print {
          .print-container {
            display: block !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .print-page {
            page-break-after: always;
            padding: 20mm;
            min-height: 250mm;
            box-sizing: border-box;
          }

          .print-page:last-child {
            page-break-after: avoid;
          }

          .print-page-break {
            page-break-before: always;
          }

          .print-header {
            margin-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 10px;
          }

          .print-title {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin: 0;
          }

          .print-subtitle {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
          }

          .print-description {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f8fafc;
            border-radius: 4px;
          }

          .timeline-container {
            position: relative;
            margin: 20px 0;
            min-height: 400px;
          }

          .timeline-months {
            position: relative;
            height: 30px;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 10px;
          }

          .month-label {
            position: absolute;
            font-size: 10px;
            color: #64748b;
            font-weight: 500;
            transform: translateX(-50%);
          }

          .timeline-grid {
            position: absolute;
            top: 30px;
            left: 0;
            right: 0;
            bottom: 0;
          }

          .timeline-grid-line {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 1px;
            background-color: #e2e8f0;
          }

          .timeline-swimlanes {
            position: relative;
            z-index: 1;
          }

          .swimlane {
            margin-bottom: 20px;
            position: relative;
          }

          .swimlane-header {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
          }

          .category-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
          }

          .category-indicator.grayscale {
            background-color: #666 !important;
          }

          .category-name {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
          }

          .swimlane-content {
            position: relative;
            background-color: #f8fafc;
            border-radius: 4px;
            min-height: 40px;
          }

          .timeline-item {
            position: absolute;
            height: 30px;
            border-radius: 4px;
            padding: 4px 8px;
            color: white;
            font-size: 8px;
            overflow: hidden;
            min-width: 80px;
          }

          .timeline-item.grayscale {
            background-color: #666 !important;
          }

          .timeline-item.bg-blue-500 { background-color: #3b82f6; }
          .timeline-item.bg-teal-500 { background-color: #14b8a6; }
          .timeline-item.bg-indigo-500 { background-color: #6366f1; }
          .timeline-item.bg-purple-500 { background-color: #8b5cf6; }
          .timeline-item.bg-rose-500 { background-color: #f43f5e; }
          .timeline-item.bg-amber-500 { background-color: #f59e0b; }
          .timeline-item.bg-emerald-500 { background-color: #10b981; }
          .timeline-item.bg-sky-500 { background-color: #0ea5e9; }

          .item-content {
            line-height: 1.2;
          }

          .item-title {
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .item-dates {
            font-size: 7px;
            opacity: 0.9;
          }

          .progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background-color: rgba(0, 0, 0, 0.2);
          }

          .progress-fill {
            height: 100%;
            transition: none;
          }

          .progress-fill.completed {
            background-color: #10b981;
          }

          .progress-fill.in-progress {
            background-color: #f59e0b;
          }

          .progress-fill.not-started {
            background-color: #ef4444;
          }

          .timeline-legend {
            margin-top: 20px;
            padding: 10px;
            background-color: #f8fafc;
            border-radius: 4px;
          }

          .legend-title {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .legend-items {
            display: flex;
            gap: 20px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            font-size: 10px;
          }

          .legend-color {
            width: 12px;
            height: 3px;
            margin-right: 6px;
          }

          .legend-color.completed {
            background-color: #10b981;
          }

          .legend-color.in-progress {
            background-color: #f59e0b;
          }

          .legend-color.not-started {
            background-color: #ef4444;
          }

          .summary-section {
            margin-bottom: 30px;
          }

          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }

          .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .summary-table td {
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            font-size: 11px;
          }

          .table-label {
            font-weight: 600;
            background-color: #f9fafb;
            width: 40%;
          }

          .table-value {
            background-color: white;
          }

          .items-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          .items-table th,
          .items-table td {
            padding: 6px 8px;
            border: 1px solid #e5e7eb;
            text-align: left;
          }

          .items-table th {
            background-color: #f3f4f6;
            font-weight: 600;
          }

          .item-name {
            font-weight: 500;
          }

          .status-completed {
            color: #059669;
            font-weight: 500;
          }

          .status-in-progress {
            color: #d97706;
            font-weight: 500;
          }

          .status-not-started {
            color: #dc2626;
            font-weight: 500;
          }

          .status-on-track {
            color: #059669;
            font-weight: 500;
          }

          .status-at-risk {
            color: #d97706;
            font-weight: 500;
          }

          .status-overdue {
            color: #dc2626;
            font-weight: 500;
          }

          .print-footer {
            position: fixed;
            bottom: 10mm;
            left: 20mm;
            right: 20mm;
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #64748b;
            border-top: 1px solid #e5e7eb;
            padding-top: 5px;
          }
        }

        @page {
          margin: 0;
          size: A4 landscape;
        }
      `}</style>
    </div>
  )
}

export default PrintableRoadmap
