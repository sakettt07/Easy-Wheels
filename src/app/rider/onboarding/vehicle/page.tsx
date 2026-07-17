'use client'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Bike, Car, CircleDashed, Package, Truck, Zap } from 'lucide-react';
import axios from 'axios';
import useGetMe from '@/hooks/useGetMe';

const STEPS = [
    { step: 1, title: "Vehicle Details", subtitle: "Tell us about your vehicle", image: { bg: "from-zinc-900 to-zinc-700", headline: "Join 5,000+ riders earning with Easy Wheels", sub: "Set up in under 3 minutes and start accepting rides today.", stat: { value: "₹40K+", label: "avg. monthly earnings" }, badge: "Rider Program", scene: "vehicle" } },
    { step: 2, title: "Your Documents", subtitle: "Upload required KYC documents", image: { bg: "from-stone-900 to-neutral-800", headline: "Your data is encrypted end‑to‑end", sub: "Bank-grade security keeps your documents safe and private.", stat: { value: "256-bit", label: "AES encryption" }, badge: "Secure & Private", scene: "docs" } },
    { step: 3, title: "Bank & Payout", subtitle: "Set up your payout account", image: { bg: "from-neutral-900 to-zinc-800", headline: "Get paid every week, on time.", sub: "Verified riders receive direct bank payouts every Monday.", stat: { value: "2×", label: "more rides for verified" }, badge: "Almost Done", scene: "profile" } },
]

const vehicles = [
    { id: "bike", label: "Bike", icon: Bike, desc: "2W" },
    { id: "auto", label: "Auto", icon: Car, desc: "3W" },
    { id: "car", label: "Car", icon: Car, desc: "4W" },
    { id: "loader", label: "Loader", icon: Package, desc: "Goods" },
    { id: "traveller", label: "Traveller", icon: Truck, desc: "Family" },
    { id: "ev", label: "EV", icon: Zap, desc: "Eco" },
]

const SceneVehicle = () => (
    <svg viewBox="0 0 280 160" fill="none" className="w-full max-w-[220px]">
        <ellipse cx="140" cy="142" rx="110" ry="12" fill="white" fillOpacity="0.07" />
        <rect x="70" y="100" width="140" height="40" rx="9" fill="white" fillOpacity="0.15" />
        <rect x="88" y="82" width="96" height="30" rx="7" fill="white" fillOpacity="0.20" />
        <rect x="96" y="87" width="36" height="18" rx="3" fill="white" fillOpacity="0.35" />
        <rect x="138" y="87" width="36" height="18" rx="3" fill="white" fillOpacity="0.35" />
        <circle cx="100" cy="142" r="14" fill="white" fillOpacity="0.12" />
        <circle cx="100" cy="142" r="8" fill="white" fillOpacity="0.2" />
        <circle cx="180" cy="142" r="14" fill="white" fillOpacity="0.12" />
        <circle cx="180" cy="142" r="8" fill="white" fillOpacity="0.2" />
        <rect x="204" y="112" width="12" height="7" rx="3.5" fill="#fbbf24" fillOpacity="0.9" />
        {[[30, 25], [230, 18], [258, 65], [18, 80], [255, 115]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2" fill="white" fillOpacity="0.4" />)}
        <line x1="22" y1="115" x2="55" y2="115" stroke="white" strokeOpacity="0.15" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="124" x2="42" y2="124" stroke="white" strokeOpacity="0.1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
)

const inputCls = 'w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all'
const labelCls = 'text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 block mb-1.5'

export default function VehiclePage() {
    const router = useRouter()
    const { refresh: refreshUserData, loading: refreshing } = useGetMe()
    const [vehicleType, setVehicleType] = useState("")
    const [vehicleNumber, setVehicleNumber] = useState("")
    const [vehicleModel, setVehicleModel] = useState("")
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const canContinue = vehicleType && vehicleNumber.trim() && vehicleModel.trim()
    const meta = STEPS[0];

    const handleVehicle = async () => {
        setErrorMessage("");
        try {
            setLoading(true);
            const { data } = await axios.post("/api/rider/onboarding/vehicle", {
                type: vehicleType, vehicleNumber, vehicleModel
            })

            // Refresh user data to reflect the updated onboarding step
            await refreshUserData()

            // Small delay to ensure data is updated before redirect
            setTimeout(() => {
                router.push('/rider/onboarding/documents');
            }, 300)
        } catch (error: any) {
            setErrorMessage(error.response?.data?.message || "Failed to save vehicle details");
        }
        finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        const handleGetVehicle = async () => {
            try {
                const { data } = await axios.get("/api/rider/onboarding/vehicle")
                setVehicleType(data.type)
                setVehicleNumber(data.vehicleNumber)
                setVehicleModel(data.vehicleModel)
            } catch (error: any) {
                console.log(error);
            }
        }
        handleGetVehicle();
    }, [])

    return (
        <div className='min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4 pt-20'>
            <div className='fixed inset-0 pointer-events-none opacity-[0.025]' style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='w-full max-w-3xl bg-white rounded-[24px] shadow-[0_8px_50px_rgba(0,0,0,0.09)] overflow-hidden'>
                <div className='flex'>

                    {/* Left panel */}
                    <div className={`hidden lg:flex flex-col justify-between w-[260px] shrink-0 bg-gradient-to-br ${meta.image.bg} p-6`}>
                        <div>
                            <span className='inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/55 border border-white/15 rounded-full px-2.5 py-1'>
                                <span className='w-1.5 h-1.5 rounded-full bg-green-400' />{meta.image.badge}
                            </span>
                            <h2 className='mt-4 text-lg font-black text-white leading-snug tracking-tight'>{meta.image.headline}</h2>
                            <p className='mt-2 text-xs text-white/45 leading-relaxed'>{meta.image.sub}</p>
                        </div>
                        <div className='flex justify-center my-4'><SceneVehicle /></div>
                        <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3'>
                            <p className='text-2xl font-black text-white'>{meta.image.stat.value}</p>
                            <p className='text-[10px] text-white/35 mt-0.5'>{meta.image.stat.label}</p>
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className='flex-1 flex flex-col p-6 sm:p-7 min-w-0'>
                        <div className='flex items-center gap-3 mb-5'>
                            <button onClick={() => router.back()} className='w-8 h-8 shrink-0 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all'>
                                <ArrowLeft size={14} />
                            </button>
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-0.5'>
                                    <span className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400'>Step 1 of 3</span>
                                    <div className='flex items-center gap-1'>
                                        <div className='w-4 h-1.5 rounded-full bg-zinc-900' />
                                        <div className='w-1.5 h-1.5 rounded-full bg-zinc-200' />
                                        <div className='w-1.5 h-1.5 rounded-full bg-zinc-200' />
                                    </div>
                                </div>
                                <h1 className='text-lg font-black text-zinc-900 tracking-tight leading-none'>{meta.title}</h1>
                                <p className='text-[11px] text-zinc-400 mt-0.5'>{meta.subtitle}</p>
                            </div>
                        </div>

                        <div className='flex-1 space-y-4'>
                            <div>
                                <p className={labelCls}>Vehicle Type</p>
                                <div className='grid grid-cols-3 gap-2'>
                                    {vehicles.map((v) => {
                                        const Icon = v.icon; const active = vehicleType === v.id
                                        return (
                                            <motion.button key={v.id} whileTap={{ scale: 0.96 }} onClick={() => setVehicleType(v.id)}
                                                className={`relative flex flex-col items-center gap-1 py-3 px-1 rounded-xl border transition-all duration-200 ${active ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-300'}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-white text-zinc-900' : 'bg-zinc-50 text-zinc-700'}`}>
                                                    <Icon size={15} strokeWidth={1.8} />
                                                </div>
                                                <span className='text-[11px] font-bold leading-none'>{v.label}</span>
                                                <span className='text-[9px] text-zinc-400 leading-none'>{v.desc}</span>
                                                {active && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center'><div className='w-1.5 h-1.5 rounded-full bg-zinc-900' /></motion.div>}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </div>
                            <div>

                                <label className={labelCls}>Vehicle Number</label>
                                <input className={`${inputCls} uppercase tracking-widest font-semibold`} placeholder='DL 9S AR 3456' value={vehicleNumber} onChange={e => setVehicleNumber(e.target.value.toUpperCase())} />

                            </div>
                            <div>
                                <label className={labelCls}>Vehicle Model</label>
                                <input className={inputCls} placeholder='e.g. Honda Activa, Tata Sumo' value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} />
                            </div>
                        </div>
                        {errorMessage && (<p className='text-red-500 text-[12px] mt-3 font-semibold'>*{errorMessage}</p>)}
                        <div className='mt-5'>
                            <motion.button whileHover={canContinue ? { scale: 1.01 } : {}} whileTap={canContinue ? { scale: 0.975 } : {}}
                                disabled={loading} onClick={handleVehicle}
                                className='w-full py-3.5 rounded-2xl bg-zinc-900 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:enabled:bg-black'>
                                {loading ? <CircleDashed className='text-white animate-spin' /> : "Continue to Documents"} <ArrowRight size={14} />
                            </motion.button>
                            <p className='text-center text-[10px] text-zinc-300 mt-2.5'>Your data is encrypted and secure</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}