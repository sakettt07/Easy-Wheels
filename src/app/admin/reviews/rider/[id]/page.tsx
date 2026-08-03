'use client'
import { logger } from "@/lib/logger";
import AnimatedCard from '@/components/AnimatedCard'
import DocPreview from '@/components/DocPreview'
import axios from 'axios'
import {
    ArrowLeft, Bike, Building2, Car, CheckCircle2,
    CreditCard, Hash, Mail, Phone, Shield, User,
    XCircle, Clock, Banknote, FileText, AlertTriangle
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'

// ── Field row ────────────────────────────────────────────────
const Field = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) => (
    <div className='flex items-start gap-3 py-2.5 border-b border-zinc-50 last:border-0'>
        {icon && (
            <div className='w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5 text-zinc-400'>
                {React.cloneElement(icon as React.ReactElement<any>, { size: 12, strokeWidth: 2 })}
            </div>
        )}
        <div className='flex-1 min-w-0'>
            <p className='text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400'>{label}</p>
            <p className='text-sm font-semibold text-zinc-800 mt-0.5 break-all'>{value ?? '—'}</p>
        </div>
    </div>
)

// ── Status badge ─────────────────────────────────────────────
const StatusBadge = ({ status }: { status?: string }) => {
    const map: Record<string, { cls: string; label: string }> = {
        approved: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Approved' },
        pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending Review' },
        rejected: { cls: 'bg-red-50 text-red-600 border-red-200', label: 'Rejected' },
        added: { cls: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Added' },
    }
    const cfg = map[status ?? 'pending'] ?? map.pending
    return (
        <span className={`text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            {cfg.label}
        </span>
    )
}

const ApproveModal = ({ open, onClose, onConfirm, loading }: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    loading: boolean
}) => {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className='fixed inset-0 z-[999] flex items-center justify-center p-4'
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                    <motion.div
                        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.88, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.88, opacity: 0, y: 16 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                        className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 z-10'
                    >
                        {/* Icon */}
                        <div className='w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5'>
                            <CheckCircle2 size={22} className='text-emerald-600' strokeWidth={1.8} />
                        </div>

                        <h2 className='text-lg font-black text-zinc-900 tracking-tight'>Approve this rider?</h2>
                        <p className='text-sm text-zinc-400 mt-2 leading-relaxed'>
                            All documents have been verified. Approving will activate this rider's account and allow them to start accepting rides.
                        </p>

                        {/* Checklist summary */}
                        <div className='mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2'>
                            {['Documents verified', 'Vehicle details confirmed', 'Bank details on file'].map(item => (
                                <div key={item} className='flex items-center gap-2'>
                                    <CheckCircle2 size={12} className='text-emerald-600 shrink-0' />
                                    <span className='text-xs font-semibold text-emerald-700'>{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className='flex items-center gap-3 mt-6'>
                            <button
                                onClick={onClose}
                                className='flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all'
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onConfirm}
                                disabled={loading}
                                className='flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60'
                            >
                                {loading
                                    ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                    : <CheckCircle2 size={14} />
                                }
                                Yes, Approve
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}

// ── Reject modal with reason textarea ────────────────────────
const RejectModal = ({ open, onClose, onConfirm, loading }: {
    open: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    loading: boolean
}) => {
    const [reason, setReason] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => setMounted(true), [])

    // Focus textarea when modal opens
    useEffect(() => {
        if (open) {
            setReason('')
            setTimeout(() => textareaRef.current?.focus(), 120)
        }
    }, [open])

    if (!mounted) return null;

    const canSubmit = reason.trim().length >= 10

    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    className='fixed inset-0 z-[999] flex items-center justify-center p-4'
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                >
                    <motion.div
                        className='absolute inset-0 bg-black/50 backdrop-blur-sm'
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.88, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.88, opacity: 0, y: 16 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                        className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 z-10'
                    >
                        {/* Icon */}
                        <div className='w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5'>
                            <XCircle size={22} className='text-red-500' strokeWidth={1.8} />
                        </div>

                        <h2 className='text-lg font-black text-zinc-900 tracking-tight'>Reject this rider?</h2>
                        <p className='text-sm text-zinc-400 mt-2 leading-relaxed'>
                            Please provide a clear reason for rejection. This will be visible to the rider so they can take corrective action.
                        </p>

                        {/* Reason input */}
                        <div className='mt-5'>
                            <label className='text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 block mb-2'>
                                Rejection Reason <span className='text-red-400'>*</span>
                            </label>
                            <textarea
                                ref={textareaRef}
                                rows={4}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder='e.g. Document quality is too low, please re-upload a clearer photo of your Aadhaar card...'
                                className='w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-red-300 focus:bg-white transition-all resize-none leading-relaxed'
                            />
                            <div className='flex items-center justify-between mt-1.5'>
                                {!canSubmit && reason.trim().length > 0 ? (
                                    <p className='text-[10px] text-red-400 font-medium'>
                                        Minimum 10 characters required
                                    </p>
                                ) : <span />}
                                <p className='text-[10px] text-zinc-300 ml-auto'>
                                    {reason.trim().length} chars
                                </p>
                            </div>
                        </div>

                        {/* Warning note */}
                        <div className='flex items-start gap-2.5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100'>
                            <AlertTriangle size={13} className='text-amber-500 mt-0.5 shrink-0' />
                            <p className='text-[11px] text-amber-700 leading-relaxed'>
                                This action will notify the rider via email. They can resubmit after making corrections.
                            </p>
                        </div>

                        <div className='flex items-center gap-3 mt-6'>
                            <button
                                onClick={onClose}
                                className='flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all'
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => canSubmit && onConfirm(reason.trim())}
                                disabled={!canSubmit || loading}
                                className='flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                            >
                                {loading
                                    ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                    : <XCircle size={14} />
                                }
                                Confirm Rejection
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    )
}

// ── Action bar ────────────────────────────────────────────────
const ActionBar = ({ riderId, currentStatus, onStatusChange }: {
    riderId: string
    currentStatus?: string
    onStatusChange: (s: string) => void
}) => {
    const [approveOpen, setApproveOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [error, setError] = useState('')

    const handleApprove = async () => {
        try {
            setApproving(true)
            setError('')
            await axios.get(`/api/admin/reviews/rider/${riderId}/approve`)
            onStatusChange('approved')
            setApproveOpen(false)
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Approval failed')
        } finally {
            setApproving(false)
        }
    }

    const handleReject = async (reason: string) => {
        try {
            setRejecting(true)
            setError('')
            await axios.post(`/api/admin/reviews/rider/${riderId}/reject`, { rejectionReason: reason })
            onStatusChange('rejected')
            setRejectOpen(false)
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Rejection failed')
        } finally {
            setRejecting(false)
        }
    }

    if (currentStatus === 'approved') {
        return (
            <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold'>
                <CheckCircle2 size={14} /> Rider Approved
            </div>
        )
    }

    if (currentStatus === 'rejected') {
        return (
            <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold'>
                <XCircle size={14} /> Rider Rejected
            </div>
        )
    }

    return (
        <>
            <div className='flex items-center gap-2'>
                {error && <p className='text-[10px] text-red-500 font-semibold'>{error}</p>}

                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setRejectOpen(true)}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold transition-all'
                >
                    <XCircle size={13} /> Reject
                </motion.button>

                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setApproveOpen(true)}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-black text-xs font-bold transition-all'
                >
                    <CheckCircle2 size={13} /> Approve
                </motion.button>
            </div>

            <ApproveModal
                open={approveOpen}
                onClose={() => setApproveOpen(false)}
                onConfirm={handleApprove}
                loading={approving}
            />

            <RejectModal
                open={rejectOpen}
                onClose={() => setRejectOpen(false)}
                onConfirm={handleReject}
                loading={rejecting}
            />
        </>
    )
}

// ── Page ─────────────────────────────────────────────────────
const RiderReviewPage = () => {
    const { id } = useParams()
    const router = useRouter()

    const [rider, setRider] = useState<any>(null)
    const [vehicle, setVehicle] = useState<any>(null)
    const [docs, setDocs] = useState<any>(null)
    const [bank, setBank] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRider = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(`/api/admin/reviews/rider/${id}`)
                setRider(data.rider)
                setVehicle(data.vehicle)
                setDocs(data.documents)
                setBank(data.bank)
            } catch (err) {
                logger.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchRider()
    }, [])

    if (loading) {
        return (
            <div className='min-h-screen bg-[#f5f5f3] p-6 pt-20'>
                <div className='max-w-7xl mx-auto space-y-6'>
                    <div className='h-14 bg-white rounded-2xl animate-pulse' />
                    <div className='grid lg:grid-cols-3 gap-6'>
                        <div className='lg:col-span-2 space-y-4'>
                            {[1, 2, 3].map(i => <div key={i} className='h-40 bg-white rounded-2xl animate-pulse' />)}
                        </div>
                        <div className='space-y-4'>
                            {[1, 2].map(i => <div key={i} className='h-48 bg-white rounded-2xl animate-pulse' />)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-[#f5f5f3]'>
            <div className='fixed inset-0 pointer-events-none opacity-[0.025]'
                style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

            {/* Sticky top bar */}
            <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100'
            >
                <div className='max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                        <button
                            onClick={() => router.back()}
                            className='w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all'
                        >
                            <ArrowLeft size={14} />
                        </button>
                        <div>
                            <p className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400'>Admin · Rider Review</p>
                            <p className='text-sm font-black text-zinc-900 leading-tight'>{rider?.name ?? '...'}</p>
                        </div>
                    </div>
                    <ActionBar
                        riderId={id as string}
                        currentStatus={rider?.riderStatus}
                        onStatusChange={s => setRider((r: any) => ({ ...r, riderStatus: s }))}
                    />
                </div>
            </motion.div>

            <main className='max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-6 relative'>

                {/* Left column */}
                <div className='lg:col-span-2 space-y-5'>
                    <AnimatedCard title="Vehicle Details" icon={<Car size={14} />} index={0}>
                        <Field label="Vehicle Type" value={vehicle?.type} icon={<Bike />} />
                        <Field label="Vehicle Number" value={vehicle?.vehicleNumber} icon={<Hash />} />
                        <Field label="Vehicle Model" value={vehicle?.vehicleModel} icon={<Car />} />
                        <Field label="Status" value={vehicle?.status} icon={<Shield />} />
                    </AnimatedCard>

                    <AnimatedCard title="KYC Documents" icon={<FileText size={14} />} index={1}>
                        <div className='space-y-3'>
                            <DocPreview label="Aadhaar / ID Proof" url={docs?.aadharUrl} />
                            <DocPreview label="Driving Licence" url={docs?.licenseUrl} />
                            <DocPreview label="Vehicle RC Document" url={docs?.vehicleRC} />
                        </div>
                        {docs?.status && (
                            <div className='mt-4 flex items-center gap-2'>
                                <span className='text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400'>Document Status</span>
                                <StatusBadge status={docs.status} />
                            </div>
                        )}
                    </AnimatedCard>

                    <AnimatedCard title="Bank & Payout" icon={<Banknote size={14} />} index={2}>
                        <Field label="Account Holder" value={bank?.accountHolderName} icon={<User />} />
                        <Field label="Account Number" value={bank?.accountNumber} icon={<CreditCard />} />
                        <Field label="IFSC Code" value={bank?.ifsc} icon={<Building2 />} />
                        <Field label="UPI ID" value={bank?.upi} icon={<Hash />} />
                        <Field label="Status" value={bank?.status} icon={<Shield />} />
                    </AnimatedCard>
                </div>

                {/* Right sidebar */}
                <div className='space-y-5'>
                    <AnimatedCard title="Rider Profile" icon={<User size={14} />} index={0}>
                        <div className='flex flex-col items-center text-center mb-4 pt-1'>
                            <div className='w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-2xl font-black mb-3'>
                                {rider?.name?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <p className='text-base font-black text-zinc-900 mb-1.5'>{rider?.name}</p>
                            <StatusBadge status={rider?.riderStatus} />
                        </div>
                        <div className='border-t border-zinc-100 pt-3'>
                            <Field label="Email" value={rider?.email} icon={<Mail />} />
                            <Field label="Phone" value={rider?.contact} icon={<Phone />} />
                            <Field label="Role" value={rider?.role} icon={<User />} />
                            <Field label="Email Verified" value={rider?.isEmailVerified ? 'Yes' : 'No'} icon={<CheckCircle2 />} />
                            <Field label="Onboarding Step" value={`Step ${rider?.riderOnboardingSteps ?? 0} of 3`} icon={<Clock />} />
                            <Field label="Joined" value={rider?.createdAt ? new Date(rider.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined} icon={<Clock />} />
                        </div>
                    </AnimatedCard>

                    <AnimatedCard title="Review Checklist" icon={<Shield size={14} />} index={1}>
                        <div className='space-y-2.5'>
                            {[
                                { label: 'Vehicle Added', done: !!vehicle },
                                { label: 'Documents Uploaded', done: !!(docs?.aadharUrl && docs?.licenseUrl && docs?.vehicleRC) },
                                { label: 'Bank Details', done: !!bank },
                                { label: 'Docs Verified', done: docs?.status === 'verified' },
                                { label: 'Rider Approved', done: rider?.riderStatus === 'approved' },
                            ].map(({ label, done }) => (
                                <div key={label} className='flex items-center gap-2.5'>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-emerald-100' : 'bg-zinc-100'}`}>
                                        {done
                                            ? <CheckCircle2 size={12} className='text-emerald-600' />
                                            : <Clock size={11} className='text-zinc-300' />
                                        }
                                    </div>
                                    <span className={`text-xs font-semibold ${done ? 'text-zinc-700' : 'text-zinc-400'}`}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </AnimatedCard>
                </div>

            </main>
        </div>
    )
}

export default RiderReviewPage