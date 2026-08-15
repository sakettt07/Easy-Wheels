'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
    {
        name: "Sarah Jenkins",
        role: "Frequent Traveler",
        content: "Easy Wheels has completely transformed my daily commute. The cars are always spotless, and the drivers are incredibly professional.",
        rating: 5
    },
    {
        name: "Michael Chen",
        role: "Corporate Executive",
        content: "We use them for all our corporate logistics. Their fleet is unmatched in terms of reliability and comfort. Highly recommended.",
        rating: 5
    },
    {
        name: "Elena Rodriguez",
        role: "Event Planner",
        content: "I needed a fleet of SUVs for a weekend event, and they delivered flawlessly. The app makes booking so effortless.",
        rating: 5
    }
]

const TestimonialsSection = () => {
    return (
        <section className="py-24 bg-white text-zinc-900 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-2 mb-4"
                    >
                        <div className="h-[1px] w-8 bg-black/20" />
                        <span className="text-zinc-500 font-bold tracking-widest text-sm uppercase">Testimonials</span>
                        <div className="h-[1px] w-8 bg-black/20" />
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black mb-6"
                    >
                        Loved by thousands
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * idx, duration: 0.5 }}
                            className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-1 mb-6">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={18} className="fill-orange-400 text-orange-400" />
                                    ))}
                                </div>
                                <p className="text-zinc-600 text-lg italic mb-8 leading-relaxed">
                                    "{testimonial.content}"
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-zinc-900">{testimonial.name}</h4>
                                <p className="text-sm text-zinc-500">{testimonial.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default TestimonialsSection
