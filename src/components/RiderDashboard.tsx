'use client'
import { logger } from "@/lib/logger";
import { RootState } from '@/redux/store';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import axios from 'axios'
import {
    Bike, FileText, CreditCard, ClipboardCheck,
    Video, Tag, Star, Zap, ChevronRight, CheckCircle2,
    Clock, Lock, XCircle, AlertTriangle, RefreshCw,
    ExternalLink, Copy, Check, Wifi, WifiOff
} from 'lucide-react';
import PricingModal from './Pricingmodal';
import ProfessionalRiderDashboard from './ProfessionalRiderDashboard';

type Step = {
    id: number;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    route?: string;
    isVideoKYC?: boolean;
    isPricing?: boolean;
};

const steps: Step[] = [
    { id: 1, title: "Vehicle", subtitle: "Add your vehicle details", icon: Bike, route: "/rider/onboarding/vehicle" },
    { id: 2, title: "Documents", subtitle: "Upload KYC documents", icon: FileText, route: "/rider/onboarding/documents" },
    { id: 3, title: "Bank", subtitle: "Set up payout account", icon: CreditCard, route: "/rider/onboarding/bank" },
    { id: 4, title: "Review", subtitle: "Initial profile review", icon: ClipboardCheck },
    { id: 5, title: "Video KYC", subtitle: "Quick identity verification", icon: Video, isVideoKYC: true },
    { id: 6, title: "Pricing", subtitle: "Set your fare & upload photo", icon: Tag, isPricing: true },
    { id: 7, title: "Final Review", subtitle: "Last check before going live", icon: Star },
    { id: 8, title: "Live", subtitle: "Start accepting rides!", icon: Zap, route: "/bookings" },
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
const RiderStatusBanner = ({ riderStatus, rejectionReason }: { riderStatus?: string; rejectionReason?: string | null }) => {
    if (!riderStatus || riderStatus === 'pending') return (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className='flex items-start gap-3.5 p-4 rounded-2xl bg-amber-50 border border-amber-200'>
            <div className='w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5'><Clock size={16} className='text-amber-600' /></div>
            <div className='flex-1 min-w-0'>
                <p className='text-sm font-black text-amber-800'>Application Under Review</p>
                <p className='text-xs text-amber-600 mt-0.5 leading-relaxed'>Our team is reviewing your profile. You'll be notified once complete — usually within 24–48 hours.</p>
            </div>
            <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 shrink-0'>Pending</span>
        </motion.div>
    )
    if (riderStatus === 'approved') return (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className='flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200'>
            <div className='w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5'><CheckCircle2 size={16} className='text-emerald-600' /></div>
            <div className='flex-1 min-w-0'>
                <p className='text-sm font-black text-emerald-800'>Your application got Approved</p>
                <p className='text-xs text-emerald-600 mt-0.5 leading-relaxed'>Move to next steps to complete your application.</p>
            </div>
            <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0'>Approved</span>
        </motion.div>
    )
    if (riderStatus === 'rejected') return (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className='rounded-2xl border border-red-200 overflow-hidden'>
            <div className='flex items-start gap-3.5 p-4 bg-red-50'>
                <div className='w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0 mt-0.5'><XCircle size={16} className='text-red-600' /></div>
                <div className='flex-1 min-w-0'>
                    <p className='text-sm font-black text-red-800'>Application Rejected</p>
                    <p className='text-xs text-red-500 mt-0.5 leading-relaxed'>Please review the reason below and resubmit.</p>
                </div>
                <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200 shrink-0'>Rejected</span>
            </div>
            {rejectionReason && (
                <div className='px-4 py-3 bg-white border-t border-red-100 flex items-start gap-3'>
                    <AlertTriangle size={13} className='text-red-400 mt-0.5 shrink-0' />
                    <div>
                        <p className='text-[9px] font-black uppercase tracking-[0.15em] text-red-400 mb-1'>Reason from Admin</p>
                        <p className='text-sm text-zinc-700 leading-relaxed'>"{rejectionReason}"</p>
                    </div>
                </div>
            )}
            <div className='px-4 py-3 bg-zinc-50 border-t border-red-100 flex items-center gap-2'>
                <RefreshCw size={12} className='text-zinc-400' />
                <p className='text-xs text-zinc-400'>Fix the issue above and resubmit your details from the steps below.</p>
            </div>
        </motion.div>
    )
    return null
}

// ── Video KYC dropdown panel ──────────────────────────────────
const VideoKYCPanel = ({ roomId, status, kycRejectionReason }: { roomId?: string | null; status?: string | null; kycRejectionReason?: string | null }) => {
    const [copied, setCopied] = useState(false)
    const [requesting, setRequesting] = useState(false)
    const [requestDone, setRequestDone] = useState(false)
    const [requestError, setRequestError] = useState('')

    const handleCopy = () => {
        if (!roomId) return
        navigator.clipboard.writeText(roomId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleJoin = () => {
        if (!roomId) return
        window.open(`/video-kyc/${roomId}`, '_blank')
    }

    const handleRequestAgain = async () => {
        try {
            setRequesting(true)
            setRequestError('')
            await axios.get('/api/rider/video-kyc/request')
            setRequestDone(true)
        } catch (err: any) {
            setRequestError(err?.response?.data?.message ?? 'Request failed. Please try again.')
        } finally {
            setRequesting(false)
        }
    }

    const statusMap: Record<string, { icon: React.ElementType; iconCls: string; bg: string; border: string; title: string; desc: string }> = {
        in_progress: {
            icon: Wifi, iconCls: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
            title: 'Your KYC call is ready!',
            desc: 'An agent is waiting. Click "Join Call" to connect now. Keep your documents handy.',
        },
        completed: {
            icon: CheckCircle2, iconCls: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',
            title: 'Video KYC Completed',
            desc: "Your identity has been verified. We'll notify you once the review is finalised.",
        },
        approved: {
            icon: CheckCircle2, iconCls: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',
            title: 'Video KYC Approved',
            desc: "Your identity has been successfully verified. You're all set to move to the next step.",
        },
        rejected: {
            icon: WifiOff, iconCls: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200',
            title: 'Video KYC Rejected',
            desc: 'Your KYC session was unsuccessful. Review the reason below and request a new call.',
        },
    }

    const cfg = statusMap[status ?? ''] ?? {
        icon: Clock, iconCls: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200',
        title: 'Awaiting KYC Scheduling',
        desc: "Our team will schedule your Video KYC call shortly. You'll see a Join Call button here once ready.",
    }

    const Icon = cfg.icon

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className='overflow-hidden'
        >
            <div className={`mx-4 mb-4 rounded-xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
                <div className='flex items-start gap-3 p-4'>
                    <div className='w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0'>
                        <Icon size={15} className={cfg.iconCls} />
                    </div>
                    <div className='flex-1 min-w-0'>
                        <p className='text-xs font-black text-zinc-800'>{cfg.title}</p>
                        <p className='text-[11px] text-zinc-500 mt-0.5 leading-relaxed'>{cfg.desc}</p>
                    </div>
                </div>

                {/* Rejected: reason + re-request */}
                {status === 'rejected' && (
                    <div className='px-4 pb-4 space-y-3'>
                        {kycRejectionReason && (
                            <div className='flex items-start gap-2.5 bg-white/70 border border-red-100 rounded-xl px-3 py-3'>
                                <AlertTriangle size={13} className='text-red-400 mt-0.5 shrink-0' />
                                <div>
                                    <p className='text-[9px] font-black uppercase tracking-[0.15em] text-red-400 mb-1'>Reason from Admin</p>
                                    <p className='text-xs text-zinc-700 leading-relaxed'>"{kycRejectionReason}"</p>
                                </div>
                            </div>
                        )}
                        {requestDone ? (
                            <div className='flex items-center gap-2 px-3 py-3 rounded-xl bg-emerald-50 border border-emerald-200'>
                                <CheckCircle2 size={13} className='text-emerald-600 shrink-0' />
                                <p className='text-xs font-semibold text-emerald-700'>Request sent! Our team will schedule a new call shortly.</p>
                            </div>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                                    onClick={handleRequestAgain}
                                    disabled={requesting}
                                    className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-black transition-all disabled:opacity-50'
                                >
                                    {requesting
                                        ? <><RefreshCw size={12} className='animate-spin' /> Sending Request…</>
                                        : <><RefreshCw size={12} /> Request KYC Again</>
                                    }
                                </motion.button>
                                {requestError && <p className='text-[10px] text-red-500 font-semibold text-center'>{requestError}</p>}
                            </>
                        )}
                    </div>
                )}

                {/* In-progress: room ID + join */}
                {roomId && status === 'in_progress' && (
                    <div className='px-4 pb-4 space-y-3'>
                        <div className='flex items-center gap-2 bg-white/70 border border-white/80 rounded-xl px-3 py-2.5'>
                            <div className='flex-1 min-w-0'>
                                <p className='text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-0.5'>Room ID</p>
                                <p className='text-xs font-semibold text-zinc-700 truncate font-mono'>{roomId}</p>
                            </div>
                            <button onClick={handleCopy} className='shrink-0 w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all' title='Copy room ID'>
                                {copied ? <Check size={12} className='text-emerald-600' /> : <Copy size={12} className='text-zinc-500' />}
                            </button>
                        </div>
                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} onClick={handleJoin}
                            className='w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-black transition-all'>
                            <Video size={13} /> Join Video Call <ExternalLink size={11} className='opacity-60' />
                        </motion.button>
                        <div className='grid grid-cols-3 gap-2'>
                            {['Good lighting', 'Quiet space', 'Documents ready'].map(tip => (
                                <div key={tip} className='flex items-center gap-1.5 bg-white/50 rounded-lg px-2 py-1.5'>
                                    <CheckCircle2 size={9} className='text-emerald-500 shrink-0' />
                                    <span className='text-[9px] text-zinc-500 font-semibold leading-tight'>{tip}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

// ── Dashboard ─────────────────────────────────────────────────
const RiderDashboard = () => {
    const [completedSteps, setCompletedSteps] = useState(3)
    const { userData } = useSelector((state: RootState) => state.user)
    const router = useRouter()
    const [expandedKYC, setExpandedKYC] = useState(false)
    const [pricingOpen, setPricingOpen] = useState(false)
    const [pricingStatus, setPricingStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)
    const [pricingRejectionReason, setPricingRejectionReason] = useState<string | null>(null)

    const refreshPricingState = async () => {
        try {
            const { data: vehicle } = await axios.get('/api/rider/onboarding/pricing')
            setPricingStatus(vehicle?.status ?? null)
            setPricingRejectionReason(vehicle?.rejectionReason ?? null)
        } catch (error: any) {
            if (error?.response?.status === 404) {
                setPricingStatus(null)
                setPricingRejectionReason(null)
                return
            }
            logger.error('Error fetching pricing state:', error)
        }
    }

    useEffect(() => {
        if (userData) {
            setCompletedSteps(userData.riderOnboardingSteps)
            if (userData.videoKYCStatus === 'in_progress') setExpandedKYC(true)
        }
    }, [userData])

    useEffect(() => {
        void refreshPricingState()
    }, [])

    const activeStep = completedSteps + 1
    const completedCount = completedSteps
    const progressPercent = Math.round((completedSteps / TOTAL_STEPS) * 100)

    const riderStatus = userData?.riderStatus
    const rejectionReason = userData?.rejectionReason
    const videoKYCStatus = userData?.videoKYCStatus
    const videoKYCRoomId = userData?.videoKYCRoomId
    const videoKYCRejectionReason = userData?.VideoKYCRejectionReason
    const pricingBadge = pricingStatus === 'rejected'
        ? { label: 'Rejected', cls: 'bg-red-50 text-red-600 border-red-200' }
        : pricingStatus === 'pending'
            ? { label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
            : pricingStatus === 'approved'
                ? { label: 'Approved', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
                : null

    const isLive = riderStatus === 'approved' && pricingStatus === 'approved' && completedSteps >= 7

    if (isLive) {
        return <ProfessionalRiderDashboard />;
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
                    <h1 className='text-4xl font-black text-zinc-900 tracking-tight'>Rider Onboarding</h1>
                    <p className='text-zinc-400 text-sm mt-1.5'>Complete all steps to activate your account and start earning.</p>
                </motion.div>

                {/* Status banner */}
                <AnimatePresence>
                    {riderStatus && <RiderStatusBanner riderStatus={riderStatus} rejectionReason={rejectionReason} />}
                </AnimatePresence>

                {/* Summary card */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className='bg-zinc-900 rounded-[20px] p-6 text-white flex flex-col sm:flex-row items-start sm:items-center gap-6'>
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
                            <motion.circle cx="40" cy="40" r="32" fill="none"
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

                {/* Live booking card (Moved to ProfessionalRiderDashboard) */}

                {/* Horizontal track */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className='bg-white rounded-[20px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-x-auto'>
                    <div className='relative min-w-160'>
                        <div className='absolute top-5 left-5 right-5 h-0.5 bg-zinc-100' />
                        <motion.div className='absolute top-5 left-5 h-0.5 bg-zinc-900 origin-left'
                            style={{ right: `${(1 - completedSteps / (TOTAL_STEPS - 1)) * 100}%` }}
                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} />
                        <div className='relative flex justify-between'>
                            {steps.map((step, i) => {
                                const status = getStatus(step.id, activeStep)
                                const cfg = statusConfig[status]
                                const Icon = step.icon
                                return (
                                    <motion.div key={step.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 + 0.3, duration: 0.35 }}
                                        className='flex flex-col items-center gap-2'>
                                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${cfg.ring} z-10 relative
                                            ${step.isVideoKYC && videoKYCStatus === 'in_progress' ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}>
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

                        const isKYCStep = !!step.isVideoKYC
                        const isPricingStep = !!step.isPricing
                        const kycInteractable = isKYCStep && !!videoKYCStatus
                        const pricingInteractable = isPricingStep && (status === 'active' || status === 'completed')
                        const isClickable = (status === 'active' || status === 'pending' || status === 'completed')
                            && !isKYCStep && !isPricingStep

                        const isActive = status === 'active'
                            || (isKYCStep && videoKYCStatus === 'in_progress')

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className={`bg-white rounded-2xl border transition-[box-shadow,border-color,transform] duration-200 will-change-transform overflow-hidden
                                    ${isActive
                                        ? 'border-zinc-900 shadow-[0_4px_24px_rgba(0,0,0,0.1)]'
                                        : 'border-zinc-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}
                            >
                                {/* Card row */}
                                <div
                                    className={`flex items-center gap-4 p-4 transition-colors
                                        ${isClickable || kycInteractable || pricingInteractable
                                            ? 'cursor-pointer hover:bg-zinc-50/50'
                                            : 'cursor-default'}`}
                                    onClick={() => {
                                        if (isKYCStep && kycInteractable) setExpandedKYC(p => !p)
                                        else if (isPricingStep && pricingInteractable) setPricingOpen(true)
                                        else if (isClickable && step.route) router.push(step.route)
                                    }}
                                >
                                    {/* Icon */}
                                    <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shrink-0 transition-all ${cfg.ring}`}>
                                        {status === 'completed' ? <CheckCircle2 size={18} className='text-white' />
                                            : status === 'locked' ? <Lock size={14} className={cfg.icon} />
                                                : <Icon size={17} className={cfg.icon} />}
                                    </div>

                                    {/* Text */}
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2 flex-wrap'>
                                            <span className={`text-sm font-black ${status === 'locked' ? 'text-zinc-300' : 'text-zinc-900'}`}>
                                                {step.title}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${step.id === 8 && status !== 'locked'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : cfg.label}`}>
                                                {step.id === 8 && status !== 'locked' ? 'Live' : cfg.labelText}
                                            </span>
                                            {isKYCStep && videoKYCStatus === 'in_progress' && (
                                                <span className='inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200'>
                                                    <span className='w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse' />
                                                    Live
                                                </span>
                                            )}
                                            {isPricingStep && pricingBadge && (
                                                <span className={`text-[9px] font-black uppercase tracking-[0.12em] px-2 py-0.5 rounded-full border ${pricingBadge.cls}`}>
                                                    {pricingBadge.label}
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-xs mt-0.5 ${status === 'locked' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                            {isKYCStep && videoKYCStatus === 'in_progress'
                                                ? 'Agent is ready — tap to join your call'
                                                : step.subtitle}
                                        </p>
                                    </div>

                                    <span className='text-[10px] font-bold text-zinc-300 shrink-0 mr-1'>{step.id}/{TOTAL_STEPS}</span>

                                    {/* KYC toggle chevron */}
                                    {isKYCStep && kycInteractable && (
                                        <motion.div animate={{ rotate: expandedKYC ? 90 : 0 }} transition={{ duration: 0.2 }}
                                            className='w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center shrink-0'>
                                            <ChevronRight size={13} className='text-zinc-500' />
                                        </motion.div>
                                    )}

                                    {/* Pricing arrow */}
                                    {isPricingStep && pricingInteractable && (
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all
                                            ${status === 'active' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                            <ChevronRight size={13} />
                                        </div>
                                    )}

                                    {/* Regular step arrow */}
                                    {isClickable && step.route && (
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all
                                            ${status === 'active' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                            <ChevronRight size={13} />
                                        </div>
                                    )}

                                    {/* Lock */}
                                    {status === 'locked' && (
                                        <div className='w-7 h-7 rounded-full bg-zinc-50 flex items-center justify-center shrink-0'>
                                            <Lock size={11} className='text-zinc-200' />
                                        </div>
                                    )}
                                </div>

                                {isPricingStep && (pricingStatus || pricingRejectionReason) && (
                                    <div className={`mx-4 mb-4 rounded-xl border px-3 py-3 ${pricingStatus === 'rejected'
                                        ? 'bg-red-50 border-red-200'
                                        : pricingStatus === 'pending'
                                            ? 'bg-amber-50 border-amber-200'
                                            : 'bg-emerald-50 border-emerald-200'}`}>
                                        <div className='flex items-start gap-2'>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pricingStatus === 'rejected'
                                                ? 'bg-red-100 text-red-600'
                                                : pricingStatus === 'pending'
                                                    ? 'bg-amber-100 text-amber-600'
                                                    : 'bg-emerald-100 text-emerald-600'}`}>
                                                {pricingStatus === 'rejected' ? <AlertTriangle size={14} /> : pricingStatus === 'pending' ? <Clock size={14} /> : <CheckCircle2 size={14} />}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <p className={`text-[10px] font-black uppercase tracking-[0.14em] ${pricingStatus === 'rejected' ? 'text-red-500' : pricingStatus === 'pending' ? 'text-amber-700' : 'text-emerald-700'}`}>
                                                    {pricingStatus === 'rejected'
                                                        ? 'Needs attention'
                                                        : pricingStatus === 'pending'
                                                            ? 'Awaiting admin review'
                                                            : 'Pricing approved'}
                                                </p>
                                                <p className='text-xs text-zinc-600 leading-relaxed mt-0.5'>
                                                    {pricingStatus === 'rejected'
                                                        ? (pricingRejectionReason ? `Reason: ${pricingRejectionReason}` : 'Please resubmit your pricing details with the requested corrections.')
                                                        : pricingStatus === 'pending'
                                                            ? 'Your latest pricing submission is under review and will be updated once an admin responds.'
                                                            : 'Your pricing is approved and you can continue with the next step.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Active progress bar (non-KYC, non-pricing) */}
                                {status === 'active' && !isKYCStep && !isPricingStep && (
                                    <div className='px-4 pb-4'>
                                        <div className='h-1 w-full bg-zinc-100 rounded-full overflow-hidden'>
                                            <motion.div className='h-full bg-zinc-900 rounded-full'
                                                initial={{ width: 0 }} animate={{ width: '40%' }}
                                                transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }} />
                                        </div>
                                        <p className='text-[10px] text-zinc-400 mt-1.5'>Continue where you left off</p>
                                    </div>
                                )}

                                {/* Video KYC expandable */}
                                {isKYCStep && (
                                    <AnimatePresence>
                                        {expandedKYC && (
                                            <VideoKYCPanel
                                                roomId={videoKYCRoomId}
                                                status={videoKYCStatus}
                                                kycRejectionReason={videoKYCRejectionReason}
                                            />
                                        )}
                                    </AnimatePresence>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Pricing modal */}
            <PricingModal
                open={pricingOpen}
                onClose={() => setPricingOpen(false)}
                data={null}
                onSuccess={async () => {
                    setPricingStatus('pending')
                    setPricingRejectionReason(null)
                    setPricingOpen(false)
                    await refreshPricingState()
                }}
            />
        </div>
    )
}

export default RiderDashboard