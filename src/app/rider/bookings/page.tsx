'use client'
import { logger } from "@/lib/logger";
import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingCard from "@/components/BookingCard";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Inbox, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const filters = [
    { id: 'all', label: 'All' },
    { id: 'requested', label: 'Requested' },
    { id: 'awaiting_payment', label: 'Payment Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'started', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
];

export default function RiderBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchBooking = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/rider/booking");
            if (data?.bookings) {
                setBookings(data.bookings);
            }
        } catch (error: any) {
            logger.error("Error fetching rider bookings:", error);
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

    return (
        <div
            className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans relative bg-neutral-50"
            style={{
                backgroundImage: 'linear-gradient(to right, rgba(163, 163, 163, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(163, 163, 163, 0.15) 1px, transparent 1px)',
                backgroundSize: '32px 32px'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white shadow-sm transition-all hover:bg-neutral-100 active:scale-95 cursor-pointer"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-5 h-5 text-neutral-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Earnings & Bookings</h1>
                        <p className="text-neutral-500 mt-1">Manage and view your ride history and upcoming requests.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${activeFilter === filter.id
                                    ? 'text-white'
                                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                                    }`}
                            >
                                {activeFilter === filter.id && (
                                    <motion.div
                                        layoutId="active-filter-rider"
                                        className="absolute inset-0 bg-zinc-900 rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{filter.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-zinc-900 animate-spin mb-4" />
                        <p className="text-zinc-500 font-medium">Loading your bookings...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredBookings.length > 0 ? (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                            >
                                {filteredBookings.map(booking => (
                                    <motion.div
                                        key={booking._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <BookingCard booking={booking} viewRole="rider" />
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-3xl border border-dashed border-zinc-300"
                            >
                                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                                    <Inbox className="w-10 h-10 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-900 mb-2">No bookings found</h3>
                                <p className="text-zinc-500 max-w-sm text-center">
                                    You don't have any bookings in the "{filters.find(f => f.id === activeFilter)?.label}" category yet.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}