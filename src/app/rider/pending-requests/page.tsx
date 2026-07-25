'use client'

import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { MapPin, Navigation, IndianRupee, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";

interface Booking {
    _id: string;
    pickupAddress: string;
    dropAddress: string;
    fare: number;
    createdAt: string;
    userMobileNumber: string;
}

const PendingRequest = () => {
    const [bookingRequests, setBookingRequests] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);
    const router = useRouter();

    const fetchPendingRequest = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/rider/booking/pending");
            if (data.bookings) {
                setBookingRequests(data.bookings);
            }
        } catch (error) {
            console.error("Error in fetching booking requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id: string) => {
        try {
            setActionId(id);
            setActionType('accept');
            await axios.get(`/api/rider/booking/${id}/accept`);
            fetchPendingRequest();
        } catch (error) {
            console.error("Error accepting booking", error);
        } finally {
            setActionId(null);
            setActionType(null);
        }
    };

    const handleReject = async (id: string) => {
        try {
            setActionId(id);
            setActionType('reject');
            await axios.post(`/api/rider/booking/${id}/reject`);
            fetchPendingRequest();
        } catch (error) {
            console.error("Error rejecting booking", error);
        } finally {
            setActionId(null);
            setActionType(null);
        }
    };
    useEffect(() => {
        const socket = getSocket();
        socket.on("new-booking", (data: any) => {
            fetchPendingRequest();
        })
        return () => {
            socket.off("new-booking")
        }
    }, [])

    useEffect(() => {
        fetchPendingRequest();
    }, []);

    if (loading) {
        return (
            <div className='min-h-screen bg-[#f5f5f3] flex items-center justify-center'>
                <div className="w-8 h-8 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-[#f5f5f3] px-4 pt-28 pb-20'>
            <div className='fixed inset-0 pointer-events-none opacity-[0.025]'
                style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

            <div className='max-w-4xl mx-auto space-y-6 relative'>
                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='h-px w-6 bg-zinc-400' />
                        <span className='text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400'>Rider Portal</span>
                    </div>
                    <h1 className='text-4xl font-black text-zinc-900 tracking-tight'>Pending Requests</h1>
                    <p className='text-zinc-400 text-sm mt-1.5'>Review and accept new ride requests in your area.</p>
                </motion.div>

                {bookingRequests.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
                        className='bg-white rounded-[20px] p-10 border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-center flex flex-col items-center justify-center'
                    >
                        <div className='w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 border border-zinc-100'>
                            <Clock size={24} className='text-zinc-400' />
                        </div>
                        <h2 className='text-lg font-black text-zinc-900'>No Pending Requests</h2>
                        <p className='text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed'>You have no new ride requests at the moment. Keep your app open to receive new bookings.</p>
                    </motion.div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <AnimatePresence>
                            {bookingRequests.map((booking, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                                    key={booking._id}
                                    className='bg-white rounded-[20px] border border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden transition-shadow hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)]'
                                >
                                    <div className="flex flex-col md:flex-row p-6 gap-6">

                                        {/* Left Side: Locations */}
                                        <div className="flex-1 space-y-5">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100 mt-0.5">
                                                    <MapPin size={14} className="text-zinc-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-0.5">Pickup</p>
                                                    <p className="text-sm font-semibold text-zinc-800 line-clamp-2 leading-relaxed">{booking.pickupAddress}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100 mt-0.5">
                                                    <Navigation size={14} className="text-zinc-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-0.5">Drop-off</p>
                                                    <p className="text-sm font-semibold text-zinc-800 line-clamp-2 leading-relaxed">{booking.dropAddress}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Fare and Time */}
                                        <div className="md:w-48 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 gap-2">
                                            <div className="text-left md:text-right">
                                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-0.5 hidden md:block">Est. Fare</p>
                                                <div className="flex items-center text-3xl font-black text-zinc-900 tracking-tight">
                                                    <IndianRupee className="h-6 w-6 mr-0.5 text-zinc-900" />
                                                    {booking.fare}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-400 mb-0.5">Requested At</p>
                                                <div className="flex items-center justify-end text-xs font-semibold text-zinc-700 gap-1">
                                                    <Clock size={12} className="text-zinc-400" />
                                                    {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex border-t border-zinc-100 divide-x divide-zinc-200">
                                        <button
                                            onClick={() => handleReject(booking._id)}
                                            disabled={actionId === booking._id}
                                            className="flex-1 py-4 flex items-center justify-center gap-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 text-xs font-black transition-colors disabled:opacity-50"
                                        >
                                            {actionId === booking._id && actionType === 'reject' ? (
                                                <div className="w-4 h-4 rounded-full border-2 border-zinc-300 border-t-zinc-600 animate-spin" />
                                            ) : (
                                                <>
                                                    <XCircle size={16} />
                                                    Reject
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleAccept(booking._id)}
                                            disabled={actionId === booking._id}
                                            className="flex-1 py-4 flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white text-xs font-black transition-colors disabled:opacity-50"
                                        >
                                            {actionId === booking._id && actionType === 'accept' ? (
                                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle2 size={16} />
                                                    Accept Ride
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingRequest;