'use client'
import axios from 'axios';
import { Users } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import Kpi from './Kpi';

type Stats = {
    totalApprovedRiders: number;
    totalPendingRiders: number
    totalRejectedRiders: number
    totalRiders: number
}

const AdminDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<Stats | null>(null);

    const handleGetData = async () => {
        try {
            const { data } = await axios.get("/api/admin/dashboard");
            setStats(data.stats);
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        handleGetData();
    }, [])
    return (
        <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200'>
            <div>
                <Image
                    src="/navLogos.png"
                    alt="Navbar logo for easy wheels"
                    width={95}
                    height={80}
                    priority
                />
            </div>
            <main className='max-w-7xl mx-auto px-6 py-12 space-y-16'>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-6'>
                    <Kpi label="Total partners" value={stats?.totalRiders} icon={<Users />} />
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard