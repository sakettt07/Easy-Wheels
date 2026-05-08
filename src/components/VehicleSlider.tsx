'use client'
import React, { useRef, useState, useCallback } from 'react';
import { motion } from "motion/react";
import { Bike, Bus, Car, CarTaxiFront, ChevronLeft, ChevronRight, Truck, ArrowRight } from 'lucide-react';

const VEHICLE_CATEGORIES = [
    {
        title: "All Vehicles",
        desc: "Browse our complete fleet",
        Icon: CarTaxiFront,
        tag: "Popular",
        count: "120+",
        color: "#18181b",
        lightBg: "#f4f4f5",
        iconBg: "#e4e4e7",
    },
    {
        title: "Bikes",
        desc: "Fast & affordable rides",
        Icon: Bike,
        tag: "Quick",
        count: "34",
        color: "#b45309",
        lightBg: "#fef9ee",
        iconBg: "#fef3c7",
    },
    {
        title: "Cars",
        desc: "Comfortable city travel",
        Icon: Car,
        tag: "Comfort",
        count: "58",
        color: "#1d4ed8",
        lightBg: "#eff6ff",
        iconBg: "#dbeafe",
    },
    {
        title: "SUVs",
        desc: "Premium & spacious",
        Icon: Car,
        tag: "Premium",
        count: "22",
        color: "#15803d",
        lightBg: "#f0fdf4",
        iconBg: "#dcfce7",
    },
    {
        title: "Vans",
        desc: "Family & group transport",
        Icon: Bus,
        tag: "Family",
        count: "18",
        color: "#be185d",
        lightBg: "#fdf2f8",
        iconBg: "#fce7f3",
    },
    {
        title: "Trucks",
        desc: "Heavy & commercial hauls",
        Icon: Truck,
        tag: "Cargo",
        count: "12",
        color: "#7c3aed",
        lightBg: "#f5f3ff",
        iconBg: "#ede9fe",
    },
];

const CARD_W = 272;
const GAP = 16;

const VehicleSlider = () => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef(0);
    const scrollStart = useRef(0);

    const handleScroll = useCallback(() => {
        const el = sliderRef.current;
        if (!el) return;
        const max = el.scrollWidth - el.clientWidth;
        setScrollProgress(max > 0 ? el.scrollLeft / max : 0);
    }, []);

    const slide = (dir: 'prev' | 'next') => {
        if (!sliderRef.current) return;
        sliderRef.current.scrollBy({ left: dir === 'next' ? CARD_W + GAP : -(CARD_W + GAP), behavior: 'smooth' });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStart.current = e.clientX;
        scrollStart.current = sliderRef.current?.scrollLeft ?? 0;
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        sliderRef.current.scrollLeft = scrollStart.current + (dragStart.current - e.clientX);
    };
    const handleMouseUp = () => setIsDragging(false);

    return (
        <section className='py-20 bg-white overflow-hidden'>
            <div className='max-w-7xl mx-auto px-6 sm:px-10'>

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className='flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10'
                >
                    <div>
                        <div className='flex items-center gap-2.5 mb-3'>
                            <div className='h-px w-6 bg-zinc-300' />
                            <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400'>Fleet</span>
                        </div>
                        <h2 className='text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 leading-[1.05]'>
                            Vehicle
                            <br />
                            <span className='relative inline-block'>
                                Categories
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className='absolute -bottom-1 left-0 right-0 h-[3px] bg-zinc-900 origin-left rounded-full'
                                />
                            </span>
                        </h2>
                        <p className='text-zinc-400 text-sm mt-3 max-w-xs leading-relaxed'>
                            Pick the ride that fits your journey — from quick commutes to heavy hauls.
                        </p>
                    </div>

                    {/* Arrows */}
                    <div className='flex items-center gap-2 self-end'>
                        <button
                            onClick={() => slide('prev')}
                            className='w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-200'
                        >
                            <ChevronLeft size={17} />
                        </button>
                        <button
                            onClick={() => slide('next')}
                            className='w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-200'
                        >
                            <ChevronRight size={17} />
                        </button>
                    </div>
                </motion.div>

                {/* ── Slider ── */}
                <div
                    ref={sliderRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onScroll={handleScroll}
                    className='flex gap-4 overflow-x-auto pb-2 select-none'
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        scrollSnapType: 'x mandatory',
                    }}
                >
                    {VEHICLE_CATEGORIES.map((cat, i) => {
                        const { Icon } = cat;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                whileHover={{ y: -5, transition: { duration: 0.22 } }}
                                className='group shrink-0 rounded-3xl border border-zinc-100 overflow-hidden relative'
                                style={{
                                    width: CARD_W,
                                    background: cat.lightBg,
                                    scrollSnapAlign: 'start',
                                    boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                                }}
                            >
                                <div className='p-6 h-[220px] flex flex-col justify-between'>

                                    {/* Top row */}
                                    <div className='flex items-start justify-between'>
                                        {/* Icon */}
                                        <div
                                            className='w-11 h-11 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110'
                                            style={{ background: cat.iconBg }}
                                        >
                                            <Icon size={20} style={{ color: cat.color }} strokeWidth={2} />
                                        </div>
                                    </div>

                                    {/* Bottom */}
                                    <div>
                                        {/* Tag */}
                                        <span
                                            className='text-[9px] font-black uppercase tracking-[0.18em] mb-1.5 block'
                                            style={{ color: cat.color }}
                                        >
                                            {cat.tag}
                                        </span>
                                        <h3 className='text-xl font-black text-zinc-900 leading-tight'>{cat.title}</h3>
                                        <p className='text-zinc-400 text-xs mt-1 leading-relaxed'>{cat.desc}</p>

                                        {/* CTA */}
                                        <div className='flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-250'>
                                            <span className='text-xs font-bold' style={{ color: cat.color }}>Explore</span>
                                            <ArrowRight size={12} style={{ color: cat.color }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom accent line */}
                                <div
                                    className='absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400 rounded-full'
                                    style={{ background: cat.color }}
                                />
                            </motion.div>
                        );
                    })}
                    <div className='shrink-0 w-2' />
                </div>

                {/* ── Scroll progress bar ── */}
                <div className='mt-6 flex items-center gap-4'>
                    <div className='flex-1 h-[3px] bg-zinc-100 rounded-full overflow-hidden'>
                        <motion.div
                            className='h-full bg-zinc-900 rounded-full origin-left'
                            style={{ scaleX: scrollProgress, transformOrigin: 'left' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        />
                    </div>
                    <span className='text-xs text-zinc-400 font-medium tabular-nums shrink-0'>
                        {VEHICLE_CATEGORIES.length} types
                    </span>
                </div>

            </div>
        </section>
    );
};

export default VehicleSlider;