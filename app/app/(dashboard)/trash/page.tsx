"use client"

import { useEffect, useState } from "react"
import { Search, Play, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getEmail } from "@/lib/authenticate"
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { fadeScaleAnimation, pageVariants, videoVariants } from "@/lib/animations"

type VideoType = { id: string; filename: string; video: string; duration: string; trashedAt: string; expiry: string }

export default function TrashPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [openVideo, setOpenVideo] = useState<VideoType | null>(null)
  const [email, setEmail] = useState("");

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === videos.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(videos.map((video) => video.id))
    }
  }
  const fetchVideos = async () => {
    const result = await getEmail();
    setEmail(result!.email);
    try {
      const response = await fetch('/api/user/trash', { method: "POST", body: JSON.stringify({ email: result?.email }) });
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDeleteList = async () => {
    await Promise.all(selectedItems.map(id => handleDelete(id)));
    setSelectedItems([]);
  }

  const handleRestoreList = async () =>{
    await Promise.all(selectedItems.map(id => handleRestore(id)));
    setSelectedItems([]);
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/user/client-delete', { method: 'POST', body: JSON.stringify({ email: email, videoId: id }) });
      const { message } = await response.json();
      if (response.ok) {
        toast.success(message);
        fetchVideos();
      } else toast.error(message);

    } catch (error) {
      console.log(error);
    }
  }

  const handleRestore = async (videoID: string) => {
    try {
      const response = await fetch('api/user/deleteVideo', { method: "POST", body: JSON.stringify({ email: email, videoID: videoID, role: "restore" }) });
      const { message } = await response.json();
      if (response.ok) {
        setVideos(prev => prev.filter(video => video.id !== videoID));
        toast.success(message);
      } else toast.error(message);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <motion.div {...pageVariants} className="container mx-auto p-2" >
      <div className="p-0 sm:p-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Trash
          </h1>
          <p className="text-muted-foreground text-sm">Items in trash will be permanently deleted after 30 days</p>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos"
              className="w-full pl-8 py-2 rounded border border-red-200 focus:border-red-500 focus:ring-red-500 focus:outline-none focus:ring-0 text-xs sm:text-sm"
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
                checked={selectedItems.length === videos.length}
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
                onClick={handleRestoreList}
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
                    <AlertDialogAction  onClick={handleDeleteList} className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-0">
                      Delete Forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}

        <motion.div {...videoVariants} className="space-y-4">
          {videos.map((video) => (
            <motion.div {...fadeScaleAnimation} key={video.id}>
              <Card className="p-0 rounded-sm overflow-hidden shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative flex items-center p-3">
                      <Checkbox
                        checked={selectedItems.includes(video.id)}
                        onCheckedChange={() => toggleSelectItem(video.id)}
                        className="border-red-300 dark:border-red-700 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                      />
                    </div>
                    <div className="relative h-40 w-36 overflow-hidden">
                      <video
                        src={video.video}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-center p-4">
                      <h3 className="font-medium text-red-800 dark:text-red-300 mb-2">{video.filename}</h3>
                      <div className="gap-1 text-xs text-muted-foreground sm:flex-row sm:gap-4">
                        <p className="mb-2">Deleted on: {video.trashedAt}</p>
                        <p>Will be permanently deleted on: {video.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpenVideo(video)}
                        className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                      >
                        <Play className="mr-1 h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(video.id)}
                        className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                      >
                        <RotateCcw className="mr-1 h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400"
                        onClick={() => handleDelete(video.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

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
                className="w-full h-full object-contain rounded-sm"
              />
            </DialogContent>
          </Dialog>
        )}</div>
    </motion.div>
  )
}