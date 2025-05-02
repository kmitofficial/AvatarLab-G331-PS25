"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Lock, Crown, X } from "lucide-react"
import Image from "next/image"

interface Background {
  id: number
  name: string
  src: string | null
  premium: boolean
  category: string
}

interface BackgroundGalleryProps {
  onSelectBackground: (src: string, id: number) => void
  onClose: () => void
  activeCategory: string
  setActiveCategory: (category: string) => void
}

export default function BackgroundGallery({
  onSelectBackground,
  onClose,
  activeCategory,
  setActiveCategory,
}: BackgroundGalleryProps) {
  const [backgrounds, setBackgrounds] = useState<Record<string, Background[]>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchBackgrounds = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/backgrounds")

        if (!response.ok) {
          throw new Error("Failed to fetch backgrounds")
        }

        const data = await response.json()

        // Group backgrounds by category
        const groupedBackgrounds: Record<string, Background[]> = {}
        const uniqueCategories: Set<string> = new Set()

        data.forEach((bg: Background) => {
          if (!bg.src) return // Skip items without image data

          uniqueCategories.add(bg.category)

          if (!groupedBackgrounds[bg.category]) {
            groupedBackgrounds[bg.category] = []
          }

          groupedBackgrounds[bg.category].push(bg)
        })

        setBackgrounds(groupedBackgrounds)
        setCategories(Array.from(uniqueCategories))

        // Set default active category if current one doesn't exist
        if (uniqueCategories.size > 0 && !uniqueCategories.has(activeCategory)) {
          setActiveCategory(Array.from(uniqueCategories)[0])
        }
      } catch (err) {
        console.error("Error fetching backgrounds:", err)
        setError("Failed to load backgrounds")
      } finally {
        setLoading(false)
      }
    }

    fetchBackgrounds()
  }, [activeCategory, setActiveCategory])

  const selectBackground = (id: number, src: string | null, isPremium: boolean) => {
    if (!isPremium && src) {
      onSelectBackground(src, id)
    }
  }

  return (
    <>
      <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold">Background Gallery</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-blue-700/50 rounded-full"
          >
            <X size={20} strokeWidth={2.5} />
          </Button>
        </div>
        <p className="text-blue-100 mt-1">Select a background to enhance your video</p>
      </div>

      <div className="p-6">
        {categories.length > 0 ? (
          <Tabs defaultValue={activeCategory} value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-6 bg-slate-100 p-1">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="data-[state=active]:bg-white capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center p-4 text-red-500">{error}</div>
              ) : (
                categories.map((category) => (
                  <TabsContent key={category} value={category} className="m-0">
                    {!backgrounds[category] || backgrounds[category].length === 0 ? (
                      <div className="text-center p-4 text-slate-500">No backgrounds available in this category</div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {backgrounds[category].map((bg) => (
                          <div
                            key={bg.id}
                            className="relative group rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md"
                            onClick={() => selectBackground(bg.id, bg.src, bg.premium)}
                          >
                            {bg.src && (
                              <div className="aspect-video relative">
                                <Image
                                  src={bg.src || "/placeholder.svg"}
                                  alt={bg.name}
                                  fill
                                  className="object-cover transition-transform group-hover:scale-105"
                                />
                              </div>
                            )}

                            {bg.premium && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="text-center p-2">
                                  <Lock className="h-6 w-6 text-white mx-auto" />
                                  <span className="text-xs font-medium text-white block mt-1">Premium</span>
                                  <Button size="sm" variant="secondary" className="mt-2 text-xs">
                                    <Crown className="h-3 w-3 mr-1" />
                                    Upgrade
                                  </Button>
                                </div>
                              </div>
                            )}

                            <div className="p-2 bg-white">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-700">{bg.name}</p>
                                {bg.premium && (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]"
                                  >
                                    PREMIUM
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))
              )}
            </ScrollArea>
          </Tabs>
        ) : loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="text-center p-8 text-slate-500">
            <p className="mb-2">No background categories available</p>
            <p className="text-sm">Try adding some backgrounds to your database</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-slate-200 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          <X size={16} className="mr-2" /> Close Gallery
        </Button>
      </div>
    </>
  )
}
