'use client'
import axios from 'axios';
import { Car, FileText, Shield, Users, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Kpi from './Kpi';
import TabButton from './TabButton';
import ContentList from './ContentList';

type Stats = {
    totalApprovedRiders: number
    totalPendingRiders: number
    totalRejectedRiders: number
    totalRiders: number
}

type Tab = 'kyc' | 'rider' | 'vehicle'

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const [activeTab, setActiveTab] = useState<Tab>('rider')
    const [riderReviews, setRiderReviews] = useState<any[]>([])
    const [kycReviews, setKycReviews] = useState<any[]>([])
    const [vehicleReviews, setVehicleReviews] = useState<any[]>([])

    const handleGetData = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get('/api/admin/dashboard')
            setStats(data.stats)
            // Rider reviews
            setRiderReviews(Array.isArray(data.pendingRiderReviews) ? data.pendingRiderReviews : [])
            // Vehicle reviews — API returns them as `pendingVehicles`
            setVehicleReviews(Array.isArray(data.pendingVehicles) ? data.pendingVehicles : [])
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleGetKYCData = async () => {
        try {
            const { data } = await axios.get('/api/admin/video-kyc/pending')
            setKycReviews(Array.isArray(data.rider) ? data.rider : [])
        } catch (error) {
            console.error(error)
        }
    }

    const handleRefresh = async () => {
        await Promise.all([handleGetData(), handleGetKYCData()])
    }

    useEffect(() => {
        handleGetData()
        handleGetKYCData()
    }, [])

    return (
        <div className='min-h-screen bg-[#f5f5f3]'>
            <div className='fixed inset-0 pointer-events-none opacity-[0.025]'
                style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

            {/* Top bar */}
            <div className='fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800'>
                <div className='max-w-7xl mx-auto px-6 h-14 flex items-center justify-between'>
                    <Image src="/navLogos.png" alt="Easy Wheels" width={80} height={64} priority />
                    <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 rounded-full bg-emerald-500' />
                        <span className='text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400'>Admin</span>
                    </div>
                </div>
            </div>

            <main className='max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-8 relative'>

                {/* Page header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                    <div className='flex items-center justify-between mb-1.5'>
                        <div className='flex items-center gap-2'>
                            <div className='h-px w-6 bg-zinc-400' />
                            <span className='text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400'>Operations</span>
                        </div>
                        <button onClick={handleRefresh} disabled={loading}
                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-black transition-all disabled:opacity-50'>
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Refreshing…' : 'Refresh'}
                        </button>
                    </div>
                    <h1 className='text-3xl font-black text-zinc-900 tracking-tight'>Admin Dashboard</h1>
                    <p className='text-zinc-400 text-sm mt-1'>Monitor riders, reviews, and onboarding activity.</p>
                </motion.div>

                {/* KPI grid */}
                {loading ? (
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                        {[1, 2, 3, 4].map(i => <div key={i} className='bg-white rounded-2xl p-5 border border-zinc-100 h-24 animate-pulse' />)}
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                        <Kpi index={0} label="Total Riders" value={stats?.totalRiders} icon={<Users />} variant="totalRiders" />
                        <Kpi index={1} label="Approved" value={stats?.totalApprovedRiders} icon={<Users />} variant="approved" />
                        <Kpi index={2} label="Pending" value={stats?.totalPendingRiders} icon={<Users />} variant="pending" />
                        <Kpi index={3} label="Rejected" value={stats?.totalRejectedRiders} icon={<Users />} variant="rejected" />
                    </div>
                )}

                {/* Tabs */}
                <div className='space-y-4'>
                    <div className='bg-white rounded-2xl p-2 shadow-sm border border-zinc-100 flex flex-wrap gap-1.5'>
                        <TabButton active={activeTab === 'rider'} count={riderReviews.length} icon={<Users />} onclick={() => setActiveTab('rider')}>Rider Reviews</TabButton>
                        <TabButton active={activeTab === 'kyc'} count={kycReviews.length} icon={<Shield />} onclick={() => setActiveTab('kyc')}>KYC Reviews</TabButton>
                        <TabButton active={activeTab === 'vehicle'} count={vehicleReviews.length} icon={<Car />} onclick={() => setActiveTab('vehicle')}>Vehicle Reviews</TabButton>
                    </div>

                    <AnimatePresence mode='wait'>
                        <motion.div key={activeTab}
                            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}>
                            {activeTab === 'rider' && <ContentList data={riderReviews} type='rider' onRefresh={handleRefresh} />}
                            {activeTab === 'kyc' && <ContentList data={kycReviews} type='kyc' onRefresh={handleRefresh} />}
                            {activeTab === 'vehicle' && <ContentList data={vehicleReviews} type='vehicle' onRefresh={handleRefresh} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard