'use client'
import React, { useState } from 'react'
import { motion } from "motion/react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, CreditCard, IndianRupee, Smartphone } from 'lucide-react';
import axios from 'axios';

const SceneBank = () => (
    <svg viewBox="0 0 280 160" fill="none" className="w-full max-w-[210px]">
        {/* Card back */}
        <rect x="52" y="48" width="168" height="100" rx="12" fill="white" fillOpacity="0.07" />
        {/* Card front */}
        <rect x="60" y="36" width="168" height="100" rx="12" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" />
        {/* Chip */}
        <rect x="82" y="56" width="28" height="20" rx="4" fill="white" fillOpacity="0.4" />
        <line x1="82" y1="66" x2="110" y2="66" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
        <line x1="96" y1="56" x2="96" y2="76" stroke="white" strokeOpacity="0.6" strokeWidth="1" />
        {/* Card number dots */}
        {[0, 1, 2, 3].map(g => (
            <g key={g}>
                {[0, 1, 2, 3].map(d => <circle key={d} cx={82 + g * 40 + d * 7} cy={96} r="2.5" fill="white" fillOpacity="0.5" />)}
            </g>
        ))}
        {/* Cardholder */}
        <rect x="82" y="112" width="60" height="5" rx="2.5" fill="white" fillOpacity="0.3" />
        {/* Contactless icon */}
        <path d="M208 60 Q216 66 208 72" stroke="white" strokeOpacity="0.6" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M213 56 Q225 66 213 76" stroke="white" strokeOpacity="0.4" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Rupee badge */}
        <circle cx="220" cy="130" r="18" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.2" strokeWidth="1.5" />
        <text x="220" y="135" textAnchor="middle" fill="white" fillOpacity="0.8" fontSize="14" fontWeight="bold">₹</text>
        {/* Particles */}
        {[[28, 30], [258, 22], [268, 120], [22, 130]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="white" fillOpacity="0.32" />)}
    </svg>
)

const inputCls = 'w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 focus:bg-white transition-all'
const labelCls = 'text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 block mb-1.5'

export default function BankPage() {
    const router = useRouter()
    const [form, setForm] = useState({
        accountHolder: "",
        accountNumber: "",
        ifsc: "",
        mobile: "",
        upi: "",
    })
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    // 11:07
    const handleSubmit = async () => {
        try {
            setLoading(true);
            setErrorMessage("");
            const { data } = await axios.post("/api/rider/onboarding/bank", {
                accountHolderName: form.accountHolder, accountNumber: form.accountNumber, upi: form.upi, ifsc: form.ifsc, contact: form.mobile
            })
            console.log("This is my Data---", data);

        } catch (error: any) {
            console.log("entered in the catch")
            setErrorMessage(error.response.data.message)
            console.log("entered in the catch and error message captured", error.response.data.message)
            setLoading(false);
        }
        finally {
            setLoading(false);
        }
    }

    const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

    const canContinue = form.accountHolder.trim() && form.accountNumber.trim() && form.ifsc.trim() && form.mobile.trim()

    return (
        <div className='min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4 pt-20'>
            <div className='fixed inset-0 pointer-events-none opacity-[0.025]' style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='w-full max-w-3xl bg-white rounded-[24px] shadow-[0_8px_50px_rgba(0,0,0,0.09)] overflow-hidden'>
                <div className='flex'>

                    {/* Left panel */}
                    <div className='hidden lg:flex flex-col justify-between w-[260px] shrink-0 bg-gradient-to-br from-neutral-900 to-zinc-800 p-6'>
                        <div>
                            <span className='inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/55 border border-white/15 rounded-full px-2.5 py-1'>
                                <span className='w-1.5 h-1.5 rounded-full bg-green-400' />Almost Done
                            </span>
                            <h2 className='mt-4 text-lg font-black text-white leading-snug tracking-tight'>Get paid every week, on time.</h2>
                            <p className='mt-2 text-xs text-white/45 leading-relaxed'>Verified riders receive direct bank payouts every Monday.</p>

                            {/* Feature list */}
                            <div className='mt-5 space-y-2.5'>
                                {[
                                    { icon: IndianRupee, text: "Weekly direct bank transfers" },
                                    { icon: CreditCard, text: "UPI instant withdrawals" },
                                    { icon: Smartphone, text: "SMS alerts for every payout" },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className='flex items-center gap-2.5'>
                                        <div className='w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0'>
                                            <Icon size={11} className='text-white/70' />
                                        </div>
                                        <span className='text-[11px] text-white/50'>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='flex justify-center my-4'><SceneBank /></div>

                        <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3'>
                            <p className='text-2xl font-black text-white'>2×</p>
                            <p className='text-[10px] text-white/35 mt-0.5'>more rides for verified riders</p>
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
                                    <span className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400'>Step 3 of 3</span>
                                    <div className='flex items-center gap-1'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-zinc-900' />
                                        <div className='w-1.5 h-1.5 rounded-full bg-zinc-900' />
                                        <div className='w-4 h-1.5 rounded-full bg-zinc-900' />
                                    </div>
                                </div>
                                <h1 className='text-lg font-black text-zinc-900 tracking-tight leading-none'>Bank & Payout</h1>
                                <p className='text-[11px] text-zinc-400 mt-0.5'>Set up your payout account</p>
                            </div>
                        </div>

                        <div className='flex-1 space-y-3.5'>

                            {/* Account Holder */}
                            <div>
                                <label className={labelCls}>Account Holder Name</label>
                                <input className={inputCls} placeholder='Arjun Sharma' value={form.accountHolder} onChange={e => set('accountHolder', e.target.value)} />
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className={labelCls}>Bank Account Number</label>
                                <input className={`${inputCls} tracking-widest font-semibold`} placeholder='XXXX XXXX XXXX XXXX' value={form.accountNumber}
                                    onChange={e => set('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))} />
                            </div>

                            {/* IFSC */}
                            <div>
                                <label className={labelCls}>IFSC Code</label>
                                <input className={`${inputCls} uppercase tracking-widest font-semibold`} placeholder='SBIN0001234' maxLength={11} value={form.ifsc}
                                    onChange={e => set('ifsc', e.target.value.toUpperCase())} />
                            </div>

                            {/* Mobile + UPI side by side */}
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className={labelCls}>Mobile Number</label>
                                    <input className={inputCls} placeholder='+91 98765 43210' value={form.mobile} onChange={e => set('mobile', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelCls}>UPI ID <span className='normal-case tracking-normal text-zinc-300'>(optional)</span></label>
                                    <input className={inputCls} placeholder='name@upi' value={form.upi} onChange={e => set('upi', e.target.value)} />
                                </div>
                            </div>

                            {/* Info note */}
                            <div className='flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100'>
                                <CheckCircle2 size={13} className='text-zinc-400 mt-0.5 shrink-0' />
                                <p className='text-[11px] text-zinc-400 leading-relaxed'>Account details are verified before your first payout. Ensure the name matches your Aadhaar.</p>
                            </div>
                        </div>
                        {errorMessage && (<p className='text-red-500 text-[12px] font-semibold mt-4'>*{errorMessage}</p>)}

                        <div className='mt-5'>
                            <motion.button whileHover={canContinue ? { scale: 1.01 } : {}} whileTap={canContinue ? { scale: 0.975 } : {}}
                                disabled={loading}
                                onClick={handleSubmit}
                                className='w-full py-3.5 rounded-2xl bg-zinc-900 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:enabled:bg-black'>
                                {loading ? <CircleDashed className='text-white animate-spin' /> : "Submit & Complete onboarding"} <ArrowRight size={14} />
                            </motion.button>
                            <p className='text-center text-[10px] text-zinc-300 mt-2.5'>Your data is encrypted and secure</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}