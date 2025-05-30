"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Smile, Frown, Meh, Send, ThumbsUp } from "lucide-react"
import { motion } from "framer-motion"

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
}

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState("suggestion")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTimeout(() => {
      setFeedbackSubmitted(true)
    }, 1000)
  }

  return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="container mx-auto p-2">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
            Feedback
          </h1>
          <p className="text-muted-foreground">Help us improve Avatar Lab with your feedback</p>
        </div>

        <div className="max-w-2xl mx-auto">
          {feedbackSubmitted ? (
            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <ThumbsUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Thank You for Your Feedback!</h2>
                <p className="text-muted-foreground mb-4">
                  We appreciate your input and will use it to improve Avatar Lab.
                </p>
                <Button
                  onClick={() => setFeedbackSubmitted(false)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Submit Another Feedback
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-none mt-4">
              <CardHeader>
                <CardTitle>Share Your Thoughts</CardTitle>
                <CardDescription>Your feedback helps us improve our product</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Label>What kind of feedback do you have?</Label>
                    <RadioGroup
                      value={feedbackType}
                      onValueChange={setFeedbackType}
                      className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                    >
                      <Label
                        htmlFor="suggestion"
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm border p-4 ${feedbackType === "suggestion"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-800"
                          }`}
                      >
                        <RadioGroupItem value="suggestion" id="suggestion" className="sr-only" />
                        <Smile
                          className={`h-5 w-5 ${feedbackType === "suggestion" ? "text-blue-600" : "text-muted-foreground"
                            }`}
                        />
                        <span>Suggestion</span>
                      </Label>
                      <Label
                        htmlFor="issue"
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm border p-4 ${feedbackType === "issue"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-800"
                          }`}
                      >
                        <RadioGroupItem value="issue" id="issue" className="sr-only" />
                        <Frown
                          className={`h-5 w-5 ${feedbackType === "issue" ? "text-blue-600" : "text-muted-foreground"}`}
                        />
                        <span>Issue</span>
                      </Label>
                      <Label
                        htmlFor="other"
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm border p-4 ${feedbackType === "other"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-800"
                          }`}
                      >
                        <RadioGroupItem value="other" id="other" className="sr-only" />
                        <Meh
                          className={`h-5 w-5 ${feedbackType === "other" ? "text-blue-600" : "text-muted-foreground"}`}
                        />
                        <span>Other</span>
                      </Label>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Your feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Tell us what you think..."
                      className="min-h-[150px] border-blue-200 dark:border-blue-800 focus-visible:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
  )
}
