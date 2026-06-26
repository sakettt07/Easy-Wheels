'use client'
import React, { useState } from 'react'
import { Car, ChevronRight, IndianRupee, Loader2, Mail, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import axios from 'axios'
import { TYPE_CONFIG, vehicleIcon } from './ContentList'

type KYCStatus = 'pending' | 'in_progress' | 'completed' | undefined

const ReviewCard = ({
    item,
    type,
    index,
    onRefresh,
}: {
    item: any
    type: keyof typeof TYPE_CONFIG
    index: number
    onRefresh?: () => void
}) => {
    const router = useRouter()
    const cfg = TYPE_CONFIG[type]

    const [kycLoading, setKycLoading] = useState(false)
    const [kycError, setKycError] = useState('')

    const videoKYCStatus: KYCStatus = item.videoKYCStatus

    // ── Normalise shape ───────────────────────────────────────
    // Rider/KYC cards: name & email are flat on item
    // Vehicle cards:   name & email are nested under item.owner
    const isVehicle = type === 'vehicle'
    const displayName = isVehicle ? (item.owner?.name ?? '?') : (item.name ?? '?')
    const displayEmail = isVehicle ? (item.owner?.email ?? '') : (item.email ?? '')
    const vehicleType = isVehicle ? item.type : item.vehicleType   // vehicle tab uses `type`, rider tab uses `vehicleType`

    const VehicleIcon = vehicleIcon[vehicleType?.toLowerCase()] ?? Car

    // ── Start Video KYC ───────────────────────────────────────
    const handleStartVideoKYC = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            setKycLoading(true)
            setKycError('')
            await axios.get(`/api/admin/video-kyc/start/${item._id}`)
            setTimeout(() => onRefresh?.(), 300)
        } catch (error: any) {
            setKycError(error?.response?.data?.message ?? 'Failed to start KYC')
        } finally {
            setKycLoading(false)
        }
    }

    // ── Action button ─────────────────────────────────────────
    const ActionButton = () => {
        if (type === 'kyc') {
            if (videoKYCStatus === 'in_progress') {
                return (
                    <button onClick={e => { e.stopPropagation(); router.push(cfg.actionRoute(item._id)) }}
                        className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black transition-all'>
                        <Video size={11} /> Join Call
                    </button>
                )
            }
            return (
                <button onClick={handleStartVideoKYC} disabled={kycLoading}
                    className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-[10px] font-black transition-all disabled:opacity-50'>
                    {kycLoading ? <Loader2 size={11} className='animate-spin' /> : <Video size={11} />}
                    {kycLoading ? 'Starting…' : 'Start KYC'}
                </button>
            )
        }
        // Rider + vehicle: navigate to review page
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
            {/* Avatar / vehicle thumbnail */}
            {isVehicle && item.imageUrl ? (
                <img
                    src={item.imageUrl}
                    alt={item.vehicleModel}
                    className='w-10 h-10 shrink-0 rounded-full object-cover border border-zinc-200'
                />
            ) : (
                <div className='w-10 h-10 shrink-0 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-700 font-black text-sm'>
                    {displayName.charAt(0).toUpperCase()}
                </div>
            )}

            {/* Info */}
            <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-sm font-black text-zinc-900 truncate'>{displayName}</span>

                    {/* Vehicle type pill */}
                    {vehicleType && (
                        <span className='inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200'>
                            <VehicleIcon size={9} strokeWidth={2.5} />
                            {vehicleType}
                        </span>
                    )}

                    {/* Status pill */}
                    {type === 'kyc' && videoKYCStatus === 'in_progress' ? (
                        <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200'>In Progress</span>
                    ) : (
                        <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200'>Pending</span>
                    )}
                </div>

                {/* Second line: email + vehicle details for vehicle tab */}
                <div className='flex items-center gap-3 mt-0.5 flex-wrap'>
                    <div className='flex items-center gap-1'>
                        <Mail size={10} className='text-zinc-300 shrink-0' />
                        <span className='text-[11px] text-zinc-400 truncate'>{displayEmail}</span>
                    </div>

                    {/* Vehicle-specific detail pills */}
                    {isVehicle && (
                        <>
                            {item.vehicleNumber && (
                                <span className='text-[10px] text-zinc-400 font-mono'>· {item.vehicleNumber}</span>
                            )}
                            {item.vehicleModel && (
                                <span className='text-[10px] text-zinc-400'>· {item.vehicleModel}</span>
                            )}
                            {item.baseFare != null && (
                                <span className='inline-flex items-center gap-0.5 text-[10px] text-zinc-400'>
                                    · <IndianRupee size={9} />{item.baseFare} base
                                </span>
                            )}
                        </>
                    )}

                    {kycError && <span className='text-[10px] text-red-500 font-semibold'>· {kycError}</span>}
                </div>
            </div>

            <ActionButton />
        </motion.div>
    )
}

export default ReviewCard