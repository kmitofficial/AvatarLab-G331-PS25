// components/Sidebar.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X, Home, Video, History, Settings, HelpCircle } from 'lucide-react';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const menuItems = [
        { name: 'Home', icon: <Home size={20} />, href: '/Home' },
        { name: 'My Videos', icon: <Video size={20} />, href: '/my-videos' },
        { name: 'History', icon: <History size={20} />, href: '/history' },
        { name: 'Settings', icon: <Settings size={20} />, href: '/settings' },
        { name: 'Help', icon: <HelpCircle size={20} />, href: '/help' },
    ];

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-md bg-blue-600 text-white"
                onClick={toggleSidebar}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <motion.div
                className={`fixed lg:static h-full bg-blue-700 text-white z-10 w-64
                   ${isOpen ? 'left-0' : '-left-full'} lg:left-0 transition-all duration-300`}
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
            >
                <div className="p-5">
                    <h2 className="text-2xl font-bold mb-8">TalkSync AI</h2>

                    <nav>
                        <ul className="space-y-4">
                            {menuItems.map((item, index) => (
                                <motion.li
                                    key={item.name}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link href={item.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-600 transition-colors">
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </motion.div>
        </>
    );
}