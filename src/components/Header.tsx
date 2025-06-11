"use client"

import type React from "react"
import { Sun, Moon, Coffee, Github } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useRoadmap } from "../context/RoadmapContext"

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { setCurrentRoadmap } = useRoadmap()

  const handleLogoClick = () => {
    setCurrentRoadmap(null)
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a
                  href="#"
                  onClick={handleLogoClick}
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer"
                >
                  RopzMap 🗺️
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <a
                href="https://github.com/adralidus"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-110 hover:rotate-12 hover:drop-shadow-lg"
                aria-label="Visit GitHub profile"
              >
                <Github className="h-5 w-5" />
              </a>

              {/* PayPal Buy Me a Coffee Button */}
              <a
                href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=SAZKD576Z7NPE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                title="Buy me a coffee - Support this project"
              >
                <Coffee className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Buy me a coffee</span>
                <span className="sm:hidden">Coffee</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
