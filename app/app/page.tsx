"use client"
import type React from "react"
import { useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FlipWords } from "@/components/ui/flip-words"
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision"

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-blue-950 flex flex-col">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-blue-100 dark:border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AvatarLab
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <div className="flex space-x-6">
                <Link
                  href="#features"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Pricing
                </Link>
                <Link
                  href="#testimonials"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Testimonials
                </Link>
                <Link
                  href="/help"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
                >
                  Help
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <BackgroundBeamsWithCollision
        containerRef={containerRef as React.RefObject<HTMLDivElement>}
        parentRef={parentRef as React.RefObject<HTMLDivElement>}
      >
        <section
          ref={parentRef}
          className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center">
            <motion.h1
              className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FlipWords
                words={["Create", "Engage", "Inspire", "Transform"]}
                duration={2000}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-blue-600 inline-block"
              />{" "}
              your Ideas with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Avatar Lab
              </span>
            </motion.h1>
            <motion.p
              className="mt-6 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Transform your text into lifelike videos with our advanced AI technology. Perfect for business
              presentations, educational content, and more.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg rounded-md shadow-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  variant="outline"
                  className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 px-8 py-3 text-lg rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </BackgroundBeamsWithCollision>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Powerful Features
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Everything you need to create professional AI avatars
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Script Creation",
                description:
                  "Begin by crafting the message you want your avatar to convey. Whether it's for training, marketing, or storytelling—precision starts with words.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                ),
              },
              {
                title: "Visual Identity",
                description:
                  "Select a photorealistic avatar from our diverse collection. Each character is designed to convey professionalism, relatability, or charisma.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
              {
                title: "Voice Personalization",
                description:
                  "Choose a voice that aligns with your message tone. From corporate clarity to expressive storytelling, find a sound that speaks for you.",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-blue-600 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ),
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-md p-8 flex flex-col items-center text-center border border-blue-100 dark:border-blue-900/30 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-4 bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Choose the plan that's right for you
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Free Plan",
                price: "₹0",
                description: "Perfect for trying out the platform",
                features: ["3 videos/month", "Basic support", "Watermarked videos"],
                buttonText: "Get Started",
                popular: false,
              },
              {
                name: "Pro Plan",
                price: "₹499/month",
                description: "For professionals and small teams",
                features: ["20 videos/month", "Priority support", "No watermark", "HD export"],
                buttonText: "Subscribe",
                popular: true,
              },
              {
                name: "Enterprise Plan",
                price: "₹1999/month",
                description: "For organizations with advanced needs",
                features: ["Unlimited videos", "Dedicated support", "Custom avatars", "Team access"],
                buttonText: "Contact Sales",
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={cn(
                  "rounded-lg p-8 flex flex-col",
                  plan.popular
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl scale-105 z-10"
                    : "bg-white dark:bg-gray-800 shadow-md border border-blue-100 dark:border-blue-900/30",
                )}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {plan.popular && (
                  <div className="bg-blue-700 text-white text-xs font-bold uppercase tracking-wider py-1 px-2 rounded-full self-start mb-4">
                    Most Popular
                  </div>
                )}
                <h3
                  className={cn(
                    "text-2xl font-bold mb-2",
                    plan.popular ? "text-white" : "text-gray-900 dark:text-white",
                  )}
                >
                  {plan.name}
                </h3>
                <div
                  className={cn(
                    "text-3xl font-bold mb-4",
                    plan.popular ? "text-white" : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
                  )}
                >
                  {plan.price}
                </div>
                <p className={cn("mb-6", plan.popular ? "text-blue-100" : "text-gray-600 dark:text-gray-400")}>
                  {plan.description}
                </p>
                <ul className="mb-8 space-y-2 flex-1">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className={cn(
                        "flex items-center",
                        plan.popular ? "text-blue-100" : "text-gray-600 dark:text-gray-400",
                      )}
                    >
                      <svg
                        className={cn(
                          "h-5 w-5 mr-2",
                          plan.popular ? "text-blue-200" : "text-blue-600 dark:text-blue-400",
                        )}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="mt-auto">
                  <Button
                    className={cn(
                      "w-full py-3",
                      plan.popular
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white",
                    )}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Trusted by professionals worldwide
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "This tool has completely transformed the way we create presentations! The avatars are incredibly lifelike.",
                name: "Gajala",
                title: "Washington DC, USA",
              },
              {
                quote:
                  "A game-changer for content creators! The voice synchronization is spot on, and the avatars feel real.",
                name: "Rohith Sharma",
                title: "Mumbai, India",
              },
              {
                quote:
                  "Fantastic! Easy to use and produces amazing results. My students love learning from the avatars.",
                name: "Michael Lee",
                title: "Sydney, Australia",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-md p-8 border border-blue-100 dark:border-blue-900/30"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-4 text-blue-600 dark:text-blue-400">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 flex-1">{testimonial.quote}</p>
                  <div className="mt-auto">
                    <p className="font-bold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="px-6 py-12 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to create your first AI avatar?</h2>
                <p className="text-blue-100 text-lg">
                  Join thousands of professionals who are already using Avatar Lab to create engaging content.
                </p>
              </div>
              <div className="md:w-1/3 md:text-right">
                <Link href="/signup">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg rounded-md shadow-md">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

     {/* Footer */}
<footer className="bg-gradient-to-b from-gray-900 to-blue-900 text-white py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-blue-300">Avatar Lab</h3>
        <p className="text-sm text-gray-400">
          Create lifelike AI avatars that speak your words—ideal for business, education, or storytelling.
        </p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-blue-300">Quick Links</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="#features" className="text-gray-400 hover:text-white">
              Features
            </Link>
          </li>
          <li>
            <Link href="#pricing" className="text-gray-400 hover:text-white">
              Pricing
            </Link>
          </li>
          <li>
            <Link href="#testimonials" className="text-gray-400 hover:text-white">
              Testimonials
            </Link>
          </li>
          <li>
            <Link href="/help" className="text-gray-400 hover:text-white">
              Help & Support
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-blue-300">Legal</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link href="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/cookies" className="text-gray-400 hover:text-white">
              Cookie Policy
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 text-blue-300">Connect</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/contact" className="text-gray-400 hover:text-white">
              Contact Us
            </Link>
          </li>
          <li>
            <Link href="/feedback" className="text-gray-400 hover:text-white">
              Feedback
            </Link>
          </li>
        </ul>
        <div className="flex space-x-4 mt-4">
          <Link href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
            </svg>
          </Link>
        </div>
      </div>
    </div>
    <div className="mt-12 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} Avatar Lab. All rights reserved.
    </div>
  </div>
</footer>
</div>
  )
};