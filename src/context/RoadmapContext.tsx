"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import type { Roadmap, RoadmapItem, RoadmapContextType } from "../types"

// Create context with default values
const RoadmapContext = createContext<RoadmapContextType>({
  roadmaps: [],
  currentRoadmap: null,
  setCurrentRoadmap: () => {},
  addRoadmap: () => {},
  updateRoadmap: () => {},
  deleteRoadmap: () => {},
  addRoadmapItem: () => {},
  updateRoadmapItem: () => {},
  deleteRoadmapItem: () => {},
})

export const useRoadmap = () => useContext(RoadmapContext)

export const RoadmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null)

  // Load roadmaps from localStorage on initial render
  useEffect(() => {
    const savedRoadmaps = localStorage.getItem("roadmaps")
    if (savedRoadmaps) {
      try {
        const parsedRoadmaps = JSON.parse(savedRoadmaps)
        // Convert string dates back to Date objects
        const processedRoadmaps = parsedRoadmaps.map((roadmap: any) => ({
          ...roadmap,
          createdAt: new Date(roadmap.createdAt),
          updatedAt: new Date(roadmap.updatedAt),
          items: roadmap.items.map((item: any) => ({
            ...item,
            startDate: new Date(item.startDate),
            endDate: new Date(item.endDate),
          })),
        }))
        setRoadmaps(processedRoadmaps)
      } catch (error) {
        console.error("Failed to parse roadmaps from localStorage:", error)
      }
    }
  }, [])

  // Save roadmaps to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("roadmaps", JSON.stringify(roadmaps))
  }, [roadmaps])

  const addRoadmap = (roadmap: Roadmap) => {
    setRoadmaps((prev) => [...prev, roadmap])
    setCurrentRoadmap(roadmap)
  }

  const updateRoadmap = (updatedRoadmap: Roadmap) => {
    setRoadmaps((prev) =>
      prev.map((roadmap) =>
        roadmap.id === updatedRoadmap.id ? { ...updatedRoadmap, updatedAt: new Date() } : roadmap,
      ),
    )
    if (currentRoadmap?.id === updatedRoadmap.id) {
      setCurrentRoadmap({ ...updatedRoadmap, updatedAt: new Date() })
    }
  }

  const deleteRoadmap = (id: string) => {
    setRoadmaps((prev) => prev.filter((roadmap) => roadmap.id !== id))
    if (currentRoadmap?.id === id) {
      setCurrentRoadmap(null)
    }
  }

  const addRoadmapItem = (item: RoadmapItem) => {
    if (!currentRoadmap) return

    const updatedRoadmap = {
      ...currentRoadmap,
      items: [...currentRoadmap.items, item],
      updatedAt: new Date(),
    }

    updateRoadmap(updatedRoadmap)
  }

  const updateRoadmapItem = (updatedItem: RoadmapItem) => {
    if (!currentRoadmap) return

    const updatedRoadmap = {
      ...currentRoadmap,
      items: currentRoadmap.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      updatedAt: new Date(),
    }

    updateRoadmap(updatedRoadmap)
  }

  const deleteRoadmapItem = (id: string) => {
    if (!currentRoadmap) return

    const updatedRoadmap = {
      ...currentRoadmap,
      items: currentRoadmap.items.filter((item) => item.id !== id),
      updatedAt: new Date(),
    }

    updateRoadmap(updatedRoadmap)
  }

  return (
    <RoadmapContext.Provider
      value={{
        roadmaps,
        currentRoadmap,
        setCurrentRoadmap,
        addRoadmap,
        updateRoadmap,
        deleteRoadmap,
        addRoadmapItem,
        updateRoadmapItem,
        deleteRoadmapItem,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  )
}
