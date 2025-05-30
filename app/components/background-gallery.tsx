"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Lock, Crown, X } from "lucide-react"

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
        const response = await fetch("/api/dev/backgrounds")
        if (!response.ok) throw new Error("Failed to fetch backgrounds")

        const data = await response.json()
        const grouped: Record<string, Background[]> = {}
        const uniqueCategories = new Set<string>()

        data.forEach((bg: Background) => {
          if (!bg.src) return
          uniqueCategories.add(bg.category)
          grouped[bg.category] = grouped[bg.category] || []
          grouped[bg.category].push(bg)
        })

        setBackgrounds(grouped)
        setCategories(Array.from(uniqueCategories))

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
    <div className="bg-background">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-blue-600">Background Gallery</h3>
        </div>
        <p className="text-sm text-blue-600">Select a background to enhance your video</p>
      </div>

      {/* Tabs and Backgrounds */}
      <div className="px-6 py-5">
        {categories.length > 0 ? (
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-muted p-1 rounded-none justify-start overflow-x-auto gap-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="rounded-none capitalize whitespace-nowrap data-[state=active]:bg-background"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="mt-6 h-[400px] pr-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              ) : error ? (
                <div className="text-center p-4 text-destructive">{error}</div>
              ) : (
                categories.map((category) => (
                  <TabsContent key={category} value={category} className="m-0">
                    {!backgrounds[category]?.length ? (
                      <div className="text-center p-4 text-muted-foreground">
                        No backgrounds available in this category
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {backgrounds[category].map((bg) => (
                          <div
                            key={bg.id}
                            onClick={() => selectBackground(bg.id, bg.src, bg.premium)}
                            className={`relative group rounded-sm overflow-hidden border transition hover:shadow-md ${bg.premium ? "cursor-not-allowed" : "cursor-pointer"
                              }`}
                          >
                            {bg.src && (
                              <div className="roundeaspect-video relative">
                                <img
                                  src={bg.src}
                                  alt={bg.name}
                                  className="rounded-none object-contain transition-transform group-hover:scale-105"
                                />
                              </div>
                            )}

                            {bg.premium && (
                              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center space-y-2 z-10">
                                <Lock className="text-white h-6 w-6" />
                                <span className="text-xs text-white font-semibold">Premium</span>
                                <Button size="sm" variant="secondary" className="text-xs">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Upgrade
                                </Button>
                              </div>
                            )}

                            <div className="bg-white px-2 py-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-foreground font-medium truncate">{bg.name}</p>
                                {bg.premium && (
                                  <Badge
                                    variant="outline"
                                    className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px]"
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
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground">
            <p>No background categories available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t bg-muted flex justify-end">
        <Button variant="outline" onClick={onClose}>
          <X size={16} className="mr-2" />
          Close Gallery
        </Button>
      </div>
    </div>

  )
}