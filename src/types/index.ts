export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: string;
  progress: number;
  color?: string;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  items: RoadmapItem[];
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type RoadmapTemplate = {
  id: string;
  name: string;
  description: string;
  categories: string[];
  image: string;
}

export type ThemeMode = 'light' | 'dark';

export interface RoadmapContextType {
  roadmaps: Roadmap[];
  currentRoadmap: Roadmap | null;
  setCurrentRoadmap: (roadmap: Roadmap | null) => void;
  addRoadmap: (roadmap: Roadmap) => void;
  updateRoadmap: (roadmap: Roadmap) => void;
  deleteRoadmap: (id: string) => void;
  addRoadmapItem: (item: RoadmapItem) => void;
  updateRoadmapItem: (item: RoadmapItem) => void;
  deleteRoadmapItem: (id: string) => void;
}
