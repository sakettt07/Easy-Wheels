'use client'
import AnimatedCard from '@/components/AnimatedCard'
import DocPreview from '@/components/DocPreview'
import axios from 'axios'
import {
    ArrowLeft, Bike, Building2, Car, CheckCircle2,
    CreditCard, Hash, Mail, Phone, Shield, User,
    XCircle, Clock, Banknote, FileText
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

// ── Field row inside a card ───────────────────────────────────
const Field = ({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) => (
    <div className='flex items-start gap-3 py-2.5 border-b border-zinc-50 last:border-0'>
        {icon && (
            <div className='w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center shrink-0 mt-0.5 text-zinc-400'>
                {React.cloneElement(icon as React.ReactElement, { size: 12, strokeWidth: 2 })}
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
        pending: { cls: 'bg-amber-50  text-amber-700  border-amber-200', label: 'Pending Review' },
        rejected: { cls: 'bg-red-50    text-red-600    border-red-200', label: 'Rejected' },
        added: { cls: 'bg-blue-50   text-blue-700   border-blue-200', label: 'Added' },
    }
    const cfg = map[status ?? 'pending'] ?? map.pending
    return (
        <span className={`text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1 rounded-full border ${cfg.cls}`}>
            {cfg.label}
        </span>
    )
}

// ── Approve / Reject action buttons ──────────────────────────
const ActionBar = ({ riderId, currentStatus, onStatusChange }: {
    riderId: string
    currentStatus?: string
    onStatusChange: (s: string) => void
}) => {
    const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
    const [error, setError] = useState('')

    const act = async (action: 'approve' | 'reject') => {
        try {
            setLoading(action)
            setError('')
            await axios.patch(`/api/admin/reviews/rider/${riderId}`, { action })
            onStatusChange(action === 'approve' ? 'approved' : 'rejected')
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Something went wrong')
        } finally {
            setLoading(null)
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
        <div className='flex items-center gap-2'>
            {error && <p className='text-[10px] text-red-500 font-semibold mr-1'>{error}</p>}
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => act('reject')}
                disabled={!!loading}
                className='flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold transition-all disabled:opacity-50'
            >
                {loading === 'reject'
                    ? <span className='w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin' />
                    : <XCircle size={13} />}
                Reject
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => act('approve')}
                disabled={!!loading}
                className='flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white hover:bg-black text-xs font-bold transition-all disabled:opacity-50'
            >
                {loading === 'approve'
                    ? <span className='w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    : <CheckCircle2 size={13} />}
                Approve
            </motion.button>
        </div>
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

    const fetchRider = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(`/api/admin/reviews/rider/${id}`)
            setRider(data.rider)
            setVehicle(data.vehicle)
            setDocs(data.documents)
            setBank(data.bank)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchRider() }, [])

    // ── Loading skeleton ──────────────────────────────────────
    if (loading) {
        return (
            <div className='min-h-screen bg-[#f5f5f3] p-6 pt-20'>
                <div className='max-w-7xl mx-auto space-y-6'>
                    <div className='h-16 bg-white rounded-2xl animate-pulse' />
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

            {/* ── Sticky top bar ── */}
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

                {/* ── Left: main details ── */}
                <div className='lg:col-span-2 space-y-5'>

                    {/* Vehicle details */}
                    <AnimatedCard title="Vehicle Details" icon={<Car size={14} />} index={0}>
                        <div className='space-y-0'>
                            <Field label="Vehicle Type" value={vehicle?.type} icon={<Bike />} />
                            <Field label="Vehicle Number" value={vehicle?.vehicleNumber} icon={<Hash />} />
                            <Field label="Vehicle Model" value={vehicle?.vehicleModel} icon={<Car />} />
                            <Field label="Status" value={
                                <span><StatusBadge status={vehicle?.status} /></span> as any
                            } />
                        </div>
                    </AnimatedCard>

                    {/* Documents */}
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

                    {/* Bank details */}
                    <AnimatedCard title="Bank & Payout" icon={<Banknote size={14} />} index={2}>
                        <div className='space-y-0'>
                            <Field label="Account Holder" value={bank?.accountHolderName} icon={<User />} />
                            <Field label="Account Number" value={bank?.accountNumber} icon={<CreditCard />} />
                            <Field label="IFSC Code" value={bank?.ifsc} icon={<Building2 />} />
                            <Field label="UPI ID" value={bank?.upi} icon={<Hash />} />
                            <Field label="Status" value={bank?.status} icon={<Shield />} />
                        </div>
                    </AnimatedCard>

                </div>

                {/* ── Right: rider profile sidebar ── */}
                <div className='space-y-5'>

                    {/* Profile card */}
                    <AnimatedCard title="Rider Profile" icon={<User size={14} />} index={0}>
                        {/* Avatar */}
                        <div className='flex flex-col items-center text-center mb-4 pt-1'>
                            <div className='w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-2xl font-black mb-3'>
                                {rider?.name?.charAt(0).toUpperCase() ?? '?'}
                            </div>
                            <p className='text-base font-black text-zinc-900'>{rider?.name}</p>
                            <StatusBadge status={rider?.riderStatus} />
                        </div>
                        <div className='space-y-0 border-t border-zinc-100 pt-3'>
                            <Field label="Email" value={rider?.email} icon={<Mail />} />
                            <Field label="Phone" value={rider?.contact} icon={<Phone />} />
                            <Field label="Role" value={rider?.role} icon={<User />} />
                            <Field label="Email Verified" value={rider?.isEmailVerified ? 'Yes' : 'No'} icon={<CheckCircle2 />} />
                            <Field label="Onboarding Step" value={`Step ${rider?.riderOnboardingSteps ?? 0} of 3`} icon={<Clock />} />
                            <Field label="Joined" value={rider?.createdAt ? new Date(rider.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : undefined} icon={<Clock />} />
                        </div>
                    </AnimatedCard>

                    {/* Quick status summary */}
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