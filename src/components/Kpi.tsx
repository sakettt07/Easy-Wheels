import React from 'react';
import { motion } from "motion/react";

const KPI_CONFIG: Record<string, {
    iconBg: string;
    iconColor: string;
    valueCls: string;
    border: string;
}> = {
    totalRiders: {
        iconBg: 'bg-zinc-100',
        iconColor: 'text-zinc-700',
        valueCls: 'text-zinc-900',
        border: 'border-zinc-100',
    },
    approved: {
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        valueCls: 'text-emerald-700',
        border: 'border-emerald-100',
    },
    pending: {
        iconBg: 'bg-amber-50',
        iconColor: 'text-amber-600',
        valueCls: 'text-amber-700',
        border: 'border-amber-100',
    },
    rejected: {
        iconBg: 'bg-red-50',
        iconColor: 'text-red-500',
        valueCls: 'text-red-600',
        border: 'border-red-100',
    },
}

interface KpiProps {
    label: string
    value: number | undefined
    icon: React.ReactNode
    variant: string
    index?: number
}

const Kpi = ({ label, value, icon, variant, index = 0 }: KpiProps) => {
    const cfg = KPI_CONFIG[variant] ?? KPI_CONFIG.totalRiders

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`bg-white rounded-2xl p-5 border ${cfg.border} shadow-[0_2px_12px_rgba(0,0,0,0.05)] flex flex-col gap-4`}
        >
            {/* Top row: icon + label */}
            <div className='flex items-center justify-between'>
                <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400'>{label}</p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${cfg.iconBg} ${cfg.iconColor}`}>
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 15, strokeWidth: 2 })}
                </div>
            </div>

            {/* Value */}
            <p className={`text-3xl font-black leading-none tracking-tight ${cfg.valueCls}`}>
                {value ?? '—'}
            </p>
        </motion.div>
    )
}

export default Kpi