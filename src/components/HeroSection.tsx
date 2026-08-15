'use client'
import React, { useEffect } from 'react';
import { motion } from "motion/react";
import { Bike, Bus, Car, Truck, MapPin, ArrowRight, FerrisWheel, ShipWheel, LucideShipWheel } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';

type propType = {
    onAuthRequired: () => void
}
const HeroSection = ({ onAuthRequired }: propType) => {
    const router = useRouter();
    const { userData } = useSelector((state: RootState) => state.user)

    return (
        <div className='relative min-h-screen w-full overflow-hidden bg-black text-white flex flex-col items-center justify-center pt-20'>
            {/* Background Image with Overlay */}
            <div className='absolute inset-0 z-0'>
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.4]"
                    style={{ backgroundImage: 'url("/newHero.png")' }}
                />
            </div>

            {/* Main Content */}
            <div className='relative z-10 w-full max-w-5xl flex flex-col items-center text-center px-4'>



                {/* Headline */}
                <motion.h1
                    className='text-white font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-[1.15] max-w-4xl'
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    Turning the Vision of Next-Gen <br className="hidden md:block" /> Mobility Into Reality
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    className='text-gray-400 mt-8 max-w-2xl text-lg md:text-xl font-light leading-relaxed'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                >
                    Whether you're a commuter taking your first ride or a growing business outpacing your current logistics. We engineer intelligent transport for market leaders.
                </motion.p>

                {/* Dual Buttons */}
                <motion.div
                    className='mt-12 flex items-center justify-center gap-6 flex-wrap'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <div className="h-full w-full flex items-center justify-center text-white">
                        <div className="group cursor-pointer border bg-zinc-900 border-zinc-500/30 gap-2 h-[60px] flex items-center p-[10px] rounded-full">
                            <button
                                onClick={() => { !userData ? onAuthRequired() : router.push("/user/book") }}
                                className="cursor-pointer gap-2 whitespace-nowrap text-sm font-medium transition-all shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/40 aria-invalid:border-destructive backdrop-blur-sm shadow-[inset_0_3px_2px_rgba(255,255,255,0.1),inset_0_-3px_6px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.30),inset_0_-8px_12px_rgba(0,0,0,0.12),0_6px_14px_-8px_rgba(0,0,0,0.18)] hover:bg-[#140d2d] hover:border-black/15 hover:shadow-[inset_0_3px_2px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.40),inset_0_-10px_14px_rgba(0,0,0,0.16),0_8px_18px_-10px_rgba(0,0,0,0.22)] active:shadow-[inset_0_3px_2px_rgba(255,255,255,0.1),inset_0_1px_3px_rgba(0,0,0,0.22),inset_0_-6px_10px_rgba(0,0,0,0.18)] active:translate-y-[1px] bg-[#0000]/55 px-6 py-2 h-[40px] rounded-full flex items-center justify-center"
                            >
                                <LucideShipWheel className='animate-spin' size={16} />
                                <p className="flex items-center gap-2 justify-center">Book a Ride Now</p>
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>


        </div>
    )
}

export default HeroSection