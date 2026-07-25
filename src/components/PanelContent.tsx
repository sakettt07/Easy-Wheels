'use client'

import React, { useEffect, useState } from 'react'
import { Clock, IndianRupee, Phone, MessageSquare, User, Zap } from 'lucide-react'
import { IBooking, BookingStatus } from '@/models/booking.model'
import RideChat from './RideChat'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

interface PanelContentProps {
    booking: IBooking;
    mapStatus: "arriving" | "ongoing" | "completed";
}

const getStatusMessage = (status: BookingStatus) => {
    switch (status) {
        case 'confirmed': return "Heading to Pickup";
        case 'started': return "Heading to Drop";
        case 'completed': return "Ride Completed";
        default: return "Active Ride";
    }
}

export default function PanelContent({ booking, mapStatus }: PanelContentProps) {
    // console.log("This is booking data-----", booking);
    const [chatOpen, setChatOpen] = useState(false);

    const { userData } = useSelector((state: RootState) => state.user)
    let currentRole;
    useEffect(() => {
        if (userData) {
            currentRole = userData?._id === booking.rider ? "rider" : "user";
            console.log("role----", currentRole);
        }
    }, [userData?._id])

    return (
        <div className="h-full flex flex-col p-6 text-white relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
                        DRIVER PANEL
                    </p>
                    <h2 className="text-2xl font-bold text-white">
                        {getStatusMessage(booking.bookingStatus)}
                    </h2>
                </div>

                <div className="flex items-center gap-1.5 bg-[#1a1a1c] border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span>0 min</span>
                </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-3 mb-3">
                {/* ETA Card */}
                <div className="flex-1 bg-[#0f0f11] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-50 rounded-[14px] flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-zinc-900" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">ETA</p>
                        <p className="text-lg font-bold text-white">0 <span className="text-sm font-medium text-zinc-400">min</span></p>
                    </div>
                </div>

                {/* Fare Card */}
                <div className="flex-1 bg-[#0f0f11] rounded-[20px] p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a1c] border border-zinc-800 rounded-[14px] flex items-center justify-center shrink-0">
                        <IndianRupee className="w-5 h-5 text-zinc-300" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">FARE</p>
                        <p className="text-lg font-bold text-white">{Math.round(booking.fare || 0)}</p>
                    </div>
                </div>
            </div>

            {/* User Profile Card */}
            <div className="bg-[#0f0f11] rounded-[20px] p-4 flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1a1a1c] border border-zinc-800 rounded-[14px] flex items-center justify-center shrink-0 relative">
                        <User className="w-5 h-5 text-zinc-400" />
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0f0f11]"></div>
                    </div>
                    <div>
                        <p className="text-base font-bold text-white capitalize">{booking.user?.name || 'Customer'}</p>
                        <div className="inline-block bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded-full mt-1">
                            Cash
                        </div>
                    </div>
                </div>
                <div className="bg-[#1a1a1c] border border-zinc-800 text-zinc-300 text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {Math.round(booking.fare || 0)}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-auto md:mt-2">
                <a
                    href={`tel:${booking.userMobileNumber}`}
                    className="flex-1 bg-zinc-50 hover:bg-white transition-colors py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-zinc-900"
                >
                    <Phone className="w-4 h-4" /> Call
                </a>
                <button
                    onClick={() => setChatOpen(true)}
                    className="flex-1 bg-[#1a1a1c] border border-zinc-800 hover:bg-zinc-800 transition-colors py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white"
                >
                    <MessageSquare className="w-4 h-4" /> Message
                </button>
            </div>

            {/* OTP Display (if needed) */}
            <div className="mt-6 flex justify-center">
                <div className="bg-[#1a1a1c] px-4 py-2 rounded-xl text-sm font-medium text-zinc-400 border border-zinc-800/50">
                    OTP: <span className="text-white font-bold tracking-widest ml-1">{mapStatus === 'arriving' ? booking.pickupOTP : booking.dropOTP}</span>
                </div>
            </div>

            {/* Chat overlay */}
            {chatOpen && <RideChat currentRole={currentRole} booking={booking} onClose={() => setChatOpen(false)} />}
        </div>
    )
}
