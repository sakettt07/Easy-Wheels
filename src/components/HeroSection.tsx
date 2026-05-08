'use client'
import React from 'react';
import { motion } from "motion/react";
import { Bike, Bus, Car, Truck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';

type propType = {
    onAuthRequired: () => void
}
const HeroSection = ({ onAuthRequired }: propType) => {
    const router = useRouter();
    const { userData } = useSelector((state: RootState) => state.user)
    return (
        <div className='relative min-h-screen w-full overflow-hidden'>
            <div className='absolute inset-0 bg-cover bg-center' style={{
                backgroundImage: "url('/heroimg.jpg')"
            }} />
            <div className='absolute inset-0 bg-black/80' />
            <div className='relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center'>
                <motion.div className='text-white font-extrabold tezt-4xl sm:text-5xl md:text-7xl' initial={{
                    opacity: 0,
                    y: 30
                }} animate={{
                    opacity: 1,
                    y: 0
                }} transition={{
                    duration: 0.9
                }}>
                    Book any Vehicle
                </motion.div>
                <motion.p className='text-white mt-4 max-w-xl' initial={{
                    opacity: 0,
                }} animate={{
                    opacity: 1,
                }} transition={{
                    delay: 0.9
                }}
                >From daily rides to heavy transport</motion.p>
                <motion.div className='mt-8 flex gap-8 text-gray-200' initial={{
                    opacity: 0,
                }} animate={{
                    opacity: 1,
                }} transition={{
                    duration: 0.3
                }}>
                    <Bike size={30} />
                    <Car size={30} />
                    <Bus size={30} />
                    <Truck size={30} />
                </motion.div>
                <motion.button onClick={() => { !userData ? onAuthRequired() : router.push("/user/book") }} whileHover={{
                    scale: 1.05
                }}
                    whileTap={{
                        scale: 0.95
                    }} className='bg-white text-black rounded-full font-semibold shadow-xl mt-12 px-10 py-4'>Where to?</motion.button>
            </div>
        </div>
    )
}

export default HeroSection