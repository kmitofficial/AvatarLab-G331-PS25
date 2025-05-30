"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, FileText, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";


const faqItems = [
  { question: "How do I create my first talking head video?", answer: 'To create your first talking head video, navigate to the Workspace page, enter your script, select an avatar, choose a voice, and click "Generate Video". The process typically takes a few minutes depending on the length of your script.' },
  { question: "What file formats are supported for download?", answer: "Avatar Lab supports downloading videos in MP4, WebM, and MOV formats. You can select your preferred format in the download options after your video has been generated." },
  { question: "Can I customize the avatar's appearance?", answer: 'Yes, you can customize certain aspects of the avatar\'s appearance. Select the "Custom" avatar option to access additional customization features like clothing, accessories, and background settings.' },
  { question: "How many videos can I create with my subscription?", answer: "The number of videos you can create depends on your subscription plan. Free accounts can create up to 3 videos per month, while paid plans offer higher limits. Check your account settings for details on your current plan and usage." },
  { question: "How do I recover deleted videos?", answer: 'Deleted videos are moved to the Trash section where they remain for 30 days before being permanently deleted. To recover a video, go to the Trash page, find the video you want to restore, and click the "Restore" button.' }
];

const guideItems = [
  { title: "Getting Started Guide", description: "Learn the basics of creating your first talking head video" },
  { title: "Advanced Voice Settings", description: "Master voice customization for more natural-sounding videos" },
  { title: "Avatar Customization", description: "Learn how to customize avatars to match your brand" },
  { title: "Video Export Options", description: "Understand the different export settings and formats" },
  { title: "Using Templates", description: "Save time by creating and using video templates" },
  { title: "Account Management", description: "Manage your subscription, billing, and account settings" }
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: "easeOut" }
}
export default function HelpPage() {
  return (
    <motion.div
      {...fadeUp}
      className="container mx-auto p-2"
    >
      <motion.div {...fadeUp} className="mb-6 text-center">
        <h1 className="text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
          Help & Support
        </h1>
        <p className="text-muted-foreground">
          Find answers to your questions and get support
        </p>
      </motion.div>

      <Tabs defaultValue="faq" className="space-y-6">
        <motion.div {...fadeUp}>
          <TabsList className="rounded-none bg-blue-100 dark:bg-blue-900/30">
            <TabsTrigger
              value="faq"
              className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <BookOpen className="mr-2 h-4 w-4" /> FAQ
            </TabsTrigger>
            <TabsTrigger
              value="guides"
              className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <FileText className="mr-2 h-4 w-4" /> Guides
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="rounded-none data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Contact Support
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="faq" className="space-y-4">
          <motion.div {...fadeUp}>
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about Avatar Lab
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, i) => (
                    <motion.div key={i} {...fadeUp}>
                      <AccordionItem value={`item-${i}`}>
                        <AccordionTrigger>{item.question}</AccordionTrigger>
                        <AccordionContent>{item.answer}</AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <motion.div {...fadeUp}>
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle>User Guides</CardTitle>
                <CardDescription>
                  Step-by-step guides to help you get the most out of Avatar Lab
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-0 grid gap-4 sm:grid-cols-4">
                  {guideItems.map((g, i) => (
                    <motion.div key={i} {...fadeUp}>
                      <Card className="p-0 rounded-sm cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">{g.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                          {g.description}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <motion.div {...fadeUp}>
            <Card className="rounded-none max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get help from our support team</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <motion.div {...fadeUp} className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Your email address" />
                    </div>
                  </motion.div>

                  <motion.div {...fadeUp} className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief description of your issue" />
                  </motion.div>

                  <motion.div {...fadeUp} className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue in detail"
                      className="rounded-sm min-h-[150px]"
                    />
                  </motion.div>

                  <motion.div {...fadeUp}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                      Submit Request
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}