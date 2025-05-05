"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "react-toastify"

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [currentPlan, setCurrentPlan] = useState<string>("Free Plan")

  const plans = [
    {
      name: "Free Plan",
      price: billingCycle === "monthly" ? "₹0" : "₹0",
      description: "Create up to 3 videos per month.",
      features: ["3 videos/month", "Basic support", "Watermarked videos"],
      missingFeatures: ["Priority support", "No watermark", "HD export", "Custom avatars", "Team access"],
      buttonText: currentPlan === "Free Plan" ? "Current Plan" : "Get Started",
      popular: false,
    },
    {
      name: "Pro Plan",
      price: billingCycle === "monthly" ? "₹499/month" : "₹4,999/year",
      description: "Create up to 20 videos per month.",
      features: ["20 videos/month", "Priority support", "No watermark", "HD export"],
      missingFeatures: ["Custom avatars", "Team access"],
      buttonText: currentPlan === "Pro Plan" ? "Current Plan" : "Upgrade to Pro",
      popular: true,
      savings: billingCycle === "yearly" ? "Save ₹1,989" : null,
    },
    {
      name: "Enterprise Plan",
      price: billingCycle === "monthly" ? "₹1,999/month" : "₹19,999/year",
      description: "Unlimited video creation for teams and businesses.",
      features: ["Unlimited videos", "Dedicated support", "Custom avatars", "Team access", "No watermark", "HD export"],
      missingFeatures: [],
      buttonText: currentPlan === "Enterprise Plan" ? "Current Plan" : "Contact Sales",
      popular: false,
      savings: billingCycle === "yearly" ? "Save ₹3,989" : null,
    },
  ]

  const handlePlanSelect = (planName: string) => {
    if (planName === currentPlan) {
      toast.info("You are already subscribed to this plan", { position: "bottom-right" })
      return
    }

    if (planName === "Enterprise Plan") {
      toast.info("Our sales team will contact you shortly", { position: "bottom-right" })
    } else {
      toast.success(`Successfully switched to ${planName}`, { position: "bottom-right" })
      setCurrentPlan(planName)
    }
  }

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Select the perfect plan for your needs. Upgrade or downgrade at any time.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 inline-flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "yearly" ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Yearly <span className="text-xs font-normal text-green-500 dark:text-green-400 ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`relative rounded-2xl overflow-hidden border ${
                plan.popular ? "border-blue-500 dark:border-blue-400" : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              <div className={`p-6 ${plan.popular ? "bg-blue-50 dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`}>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.name !== "Free Plan" && billingCycle === "monthly" && (
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">per month</span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                <Button
                  onClick={() => handlePlanSelect(plan.name)}
                  className={`w-full ${
                    currentPlan === plan.name
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-default"
                      : plan.popular
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white"
                  }`}
                  disabled={currentPlan === plan.name}
                >
                  {plan.buttonText}
                </Button>
                {plan.savings && (
                  <p className="text-center text-green-500 dark:text-green-400 text-sm mt-2 font-medium">
                    {plan.savings}
                  </p>
                )}
              </div>
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
                <h4 className="font-medium mb-4">Features included:</h4>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.missingFeatures.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mr-2 shrink-0" />
                      <span className="text-gray-400 dark:text-gray-500 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will be reflected
                in your next billing cycle.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards, PayPal, and UPI payments. For Enterprise plans, we also support
                invoicing.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-2">Do unused videos roll over to the next month?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                No, unused video credits do not roll over to the next month. They reset at the beginning of each billing
                cycle.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can try our service with the Free plan that includes 3 videos per month. No credit card
                required.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Our team is here to help you find the perfect plan for your needs. Contact us for a personalized
            consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Contact Sales
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              View Documentation
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
