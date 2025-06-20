"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ThemeMode } from "../types"

interface ThemeContextType {
  theme: ThemeMode
  toggleTheme: () => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  mounted: false,
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>("light")
  const [mounted, setMounted] = useState(false)

  // Check for user's preferred theme on first render
  useEffect(() => {
    setMounted(true)
    
    const savedTheme = localStorage.getItem("theme") as ThemeMode | null

    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  // Apply theme class to document and save to localStorage when changed
  useEffect(() => {
    if (!mounted) return
    
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}