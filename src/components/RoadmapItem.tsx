import type React from "react"
import { CheckCircle2, Circle, HelpCircle } from "lucide-react"

interface RoadmapItemProps {
  title: string
  description: string
  status: "planned" | "in-progress" | "live" | "unknown"
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ title, description, status }) => {
  let statusIcon
  let statusColor

  switch (status) {
    case "planned":
      statusIcon = <Circle className="h-4 w-4 text-gray-400" />
      statusColor = "text-gray-400"
      break
    case "in-progress":
      statusIcon = <HelpCircle className="h-4 w-4 text-blue-500" />
      statusColor = "text-blue-500"
      break
    case "live":
      statusIcon = <CheckCircle2 className="h-4 w-4 text-green-500" />
      statusColor = "text-green-500"
      break
    default:
      statusIcon = <HelpCircle className="h-4 w-4 text-gray-400" />
      statusColor = "text-gray-400"
      break
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-0 flex h-full w-6 items-start justify-center">
        <div className="mt-1 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      </div>
      <div className="relative mb-4 flex space-x-4">
        <div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow">
            {statusIcon}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default RoadmapItem
