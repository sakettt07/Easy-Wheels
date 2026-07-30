'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { 
    LayoutDashboard, Users, Shield, Car, Settings, TrendingUp, DollarSign, Activity, Zap, Menu, X, BarChart, FileText, LogOut
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend 
} from 'recharts';
import Image from 'next/image';
import TabButton from './TabButton';
import ContentList from './ContentList';
import { signOut } from 'next-auth/react';

type Tab = 'kyc' | 'rider' | 'vehicle';

export default function ProfessionalAdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    
    // New States
    const [breakdown, setBreakdown] = useState<any[]>([]);
    const [usersList, setUsersList] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<Tab>('rider');
    const [riderReviews, setRiderReviews] = useState<any[]>([]);
    const [kycReviews, setKycReviews] = useState<any[]>([]);
    const [vehicleReviews, setVehicleReviews] = useState<any[]>([]);

    const [activeMenu, setActiveMenu] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleGetData = async () => {
        try {
            const { data } = await axios.get('/api/admin/dashboard');
            setRiderReviews(Array.isArray(data.pendingRiderReviews) ? data.pendingRiderReviews : []);
            setVehicleReviews(Array.isArray(data.pendingVehicles) ? data.pendingVehicles : []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGetKYCData = async () => {
        try {
            const { data } = await axios.get('/api/admin/video-kyc/pending');
            setKycReviews(Array.isArray(data.rider) ? data.rider : []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGetEarnings = async () => {
        try {
            const { data } = await axios.get('/api/admin/earning');
            setStats(data.stats);
            setChartData(data.chartData);

            const { data: breakdownData } = await axios.get('/api/admin/earning/breakdown');
            setBreakdown(Array.isArray(breakdownData.breakdown) ? breakdownData.breakdown : []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGetUsers = async () => {
        try {
            const { data } = await axios.get('/api/admin/users');
            setUsersList(Array.isArray(data.users) ? data.users : []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleBan = async (userId: string, isBanned: boolean) => {
        try {
            await axios.put('/api/admin/users', { userId, isBanned: !isBanned });
            handleGetUsers(); // Refresh list
        } catch (error) {
            console.error(error);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await Promise.all([handleGetData(), handleGetKYCData(), handleGetEarnings(), handleGetUsers()]);
        setLoading(false);
    };

    useEffect(() => {
        handleRefresh();
    }, []);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'reviews', label: 'Reviews & Approvals', icon: Shield },
        { id: 'earning-metrics', label: 'Earning Metrics', icon: BarChart },
        { id: 'user-metrics', label: 'User Metrics', icon: Users },
        { id: 'settings', label: 'System Settings', icon: Settings },
    ];

    const COLORS = ['#ffffff', '#71717a'];
    const paymentData = stats?.paymentBreakdown ? [
        { name: 'Online', value: stats.paymentBreakdown.online },
        { name: 'Cash', value: stats.paymentBreakdown.cash }
    ] : [];

    if (loading && !stats) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const SidebarContent = () => (
        <>
            <div className="p-6">
                <div className="flex items-center justify-between mb-8 text-white">
                    <Image src="/navLogos.png" alt="Logo" width={80} height={40} className="invert brightness-0" />
                    <button className="md:hidden text-zinc-400 hover:text-white" onClick={toggleMobileMenu}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 px-3">Admin Panel</div>
                    {navItems.map((item) => (
                        <button 
                            key={item.id} 
                            onClick={() => {
                                setActiveMenu(item.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeMenu === item.id ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}>
                            <item.icon size={18} />
                            {item.label}
                            {item.id === 'reviews' && (riderReviews.length + kycReviews.length + vehicleReviews.length > 0) && (
                                <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${activeMenu === item.id ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                    {riderReviews.length + kycReviews.length + vehicleReviews.length}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-6">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold capitalize">
                        A
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">Administrator</p>
                        <p className="text-[10px] text-zinc-400 truncate">Full Access</p>
                    </div>
                    <button 
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-auto"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans flex relative">
            
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-white/5 flex-col bg-[#0f0f11] shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="fixed inset-0 bg-black/60 z-40 md:hidden" 
                            onClick={toggleMobileMenu} 
                        />
                        <motion.aside 
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-y-0 left-0 w-64 border-r border-white/5 flex-col bg-[#0f0f11] z-50 md:hidden flex"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-10 overflow-y-auto relative w-full">
                {/* Glow effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
                    
                    {/* Mobile Header Bar */}
                    <div className="md:hidden flex items-center gap-3 mb-6">
                        <button onClick={toggleMobileMenu} className="p-2 -ml-2 bg-white/5 rounded-xl text-white">
                            <Menu size={20} />
                        </button>
                        <span className="font-black text-lg text-white">Admin Panel</span>
                    </div>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight capitalize">{activeMenu.replace('-', ' ')}</h1>
                            <p className="text-sm text-zinc-400 mt-1">Platform monitor & operations control.</p>
                        </div>
                        <button 
                            onClick={handleRefresh}
                            disabled={loading}
                            className="bg-[#121214] border border-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                            <Activity size={16} className={loading ? 'animate-spin text-white' : 'text-white'} /> 
                            {loading ? 'Syncing...' : 'Refresh'}
                        </button>
                    </div>

                    {activeMenu === 'overview' && (
                        <>
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/10 to-[#121214] p-6 rounded-3xl border border-white/20 relative overflow-hidden">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                                        <DollarSign size={20} className="text-white" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Total Revenue</p>
                                    <h3 className="text-3xl font-black text-white">₹{stats?.totalRevenue?.toLocaleString() || 0}</h3>
                                    <p className="text-xs text-zinc-300 mt-2 font-medium">Platform commission</p>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                                        <Users size={20} className="text-zinc-300" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Active Riders</p>
                                    <h3 className="text-3xl font-black text-white">{stats?.activeRiders || 0}</h3>
                                    <p className="text-xs text-zinc-500 mt-2 font-medium">Approved & ready</p>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                                        <Users size={20} className="text-zinc-300" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Total Users</p>
                                    <h3 className="text-3xl font-black text-white">{stats?.activeUsers || 0}</h3>
                                    <p className="text-xs text-zinc-500 mt-2 font-medium">Registered customers</p>
                                </motion.div>
                                
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                                        <TrendingUp size={20} className="text-zinc-300" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Gross Volume</p>
                                    <h3 className="text-3xl font-black text-white">₹{stats?.grossVolume?.toLocaleString() || 0}</h3>
                                    <p className="text-xs text-zinc-500 mt-2 font-medium">Total fare processed</p>
                                </motion.div>
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-[#121214] p-6 rounded-3xl border border-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Sales Volume</h3>
                                            <p className="text-xs text-zinc-400 mt-1">Platform revenue trend</p>
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                />
                                                <Area type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-white">Payment Breakdown</h3>
                                        <p className="text-xs text-zinc-400 mt-1">Cash vs Online</p>
                                    </div>
                                    <div className="flex-1 min-h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={paymentData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    stroke="none"
                                                >
                                                    {paymentData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeMenu === 'reviews' && (
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveTab('rider')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'rider' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                                    Rider Reviews <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">{riderReviews.length}</span>
                                </button>
                                <button onClick={() => setActiveTab('kyc')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'kyc' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                                    KYC Reviews <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">{kycReviews.length}</span>
                                </button>
                                <button onClick={() => setActiveTab('vehicle')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'vehicle' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                                    Vehicle Reviews <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 text-xs">{vehicleReviews.length}</span>
                                </button>
                            </div>
                            
                            <div className="bg-[#121214] rounded-3xl p-6 border border-white/5">
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
                        </div>
                    )}

                    {activeMenu === 'earning-metrics' && (
                        <div className="bg-[#121214] rounded-3xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-6">Ride Earnings Breakdown</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-zinc-400">
                                    <thead className="text-xs uppercase bg-white/5 text-white">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-xl">Date</th>
                                            <th className="px-4 py-3">Rider</th>
                                            <th className="px-4 py-3">User</th>
                                            <th className="px-4 py-3">Total Fare</th>
                                            <th className="px-4 py-3">Rider Earning</th>
                                            <th className="px-4 py-3">Platform Comm.</th>
                                            <th className="px-4 py-3 rounded-tr-xl">Payment</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {breakdown.map((ride, idx) => (
                                            <tr key={ride._id} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                                                <td className="px-4 py-4">{new Date(ride.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 font-bold text-white">{ride.riderName}</td>
                                                <td className="px-4 py-4">{ride.userName}</td>
                                                <td className="px-4 py-4 text-white">₹{ride.fare}</td>
                                                <td className="px-4 py-4 text-emerald-400">₹{ride.riderEarning}</td>
                                                <td className="px-4 py-4 text-white font-bold">₹{ride.adminCommission}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${ride.paymentStatus === 'paid' || ride.paymentStatus === 'cash' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                        {ride.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {breakdown.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-8 text-zinc-500">No completed rides found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeMenu === 'user-metrics' && (
                        <div className="bg-[#121214] rounded-3xl p-6 border border-white/5">
                            <h3 className="text-lg font-bold text-white mb-6">User Management</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-zinc-400">
                                    <thead className="text-xs uppercase bg-white/5 text-white">
                                        <tr>
                                            <th className="px-4 py-3 rounded-tl-xl">Joined</th>
                                            <th className="px-4 py-3">Name</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right rounded-tr-xl">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map((u, idx) => (
                                            <tr key={u._id} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}>
                                                <td className="px-4 py-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 font-bold text-white capitalize">{u.name}</td>
                                                <td className="px-4 py-4">{u.email}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${u.role === 'rider' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-800 text-zinc-300'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {u.isBanned ? (
                                                        <span className="text-red-500 font-bold text-xs uppercase bg-red-500/10 px-2 py-1 rounded">Banned</span>
                                                    ) : (
                                                        <span className="text-emerald-500 font-bold text-xs uppercase bg-emerald-500/10 px-2 py-1 rounded">Active</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {u.role !== 'admin' && (
                                                        <button 
                                                            onClick={() => handleToggleBan(u._id, u.isBanned)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                                u.isBanned 
                                                                ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                                                                : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                                            }`}
                                                        >
                                                            {u.isBanned ? 'Unban' : 'Suspend'}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
