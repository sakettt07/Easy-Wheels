'use client'
import React from 'react'
import { motion } from "motion/react"

interface AnimatedCardProps {
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    index?: number
}

const AnimatedCard = ({ title, icon, children, index = 0 }: AnimatedCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className='bg-white rounded-2xl border border-zinc-100 shadow-[0_2px_16px_rgba(0,0,0,0.05)] overflow-hidden'
        >
            {/* Card header */}
            <div className='flex items-center gap-2.5 px-5 py-4 border-b border-zinc-100'>
                <div className='w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0'>
                    {icon}
                </div>
                <h3 className='text-sm font-black text-zinc-900 tracking-tight'>{title}</h3>
            </div>
            {/* Card body */}
            <div className='p-5'>
                {children}
            </div>
        </motion.div>
    )
}

export default AnimatedCard