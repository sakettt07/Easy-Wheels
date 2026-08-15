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
    LifeBuoy, Star, User, Calendar, MessageSquare, MapPin, IndianRupee, CheckCircle2, XCircle
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

    // Reviews State
    const [reviewsData, setReviewsData] = useState<{ reviews: any[], averageRating: number, totalReviews: number }>({
        reviews: [], averageRating: 0, totalReviews: 0
    });
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Pending Requests State
    const [bookingRequests, setBookingRequests] = useState<any[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null);

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

    useEffect(() => {
        if (activeMenu === 'reviews') {
            const fetchReviews = async () => {
                try {
                    setLoadingReviews(true);
                    const { data } = await axios.get("/api/rider/reviews");
                    setReviewsData({
                        reviews: data.reviews || [],
                        averageRating: data.averageRating || 0,
                        totalReviews: data.totalReviews || 0
                    });
                } catch (error: any) {
                    logger.error("Error fetching rider reviews", error);
                } finally {
                    setLoadingReviews(false);
                }
            };
            fetchReviews();
        }
    }, [activeMenu]);

    const fetchPendingRequest = async () => {
        try {
            setLoadingRequests(true);
            const { data } = await axios.get("/api/rider/booking/pending");
            if (data.bookings) {
                setBookingRequests(data.bookings);
            }
        } catch (error: any) {
            logger.error("Error in fetching booking requests", error);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        if (activeMenu === 'pending-requests') {
            fetchPendingRequest();
        }
    }, [activeMenu]);

    useEffect(() => {
        const socket = getSocket();
        socket.on("new-booking", (data: any) => {
            fetchPendingCount();
            if (activeMenu === 'pending-requests') {
                fetchPendingRequest();
            }
        });
        return () => {
            socket.off("new-booking");
        }
    }, [activeMenu]);

    const handleAccept = async (id: string) => {
        try {
            setActionId(id);
            setActionType('accept');
            await axios.get(`/api/rider/booking/${id}/accept`);
            fetchPendingCount();
            fetchPendingRequest();
            setActiveMenu('active-rides');
        } catch (error: any) {
            logger.error("Error accepting booking", error);
        } finally {
            setActionId(null);
            setActionType(null);
        }
    };

    const handleReject = async (id: string) => {
        try {
            setActionId(id);
            setActionType('reject');
            await axios.post(`/api/rider/booking/${id}/reject`);
            fetchPendingCount();
            fetchPendingRequest();
        } catch (error: any) {
            logger.error("Error rejecting booking", error);
        } finally {
            setActionId(null);
            setActionType(null);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-white/10 text-white/10'}`}
                    />
                ))}
            </div>
        );
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'documents', label: 'Documents & Vehicle', icon: FileText },
        { id: 'pending-requests', label: 'Pending Requests', icon: Clock },
        { id: 'active-rides', label: 'Active Rides', icon: Navigation },
        { id: 'bookings', label: 'Bookings', icon: BookOpen },
        { id: 'reviews', label: 'Reviews', icon: Star },
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
                                if (['active-rides', 'bookings'].includes(item.id)) {
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
                                    activeMenu === 'documents' ? 'View your uploaded vehicle, KYC, and bank details.' :
                                        activeMenu === 'reviews' ? 'See what passengers are saying about your rides.' :
                                            activeMenu === 'pending-requests' ? 'Review and accept new ride requests in your area.' :
                                                'Manage your account settings.'}
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

                    {activeMenu === 'pending-requests' && (
                        <div className="space-y-6">
                            {loadingRequests ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-zinc-500 font-medium">Loading requests...</p>
                                </div>
                            ) : bookingRequests.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-24 bg-[#121214] rounded-3xl border border-dashed border-white/10"
                                >
                                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <Clock className="w-10 h-10 text-zinc-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">No Pending Requests</h3>
                                    <p className="text-zinc-500 max-w-sm text-center">
                                        You have no new ride requests at the moment. Keep your app open to receive new bookings.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AnimatePresence>
                                        {bookingRequests.map((booking, index) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                key={booking._id}
                                                className="bg-[#121214] rounded-3xl border border-white/5 flex flex-col overflow-hidden hover:border-white/20 transition-colors"
                                            >
                                                <div className="flex flex-col p-6 gap-6">
                                                    {/* Locations */}
                                                    <div className="space-y-5">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
                                                                <MapPin size={14} className="text-zinc-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-0.5">Pickup</p>
                                                                <p className="text-sm font-semibold text-white line-clamp-2 leading-relaxed">{booking.pickupAddress}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 mt-0.5">
                                                                <Navigation size={14} className="text-zinc-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-0.5">Drop-off</p>
                                                                <p className="text-sm font-semibold text-white line-clamp-2 leading-relaxed">{booking.dropAddress}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Fare and Time */}
                                                    <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-0.5">Est. Fare</p>
                                                            <div className="flex items-center text-2xl font-black text-white tracking-tight">
                                                                <IndianRupee size={18} className="mr-0.5 text-zinc-300" />
                                                                {booking.fare}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-0.5">Requested</p>
                                                            <div className="flex items-center justify-end text-xs font-semibold text-zinc-400 gap-1">
                                                                <Clock size={12} className="text-zinc-500" />
                                                                {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex border-t border-white/5 divide-x divide-white/5">
                                                    <button
                                                        onClick={() => handleReject(booking._id)}
                                                        disabled={actionId === booking._id}
                                                        className="flex-1 py-4 flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white text-xs font-black transition-colors disabled:opacity-50"
                                                    >
                                                        {actionId === booking._id && actionType === 'reject' ? (
                                                            <div className="w-4 h-4 rounded-full border-2 border-zinc-500 border-t-white animate-spin" />
                                                        ) : (
                                                            <>
                                                                <XCircle size={16} />
                                                                Reject
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleAccept(booking._id)}
                                                        disabled={actionId === booking._id}
                                                        className="flex-1 py-4 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-black transition-colors disabled:opacity-50"
                                                    >
                                                        {actionId === booking._id && actionType === 'accept' ? (
                                                            <div className="w-4 h-4 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <CheckCircle2 size={16} />
                                                                Accept Ride
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    )}

                    {activeMenu === 'reviews' && (
                        <div className="space-y-6">
                            {loadingReviews ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-zinc-500 font-medium">Loading reviews...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Stats Banner */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-[#121214] p-8 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 mb-6"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-md">
                                                <span className="text-4xl font-black text-amber-500">{reviewsData.averageRating.toFixed(1)}</span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">Overall Rating</h2>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {renderStars(Math.round(reviewsData.averageRating))}
                                                    <span className="text-zinc-400 font-medium">({reviewsData.totalReviews} reviews)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Reviews Grid */}
                                    {reviewsData.reviews.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <AnimatePresence>
                                                {reviewsData.reviews.map((review: any, index: number) => (
                                                    <motion.div
                                                        key={review._id}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="bg-[#121214] p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-colors"
                                                    >
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-zinc-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-white capitalize">{review.user?.name || "Passenger"}</p>
                                                                    <div className="flex items-center gap-1 mt-0.5 text-xs text-zinc-500 font-medium">
                                                                        <Calendar className="w-3 h-3" />
                                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                        </div>

                                                        {review.comment ? (
                                                            <p className="text-zinc-300 leading-relaxed text-sm">
                                                                "{review.comment}"
                                                            </p>
                                                        ) : (
                                                            <p className="text-zinc-600 italic text-sm">No comment provided.</p>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex flex-col items-center justify-center py-24 bg-[#121214] rounded-3xl border border-dashed border-white/10"
                                        >
                                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                                <MessageSquare className="w-10 h-10 text-zinc-600" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2">No reviews yet</h3>
                                            <p className="text-zinc-500 max-w-sm text-center">
                                                Complete more rides to start receiving feedback from your passengers.
                                            </p>
                                        </motion.div>
                                    )}
                                </>
                            )}
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
