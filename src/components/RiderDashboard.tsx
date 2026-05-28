'use client'
import { RootState } from '@/redux/store';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
    Bike, FileText, CreditCard, ClipboardCheck,
    Video, Tag, Star, Zap, ChevronRight, CheckCircle2,
    Clock, Lock, XCircle, AlertTriangle, RefreshCw
} from 'lucide-react';

type Step = {
    id: number;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    route?: string;
};

const steps: Step[] = [
    { id: 1, title: "Vehicle", subtitle: "Add your vehicle details", icon: Bike, route: "/rider/onboarding/vehicle" },
    { id: 2, title: "Documents", subtitle: "Upload KYC documents", icon: FileText, route: "/rider/onboarding/documents" },
    { id: 3, title: "Bank", subtitle: "Set up payout account", icon: CreditCard, route: "/rider/onboarding/bank" },
    { id: 4, title: "Review", subtitle: "Initial profile review", icon: ClipboardCheck },
    { id: 5, title: "Video KYC", subtitle: "Quick identity verification", icon: Video },
    { id: 6, title: "Pricing", subtitle: "Choose your service plan", icon: Tag },
    { id: 7, title: "Final Review", subtitle: "Last check before going live", icon: Star },
    { id: 8, title: "Live", subtitle: "Start accepting rides!", icon: Zap },
]

const TOTAL_STEPS = steps.length

type Status = 'completed' | 'active' | 'pending' | 'locked'

const getStatus = (stepId: number, activeStep: number): Status => {
    if (stepId < activeStep) return 'completed'
    if (stepId === activeStep) return 'active'
    if (stepId === activeStep + 1) return 'pending'
    return 'locked'
}

const statusConfig = {
    completed: { ring: 'border-zinc-900 bg-zinc-900', icon: 'text-white', label: 'bg-emerald-50 text-emerald-700 border-emerald-200', labelText: 'Completed' },
    active: { ring: 'border-zinc-900 bg-white', icon: 'text-zinc-900', label: 'bg-zinc-900 text-white border-zinc-900', labelText: 'In Progress' },
    pending: { ring: 'border-zinc-300 bg-white', icon: 'text-zinc-400', label: 'bg-amber-50 text-amber-700 border-amber-200', labelText: 'Up Next' },
    locked: { ring: 'border-zinc-100 bg-zinc-50', icon: 'text-zinc-300', label: 'bg-zinc-50 text-zinc-400 border-zinc-100', labelText: 'Locked' },
}

// ── Rider status banner ───────────────────────────────────────
type RiderStatus = 'pending' | 'approved' | 'rejected' | string | undefined

const RiderStatusBanner = ({
    riderStatus,
    rejectionReason,
}: {
    riderStatus: RiderStatus
    rejectionReason?: string | null
}) => {
    if (!riderStatus || riderStatus === 'pending') {
        return (
            <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200'
            >
                <div className='w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5'>
                    <Clock size={16} className='text-amber-600' />
                </div>
                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-black text-amber-800'>Application Under Review</p>
                    <p className='text-xs text-amber-600 mt-0.5 leading-relaxed'>
                        Our team is reviewing your profile. You'll be notified once the review is complete — usually within 24–48 hours.
                    </p>
                </div>
                <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shrink-0'>
                    Pending
                </span>
            </motion.div>
        )
    }

    if (riderStatus === 'approved') {
        return (
            <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200'
            >
                <div className='w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5'>
                    <CheckCircle2 size={16} className='text-emerald-600' />
                </div>
                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-black text-emerald-800'>Your application got  Approved </p>
                    <p className='text-xs text-emerald-600 mt-0.5 leading-relaxed'>
                        Move to next steps to complete your application.
                    </p>
                </div>
                <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0'>
                    Approved
                </span>
            </motion.div>
        )
    }

    if (riderStatus === 'rejected') {
        return (
            <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='rounded-2xl border border-red-200 overflow-hidden'
            >
                {/* Top bar */}
                <div className='flex items-start gap-3.5 p-4 bg-red-50'>
                    <div className='w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5'>
                        <XCircle size={16} className='text-red-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm font-black text-red-800'>Application Rejected</p>
                        <p className='text-xs text-red-500 mt-0.5 leading-relaxed'>
                            Your application was not approved. Please review the reason below and resubmit.
                        </p>
                    </div>
                    <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 shrink-0'>
                        Rejected
                    </span>
                </div>

                {/* Rejection reason */}
                {rejectionReason && (
                    <div className='px-4 py-3 bg-white border-t border-red-100 flex items-start gap-3'>
                        <AlertTriangle size={13} className='text-red-400 mt-0.5 shrink-0' />
                        <div>
                            <p className='text-[9px] font-black uppercase tracking-[0.15em] text-red-400 mb-1'>Reason from Admin</p>
                            <p className='text-sm text-zinc-700 leading-relaxed'>"{rejectionReason}"</p>
                        </div>
                    </div>
                )}
            </motion.div>
        )
    }

    return null
}

// ── Dashboard ─────────────────────────────────────────────────
const RiderDashboard = () => {
    const [completedSteps, setCompletedSteps] = useState(3)
    const { userData } = useSelector((state: RootState) => state.user)
    const router = useRouter()

    useEffect(() => {
        if (userData) setCompletedSteps(userData.riderOnboardingSteps)
    }, [userData])

    const activeStep = completedSteps + 1
    const completedCount = completedSteps
    const progressPercent = Math.round((completedSteps / TOTAL_STEPS) * 100)

    const riderStatus = userData?.riderStatus
    const rejectionReason = userData?.rejectionReason

    return (
        <div className='min-h-screen bg-[#f5f5f3] px-4 pt-28 pb-20'>
            <div className='fixed inset-0 pointer-events-none opacity-[0.025]'
                style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

            <div className='max-w-4xl mx-auto space-y-6 relative'>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                    <div className='flex items-center gap-2 mb-2'>
                        <div className='h-px w-6 bg-zinc-400' />
                        <span className='text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400'>Rider Portal</span>
                    </div>
                    <h1 className='text-4xl font-black text-zinc-900 tracking-tight'>Rider Onboarding</h1>
                    <p className='text-zinc-400 text-sm mt-1.5'>Complete all steps to activate your account and start earning.</p>
                </motion.div>

                {/* ── Rider status banner ── */}
                <AnimatePresence>
                    {riderStatus && (
                        <RiderStatusBanner
                            riderStatus={riderStatus}
                            rejectionReason={rejectionReason}
                        />
                    )}
                </AnimatePresence>

                {/* Summary card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
                    className='bg-zinc-900 rounded-[20px] p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6'
                >
                    <div className='flex items-center gap-6 flex-1'>
                        <div>
                            <p className='text-4xl font-black leading-none'>{completedCount}<span className='text-zinc-500 text-xl'>/{TOTAL_STEPS}</span></p>
                            <p className='text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1'>Steps Done</p>
                        </div>
                        <div className='h-10 w-px bg-zinc-700' />
                        <div>
                            <p className='text-4xl font-black leading-none'>{progressPercent}<span className='text-zinc-500 text-xl'>%</span></p>
                            <p className='text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1'>Complete</p>
                        </div>
                        <div className='h-10 w-px bg-zinc-700' />
                        <div>
                            <p className='text-4xl font-black leading-none'>{TOTAL_STEPS - completedCount}</p>
                            <p className='text-[10px] uppercase tracking-[0.15em] text-zinc-500 mt-1'>Remaining</p>
                        </div>
                    </div>
                    <div className='relative w-20 h-20 shrink-0'>
                        <svg viewBox="0 0 80 80" className='w-full h-full -rotate-90'>
                            <circle cx="40" cy="40" r="32" fill="none" stroke="#27272a" strokeWidth="7" />
                            <motion.circle
                                cx="40" cy="40" r="32" fill="none"
                                stroke={riderStatus === 'approved' ? '#22c55e' : riderStatus === 'rejected' ? '#ef4444' : 'white'}
                                strokeWidth="7" strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 32}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - progressPercent / 100) }}
                                transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </svg>
                        <div className='absolute inset-0 flex items-center justify-center'>
                            <span className='text-xs font-black text-white'>{progressPercent}%</span>
                        </div>
                    </div>
                </motion.div>

                {/* Horizontal progress track */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
                    className='bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-x-auto'
                >
                    <div className='relative min-w-[640px]'>
                        <div className='absolute top-5 left-5 right-5 h-[2px] bg-zinc-100' />
                        <motion.div
                            className='absolute top-5 left-5 h-[2px] bg-zinc-900 origin-left'
                            style={{ right: `${(1 - completedSteps / (TOTAL_STEPS - 1)) * 100}%` }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <div className='relative flex justify-between'>
                            {steps.map((step, i) => {
                                const status = getStatus(step.id, activeStep)
                                const cfg = statusConfig[status]
                                const Icon = step.icon
                                return (
                                    <motion.div key={step.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 + 0.3, duration: 0.35 }}
                                        className='flex flex-col items-center gap-2'
                                    >
                                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${cfg.ring} z-10 relative`}>
                                            {status === 'completed' ? <CheckCircle2 size={16} className='text-white' />
                                                : status === 'locked' ? <Lock size={13} className={cfg.icon} />
                                                    : <Icon size={15} className={cfg.icon} />}
                                        </div>
                                        <span className={`text-[10px] font-bold whitespace-nowrap ${status === 'completed' || status === 'active' ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                            {step.title}
                                        </span>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </motion.div>

                {/* Step cards */}
                <div className='space-y-3'>
                    {steps.map((step, i) => {
                        const status = getStatus(step.id, activeStep)
                        const cfg = statusConfig[status]
                        const Icon = step.icon
                        const isClickable = status === 'active' || status === 'pending' || status === 'completed'

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                onClick={() => isClickable && step.route && router.push(step.route)}
                                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden
                                    ${status === 'active' ? 'border-zinc-900 shadow-[0_4px_24px_rgba(0,0,0,0.1)]' : 'border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}
                                    ${isClickable && step.route ? 'cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : 'cursor-default'}
                                `}
                            >
                                <div className='flex items-center gap-4 p-4'>
                                    <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all ${cfg.ring}`}>
                                        {status === 'completed' ? <CheckCircle2 size={18} className='text-white' />
                                            : status === 'locked' ? <Lock size={14} className={cfg.icon} />
                                                : <Icon size={17} className={cfg.icon} />}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <span className={`text-sm font-black ${status === 'locked' ? 'text-zinc-300' : 'text-zinc-900'}`}>
                                                {step.title}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${cfg.label}`}>
                                                {cfg.labelText}
                                            </span>
                                        </div>
                                        <p className={`text-xs mt-0.5 ${status === 'locked' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                            {step.subtitle}
                                        </p>
                                    </div>
                                    <span className='text-[10px] font-bold text-zinc-300 shrink-0 mr-1'>{step.id}/{TOTAL_STEPS}</span>
                                    {isClickable && step.route && (
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all
                                            ${status === 'active' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                            <ChevronRight size={13} />
                                        </div>
                                    )}
                                    {status === 'locked' && (
                                        <div className='w-7 h-7 rounded-full bg-zinc-50 flex items-center justify-center shrink-0'>
                                            <Lock size={11} className='text-zinc-200' />
                                        </div>
                                    )}
                                </div>
                                {status === 'active' && (
                                    <div className='px-4 pb-4'>
                                        <div className='h-1 w-full bg-zinc-100 rounded-full overflow-hidden'>
                                            <motion.div className='h-full bg-zinc-900 rounded-full'
                                                initial={{ width: 0 }} animate={{ width: '40%' }}
                                                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} />
                                        </div>
                                        <p className='text-[10px] text-zinc-400 mt-1.5'>Continue where you left off</p>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

            </div>
        </div>
    )
}

export default RiderDashboard