'use client'

import React, { useEffect, useState } from 'react'
import { Clock, IndianRupee, Phone, MessageSquare, User, Zap, MapPin, Navigation, Car, X } from 'lucide-react'
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
    const [chatOpen, setChatOpen] = useState(false);

    const { userData } = useSelector((state: RootState) => state.user)
    const riderId = typeof booking.rider === 'object' ? (booking.rider as any)?._id : booking.rider;
    const currentRole = userData?._id === riderId ? "rider" : "user";
    
    const isRider = currentRole === "rider";
    const panelTitle = isRider ? "DRIVER PANEL" : "RIDE DETAILS";
    const otherPartyName = isRider ? (booking.user as any)?.name : (booking.rider as any)?.name;
    const otherPartyFallback = isRider ? "Customer" : "Driver";
    const otherPartyPhone = isRider ? booking.userMobileNumber : booking.riderMobileNumber;

    return (
        <div className="h-full flex flex-col p-4 md:p-5 text-white relative overflow-hidden">
            {/* Header (Fixed) */}
            <div className="flex items-start justify-between mb-4 shrink-0">
                <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">
                        {panelTitle}
                    </p>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                        {getStatusMessage(booking.bookingStatus)}
                    </h2>
                </div>

                <div className="flex items-center gap-1.5 bg-[#1a1a1c] border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-full text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span>0 min</span>
                </div>
            </div>

            {/* Scrollable Middle Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col pb-2">
                {!chatOpen ? (
                    <div className="flex flex-col gap-4">
                        {/* Stats Row */}
                        <div className="flex items-center gap-3">
                            {/* ETA Card */}
                            <div className="flex-1 bg-[#0f0f11] rounded-[20px] p-3.5 md:p-4 flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-50 rounded-[14px] flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-zinc-900" />
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">ETA</p>
                                    <p className="text-base md:text-lg font-bold text-white">0 <span className="text-xs md:text-sm font-medium text-zinc-400">min</span></p>
                                </div>
                            </div>

                            {/* Fare Card */}
                            <div className="flex-1 bg-[#0f0f11] rounded-[20px] p-3.5 md:p-4 flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1a1a1c] border border-zinc-800 rounded-[14px] flex items-center justify-center shrink-0">
                                    <IndianRupee className="w-4 h-4 md:w-5 md:h-5 text-zinc-300" />
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">FARE</p>
                                    <p className="text-base md:text-lg font-bold text-white">{Math.round(booking.fare || 0)}</p>
                                </div>
                            </div>
                        </div>

                        {/* User Profile Card */}
                        <div className="bg-[#0f0f11] rounded-[20px] p-3.5 md:p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1a1a1c] border border-zinc-800 rounded-[14px] flex items-center justify-center shrink-0 relative">
                                    <User className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full border-2 border-[#0f0f11]"></div>
                                </div>
                                <div>
                                    <p className="text-sm md:text-base font-bold text-white capitalize">{otherPartyName || otherPartyFallback}</p>
                                    <div className="inline-block bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 md:mt-1">
                                        Cash
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#1a1a1c] border border-zinc-800 text-zinc-300 text-[10px] md:text-xs px-2.5 py-1 md:px-3 md:py-1.5 rounded-full font-bold flex items-center gap-1">
                                <IndianRupee className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                {Math.round(booking.fare || 0)}
                            </div>
                        </div>

                        {/* Vehicle Info */}
                        <div className="bg-[#0f0f11] rounded-[20px] p-3.5 md:p-4 flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#1a1a1c] border border-zinc-800 rounded-[14px] flex items-center justify-center shrink-0">
                                <Car className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                            </div>
                            <div>
                                <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">
                                    {(booking.vehicle as any)?.type || 'Vehicle'} • {(booking.vehicle as any)?.vehicleModel || 'Details'}
                                </p>
                                <p className="text-xs md:text-sm font-bold text-white uppercase tracking-wider">
                                    {(booking.vehicle as any)?.vehicleNumber || 'Pending'}
                                </p>
                            </div>
                        </div>

                        {/* Location Info */}
                        <div className="bg-[#0f0f11] rounded-[20px] p-3.5 md:p-4 flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-500"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Pickup</p>
                                    <p className="text-xs md:text-sm font-medium text-zinc-300 line-clamp-2">{booking.pickupAddress}</p>
                                </div>
                            </div>
                            
                            <div className="relative ml-2.5 md:ml-3 border-l-2 border-dashed border-zinc-800 h-6 -my-3 z-0"></div>
                            
                            <div className="flex items-start gap-3 z-10">
                                <div className="mt-1 w-5 h-5 md:w-6 md:h-6 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
                                    <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-rose-500"></div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Drop-off</p>
                                    <p className="text-xs md:text-sm font-medium text-zinc-300 line-clamp-2">{booking.dropAddress}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <RideChat currentRole={currentRole} booking={booking} />
                    </div>
                )}
            </div>

            {/* Action Buttons (Fixed at bottom) */}
            <div className="flex items-center gap-3 mt-2 shrink-0">
                <a
                    href={`tel:${otherPartyPhone}`}
                    className="flex-1 bg-zinc-50 hover:bg-white transition-colors py-3 md:py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm md:text-base font-bold text-zinc-900"
                >
                    <Phone className="w-4 h-4 md:w-4 md:h-4" /> Call
                </a>
                <button
                    onClick={() => setChatOpen(!chatOpen)}
                    className="flex-1 bg-[#1a1a1c] border border-zinc-800 hover:bg-zinc-800 transition-colors py-3 md:py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm md:text-base font-bold text-white"
                >
                    {chatOpen ? (
                        <>
                            <X className="w-4 h-4 md:w-4 md:h-4" /> Close Chat
                        </>
                    ) : (
                        <>
                            <MessageSquare className="w-4 h-4 md:w-4 md:h-4" /> Message
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
