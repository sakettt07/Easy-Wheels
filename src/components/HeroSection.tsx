'use client'
import React, { useEffect } from 'react';
import { motion } from "motion/react";
import { Bike, Bus, Car, Truck, MapPin, ArrowRight } from 'lucide-react';
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
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
                    style={{ backgroundImage: 'url("/hero-bg.jpg")' }}
                />
                {/* Dark gradient overlay to blend perfectly and maintain text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/90" />
            </div>

            {/* Main Content */}
            <div className='relative z-10 w-full max-w-5xl flex flex-col items-center text-center px-4'>
                
                {/* Pill Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className='px-6 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-10 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md'
                >
                    Ready to ride ? We are ready to go
                </motion.div>

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
                    Whether you're a commuter taking your first ride or a growing business outpacing your current logistics. We engineer <span className="text-white border-b-2 border-blue-500 pb-1">intelligent transport</span> for market leaders.
                </motion.p>

                {/* Dual Buttons */}
                <motion.div 
                    className='mt-12 flex items-center justify-center gap-6 flex-wrap'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <button 
                        onClick={() => { !userData ? onAuthRequired() : router.push("/user/book") }}
                        className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500 transition-colors flex items-center gap-3 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                    >
                        <Car size={20} />
                        Book a Ride Now
                    </button>
                    <button 
                        onClick={() => router.push("/about-us")}
                        className="text-white px-8 py-4 rounded-full font-medium border border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 backdrop-blur-md"
                    >
                        Learn More <ArrowRight size={18} className="-rotate-45" />
                    </button>
                </motion.div>
            </div>

            {/* The Curved Ground / Planet Surface */}
            <div className='absolute bottom-0 left-0 right-0 h-[25vh] z-0 overflow-hidden pointer-events-none'>
                {/* The glowing curved surface */}
                <div 
                    className='absolute -bottom-[60%] left-1/2 -translate-x-1/2 w-[200vw] md:w-[150vw] h-[100%] rounded-[100%] bg-neutral-950 border-t border-blue-500/30'
                    style={{
                        boxShadow: '0 -20px 100px rgba(37, 99, 235, 0.15)'
                    }}
                >
                    {/* Inner glow gradient */}
                    <div className="absolute inset-0 rounded-[100%]" style={{
                        background: 'radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 70%)'
                    }} />
                </div>
            </div>

            {/* Bottom Marquee Text */}
            <div className='absolute bottom-6 w-full overflow-hidden flex whitespace-nowrap z-10 opacity-60 pointer-events-none'>
                <motion.div 
                    className='flex gap-10 md:gap-16 items-center text-gray-400 text-[10px] md:text-xs tracking-[0.2em] font-medium uppercase'
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
                >
                    {[...Array(6)].map((_, i) => (
                        <React.Fragment key={i}>
                            <span>E-BIKES</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                            <span>DAILY COMMUTE</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                            <span>CARS</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                            <span>INTERCITY TRAVEL</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                            <span>BUSES</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                            <span>LOGISTICS</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                            <span>TRUCKS</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                            <span>RENTALS</span>
                            <span className="w-1 h-1 rounded-full bg-blue-500/50" />
                        </React.Fragment>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

export default HeroSection