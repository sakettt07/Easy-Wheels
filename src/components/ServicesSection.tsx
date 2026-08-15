'use client'
import React, { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CheckCircle2, Navigation, Zap, Truck, Briefcase } from 'lucide-react'

const services = [
    {
        title: "Daily Commute",
        icon: Navigation,
        gradient: "from-blue-600/20 to-blue-900/50",
        headline: "Where comfort meets reliability.",
        desc: "Book your everyday rides with precision and ease. Arrive on time, every time."
    },
    {
        title: "E-Bike Rentals",
        icon: Zap,
        gradient: "from-green-500/20 to-emerald-900/50",
        headline: "Beat the traffic, save the planet.",
        desc: "Unlock the city with our fleet of premium electric bikes for quick short-distance trips."
    },
    {
        title: "Logistics Delivery",
        icon: Truck,
        gradient: "from-orange-500/20 to-red-900/50",
        headline: "Moving your goods seamlessly.",
        desc: "From small parcels to large cargo, our trucks handle logistics for businesses and individuals."
    },
    {
        title: "Corporate Travel",
        icon: Briefcase,
        gradient: "from-purple-600/20 to-indigo-900/50",
        headline: "Elevate your business mobility.",
        desc: "Dedicated corporate accounts with priority booking and monthly billing options."
    }
]

const features = [
    "Intercity Rides",
    "Daily Commute",
    "E-Bike Rentals",
    "Logistics & Freight",
    "Corporate Accounts"
]

const ServicesSection = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full bg-black py-24 md:py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_2.5fr] gap-12 lg:gap-8 items-start">
                
                {/* Left Column: Title and Features */}
                <div className="sticky top-32 flex flex-col pt-10">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-white text-4xl font-bold mb-2"
                    >
                        Services
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg mb-12"
                    >
                        mobility solutions
                    </motion.p>

                    <div className="space-y-5">
                        {features.map((feature, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-center gap-3 text-white/80"
                            >
                                <CheckCircle2 size={20} className="text-white/40" />
                                <span className="font-medium text-sm md:text-base">{feature}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Horizontally Scrolling Cards */}
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-6 pb-12 pt-10 px-4 -mx-4 lg:mx-0 snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}
                >
                    {/* Add style for webkit scrollbar hiding directly in DOM if needed, but Tailwind doesn't have it natively without plugins, so inline styles usually work or we can rely on standard CSS. */}
                    <style dangerouslySetInnerHTML={{__html: `
                        .hide-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}} />

                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className={`min-w-[80vw] sm:min-w-[320px] md:min-w-[360px] aspect-[4/5] rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group snap-center border border-white/10 bg-gradient-to-b ${service.gradient}`}
                        >
                            {/* Inner ambient glow */}
                            <div className="absolute inset-0 bg-neutral-950/80 group-hover:bg-neutral-950/60 transition-colors duration-500 z-0" />
                            
                            {/* Top Content */}
                            <div className="relative z-10">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 sm:mb-6">
                                    <service.icon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <h3 className="text-white text-2xl sm:text-3xl font-bold leading-tight mt-auto">
                                    {service.headline.split(' ').map((word, i, arr) => (
                                        i === arr.length - 2 || i === arr.length - 1 ? (
                                            <span key={i} className="text-white">{word} </span>
                                        ) : (
                                            <span key={i} className="text-white/40">{word} </span>
                                        )
                                    ))}
                                </h3>
                            </div>

                            {/* Bottom Content */}
                            <div className="relative z-10 flex flex-col justify-end mt-4">
                                <p className="text-white/60 text-xs sm:text-sm mb-4 sm:mb-6 max-w-[95%]">
                                    {service.desc}
                                </p>
                                <h4 className="text-white font-bold text-lg sm:text-xl flex items-center gap-2">
                                    {service.title}
                                </h4>
                            </div>

                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ServicesSection
