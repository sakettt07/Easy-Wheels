'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

const categories = ["All", "Premium", "Coupe", "Hypercars", "Sportcar", "Cabriolet", "Limousines"]

const vehicles = [
    {
        id: 1,
        name: "BMW 8 Series",
        category: "Cabriolet",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
        colSpan: "md:col-span-4"
    },
    {
        id: 2,
        name: "Porsche 911",
        category: "Hypercars",
        image: "https://images.unsplash.com/photo-1503376760367-22eca6322881?auto=format&fit=crop&q=80&w=800",
        colSpan: "md:col-span-4"
    },
    {
        id: 3,
        name: "Corvette C8",
        category: "Sportcar",
        image: "https://images.unsplash.com/photo-1584345617066-5e5d487f9780?auto=format&fit=crop&q=80&w=800",
        colSpan: "md:col-span-4"
    },
    {
        id: 4,
        name: "Lexus LC",
        category: "Premium",
        image: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=600",
        colSpan: "md:col-span-3"
    },
    {
        id: 5,
        name: "Mercedes AMG",
        category: "Coupe",
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=600",
        colSpan: "md:col-span-3"
    },
    {
        id: 6,
        name: "Lamborghini",
        category: "Hypercars",
        image: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&q=80&w=600",
        colSpan: "md:col-span-3"
    },
    {
        id: 7,
        name: "Audi e-tron",
        category: "Limousines",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0b12?auto=format&fit=crop&q=80&w=600",
        colSpan: "md:col-span-3"
    }
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
}

const FleetGridSection = () => {
    const [activeCategory, setActiveCategory] = useState("All")

    const filteredVehicles = vehicles.filter(v => activeCategory === "All" || v.category === activeCategory)

    return (
        <section className="py-24 bg-white text-black overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                
                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-gray-400 font-bold text-xs tracking-[0.2em] uppercase mb-4">
                        Only the best cars
                    </p>
                    <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                        Our Vehicle Fleet
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                        We provide our customers with the most incredible driving emotions.
                        That's why we have only world-class cars in our fleet.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                                activeCategory === cat 
                                    ? "bg-black text-white shadow-lg scale-105" 
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredVehicles.map((vehicle) => (
                            <motion.div
                                layout
                                key={vehicle.id}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                className={`col-span-12 ${activeCategory === "All" ? vehicle.colSpan : "md:col-span-4 lg:col-span-3"} relative group rounded-[2rem] overflow-hidden bg-gray-100 aspect-[4/3] md:aspect-auto md:min-h-[280px] lg:min-h-[320px] shadow-sm`}
                            >
                                <img 
                                    src={vehicle.image} 
                                    alt={vehicle.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                {/* Overlay gradient for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                {/* Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-8 translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-3 inline-block">
                                        {vehicle.category}
                                    </span>
                                    <h3 className="text-white text-2xl font-bold">{vehicle.name}</h3>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

            </div>
        </section>
    )
}

export default FleetGridSection
