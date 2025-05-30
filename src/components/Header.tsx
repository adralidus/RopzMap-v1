"use client"

import type React from "react"
import { useState } from "react"
import { Sun, Moon, LayoutDashboard, Calendar, Settings } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import NewRoadmapDialog from "./NewRoadmapDialog"

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const [isNewRoadmapDialogOpen, setIsNewRoadmapDialogOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">RopzMap</span>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-4">
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LayoutDashboard className="inline-block w-4 h-4 mr-1" />
                  Dashboard
                </a>
                <a
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Roadmaps
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex-shrink-0">
                <button
                  onClick={() => setIsNewRoadmapDialogOpen(true)}
                  className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  New Roadmap
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <NewRoadmapDialog isOpen={isNewRoadmapDialogOpen} onClose={() => setIsNewRoadmapDialogOpen(false)} />
    </>
  )
}

export default Header
