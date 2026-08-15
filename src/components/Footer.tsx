'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowUpRight, Globe } from 'lucide-react'

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Bookings', href: '/bookings' },
]

const legalLinks = [
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refunds' },
]

const socials = [
    { icon: Globe, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Globe, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Globe, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Globe, href: 'https://youtube.com', label: 'YouTube' },
]

const Footer = () => {
    const year = new Date().getFullYear()

    return (
        <footer className='bg-[#0b0b0b] text-white relative overflow-hidden'>

            {/* Subtle top gradient glow */}
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent' />

            {/* Large background wordmark */}
            <div className='absolute bottom-10 left-1/2 -translate-x-1/2 text-[clamp(5rem,18vw,14rem)] font-black text-white/[0.03] whitespace-nowrap select-none pointer-events-none leading-none tracking-tighter'>
                EASY WHEELS
            </div>

            <div className='relative max-w-7xl mx-auto px-6 sm:px-10 pt-16 pb-8'>

                {/* ── Main 3-column grid ── */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 pb-12 border-b border-white/8'>

                    {/* Col 1 — Brand */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Image
                            src='/navLogos.png'
                            alt='Easy Wheels'
                            width={100}
                            height={80}
                            className='mb-5 brightness-0 invert'
                        />
                        <p className='text-zinc-400 text-sm leading-relaxed max-w-[240px]'>
                            Redefining urban mobility — book bikes, cars, vans & trucks on demand, anywhere in the city.
                        </p>

                        {/* Socials */}
                        <div className='flex items-center gap-2.5 mt-6'>
                            {socials.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    aria-label={label}
                                    className='w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black hover:border-white transition-all duration-200'
                                >
                                    <Icon size={15} strokeWidth={1.8} />
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Col 2 — Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5'>
                            Navigation
                        </p>
                        <ul className='space-y-3'>
                            {navLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        className='group flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors duration-200'
                                    >
                                        <span>{label}</span>
                                        <ArrowUpRight
                                            size={12}
                                            className='opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200'
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Col 3 — Legal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <p className='text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5'>
                            Legal
                        </p>
                        <ul className='space-y-3'>
                            {legalLinks.map(({ label, href }) => (
                                <li key={label}>
                                    <Link
                                        href={href}
                                        className='group flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors duration-200'
                                    >
                                        <span>{label}</span>
                                        <ArrowUpRight
                                            size={12}
                                            className='opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200'
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                </div>

                {/* ── Bottom bar ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className='pt-6 flex flex-col sm:flex-row items-center justify-between gap-3'
                >
                    <p className='text-zinc-600 text-xs'>
                        © {year} Easy Wheels. All rights reserved.
                    </p>
                    <p className='text-zinc-700 text-xs'>
                        Made with ♥ for seamless urban mobility
                    </p>
                </motion.div>

            </div>
        </footer>
    )
}

export default Footer