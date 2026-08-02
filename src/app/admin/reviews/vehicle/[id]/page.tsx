'use client'
import { logger } from "@/lib/logger";
import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import {
    ArrowLeft, Bike, Car, CheckCircle2, Clock,
    Hash, IndianRupee, Mail, Phone, Shield,
    User, XCircle, AlertTriangle, ImageIcon, Tag
} from 'lucide-react'
import AnimatedCard from '@/components/AnimatedCard'

// ── Field ────────────────────────────────────────────────────
const Field = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) => (
    <div className='flex items-start gap-3 py-2.5 border-b border-zinc-50 last:border-0'>
        {icon && (
            <div className='w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5 text-zinc-400'>
                {icon}
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
    }
    const cfg = map[status ?? 'pending'] ?? map.pending
    return (
        <span className={`text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            {cfg.label}
        </span>
    )
}

// ── Approve modal ─────────────────────────────────────────────
const ApproveModal = ({ open, onClose, onConfirm, loading }: {
    open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean
}) => {
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div className='fixed inset-0 z-1000 bg-black/50 backdrop-blur-sm'
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} />
                    <div className='fixed inset-0 z-1001 flex items-center justify-center p-4 pointer-events-none'>
                        <motion.div
                            initial={{ scale: 0.88, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 16 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 pointer-events-auto'
                        >
                            <div className='w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5'>
                                <CheckCircle2 size={22} className='text-emerald-600' strokeWidth={1.8} />
                            </div>
                            <h2 className='text-lg font-black text-zinc-900 tracking-tight'>Approve Vehicle Pricing?</h2>
                            <p className='text-sm text-zinc-400 mt-2 leading-relaxed'>
                                Approving will confirm the vehicle's pricing and image. The rider will be able to proceed to the next step.
                            </p>
                            <div className='mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2'>
                                {['Vehicle image verified', 'Fare rates look acceptable', 'Rider profile is complete'].map(item => (
                                    <div key={item} className='flex items-center gap-2'>
                                        <CheckCircle2 size={12} className='text-emerald-600 shrink-0' />
                                        <span className='text-xs font-semibold text-emerald-700'>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className='flex items-center gap-3 mt-6'>
                                <button onClick={onClose} className='flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all'>Cancel</button>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} disabled={loading}
                                    className='flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-60'>
                                    {loading ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> : <CheckCircle2 size={14} />}
                                    Yes, Approve
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

// ── Reject modal ──────────────────────────────────────────────
const RejectModal = ({ open, onClose, onConfirm, loading }: {
    open: boolean; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean
}) => {
    const [reason, setReason] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (open) { setReason(''); setTimeout(() => textareaRef.current?.focus(), 120) }
    }, [open])

    if (!mounted) return null;

    const canSubmit = reason.trim().length >= 10

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div className='fixed inset-0 z-1000 bg-black/50 backdrop-blur-sm'
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} />
                    <div className='fixed inset-0 z-1001 flex items-center justify-center p-4 pointer-events-none'>
                        <motion.div
                            initial={{ scale: 0.88, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 16 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 pointer-events-auto'
                        >
                            <div className='w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5'>
                                <XCircle size={22} className='text-red-500' strokeWidth={1.8} />
                            </div>
                            <h2 className='text-lg font-black text-zinc-900 tracking-tight'>Reject Vehicle Pricing?</h2>
                            <p className='text-sm text-zinc-400 mt-2 leading-relaxed'>Provide a clear reason — the rider will see this and can resubmit corrected pricing.</p>
                            <div className='mt-5'>
                                <label className='text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 block mb-2'>
                                    Rejection Reason <span className='text-red-400'>*</span>
                                </label>
                                <textarea ref={textareaRef} rows={4} value={reason} onChange={e => setReason(e.target.value)}
                                    placeholder='e.g. Base fare is too high for this vehicle category, or vehicle image is unclear...'
                                    className='w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:border-red-300 focus:bg-white transition-all resize-none leading-relaxed' />
                                <div className='flex justify-between mt-1.5'>
                                    {!canSubmit && reason.trim().length > 0
                                        ? <p className='text-[10px] text-red-400 font-medium'>Minimum 10 characters</p>
                                        : <span />}
                                    <p className='text-[10px] text-zinc-300 ml-auto'>{reason.trim().length} chars</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-2.5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100'>
                                <AlertTriangle size={13} className='text-amber-500 mt-0.5 shrink-0' />
                                <p className='text-[11px] text-amber-700 leading-relaxed'>The rider will be notified and can resubmit after corrections.</p>
                            </div>
                            <div className='flex items-center gap-3 mt-6'>
                                <button onClick={onClose} className='flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-all'>Cancel</button>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={() => canSubmit && onConfirm(reason.trim())}
                                    disabled={!canSubmit || loading}
                                    className='flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed'>
                                    {loading ? <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' /> : <XCircle size={14} />}
                                    Confirm Rejection
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

// ── Action bar ────────────────────────────────────────────────
const ActionBar = ({ vehicleId, currentStatus, onStatusChange }: {
    vehicleId: string; currentStatus?: string; onStatusChange: (s: string) => void
}) => {
    const [approveOpen, setApproveOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [approving, setApproving] = useState(false)
    const [rejecting, setRejecting] = useState(false)
    const [error, setError] = useState('')

    const handleApprove = async () => {
        try {
            setApproving(true); setError('')
            await axios.get(`/api/admin/reviews/vehicle/${vehicleId}/approve`)
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
            setRejecting(true); setError('')
            await axios.post(`/api/admin/reviews/vehicle/${vehicleId}/reject`, { reason })
            onStatusChange('rejected')
            setRejectOpen(false)
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Rejection failed')
        } finally {
            setRejecting(false)
        }
    }

    if (currentStatus === 'approved') return (
        <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold'>
            <CheckCircle2 size={14} /> Vehicle Approved
        </div>
    )
    if (currentStatus === 'rejected') return (
        <div className='flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold'>
            <XCircle size={14} /> Vehicle Rejected
        </div>
    )

    return (
        <>
            <div className='flex items-center gap-2'>
                {error && <p className='text-[10px] text-red-500 font-semibold'>{error}</p>}
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setRejectOpen(true)}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold transition-all'>
                    <XCircle size={13} /> Reject
                </motion.button>
                <motion.button whileTap={{ scale: 0.96 }} onClick={() => setApproveOpen(true)}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-black text-xs font-bold transition-all'>
                    <CheckCircle2 size={13} /> Approve
                </motion.button>
            </div>
            <ApproveModal open={approveOpen} onClose={() => setApproveOpen(false)} onConfirm={handleApprove} loading={approving} />
            <RejectModal open={rejectOpen} onClose={() => setRejectOpen(false)} onConfirm={handleReject} loading={rejecting} />
        </>
    )
}

// ── Page ─────────────────────────────────────────────────────
export default function VehicleReviewPage() {
    const { id } = useParams()
    const router = useRouter()

    const [vehicle, setVehicle] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                setLoading(true)
                const { data } = await axios.get(`/api/admin/reviews/vehicle/${id}`)
                setVehicle(data)
            } catch (err) {
                logger.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchVehicle()
    }, [])

    const owner = vehicle?.owner

    if (loading) {
        return (
            <div className='min-h-screen bg-[#f5f5f3] p-6 pt-20'>
                <div className='max-w-7xl mx-auto space-y-6'>
                    <div className='h-14 bg-white rounded-2xl animate-pulse' />
                    <div className='grid lg:grid-cols-3 gap-6'>
                        <div className='lg:col-span-2 space-y-4'>
                            {[1, 2].map(i => <div key={i} className='h-48 bg-white rounded-2xl animate-pulse' />)}
                        </div>
                        <div className='space-y-4'>
                            {[1, 2].map(i => <div key={i} className='h-40 bg-white rounded-2xl animate-pulse' />)}
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
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
                className='sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-100'>
                <div className='max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                        <button onClick={() => router.back()}
                            className='w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all'>
                            <ArrowLeft size={14} />
                        </button>
                        <div>
                            <p className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400'>Admin · Vehicle Review</p>
                            <p className='text-sm font-black text-zinc-900 leading-tight'>
                                {vehicle?.vehicleModel ?? '...'} — {vehicle?.vehicleNumber ?? ''}
                            </p>
                        </div>
                    </div>
                    <ActionBar
                        vehicleId={id as string}
                        currentStatus={vehicle?.status}
                        onStatusChange={s => setVehicle((v: any) => ({ ...v, status: s }))}
                    />
                </div>
            </motion.div>

            <main className='max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-6 relative'>

                {/* ── Left column ── */}
                <div className='lg:col-span-2 space-y-5'>

                    {/* Vehicle image */}
                    <AnimatedCard title="Vehicle Photo" icon={<ImageIcon size={14} />} index={0}>
                        {vehicle?.imageUrl ? (
                            <a href={vehicle.imageUrl} target='_blank' rel='noopener noreferrer'>
                                <img
                                    src={vehicle.imageUrl}
                                    alt='Vehicle'
                                    className='w-full h-56 object-cover rounded-xl border border-zinc-100 hover:opacity-90 transition-opacity cursor-zoom-in'
                                />
                            </a>
                        ) : (
                            <div className='w-full h-40 rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2'>
                                <ImageIcon size={24} className='text-zinc-300' />
                                <p className='text-xs text-zinc-400'>No vehicle photo uploaded</p>
                            </div>
                        )}
                    </AnimatedCard>

                    {/* Vehicle details */}
                    <AnimatedCard title="Vehicle Details" icon={<Car size={14} />} index={1}>
                        <Field label="Vehicle Type" value={vehicle?.type} icon={<Bike />} />
                        <Field label="Vehicle Number" value={vehicle?.vehicleNumber} icon={<Hash />} />
                        <Field label="Vehicle Model" value={vehicle?.vehicleModel} icon={<Car />} />
                        <Field label="Status" value={vehicle?.status} icon={<Shield />} />
                        {vehicle?.rejectionReason && (
                            <Field label="Rejection Reason" value={vehicle.rejectionReason} icon={<AlertTriangle />} />
                        )}
                    </AnimatedCard>

                    {/* Pricing */}
                    <AnimatedCard title="Pricing Details" icon={<IndianRupee size={14} />} index={2}>
                        <Field label="Base Fare" value={vehicle?.baseFare != null ? `₹${vehicle.baseFare} flat` : null} icon={<IndianRupee />} />
                        <Field label="Price Per KM" value={vehicle?.pricePerKM != null ? `₹${vehicle.pricePerKM} / km` : null} icon={<IndianRupee />} />
                        <Field label="Waiting Charge" value={vehicle?.waitingCharge != null ? `₹${vehicle.waitingCharge} / min` : null} icon={<Tag />} />

                        {/* Preview summary */}
                        {vehicle?.baseFare != null && (
                            <div className='mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100'>
                                <p className='text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-1'>Fare Summary</p>
                                <p className='text-xs text-zinc-500 leading-relaxed'>
                                    Customer pays <strong className='text-zinc-800'>₹{vehicle.baseFare}</strong> base +{' '}
                                    <strong className='text-zinc-800'>₹{vehicle.pricePerKM}/km</strong> +{' '}
                                    <strong className='text-zinc-800'>₹{vehicle.waitingCharge}/min</strong> waiting
                                </p>
                            </div>
                        )}
                    </AnimatedCard>
                </div>

                {/* ── Right sidebar ── */}
                <div className='space-y-5'>

                    {/* Owner profile */}
                    <AnimatedCard title="Vehicle Owner" icon={<User size={14} />} index={0}>
                        <div className='flex flex-col items-center text-center mb-4 pt-1'>
                            <div className='w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center text-2xl font-black mb-3'>
                                {owner?.name?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <p className='text-base font-black text-zinc-900 mb-1.5'>{owner?.name ?? '—'}</p>
                            <StatusBadge status={owner?.riderStatus} />
                        </div>
                        <div className='border-t border-zinc-100 pt-3'>
                            <Field label="Email" value={owner?.email} icon={<Mail />} />
                            <Field label="Phone" value={owner?.contact} icon={<Phone />} />
                            <Field label="Role" value={owner?.role} icon={<User />} />
                            <Field label="Joined" value={owner?.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined} icon={<Clock />} />
                        </div>
                    </AnimatedCard>

                    {/* Review checklist */}
                    <AnimatedCard title="Review Checklist" icon={<Shield size={14} />} index={1}>
                        <div className='space-y-2.5'>
                            {[
                                { label: 'Vehicle image uploaded', done: !!vehicle?.imageUrl },
                                { label: 'Base fare set', done: vehicle?.baseFare != null },
                                { label: 'Per-KM rate set', done: vehicle?.pricePerKM != null },
                                { label: 'Waiting charge set', done: vehicle?.waitingCharge != null },
                                { label: 'Pricing approved', done: vehicle?.status === 'approved' },
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