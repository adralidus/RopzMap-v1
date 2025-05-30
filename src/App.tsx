"use client"

import type React from "react"
import { ThemeProvider } from "./context/ThemeContext"
import { RoadmapProvider, useRoadmap } from "./context/RoadmapContext"
import Header from "./components/Header"
import Dashboard from "./components/Dashboard"
import RoadmapTimeline from "./components/RoadmapTimeline"
import { Toaster } from "@/components/ui/toaster"

const RoadmapApp: React.FC = () => {
  const { currentRoadmap, setCurrentRoadmap } = useRoadmap()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Header />

      <main>
        {currentRoadmap ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-4">
              <button
                onClick={() => setCurrentRoadmap(null)}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
            <RoadmapTimeline roadmap={currentRoadmap} />
          </div>
        ) : (
          <Dashboard />
        )}
      </main>

      <Toaster />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <RoadmapProvider>
        <RoadmapApp />
      </RoadmapProvider>
    </ThemeProvider>
  )
}

export default App
