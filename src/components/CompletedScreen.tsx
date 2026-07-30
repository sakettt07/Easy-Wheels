'use client'

import React from 'react'
import { Check, IndianRupee, User } from 'lucide-react'
import { IBooking } from '@/models/booking.model'
import { useRouter } from 'next/navigation'

interface CompletedScreenProps {
    booking: IBooking
}

export default function CompletedScreen({ booking }: CompletedScreenProps) {
    const router = useRouter()
    const customerName = (booking.user as any)?.name || 'Customer'
    const fare = Math.round(booking.fare || 0)

    return (
        <div className="min-h-screen bg-[#0f0f11] flex flex-col items-center justify-center p-6 w-full text-white">
            <div className="w-full max-w-md flex flex-col items-center">
                {/* Success Icon */}
                <div className="mb-8 relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 bg-emerald-500/10 rounded-full animate-pulse"></div>
                    <div className="absolute w-16 h-16 bg-emerald-500/20 rounded-full"></div>
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Check className="w-5 h-5 text-black stroke-[3]" />
                    </div>
                </div>

                {/* Header Text */}
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mb-2">
                    Trip Complete
                </p>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                    Ride Completed !
                </h1>
                <p className="text-zinc-400 text-sm mb-10">
                    You have successfully dropped the customer.
                </p>

                {/* Fare Card */}
                <div className="w-full bg-[#161618] border border-zinc-800/50 rounded-2xl p-6 flex flex-col items-center mb-4">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
                        Fare Collected
                    </p>
                    <div className="flex items-center gap-2 mb-6">
                        <IndianRupee className="w-8 h-8 text-white" />
                        <span className="text-5xl font-black text-white tracking-tighter">{fare}</span>
                    </div>

                    <div className="w-full h-px bg-zinc-800/50 mb-5"></div>

                    <div className="w-full flex items-center justify-between">
                        <span className="text-sm text-zinc-400 font-medium">Payment Status</span>
                        <div className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">
                            Cash
                        </div>
                    </div>
                </div>

                {/* Customer Card */}
                <div className="w-full bg-[#161618] border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-zinc-800/50 rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">
                            Customer
                        </p>
                        <p className="text-base font-bold text-white capitalize">
                            {customerName}
                        </p>
                    </div>
                </div>

                {/* Back to Home Button */}
                <button
                    onClick={() => router.push('/')}
                    className="w-full bg-transparent border border-zinc-800 hover:bg-zinc-800/50 text-zinc-300 font-medium py-4 rounded-2xl transition-colors"
                >
                    Back To Home
                </button>
            </div>
        </div>
    )
}
