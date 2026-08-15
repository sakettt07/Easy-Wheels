'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Star, MapPin } from 'lucide-react'

const features = [
    {
        icon: Zap,
        title: "Lightning Fast",
        desc: "Book a ride in seconds and get picked up in minutes. Our routing algorithm ensures the fastest path."
    },
    {
        icon: ShieldCheck,
        title: "Verified Safety",
        desc: "Every driver undergoes strict background checks. Real-time GPS tracking guarantees your peace of mind."
    },
    {
        icon: Star,
        title: "Premium Fleet",
        desc: "Experience luxury in every ride. Our vehicles are meticulously maintained and deep-cleaned daily."
    },
    {
        icon: MapPin,
        title: "Anywhere, Anytime",
        desc: "Whether it's a late-night airport drop or an early morning commute, we are available 24/7."
    }
]

const WhyChooseUsSection = () => {
    return (
        <section className="py-24 bg-zinc-950 text-white relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-2 mb-4"
                    >
                        <div className="h-[1px] w-8 bg-blue-500" />
                        <span className="text-blue-400 font-bold tracking-widest text-sm uppercase">Why Choose Us</span>
                        <div className="h-[1px] w-8 bg-blue-500" />
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black mb-6"
                    >
                        Redefining Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Journey</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 max-w-2xl mx-auto text-lg"
                    >
                        We don't just take you from point A to point B. We deliver an experience crafted with precision, luxury, and utmost reliability.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * idx, duration: 0.5 }}
                            className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors duration-300 group"
                        >
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <feat.icon size={28} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default WhyChooseUsSection
