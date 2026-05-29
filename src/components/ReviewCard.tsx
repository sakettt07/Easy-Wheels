'use client'
import React, { useState } from 'react'
import { Car, ChevronRight, Loader2, Mail, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import axios from 'axios'
import { TYPE_CONFIG, vehicleIcon } from './ContentList'

type KYCStatus = 'pending' | 'in_progress' | 'completed' | undefined

const ReviewCard = ({
    item,
    type,
    index,
}: {
    item: any
    type: keyof typeof TYPE_CONFIG
    index: number
}) => {
    const router = useRouter()
    const cfg = TYPE_CONFIG[type]
    const VehicleIcon = vehicleIcon[item.vehicleType?.toLowerCase()] ?? Car

    const [kycLoading, setKycLoading] = useState(false)
    const [kycError, setKycError] = useState('')

    const videoKYCStatus: KYCStatus = item.videoKYCStatus

    // ── Start video KYC — lives here so it has access to item._id ──
    const handleStartVideoKYC = async (e: React.MouseEvent) => {
        e.stopPropagation() // don't trigger the card's router.push
        try {
            setKycLoading(true)
            setKycError('')
            const { data } = await axios.get(`/api/admin/video-kyc/start/${item._id}`)
            console.log('KYC started:', data)
            // Optionally navigate to the KYC call page
            // router.push(`/admin/reviews/kyc/${item._id}`)
        } catch (error: any) {
            setKycError(error?.response?.data?.message ?? 'Failed to start KYC')
        } finally {
            setKycLoading(false)
        }
    }

    // ── Action button based on KYC status ──────────────────────
    const ActionButton = () => {
        // KYC tab: show Start / Join based on videoKYCStatus
        if (type === 'kyc') {
            if (videoKYCStatus === 'in_progress') {
                return (
                    <button
                        onClick={e => { e.stopPropagation(); router.push(cfg.actionRoute(item._id)) }}
                        className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black transition-all'
                    >
                        <Video size={11} /> Join Call
                    </button>
                )
            }
            // pending = not started yet
            return (
                <button
                    onClick={handleStartVideoKYC}
                    disabled={kycLoading}
                    className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-[10px] font-black transition-all disabled:opacity-50'
                >
                    {kycLoading
                        ? <Loader2 size={11} className='animate-spin' />
                        : <Video size={11} />
                    }
                    {kycLoading ? 'Starting…' : 'Start KYC'}
                </button>
            )
        }

        // Default: Review arrow button for rider / vehicle tabs
        return (
            <div className='shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-200'>
                <ChevronRight size={14} />
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => type !== 'kyc' && router.push(cfg.actionRoute(item._id))}
            className={`group flex items-center gap-4 p-4 bg-white rounded-2xl border border-zinc-100
                        hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]
                        transition-all duration-200 ${type !== 'kyc' ? 'cursor-pointer' : 'cursor-default'}`}
        >
            {/* Avatar initial */}
            <div className='w-10 h-10 shrink-0 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-black text-sm'>
                {item.name?.charAt(0).toUpperCase() ?? '?'}
            </div>

            {/* Info */}
            <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-sm font-black text-zinc-900 truncate'>{item.name}</span>

                    {/* Vehicle type pill */}
                    {item.vehicleType && (
                        <span className='inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200'>
                            <VehicleIcon size={9} strokeWidth={2.5} />
                            {item.vehicleType}
                        </span>
                    )}

                    {/* Status pill */}
                    {type === 'kyc' && videoKYCStatus === 'in_progress' ? (
                        <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200'>
                            In Progress
                        </span>
                    ) : (
                        <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200'>
                            Pending
                        </span>
                    )}
                </div>

                <div className='flex items-center gap-3 mt-0.5'>
                    <div className='flex items-center gap-1'>
                        <Mail size={10} className='text-zinc-300 shrink-0' />
                        <span className='text-[11px] text-zinc-400 truncate'>{item.email}</span>
                    </div>
                    {/* Inline KYC error */}
                    {kycError && (
                        <span className='text-[10px] text-red-500 font-semibold'>· {kycError}</span>
                    )}
                </div>
            </div>

            {/* Action button */}
            <ActionButton />
        </motion.div>
    )
}

export default ReviewCard