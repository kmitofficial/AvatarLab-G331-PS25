"use client"

import { useState, useEffect, type ChangeEvent, type FormEvent, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { getEmail } from "@/lib/authenticate"
import { toast } from "react-toastify"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Globe, User, Shield, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
}

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
}

export default function SettingsPage() {
  const shouldReduceMotion = useReducedMotion()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profilePhoto, setProfilePhoto] = useState("")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [showPhotoOptions, setShowPhotoOptions] = useState(false)
  const [viewPhoto, setViewPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [details, setDetails] = useState({ email: "", username: "", image: "" })
  const [language, setLanguage] = useState("en")
  const [fontSize, setFontSize] = useState("medium")
  const [highContrast, setHighContrast] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const router = useRouter()

  const [currentPlan, setCurrentPlan] = useState({
    name: "Free Plan",
    renewalDate: "N/A",
    usageQuota: "Limited",
  })

  useEffect(() => {
    const theme = () => {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
      if (savedTheme) {
        setTheme(savedTheme)
        document.documentElement.classList.toggle("dark", savedTheme === "dark")
      }
    }
    const getDetails = async () => {
      const result = await getEmail()
      if (result) {
        setDetails((prev) => ({ ...prev, email: result.email, username: result.username, image: result.image }))
        setProfilePhoto(result.image)
      }
    }
    getDetails()
    theme()
  }, [])

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size exceeds 5MB limit")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string)
        setShowPhotoOptions(false)
        toast.success("Profile photo updated successfully!")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangePhoto = () => {
    fileInputRef.current?.click()
  }

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Profile updated successfully!")
    } catch (err) {
      toast.error("Failed to update profile")
    }
  }

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match")
      return
    }
    const result = await getEmail()
    const email = result?.email
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, currentPassword, newPassword}),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update password")
      }
      toast.success("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      toast.error("Failed to change password. Please try again.")
    }
  }

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const handleAccessibilitySave = async (e: FormEvent) => {
    e.preventDefault()
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Accessibility settings saved!")
    } catch (err) {
      toast.error("Failed to save accessibility settings")
    }
  }

  return (
    <motion.div
      className="container mx-auto p-2" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-medium mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          Account Settings
        </h1>

        <Tabs defaultValue="profile">
          <TabsList className="rounded-none grid grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="rounded-none flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-none flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="rounded-none flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Accessibility</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <AnimatePresence mode="wait">
            <TabsContent value="profile" asChild>
              <motion.div
                key="profile"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <section className="mb-8 bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">
                    Profile Information
                  </h2>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* Profile Photo */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div
                            className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer border-4 border-white dark:border-gray-600 shadow-md"
                            onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                          >
                            {profilePhoto ? (
                              <Image
                                src={profilePhoto || "/placeholder.svg"}
                                alt="Profile"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-16 w-16"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <AnimatePresence>
                            {showPhotoOptions && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-32 left-0 mt-2 bg-white dark:bg-gray-700 shadow-lg rounded-md p-2 z-10 w-40"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (profilePhoto) setViewPhoto(true)
                                    setShowPhotoOptions(false)
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                  disabled={!profilePhoto}
                                >
                                  View Photo
                                </button>
                                <button
                                  type="button"
                                  onClick={handleChangePhoto}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                                >
                                  Change Photo
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={handleChangePhoto}
                          variant="outline"
                          size="sm"
                          className="text-sm"
                        >
                          Update Photo
                        </Button>
                      </div>

                      {/* Profile Details */}
                      <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="username" className="text-sm font-medium mb-1 block">
                              Username
                            </Label>
                            <div className="py-3 font-medium">{details.username}</div>
                          </div>
                          <div>
                            <Label htmlFor="email" className="text-sm font-medium mb-1 block">
                              Email Address
                            </Label>
                            <div className="py-3 rounded-md font-medium">{details.email}</div>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="language" className="text-sm font-medium mb-1 block">
                            Preferred Language
                          </Label>
                          <Select value={language} onValueChange={(value) => setLanguage(value)}>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                              <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                              <SelectItem value="zh">Chinese</SelectItem>
                              <SelectItem value="ja">Japanese</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="submit"
                          className="rounded-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Save Profile
                        </Button>

                      </div>
                    </div>
                  </form>
                </section>

                {/* Subscription Section */}
                <section className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-none shadow-lg border border-gray-300 dark:border-gray-700">
                  <h2 className="text-2xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">
                    Subscription
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Current Plan", value: currentPlan.name },
                      { label: "Renewal Date", value: currentPlan.renewalDate },
                      { label: "Usage Quota", value: currentPlan.usageQuota },
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-gray-200">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                          {item.label}
                        </p>
                        <p className="font-medium text-lg">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex gap-4">
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-gradient-to-r hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-sm"
                      onClick={() => router.push("/plans")}
                    >
                      Upgrade Plan
                    </Button>
                    <Button variant="outline">Billing History</Button>
                  </div>
                </section>
              </motion.div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" asChild>
              <motion.div
                key="security"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <section className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-none shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-300">
                    Change Password
                  </h2>
                  <form onSubmit={handlePasswordChange} className="max-w-md">
                    <div className="space-y-4">
                      {[
                        {
                          id: "current-password",
                          label: "Current Password",
                          value: currentPassword,
                          setValue: setCurrentPassword,
                        },
                        {
                          id: "new-password",
                          label: "New Password",
                          value: newPassword,
                          setValue: setNewPassword,
                        },
                        {
                          id: "confirm-password",
                          label: "Confirm New Password",
                          value: confirmPassword,
                          setValue: setConfirmPassword,
                        },
                      ].map((field) => (
                        <div key={field.id}>
                          <Label htmlFor={field.id} className="text-sm font-medium mb-1 block">
                            {field.label}
                          </Label>
                          <Input
                            id={field.id}
                            type="password"
                            value={field.value}
                            onChange={(e) => field.setValue(e.target.value)}
                            className="rounded-sm dark:bg-gray-700 dark:border-gray-600"
                            required
                          />
                        </div>
                      ))}

                      <Button
                        type="submit"
                        className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Change Password
                      </Button>

                    </div>
                  </form>
                </section>
                <section className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-none shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-semibold mb-6 pb-2 border-b border-gray-400">
                    Data & Privacy
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        title: "Download Your Data",
                        description:
                          "You can request a copy of your personal data, including your profile information and activity.",
                        buttonText: "Request Data Export",
                        variant: "outline",
                      },
                      {
                        title: "Delete Account",
                        description:
                          "Permanently delete your account and all associated data. This action cannot be undone.",
                        buttonText: "Delete Account",
                        variant: "outline",
                        className:
                          "rounded-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20",
                      },
                    ].map((item) => (
                      <div key={item.title}>
                        <h3
                          className={`font-medium mb-2 ${item.title === "Delete Account" ? "text-red-600 dark:text-red-400" : ""
                            }`}
                        >
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          {item.description}
                        </p>
                        <Button variant="outline" className={item.className}>
                          {item.buttonText}
                        </Button>
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            </TabsContent>

            {/* Accessibility Tab */}
            <TabsContent value="accessibility" asChild>
              <motion.div
                key="accessibility"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <section className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-none shadow-lg border border-gray-100 dark:border-gray-700">
                  <h2 className="text-2xl font-semibold mb-6 pb-2 border-b dark:border-gray-700">
                    Accessibility Settings
                  </h2>
                  <form onSubmit={handleAccessibilitySave}>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="font-size" className="text-sm font-medium mb-1 block">
                          Font Size
                        </Label>
                        <Select value={fontSize} onValueChange={(value) => setFontSize(value)}>
                          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select a font size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                            <SelectItem value="x-large">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {[
                        {
                          title: "High Contrast Mode",
                          description: "Increase contrast for better visibility",
                          checked: highContrast,
                          onCheckedChange: setHighContrast,
                        },
                        {
                          title: "Reduce Motion",
                          description: "Minimize animations and transitions",
                          checked: reduceMotion,
                          onCheckedChange: setReduceMotion,
                        },
                      ].map((item) => (
                        <div key={item.title} className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                          </div>
                          <Switch checked={item.checked} onCheckedChange={item.onCheckedChange} />
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Theme</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Choose between light and dark mode
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Sun className="h-5 w-5 text-gray-500" />
                          <Switch checked={theme === "dark"} onCheckedChange={handleThemeToggle} />
                          <Moon className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Save Accessibility Settings
                      </Button>
                    </div>
                  </form>
                </section>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Full-size Photo */}
      <AnimatePresence>
        {viewPhoto && profilePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setViewPhoto(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-md w-full"
            >
              <Image
                src={profilePhoto || "/placeholder.svg"}
                alt="Full-size Profile"
                width={400}
                height={400}
                className="rounded-lg object-cover w-full h-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}