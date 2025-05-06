"use client"

import React, { useState } from "react"
import { Search, Play, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getEmail } from "@/lib/authenticate"

type VideoType = { id: string; filename: string; video: string; duration: string; date: string }

export default function MyVideosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [videos, setVideos] = useState<VideoType[]>([])
  const [openVideo, setOpenVideo] = useState<VideoType | null>(null)

  React.useEffect(() => {
    const retrieveVideos = async () => {
      const result = await getEmail();
      const response = await fetch('/api/user/videos', {
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({ email:result?.email }),
      })
      if (response.ok) {
        const data = await response.json();
        setVideos(data)
      }
    }
    retrieveVideos()
  }, [])

  const handleDownload = (videoUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async (id: string) => {
  }

  const filteredVideos = videos.filter((video) =>
    video.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime()
    if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime()
    if (sortBy === "a-z") return a.filename.localeCompare(b.filename)
    if (sortBy === "z-a") return b.filename.localeCompare(a.filename)
    return 0
  })

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="fontfamily text-3xl font-semibold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
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
        </div>
      </div>

      <div className="space-y-3">
        {sortedVideos.map((video) => (
          <div
            key={video.id}
            className="flex items-center gap-4 rounded-sm border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors shadow-sm"
          >
            <div className="relative h-25 w-36 overflow-hidden">
              <video
                src={video.video}
                className="h-full w-full object-cover rounded-sm"
                muted
              />
              <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-xs text-white">
                {video.duration}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-green-800 dark:text-green-300">{video.filename}</h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground mt-2">{video.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpenVideo(video)}
                className="h-8 w-8 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <Play className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(video.video, video.filename)}
                className="h-8 w-8 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(video.id)}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-100 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Video Dialog */}
      {openVideo && (
        <Dialog open={!!openVideo} onOpenChange={() => setOpenVideo(null)}>
          <DialogContent
            className="max-w-3xl p-0 bg-transparent border-none shadow-none"
          >
            <video
              src={openVideo.video}
              controls
              width={400}
              height={400}
              autoPlay
              className="w-full h-full object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
