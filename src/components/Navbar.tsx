'use client'
import React from 'react'
import { motion } from "motion/react";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItem = [
    { name: "Home", path: "/" },
    { name: "Bookings", path: "/bookings" },
    { name: "About Us", path: "/about-us" },
    { name: "Contact", path: "/contact" }
];

const Navbar = () => {
    const pathName = usePathname();

    return (
        <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0b0b0b] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-2"
        >
            <div className='max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between'>

                {/* Logo */}
                <Image
                    src="/navLogos.png"
                    alt="Navbar logo for easy wheels"
                    width={95}
                    height={80}
                    priority
                />

                {/* Nav Items */}
                <div className="flex items-center gap-6">
                    {navItem.map((item, index) => {
                        const active = item.path === pathName;

                        return (
                            <Link
                                href={item.path}
                                key={index}
                                className={`text-sm font-medium transition ${active
                                    ? "text-white"
                                    : "text-gray-400 hover:text-white"
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
                <button className='px-4 py-1.5 rounded-full bg-white text-black text-sm'>
                    Login
                </button>

            </div>
        </motion.div>
    )
}

export default Navbar;