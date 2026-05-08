'use client'
import React, { useState } from 'react'
import { motion } from "motion/react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Upload } from 'lucide-react';

const SceneDocs = () => (
    <svg viewBox="0 0 280 160" fill="none" className="w-full max-w-[200px]">
        <rect x="66" y="18" width="120" height="132" rx="10" fill="white" fillOpacity="0.05" />
        <rect x="78" y="28" width="120" height="132" rx="10" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.18" strokeWidth="1.5" />
        {[55, 72, 86, 100, 114, 128].map((y, i) => <rect key={i} x="96" y={y} width={i % 2 === 0 ? 72 : 54} height="5" rx="2.5" fill="white" fillOpacity="0.18" />)}
        <path d="M138 148 C122 141 112 129 112 115V103L138 96L164 103V115C164 129 154 141 138 148Z" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
        <path d="M131 122 L136 127 L146 114" stroke="white" strokeOpacity="0.9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {[[32, 28], [240, 22], [258, 130], [22, 138]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="white" fillOpacity="0.3" />)}
    </svg>
)

const labelCls = 'text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 block mb-1.5'

const UploadBox = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
        <label className={labelCls}>{label}</label>
        <label className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all group ${value ? 'border-zinc-300 bg-zinc-50' : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white'}`}>
            <Upload size={15} className={`shrink-0 transition-colors ${value ? 'text-zinc-500' : 'text-zinc-300 group-hover:text-zinc-500'}`} />
            <span className={`text-xs transition-colors truncate ${value ? 'text-zinc-600 font-medium' : 'text-zinc-400'}`}>{value || "Click to upload"}</span>
            {value && <CheckCircle2 size={14} className='text-green-500 ml-auto shrink-0' />}
            <input type="file" className='hidden' onChange={e => onChange(e.target.files?.[0]?.name || "")} />
        </label>
    </div>
)

export default function DocumentsPage() {
    const router = useRouter()
    const [aadhaar, setAadhaar] = useState("")
    const [license, setLicense] = useState("")
    const [rc, setRc] = useState("")

    const canContinue = aadhaar && license && rc

    return (
        <div className='min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4 pt-20'>
            <div className='fixed inset-0 pointer-events-none opacity-[0.025]' style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='w-full max-w-3xl bg-white rounded-[24px] shadow-[0_8px_50px_rgba(0,0,0,0.09)] overflow-hidden'>
                <div className='flex'>

                    {/* Left panel */}
                    <div className='hidden lg:flex flex-col justify-between w-[260px] shrink-0 bg-gradient-to-br from-stone-900 to-neutral-800 p-6'>
                        <div>
                            <span className='inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/55 border border-white/15 rounded-full px-2.5 py-1'>
                                <span className='w-1.5 h-1.5 rounded-full bg-green-400' />Secure & Private
                            </span>
                            <h2 className='mt-4 text-lg font-black text-white leading-snug tracking-tight'>Your data is encrypted end‑to‑end</h2>
                            <p className='mt-2 text-xs text-white/45 leading-relaxed'>Bank-grade security keeps your documents safe and private.</p>
                        </div>
                        <div className='flex justify-center my-4'><SceneDocs /></div>
                        <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3'>
                            <p className='text-2xl font-black text-white'>256-bit</p>
                            <p className='text-[10px] text-white/35 mt-0.5'>AES encryption</p>
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
                                    <span className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400'>Step 2 of 3</span>
                                    <div className='flex items-center gap-1'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-zinc-900' />
                                        <div className='w-4 h-1.5 rounded-full bg-zinc-900' />
                                        <div className='w-1.5 h-1.5 rounded-full bg-zinc-200' />
                                    </div>
                                </div>
                                <h1 className='text-lg font-black text-zinc-900 tracking-tight leading-none'>Your Documents</h1>
                                <p className='text-[11px] text-zinc-400 mt-0.5'>Upload required KYC documents</p>
                            </div>
                        </div>

                        <div className='flex-1 space-y-3.5'>
                            <UploadBox label="Aadhaar / ID Proof" value={aadhaar} onChange={setAadhaar} />
                            <UploadBox label="Driving license (Front & Back)" value={license} onChange={setLicense} />
                            <UploadBox label="Vehicle RC Document" value={rc} onChange={setRc} />

                            <div className='flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100'>
                                <CheckCircle2 size={13} className='text-zinc-400 mt-0.5 shrink-0' />
                                <p className='text-[11px] text-zinc-400 leading-relaxed'>Documents reviewed within 24 hrs. You'll get an email once verified.</p>
                            </div>
                        </div>

                        <div className='mt-5'>
                            <motion.button whileHover={canContinue ? { scale: 1.01 } : {}} whileTap={canContinue ? { scale: 0.975 } : {}}
                                disabled={!canContinue} onClick={() => router.push('/rider/onboarding/bank')}
                                className='w-full py-3.5 rounded-2xl bg-zinc-900 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:enabled:bg-black'>
                                Continue to Bank & Payout <ArrowRight size={14} />
                            </motion.button>
                            <p className='text-center text-[10px] text-zinc-300 mt-2.5'>Your data is encrypted and secure</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}