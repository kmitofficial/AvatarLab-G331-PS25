    'use client';

    import { useRef, useState } from 'react';
    import Link from 'next/link';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';
    import { Timeline } from '@/components/ui/timeline';
    import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
    import { FlipWords } from '@/components/ui/flip-words';
    import Navbar from '@/components/Navbar';
    import UserCounterSection from '@/components/ui/counter';

    const routeMap = [
      {
        title: 'Script Creation',
        content: (
          <p className="text-gray-700 dark:text-gray-300 max-w-xl text-base md:text-lg">
            Begin by crafting the message you want your avatar to convey. Whether it’s for training, marketing, or storytelling—precision starts with words.
          </p>
        ),
        image: '/images/script-creation.jpg',
      },
      {
        title: 'Visual Identity',
        content: (
          <p className="text-gray-700 dark:text-gray-300 max-w-xl text-base md:text-lg">
            Select a photorealistic avatar from our diverse collection. Each character is designed to convey professionalism, relatability, or charisma.
          </p>
        ),
        image: '/images/emma.jpeg',
      },
      {
        title: 'Voice Personalization',
        content: (
          <p className="text-gray-700 dark:text-gray-300 max-w-xl text-base md:text-lg">
            Choose a voice that aligns with your message tone. From corporate clarity to expressive storytelling, find a sound that speaks for you.
          </p>
        ),
        image: '/images/step3-voice.png',
      },
      {
        title: 'Video Generation',
        content: (
          <p className="text-gray-700 dark:text-gray-300 max-w-xl text-base md:text-lg">
            Watch your avatar come to life with synchronized motion, speech, and expression—ready to be exported and shared across your channels.
          </p>
        ),
        image: '/images/step4-video.png',
      },
    ];

    const userComments = [
      {
        quote: "This tool has completely transformed the way we create presentations! The avatars are incredibly lifelike.",
        name: "Gajala",
        title: "Washington DC, USA",
      },
      {
        quote: "A game-changer for content creators! The voice synchronization is spot on, and the avatars feel real.",
        name: "Rohith Sharma",
        title: "Mumbai, India",
      },
      {
        quote: "Fantastic! Easy to use and produces amazing results. My students love learning from the avatars.",
        name: "Michael Lee",
        title: "Sydney, Australia",
      },
      {
        quote: "The best tool for creating interactive avatars! It's enhanced our marketing campaigns dramatically.",
        name: "Emily Johnson",
        title: "Los Angeles, USA",
      },
      {
        quote: "This has revolutionized how we approach education. The avatars are engaging and fun to use!",
        name: "virat Kohli",
        title: "Bangalore, India",
      },
    ];

    const plans = [
      {
        name: 'Free Plan',
        price: '₹0',
        description: 'Create up to 3 videos per month.',
        features: ['3 videos/month', 'Basic support', 'Watermarked videos'],
      },
      {
        name: 'Pro Plan',
        price: '₹499/month',
        description: 'Create up to 20 videos per month.',
        features: ['20 videos/month', 'Priority support', 'No watermark', 'HD export'],
      },
      {
        name: 'Enterprise Plan',
        price: '₹1999/month',
        description: 'Unlimited video creation for teams and businesses.',
        features: ['Unlimited videos', 'Dedicated support', 'Custom avatars', 'Team access'],
      },
    ];
    const paymentMethods = ['Card', 'PayPal', 'UPI'];

    export default function LandingPage() {
      const containerRef = useRef<HTMLDivElement>(null);
      const parentRef = useRef<HTMLDivElement>(null);
      const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
      const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

      const handleSubscribe = (planName: string) => {
        setSelectedPlan(planName);
        setPaymentMethod(null);
      };

      return (
        <main className="min-h-screen dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-x-hidden">
          <Navbar />
          <BackgroundBeamsWithCollision
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            parentRef={parentRef as React.RefObject<HTMLDivElement>}
          >
            <section
              ref={parentRef}
              className="flex-1 flex flex-col md:flex-row items-center justify-between text-center md:text-left px-4 py-20 relative z-10 max-w-7xl mx-auto"
            >
              <div className="md:w-1/2 flex flex-col items-center md:items-start">
                <motion.h1
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-4xl md:text-6xl font-extrabold leading-tight bg-clip-text text-black dark:text-white"
                >
                  <FlipWords
                    words={['Create', 'Engage', 'Inspire']}
                    duration={2000}
                    className="text-blue-600 dark:text-blue-400 inline-block"
                  />{' '}
                  your Ideas with <span className="text-blue-600 dark:text-blue-400">Avatar Lab</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl"
                >
                  Create lifelike AI avatars that speak your words—ideal for business, education, or storytelling.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="mt-10 flex flex-col sm:flex-row gap-4"
                >
                  <Link href="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 text-lg rounded-xl shadow-lg">
                      Start Creating
                    </Button>
                  </Link>
                  <Link href="#workflow">
                    <Button
                      variant="outline"
                      className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 px-6 py-3 text-lg rounded-xl"
                    >
                      Explore Workflow
                    </Button>
                  </Link>
                </motion.div>
              </div>

              <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center md:justify-end">
                <video
                  className="w-full max-w-md h-auto object-cover rounded-lg "
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="videos/HOME.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </section>
          </BackgroundBeamsWithCollision>

          <section id="workflow" className="bg-gray-50 dark:bg-gray-800">
            <style jsx>{`
              .timeline-font,
              .timeline-font * {
                font-family: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
                color: #1f2937;
              }

              .timeline-font h3, .timeline-font h2, .timeline-font h1 {
                font-weight: 600;
                font-size: 2rem;
                color: #111827;
                margin-bottom: 1rem;
              }

              .timeline-font p {
                font-weight: 400;
                font-size: 1.05rem;
                line-height: 1.8;
                margin-bottom: 3rem;
                color: #374151;
              }

              .dark .timeline-font,
              .dark .timeline-font * {
                color: #d1d5db;
              }

              .dark .timeline-font h3, .dark .timeline-font h2, .dark .timeline-font h1 {
                color: #f3f4f6;
              }

              .dark .timeline-font p {
                color: #9ca3af;
              }
            `}</style>
            <div className="timeline-font" id="services">
              <Timeline data={routeMap} />
            </div>
          </section>

          <section id="pricing">
            <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-16 px-6 mt-5">
              <div className="max-w-5xl mx-auto text-center">
                <motion.h1
                  className="text-4xl font-bold mb-6 text-gray-900 dark:text-gray-100"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Choose Your Subscription Plan
                </motion.h1>
                <motion.p
                  className="text-lg text-gray-600 dark:text-gray-400 mb-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  The number of videos you can create depends on your subscription plan.
                </motion.p>
                <div className="grid md:grid-cols-3 gap-8">
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.name}
                      className={`rounded-xl shadow-lg p-6 bg-white dark:bg-gray-700 border ${
                        selectedPlan === plan.name ? 'border-blue-500 dark:border-blue-400' : 'border-transparent'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{plan.name}</h2>
                      <p className="text-xl text-blue-600 dark:text-blue-400 mb-4">{plan.price}</p>
                      <p className="mb-4 text-gray-600 dark:text-gray-400">{plan.description}</p>
                      <ul className="text-left text-sm mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                        {plan.features.map((feature) => (
                          <li key={feature}>• {feature}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleSubscribe(plan.name)}
                        className="w-full mt-auto bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
                      >
                        {plan.name === 'Free Plan' ? 'Get Started' : 'Subscribe'}
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Payment Selection Section */}
                {selectedPlan && selectedPlan !== 'Free Plan' && (
                  <motion.div
                    className="mt-16 max-w-xl mx-auto bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Selected: {selectedPlan}</h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">Choose your payment method:</p>
                    <div className="flex flex-col gap-4">
                      {paymentMethods.map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`border px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition ${
                            paymentMethod === method ? 'border-blue-600 dark:border-blue-400' : 'border-gray-300 dark:border-gray-500'
                          } text-gray-900 dark:text-gray-100`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>

                    {paymentMethod && (
                      <div className="mt-6 text-center">
                        <p className="mb-2 text-gray-700 dark:text-gray-300">
                          You selected <strong>{paymentMethod}</strong> to pay for <strong>{selectedPlan}</strong>.
                        </p>
                        <button
                          onClick={() => alert(`Processing ${paymentMethod} payment for ${selectedPlan}`)}
                          className="bg-green-600 dark:bg-green-500 text-white px-6 py-2 rounded hover:bg-green-700 dark:hover:bg-green-600 transition"
                        >
                          Proceed to Pay
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          <section id="reviews" className="px-4 py-16 bg-white dark:bg-gray-900 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
              What Our Users Say
            </h2>
            <InfiniteMovingCards items={userComments} direction="left" speed="normal" />
          </section>

          <UserCounterSection />

          <footer className="bg-gray-800 dark:bg-gray-950 text-white dark:text-gray-200 text-center py-4">
            <p className="text-sm">
              © {new Date().getFullYear()} Avatar Lab. All rights reserved.
            </p>
          </footer>
        </main>
      );
    }