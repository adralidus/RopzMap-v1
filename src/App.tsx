"use client"

import type React from "react"
import dynamic from "next/dynamic"
import { Toaster } from "@/components/ui/toaster"

// Dynamically import providers to avoid hydration mismatch
const ThemeProvider = dynamic(() => import("./context/ThemeContext").then(mod => ({ default: mod.ThemeProvider })), {
  ssr: false
})

const RoadmapProvider = dynamic(() => import("./context/RoadmapContext").then(mod => ({ default: mod.RoadmapProvider })), {
  ssr: false
})

// Dynamically import components that depend on context
const Header = dynamic(() => import("./components/Header"), {
  ssr: false
})

const Dashboard = dynamic(() => import("./components/Dashboard"), {
  ssr: false
})

const RoadmapTimeline = dynamic(() => import("./components/RoadmapTimeline"), {
  ssr: false
})

// Create a client-only wrapper for the roadmap context hook
const RoadmapApp: React.FC = dynamic(() => 
  import("./context/RoadmapContext").then(mod => {
    const { useRoadmap } = mod
    
    const RoadmapAppComponent: React.FC = () => {
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
    
    return { default: RoadmapAppComponent }
  }), 
  { ssr: false }
)

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