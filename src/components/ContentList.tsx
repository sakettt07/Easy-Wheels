'use client'
import React from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import {
    Bike, Car, Bus, Truck, Zap, Package,
    ChevronRight, User, Mail, Clock, FileText, Shield
} from 'lucide-react'

// ── Vehicle icon map ──────────────────────────────────────────
const vehicleIcon: Record<string, React.ElementType> = {
    bike: Bike,
    auto: Car,
    car: Car,
    traveller: Bus,
    ev: Zap,
    loading: Package,
    truck: Truck,
}

// ── Type configs ──────────────────────────────────────────────
const TYPE_CONFIG = {
    rider: {
        emptyText: 'No pending rider reviews',
        emptyIcon: User,
        actionLabel: 'Review Rider',
        actionRoute: (id: string) => `/admin/reviews/rider/${id}`,
        accentCls: 'bg-zinc-900 text-white',
    },
    kyc: {
        emptyText: 'No pending KYC reviews',
        emptyIcon: Shield,
        actionLabel: 'Review KYC',
        actionRoute: (id: string) => `/admin/reviews/kyc/${id}`,
        accentCls: 'bg-blue-900 text-white',
    },
    vehicle: {
        emptyText: 'No pending vehicle reviews',
        emptyIcon: Car,
        actionLabel: 'Review Vehicle',
        actionRoute: (id: string) => `/admin/reviews/vehicle/${id}`,
        accentCls: 'bg-zinc-900 text-white',
    },
}

// ── Row card ──────────────────────────────────────────────────
const ReviewCard = ({
    item, type, index,
}: {
    item: any
    type: 'rider' | 'kyc' | 'vehicle'
    index: number
}) => {
    const router = useRouter()
    const cfg = TYPE_CONFIG[type]
    const VehicleIcon = vehicleIcon[item.vehicleType?.toLowerCase()] ?? Car

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => router.push(cfg.actionRoute(item._id))}
            className='group flex items-center gap-4 p-4 bg-white rounded-2xl border border-zinc-100
                       hover:border-zinc-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]
                       cursor-pointer transition-all duration-200'
        >
            {/* Avatar initial */}
            <div className='w-10 h-10 shrink-0 rounded-full bg-zinc-100 flex items-center justify-center
                            text-zinc-700 font-black text-sm'>
                {item.name?.charAt(0).toUpperCase() ?? '?'}
            </div>

            {/* Info */}
            <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-sm font-black text-zinc-900 truncate'>{item.name}</span>
                    {/* Vehicle type pill */}
                    {item.vehicleType && (
                        <span className='inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em]
                                         px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200'>
                            <VehicleIcon size={9} strokeWidth={2.5} />
                            {item.vehicleType}
                        </span>
                    )}
                    {/* Status pill */}
                    <span className='text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5
                                     rounded-full bg-amber-50 text-amber-700 border border-amber-200'>
                        Pending
                    </span>
                </div>
                <div className='flex items-center gap-1.5 mt-0.5'>
                    <Mail size={10} className='text-zinc-300 shrink-0' />
                    <span className='text-[11px] text-zinc-400 truncate'>{item.email}</span>
                </div>
            </div>

            {/* Action */}
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                             bg-zinc-100 text-zinc-500 group-hover:bg-zinc-900 group-hover:text-white
                             transition-all duration-200`}>
                <ChevronRight size={14} />
            </div>
        </motion.div>
    )
}

// ── Empty state ───────────────────────────────────────────────
const EmptyState = ({ type }: { type: 'rider' | 'kyc' | 'vehicle' }) => {
    const cfg = TYPE_CONFIG[type]
    const Icon = cfg.emptyIcon
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className='flex flex-col items-center justify-center py-16 text-center'
        >
            <div className='w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4'>
                <Icon size={22} className='text-zinc-300' strokeWidth={1.5} />
            </div>
            <p className='text-sm font-bold text-zinc-400'>{cfg.emptyText}</p>
            <p className='text-xs text-zinc-300 mt-1'>All caught up!</p>
        </motion.div>
    )
}

// ── Main component ────────────────────────────────────────────
interface ContentListProps {
    data: any[]
    type: 'rider' | 'kyc' | 'vehicle'
}

const ContentList = ({ data, type }: ContentListProps) => {
    const list = Array.isArray(data) ? data : []

    if (list.length === 0) return <EmptyState type={type} />

    return (
        <div className='space-y-2.5'>
            {/* Header row */}
            <div className='flex items-center justify-between mb-4'>
                <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400'>
                    {list.length} pending review{list.length !== 1 ? 's' : ''}
                </p>
            </div>

            {list.map((item, i) => (
                <ReviewCard key={item._id ?? i} item={item} type={type} index={i} />
            ))}
        </div>
    )
}

export default ContentList