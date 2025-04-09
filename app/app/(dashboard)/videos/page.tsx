"use client"

import { useState } from "react"
import { MoreHorizontal, Search, Filter, Play, Download, Trash2} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


// Sample video data
const videos = [
  {
    id: 1,
    title: "Company Introduction",
    thumbnail: "/placeholder.svg?height=720&width=1280",
    duration: "01:45",
    status: "completed",
    date: "Apr 1, 2025",
  },
  {
    id: 2,
    title: "Product Announcement",
    thumbnail: "/placeholder.svg?height=720&width=1280",
    duration: "02:30",
    status: "completed",
    date: "Mar 28, 2025",
  },
  {
    id: 3,
    title: "Training Module",
    thumbnail: "/placeholder.svg?height=720&width=1280",
    duration: "05:12",
    status: "completed",
    date: "Mar 25, 2025",
  },
  {
    id: 4,
    title: "Customer Testimonial",
    thumbnail: "/placeholder.svg?height=720&width=1280",
    duration: "03:20",
    status: "processing",
    date: "Apr 1, 2025",
  },
  
]

export default function MyVideosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("grid")

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          My Videos
        </h1>
        <p className="text-muted-foreground">Manage your generated videos</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            className="pl-8 rounded-sm focus-visible:border-none focus:outline-none focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] border-green-200 dark:border-green-800">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
              <SelectItem value="z-a">Z-A</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden sm:flex">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`rounded-r-none ${viewMode === "grid" ? "bg-gradient-to-r from-green-600 to-teal-600" : "border-green-200 dark:border-green-800"}`}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`rounded-l-none ${viewMode === "list" ? "bg-gradient-to-r from-green-600 to-teal-600" : "border-green-200 dark:border-green-800"}`}
            >
              List
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <Card
              key={video.id}
              className="mt-3 p-0 rounded-sm relative overflow-hidden dark:border-green-800 shadow-md group hover:shadow-lg transition-shadow"
            >
              <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-green-600 to-teal-600 h-1"></div>
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-green-600 text-white hover:bg-green-700"
                  >
                    <Play className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                  {video.duration}
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-green-800 dark:text-green-300">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">{video.date}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="-mr-2 h-8 w-8 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4 text-green-600" />
                        <span>Play</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4 text-green-600" />
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex items-center gap-4 rounded-lg border border-green-200 dark:border-green-800 p-3 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors shadow-sm"
            >
              <div className="relative h-20 w-36 flex-shrink-0 overflow-hidden rounded">
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
                  {video.duration}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-green-800 dark:text-green-300">{video.title}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">{video.date}</p>
                  
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <Play className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


