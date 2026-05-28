'use client'
import React from 'react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import {
    Bike, Car, Bus, Truck, Zap, Package,
    ChevronRight, User, Mail, Clock, FileText, Shield
} from 'lucide-react'
import ReviewCard from './ReviewCard'

// ── Vehicle icon map ──────────────────────────────────────────
export const vehicleIcon: Record<string, React.ElementType> = {
    bike: Bike,
    auto: Car,
    car: Car,
    traveller: Bus,
    ev: Zap,
    loading: Package,
    truck: Truck,
}

// ── Type configs ──────────────────────────────────────────────
export const TYPE_CONFIG = {
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
    console.log("This is my data---", data);
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