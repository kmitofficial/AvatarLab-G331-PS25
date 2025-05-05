'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

const UserCounterSection: React.FC = () => {
  const [count, setCount] = useState(0);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);

  const animateCounter = () => {
    setCount(0);
    let start = 0;
    const end = 10000;
    const duration = 2000;
    const stepTime = Math.abs(Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 100;
      setCount((prev) => Math.min(prev + 100, end));
      if (start >= end) clearInterval(timer);
    }, stepTime);
    controls.start('visible');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      animateCounter();
    }, 10000); // every 10 seconds

    animateCounter(); // initial run

    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="bg-blue-50 py-20 text-center">
      <motion.div
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
          {count.toLocaleString()}+ Users
        </h2>
        <p className="text-lg text-gray-600">
          Trusted by thousands of creators, educators, and businesses worldwide.
        </p>
      </motion.div>
    </section>
  );
};

export default UserCounterSection;
