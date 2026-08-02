'use client'
import { logger } from "@/lib/logger";
import React, { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from "motion/react";
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AuthModal from './AuthModal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { Bike, Car, ChevronRight, Home, BookOpen, Info, Phone, LogOut, Menu, Truck, User, Clock, Navigation, ArrowRight } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { setUserData } from '@/redux/userSlice';
import axios from 'axios';
import { getSocket } from '@/lib/socket';



const Navbar = () => {
    const pathName = usePathname();
    const [authOpen, setAuthOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [hasActiveBooking, setHasActiveBooking] = useState(false);
    const { userData } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch<AppDispatch>();
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const currentNavItems = React.useMemo(() => {
        if (userData?.role === "rider") {
            return [
                { name: "Home", path: "/", icon: Home },
                { name: "Pending Requests", path: "/rider/pending-requests", icon: Clock },
                { name: "Active Rides", path: "/rider/active-rides", icon: Navigation },
                { name: "Bookings", path: "/rider/bookings", icon: BookOpen },
            ];
        }
        return [
            { name: "Home", path: "/", icon: Home },
            { name: "Bookings", path: "/user/bookings", icon: BookOpen },
            { name: "About Us", path: "/about-us", icon: Info },
            { name: "Contact", path: "/contact", icon: Phone }
        ];
    }, [userData?.role]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        dispatch(setUserData(null));
        setProfileOpen(false);
        setMobileMenuOpen(false);
    };

    const userInitial = userData?.name?.charAt(0)?.toUpperCase();

    const fetchPendingCount = async () => {
        try {
            const { data } = await axios.get("/api/rider/booking/pending-request");
            setPendingCount(data.count || 0);
        } catch (error: any) {
            logger.error("error in fetching pending count", error);
            setPendingCount(0);
        }
    }
    useEffect(() => {
        const socket = getSocket();
        socket.on("new-booking", (data: any) => {
            if (userData?.role === "rider") {
                fetchPendingCount();
            }
        })
        return () => {
            socket.off("new-booking")
        }
    }, [userData?.role])
    useEffect(() => {
        if (userData?.role == "rider") {
            fetchPendingCount();
        }

        const checkActiveBooking = async () => {
            if (userData?.role === "user") {
                try {
                    const { data } = await axios.get('/api/booking/accept');
                    if (data?.booking && data.booking !== 'idle') {
                        setHasActiveBooking(true);
                    } else {
                        setHasActiveBooking(false);
                    }
                } catch (error: any) {
                    logger.error('Error checking active booking', error);
                }
            }
        };
        checkActiveBooking();
    }, [userData?.role])

    return (
        <>
            <motion.div
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 w-[94%] max-w-[1200px] z-50"
            >
                <div className='flex items-center justify-between w-full bg-black/90 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
                        <Image
                            src="/navLogos.png"
                            alt="Navbar logo for easy wheels"
                            width={48}
                            height={48}
                            className="object-contain drop-shadow-md w-10 h-10 md:w-12 md:h-12"
                            priority
                        />
                        <span className="text-white font-bold tracking-wide text-lg sm:text-xl hidden sm:block">EasyWheels</span>
                    </Link>

                    {/* Desktop Nav Items */}
                    <div className="hidden md:flex items-center gap-8">
                        {currentNavItems.map((item, index) => {
                            const active = item.path === pathName;
                            return (
                                <Link
                                    href={item.path}
                                    key={index}
                                    className={`relative text-sm font-medium transition ${active ? "text-white" : "text-white/70 hover:text-white"}`}
                                >
                                    {item.name}
                                    {item.name === "Pending Requests" && pendingCount > 0 && (
                                        <span className="absolute -top-3 -right-4 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                            {pendingCount}
                                        </span>
                                    )}
                                    {item.name === "Bookings" && hasActiveBooking && (
                                        <span className="absolute -top-1 -right-3 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right side */}
                    <div className='flex items-center gap-3'>

                        {/* Desktop Auth / Profile */}
                        <div className='hidden md:block relative' ref={profileRef}>
                            {!userData ? (
                                <button
                                    onClick={() => setAuthOpen(true)}
                                    className='px-6 py-2.5 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                >
                                    Get Started
                                    <ArrowRight size={16} className="-rotate-45" />
                                </button>
                            ) : (
                                <>
                                    <button
                                        className='w-11 h-11 rounded-full bg-white text-black font-bold hover:scale-105 transition-all shadow-[0_4px_14px_rgba(255,255,255,0.25)]'
                                        onClick={() => setProfileOpen(p => !p)}
                                    >
                                        {userInitial}
                                    </button>
                                    <AnimatePresence>
                                        {profileOpen && (
                                            <motion.div
                                                className='absolute top-14 right-0 w-[300px] bg-white text-black rounded-2xl shadow-xl border'
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                            >
                                                <div className='p-6'>
                                                    <p className='font-semibold text-lg'>{userData.name}</p>
                                                    <p className='text-xs uppercase text-gray-500 mb-4'>{userData.role}</p>
                                                    {userData.role !== "rider" && (
                                                        <button onClick={() => router.push("/rider/onboarding/vehicle")} className='w-full px-3 flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl transition'>
                                                            <div className='flex -space-x-2'>
                                                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Bike size={14} /></div>
                                                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Car size={14} /></div>
                                                                <div className='w-6 h-6 rounded-full bg-black text-white flex items-center justify-center'><Truck size={14} /></div>
                                                            </div>
                                                            Become a rider
                                                            <ChevronRight size={16} className='ml-auto' />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleLogout}
                                                        className='w-full px-3 flex items-center gap-3 py-3 hover:bg-gray-100 rounded-xl mt-2 transition'
                                                    >
                                                        <LogOut size={15} />
                                                        Logout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>

                        {/* Mobile Hamburger */}
                        <button
                            className='md:hidden w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition'
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── Mobile Bottom Sheet ── */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Blurred backdrop */}
                        <motion.div
                            className='fixed inset-0 z-40 md:hidden'
                            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Sheet */}
                        <motion.div
                            className='fixed bottom-0 left-0 right-0 z-50 md:hidden'
                            style={{
                                background: 'linear-gradient(160deg, #141414 0%, #0b0b0b 100%)',
                                borderRadius: '28px 28px 0 0',
                                boxShadow: '0 -24px 80px rgba(0,0,0,0.9)',
                            }}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        >
                            {/* Pill handle */}
                            <div className='flex justify-center pt-3 pb-2'>
                                <div className='w-10 h-1 rounded-full bg-white/20' />
                            </div>

                            {/* User banner */}
                            {userData && (
                                <motion.div
                                    className='mx-4 mt-2 mb-3 flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10'
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.08 }}
                                >
                                    <div className='w-10 h-10 rounded-full bg-white text-black font-bold flex items-center justify-center text-sm shrink-0'>
                                        {userInitial}
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='text-white font-semibold text-sm truncate'>{userData.name}</p>
                                        <p className='text-gray-500 text-xs uppercase tracking-wider'>{userData.role}</p>
                                    </div>
                                </motion.div>
                            )}

                            {/* 2×2 nav grid — each tile pops up with stagger */}
                            <nav className='px-4 pt-1 pb-3 grid grid-cols-2 gap-2.5'>
                                {currentNavItems.map((item, index) => {
                                    const active = item.path === pathName;
                                    const Icon = item.icon;
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 40 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: index * 0.055 + 0.12,
                                                type: 'spring',
                                                damping: 20,
                                                stiffness: 280
                                            }}
                                        >
                                            <Link
                                                href={item.path}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex flex-col items-center justify-center gap-2 py-5 rounded-2xl text-sm font-medium transition-all active:scale-95 ${active
                                                    ? 'bg-white text-black shadow-[0_4px_24px_rgba(255,255,255,0.15)]'
                                                    : 'text-gray-400 hover:text-white border border-white/8'
                                                    }`}
                                                style={!active ? { background: 'rgba(255,255,255,0.04)' } : {}}
                                            >
                                                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                                                <span className="relative">
                                                    {item.name}
                                                    {item.name === "Pending Requests" && pendingCount > 0 && (
                                                        <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                            {pendingCount}
                                                        </span>
                                                    )}
                                                    {item.name === "Bookings" && hasActiveBooking && (
                                                        <span className="absolute -top-1 -right-3 flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                        </span>
                                                    )}
                                                </span>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </nav>

                            {/* Divider */}
                            <div className='mx-4 h-px my-1' style={{ background: 'rgba(255,255,255,0.08)' }} />

                            {/* Action row */}
                            <div className='px-4 pt-2 pb-10 space-y-2'>
                                {!userData ? (
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.36 }}
                                        onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}
                                        className='w-full py-4 rounded-2xl bg-white text-black text-sm font-semibold hover:bg-gray-100 active:scale-[0.98] transition flex items-center justify-center gap-2'
                                    >
                                        <User size={16} />
                                        Login to your account
                                    </motion.button>
                                ) : (
                                    <>
                                        {userData.role !== "rider" && (
                                            <motion.button onClick={() => router.push("/rider/onboarding/vehicle")}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.34 }}
                                                className='w-full px-4 flex items-center gap-3 py-3.5 rounded-2xl transition text-white text-sm active:scale-[0.98]'
                                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                                            >
                                                <div className='flex -space-x-2'>
                                                    <div className='w-6 h-6 rounded-full bg-white text-black flex items-center justify-center'><Bike size={12} /></div>
                                                    <div className='w-6 h-6 rounded-full bg-white text-black flex items-center justify-center'><Car size={12} /></div>
                                                    <div className='w-6 h-6 rounded-full bg-white text-black flex items-center justify-center'><Truck size={12} /></div>
                                                </div>
                                                Become a rider
                                                <ChevronRight size={16} className='ml-auto text-gray-500' />
                                            </motion.button>
                                        )}
                                        <motion.button
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.40 }}
                                            onClick={handleLogout}
                                            className='w-full px-4 flex items-center gap-3 py-3.5 rounded-2xl transition text-gray-400 hover:text-white text-sm active:scale-[0.98]'
                                            style={{ background: 'rgba(255,255,255,0.04)' }}
                                        >
                                            <LogOut size={15} />
                                            Logout
                                        </motion.button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </>
    );
};

export default Navbar;