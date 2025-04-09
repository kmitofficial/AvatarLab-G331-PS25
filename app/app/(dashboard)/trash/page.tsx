"use client"

import { useState } from "react"
import { Search,Play, RotateCcw, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Sample deleted videos data
const deletedVideos = [
  {
    id: 1,
    title: "Old Marketing Video",
    thumbnail: "/placeholder.svg?height=720&width=1280",
    duration: "02:15",
    deletedDate: "Mar 15, 2025",
    expiryDate: "Apr 15, 2025",
  },
  {
    id: 2,
    title: "Draft Presentation",
    thumbnail: "/placeholder.svg?height=720&width=1280",
    duration: "01:30",
    deletedDate: "Mar 20, 2025",
    expiryDate: "Apr 20, 2025",
  },
  {
    id: 3,
    title: "Test Recording",
    thumbnail: "/placeholder.svg?height=720&width=1280",
    duration: "00:45",
    deletedDate: "Mar 25, 2025",
    expiryDate: "Apr 25, 2025",
  },
]

export default function TrashPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const toggleSelectItem = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === deletedVideos.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(deletedVideos.map((video) => video.id))
    }
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Trash
        </h1>
        <p className="text-muted-foreground">Items in trash will be permanently deleted after 30 days</p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trash..."
            className="pl-8 rounded-sm focus-visible:border-none focus:outline-none focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] rounded-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Recently Deleted</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedItems.length === deletedVideos.length}
              onCheckedChange={toggleSelectAll}
              className="border-red-300 dark:border-red-700 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
            />
            <label htmlFor="select-all" className="text-sm font-medium text-red-800 dark:text-red-300">
              {selectedItems.length} items selected
            </label>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
            </Button>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 border-0"
                >
                  <Trash2 className="mr h-3 w-3" />

                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected videos from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0">
                    Delete Forever
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {deletedVideos.map((video) => (
          <Card key={video.id} className="p-0 rounded-sm overflow-hidden shadow-md">
            
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className="relative flex items-center p-3 sm:w-16">
                  <Checkbox
                    checked={selectedItems.includes(video.id)}
                    onCheckedChange={() => toggleSelectItem(video.id)}
                    className="border-red-300 dark:border-red-700 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                  />
                </div>
                <div className="relative h-32 sm:h-24 sm:w-44">
                  <img
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    {video.duration}
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-center p-4">
                  <h3 className="font-medium text-red-800 dark:text-red-300">{video.title}</h3>
                  <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:gap-4">
                    <span>Deleted on: {video.deletedDate}</span>
                    <span>Will be permanently deleted on: {video.expiryDate}</span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 p-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                  >
                    <Play className="mr-1 h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                  >
                    <RotateCcw className="mr-1 h-3 w-3" />

                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />

                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

