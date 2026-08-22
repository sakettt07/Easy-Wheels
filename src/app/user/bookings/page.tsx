'use client'
import { logger } from "@/lib/logger";
import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingCard from "@/components/BookingCard";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Inbox, ArrowLeft, Filter, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

const filters = [
    { id: 'all', label: 'All' },
    { id: 'requested', label: 'Requested' },
    { id: 'awaiting_payment', label: 'Payment Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'started', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'expired', label: 'Expired' },
];

export default function UserBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const [hasCalendarConnected, setHasCalendarConnected] = useState(false);

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/user/bookings");
            if (data?.bookings) {
                setBookings(data.bookings);
            }
            if (data?.hasCalendarConnected !== undefined) {
                setHasCalendarConnected(data.hasCalendarConnected);
            }
        } catch (error: any) {
            logger.error("Error fetching user bookings:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBooking();
    }, []);

    const filteredBookings = bookings.filter(booking => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'cancelled') return booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'rejected';
        return booking.bookingStatus === activeFilter;
    });

    const handleConnectCalendar = () => {
        window.location.href = '/api/calendar/google/auth';
    };

    return (
        <div
            className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans relative bg-neutral-50/50"
            style={{
                backgroundImage: 'linear-gradient(to right, rgba(163, 163, 163, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(163, 163, 163, 0.1) 1px, transparent 1px)',
                backgroundSize: '32px 32px'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50/50 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/50 pb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/80 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:bg-white hover:shadow-md hover:border-neutral-300 active:scale-95 cursor-pointer"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-neutral-700" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Your Rides</h1>
                            <p className="text-neutral-500 mt-1.5 font-medium">Manage and view your ride history and upcoming requests.</p>
                        </div>
                    </div>
                    
                    {!loading && (
                        <div>
                            {hasCalendarConnected ? (
                                <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 font-bold text-sm flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Calendar Connected
                                </div>
                            ) : (
                                <button
                                    onClick={handleConnectCalendar}
                                    className="px-5 py-2.5 bg-white text-zinc-900 border border-zinc-200 rounded-xl font-bold text-sm hover:bg-zinc-50 hover:shadow-sm transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Connect Google Calendar
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 z-20 relative">
                        <div className="bg-white/60 backdrop-blur-xl rounded-[24px] border border-neutral-200/60 p-4 lg:p-6 lg:sticky lg:top-24 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                            
                            {/* Mobile Toggle */}
                            <button 
                                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                className="w-full flex items-center justify-between lg:hidden"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                        <Filter className="w-4 h-4 text-zinc-900" />
                                    </div>
                                    <span className="text-sm font-bold text-neutral-900">
                                        {filters.find(f => f.id === activeFilter)?.label} Rides
                                    </span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <h3 className="hidden lg:block text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-5 pl-2">Filter Bookings</h3>
                            
                            <div className={`mt-5 lg:mt-0 flex-col gap-1.5 ${isFiltersOpen ? 'flex' : 'hidden lg:flex'}`}>
                                {filters.map(filter => {
                                    const isActive = activeFilter === filter.id;
                                    return (
                                        <button
                                            key={filter.id}
                                            onClick={() => setActiveFilter(filter.id)}
                                            className={`relative w-full text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between group overflow-hidden ${isActive
                                                    ? 'text-white shadow-md'
                                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-white/80'
                                                }`}
                                        >
                                            {isActive && (
                                                <motion.div
                                                    layoutId="sidebar-active"
                                                    className="absolute inset-0 bg-zinc-900 rounded-xl"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10">{filter.label}</span>
                                            <span className={`relative z-10 w-2 h-2 rounded-full transition-transform duration-300 ${isActive ? 'bg-white scale-100' : 'bg-transparent scale-0 group-hover:scale-50 group-hover:bg-zinc-300'}`} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white/30 backdrop-blur-sm rounded-[32px] border border-neutral-200/50">
                                <Loader2 className="w-10 h-10 text-zinc-900 animate-spin mb-4" />
                                <p className="text-zinc-500 font-medium">Loading your bookings...</p>
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {filteredBookings.length > 0 ? (
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
                                    >
                                        {filteredBookings.map(booking => (
                                            <motion.div
                                                key={booking._id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <BookingCard booking={booking} viewRole="user" />
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-md rounded-[32px] border border-dashed border-neutral-300 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                                    >
                                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-neutral-100">
                                            <Inbox className="w-10 h-10 text-neutral-300" />
                                        </div>
                                        <h3 className="text-2xl font-black text-neutral-900 mb-2">No bookings found</h3>
                                        <p className="text-neutral-500 max-w-sm text-center font-medium leading-relaxed">
                                            You don't have any bookings in the "{filters.find(f => f.id === activeFilter)?.label}" category yet.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}