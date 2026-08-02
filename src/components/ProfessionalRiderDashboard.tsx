'use client'
import { logger } from "@/lib/logger";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'motion/react';
import { getSocket } from '@/lib/socket';
import {
    LayoutDashboard, Wallet, FileText, Settings,
    LogOut, TrendingUp, DollarSign, Car, ChevronRight, Activity, Zap, Menu, X, Clock, Navigation, BookOpen,
    FerrisWheel,
    LifeBuoy
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function ProfessionalRiderDashboard() {
    const { userData } = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [activeMenu, setActiveMenu] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    const fetchPendingCount = async () => {
        try {
            const { data } = await axios.get("/api/rider/booking/pending-request");
            setPendingCount(data.count || 0);
        } catch (error: any) {
            logger.error("error in fetching pending count", error);
            setPendingCount(0);
        }
    };

    useEffect(() => {
        if (userData?.role === "rider") {
            fetchPendingCount();
        }

        const socket = getSocket();
        socket.on("new-booking", (data: any) => {
            if (userData?.role === "rider") {
                fetchPendingCount();
            }
        });
        return () => {
            socket.off("new-booking");
        };
    }, [userData?.role]);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const { data } = await axios.get('/api/rider/earning');
                setStats(data.stats);
                setChartData(data.chartData);
                setProfile(data.profile);
            } catch (error: any) {
                logger.error("Failed to fetch earnings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'documents', label: 'Documents & Vehicle', icon: FileText },
        { id: 'pending-requests', label: 'Pending Requests', icon: Clock },
        { id: 'active-rides', label: 'Active Rides', icon: Navigation },
        { id: 'bookings', label: 'Bookings', icon: BookOpen },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const quickLinks = [
        { title: 'Update Vehicle', desc: 'Modify your vehicle details', icon: Car, path: '/rider/onboarding/vehicle' },
        { title: 'Update Bank', desc: 'Change payout method', icon: Wallet, path: '/rider/onboarding/bank' },
        { title: 'Update Docs', desc: 'Update KYC documents', icon: FileText, path: '/rider/onboarding/documents' },
    ];

    if (loading) {
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
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                            <LifeBuoy size={18} className="text-black" />
                        </div>
                        <span className="font-black text-xl tracking-tight">Easy Wheels</span>
                    </div>
                    {/* Close button for mobile */}
                    <button className="md:hidden text-zinc-400 hover:text-white" onClick={toggleMobileMenu}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3 px-3">Main Menu</div>
                    {navItems.map((item, i) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (['pending-requests', 'active-rides', 'bookings'].includes(item.id)) {
                                    router.push(`/rider/${item.id}`);
                                } else {
                                    setActiveMenu(item.id);
                                    setIsMobileMenuOpen(false);
                                }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeMenu === item.id ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                }`}>
                            <item.icon size={18} />
                            {item.label}
                            {item.id === 'pending-requests' && pendingCount > 0 && (
                                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm ${activeMenu === item.id ? 'bg-black text-white' : 'bg-white text-black'}`}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-6">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold capitalize">
                        {userData?.name?.charAt(0) || 'R'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate capitalize">{userData?.name}</p>
                        <p className="text-[10px] text-zinc-400 truncate">Approved Rider</p>
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
            <main className="flex-1 p-4 md:p-10 overflow-y-auto overflow-x-hidden relative w-full">
                {/* Glow effects */}
                <div className="absolute top-0 right-0 w-full max-w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full max-w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 max-w-6xl mx-auto space-y-6 md:space-y-8">
                    {/* Mobile Header Bar */}
                    <div className="md:hidden flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <button onClick={toggleMobileMenu} className="p-2 -ml-2 bg-white/5 rounded-xl text-white">
                                <Menu size={20} />
                            </button>
                            <span className="font-black text-lg text-white">Easy Wheels</span>
                        </div>
                        {pendingCount > 0 && (
                            <button onClick={() => router.push('/rider/pending-requests')} className="relative p-2 bg-white/5 rounded-xl text-white">
                                <Clock size={20} />
                                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                                    {pendingCount}
                                </span>
                            </button>
                        )}
                    </div>

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight capitalize">{activeMenu.replace('-', ' ')}</h1>
                            <p className="text-sm text-zinc-400 mt-1">
                                {activeMenu === 'overview' ? 'Track your earnings and manage your profile.' :
                                    activeMenu === 'documents' ? 'View your uploaded vehicle, KYC, and bank details.' : 'Manage your account settings.'}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/rider/active-rides')}
                            className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition-all flex items-center gap-2"
                        >
                            <Activity size={16} /> Go Live
                        </button>
                    </div>

                    {activeMenu === 'overview' && (
                        <>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white/10 to-[#121214] p-6 rounded-3xl border border-white/20 relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                                        <DollarSign size={20} className="text-white" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Total Earnings</p>
                                    <h3 className="text-4xl font-black text-white">₹{stats?.totalEarnings?.toLocaleString() || 0}</h3>
                                    <p className="text-xs text-zinc-300 mt-2 flex items-center gap-1 font-medium"><TrendingUp size={12} /> Lifetime</p>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                                        <Car size={20} className="text-zinc-300" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Total Rides</p>
                                    <h3 className="text-4xl font-black text-white">{stats?.totalRides || 0}</h3>
                                    <p className="text-xs text-zinc-500 mt-2 font-medium">Completed rides</p>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                                        <LayoutDashboard size={20} className="text-zinc-300" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-400 mb-1">Commission Paid</p>
                                    <h3 className="text-4xl font-black text-white">₹{stats?.totalCommission?.toLocaleString() || 0}</h3>
                                    <p className="text-xs text-zinc-500 mt-2 font-medium">Platform fees</p>
                                </motion.div>
                            </div>

                            {/* Chart & Quick Links */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                <div className="lg:col-span-2 bg-[#121214] p-6 rounded-3xl border border-white/5">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Earnings Growth</h3>
                                            <p className="text-xs text-zinc-400 mt-1">Daily breakdown of your income</p>
                                        </div>
                                    </div>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                                <XAxis dataKey="date" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                />
                                                <Area type="monotone" dataKey="earnings" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-white mb-2">Profile Details</h3>
                                    {quickLinks.map((link, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => router.push(link.path)}
                                            className="bg-[#121214] p-4 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/30 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors text-zinc-400">
                                                    <link.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white transition-colors">{link.title}</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">{link.desc}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-colors" />
                                        </motion.div>
                                    ))}
                                </div>

                            </div>
                        </>
                    )}

                    {activeMenu === 'documents' && (
                        <div className="space-y-6">
                            {/* Vehicle */}
                            <div className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Car className="text-white" /> Vehicle Information</h3>
                                {profile?.vehicle ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><p className="text-xs text-zinc-500 mb-1">Type</p><p className="text-sm font-bold text-white capitalize">{profile.vehicle.type}</p></div>
                                        <div><p className="text-xs text-zinc-500 mb-1">Model</p><p className="text-sm font-bold text-white">{profile.vehicle.vehicleModel}</p></div>
                                        <div><p className="text-xs text-zinc-500 mb-1">Number</p><p className="text-sm font-bold text-white">{profile.vehicle.vehicleNumber}</p></div>
                                        <div><p className="text-xs text-zinc-500 mb-1">Status</p>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md ${profile.vehicle.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                                {profile.vehicle.status}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500">No vehicle data found.</p>
                                )}
                            </div>

                            {/* Bank */}
                            <div className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Wallet className="text-white" /> Bank & Payout Info</h3>
                                {profile?.bank ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div><p className="text-xs text-zinc-500 mb-1">Account Holder</p><p className="text-sm font-bold text-white capitalize">{profile.bank.accountHolderName}</p></div>
                                        <div><p className="text-xs text-zinc-500 mb-1">Account Number</p><p className="text-sm font-bold text-white font-mono">•••• {profile.bank.accountNumber?.slice(-4)}</p></div>
                                        <div><p className="text-xs text-zinc-500 mb-1">IFSC</p><p className="text-sm font-bold text-white font-mono">{profile.bank.ifsc}</p></div>
                                        <div><p className="text-xs text-zinc-500 mb-1">UPI ID</p><p className="text-sm font-bold text-white">{profile.bank.upi}</p></div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500">No bank data found.</p>
                                )}
                            </div>

                            {/* Documents */}
                            <div className="bg-[#121214] p-6 rounded-3xl border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><FileText className="text-white" /> KYC Documents</h3>
                                {profile?.docs ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">Aadhar Card</span>
                                            {profile.docs.aadharUrl ? <a href={profile.docs.aadharUrl} target="_blank" rel="noreferrer" className="text-xs text-white underline">View File</a> : <span className="text-xs text-zinc-500">Missing</span>}
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">Driving License</span>
                                            {profile.docs.licenseUrl ? <a href={profile.docs.licenseUrl} target="_blank" rel="noreferrer" className="text-xs text-white underline">View File</a> : <span className="text-xs text-zinc-500">Missing</span>}
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                            <span className="text-sm font-bold text-white">RC Document</span>
                                            {profile.docs.rcUrl ? <a href={profile.docs.rcUrl} target="_blank" rel="noreferrer" className="text-xs text-white underline">View File</a> : <span className="text-xs text-zinc-500">Missing</span>}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-zinc-500">No documents found.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeMenu === 'settings' && (
                        <div className="bg-[#121214] p-6 rounded-3xl border border-white/5 text-center py-20">
                            <Settings size={48} className="text-zinc-700 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-white">Settings Coming Soon</h2>
                            <p className="text-zinc-500 mt-2">Manage your app preferences and notifications here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
