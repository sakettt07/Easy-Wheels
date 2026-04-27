'use client'
import React from 'react';
import { motion } from "motion/react";
import { X } from 'lucide-react';

type propType = {
    open: boolean,
    onClose: () => void
}

const AuthModal = ({ open, onClose }: propType) => {
    return (
        <>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className='fixed inset-0 z-[90] bg-black/80 backdrop-blur-md'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <div className='relative w-full max-w-md rounded-3x1 bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-black'>
                                <div className='absolute right-4 top-4 text-gray-500 hover:text-black transition' onClick={onClose}>
                                    <X size={20} />
                                </div>
                                <div>
                                    Easy Wheels
                                </div>
                            </div>
                        </motion.div>
                        <motion.div />
                    </motion.div>
                </>
            )}
        </>
    )
}

export default AuthModal