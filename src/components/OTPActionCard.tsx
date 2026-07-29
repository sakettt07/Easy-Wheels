'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Car, Loader2, ChevronRight } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface OTPActionCardProps {
    bookingId: string;
    actionType: "pickup" | "drop";
}

export default function OTPActionCard({ bookingId, actionType }: OTPActionCardProps) {
    const router = useRouter()
    const [step, setStep] = useState<"action" | "sending" | "verify">("action")
    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [verifying, setVerifying] = useState(false)

    const handleActionClick = async () => {
        setStep("sending")
        setError("")
        try {
            const endpoint = actionType === "pickup"
                ? "/api/rider/booking/otp/pickup/send"
                : "/api/rider/booking/otp/drop/send"

            await axios.post(endpoint, { bookingId })

            // Artificial delay to show the smooth animation just a bit longer if API is super fast
            setTimeout(() => {
                setStep("verify")
            }, 1200)

        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to send OTP")
            setStep("action")
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length !== 4) return

        setVerifying(true)
        setError("")
        try {
            const endpoint = actionType === "pickup"
                ? "/api/rider/booking/otp/pickup/verify"
                : "/api/rider/booking/otp/drop/verify"

            await axios.post(endpoint, { bookingId, otp })

            if (actionType === "pickup") {
                window.location.reload()
            } else {
                router.push("/rider/bookings")
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Invalid OTP")
            setVerifying(false)
        }
    }

    return (
        <div className="bg-[#0f0f11] rounded-[20px] p-4 flex flex-col gap-3 relative overflow-hidden mt-1 border border-zinc-800">
            <AnimatePresence mode="wait">
                {step === "action" && (
                    <motion.div
                        key="action"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col"
                    >
                        <button
                            onClick={handleActionClick}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors relative overflow-hidden group"
                        >
                            <span>{actionType === "pickup" ? "I've Arrived at Pickup" : "Complete the Ride"}</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        {error && <p className="text-rose-500 text-xs mt-2 text-center">{error}</p>}
                    </motion.div>
                )}

                {step === "sending" && (
                    <motion.div
                        key="sending"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="w-full bg-[#1a1a1c] border border-zinc-800 py-6 rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
                    >
                        {/* Track background */}
                        <div className="w-3/4 h-1 bg-zinc-800 rounded-full mb-4 relative overflow-hidden">
                            {/* Moving car/wheel */}
                            <motion.div
                                animate={{ x: ["0%", "300%"] }}
                                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                                className="absolute top-1/2 -translate-y-1/2 -left-6"
                            >
                                <Car className="w-5 h-5 text-emerald-500" />
                            </motion.div>
                        </div>
                        <p className="text-zinc-400 text-sm font-medium animate-pulse">Sending OTP to User...</p>
                    </motion.div>
                )}

                {step === "verify" && (
                    <motion.form
                        key="verify"
                        onSubmit={handleVerify}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-3"
                    >
                        <div className="text-center">
                            <p className="text-sm text-zinc-300 font-medium mb-1">Enter Verification OTP</p>
                            <p className="text-[10px] text-zinc-500">Ask the passenger for the 4-digit code sent to their email.</p>
                        </div>

                        <div className="flex justify-center my-1">
                            <input
                                type="text"
                                maxLength={4}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="----"
                                className="bg-[#1a1a1c] border border-zinc-800 text-white text-center text-2xl font-bold tracking-[0.5em] rounded-xl py-3 w-3/4 outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        {error && <p className="text-rose-500 text-xs text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={otp.length !== 4 || verifying}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors mt-1"
                        >
                            {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Proceed"}
                        </button>

                        <button
                            type="button"
                            onClick={handleActionClick}
                            disabled={verifying}
                            className="w-full text-zinc-400 hover:text-white text-xs font-medium py-1 mt-1 transition-colors"
                        >
                            Didn't receive it? <span className="text-emerald-500 underline">Resend OTP</span>
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    )
}
