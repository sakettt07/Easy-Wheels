'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'next-auth/react'
import axios from 'axios'
import { RootState, AppDispatch } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'
import AuthModal from './AuthModal'
import toast from 'react-hot-toast'
import { logger } from '@/lib/logger'

const VEHICLE_MODES = [
  {
    key: 'bike',
    label: 'Bike',
    sym: '#v-bike',
    title: 'Bike',
    desc: 'Beat the traffic. Solo trips that slip through the jams.',
    delay: '0s',
  },
  {
    key: 'auto',
    label: 'Auto',
    sym: '#v-auto',
    title: 'Auto',
    desc: 'Rickshaw rides for short hops and narrow lanes.',
    delay: '-0.6s',
  },
  {
    key: 'car',
    label: 'Car',
    sym: '#v-car',
    title: 'Car',
    desc: 'Room to relax, for friends, family and luggage.',
    delay: '-1.2s',
  },
  {
    key: 'ev',
    label: 'EV',
    sym: '#v-ev',
    title: 'EV',
    desc: 'Quiet, clean electric rides with no tailpipe.',
    delay: '-1.8s',
  },
  {
    key: 'loader',
    label: 'Loader',
    sym: '#v-loader',
    title: 'Loader',
    desc: 'Mini-trucks and loaders for goods, deliveries and heavy cargo.',
    delay: '-2.4s',
  },
  {
    key: 'traveller',
    label: 'Traveller',
    sym: '#v-traveller',
    title: 'Traveller',
    desc: 'Spacious tempo travellers for group travel, family trips and tours.',
    delay: '-3.0s',
  },
] as const

const PublicHome = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { userData } = useSelector((state: RootState) => state.user)

  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string>('car')
  const [pickup, setPickup] = useState('Green Park')
  const [drop, setDrop] = useState('Central Station')
  const [hasActiveBooking, setHasActiveBooking] = useState(false)

  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (userData?.role === 'user') {
      const checkActiveBooking = async () => {
        try {
          const { data } = await axios.get('/api/booking/accept')
          if (data?.booking && data.booking !== 'idle') {
            setHasActiveBooking(true)
          } else {
            setHasActiveBooking(false)
          }
        } catch (error: any) {
          logger.error('Error checking active booking', error)
        }
      }
      checkActiveBooking()
    }
  }, [userData?.role])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    dispatch(setUserData(null))
    setProfileOpen(false)
    setMobileMenuOpen(false)
    router.refresh()
  }

  const handleBookRide = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!userData) {
      setAuthOpen(true)
      return
    }
    if (userData.role === 'rider') {
      toast.error('Rider accounts cannot book passenger rides. Please switch to a user account.')
      router.push('/rider/dashboard')
      return
    }
    if (userData.role === 'admin') {
      toast.error('Administrator accounts cannot book passenger rides.')
      router.push('/admin/dashboard')
      return
    }
    const params = new URLSearchParams()
    if (pickup.trim()) params.set('pickup', pickup.trim())
    if (drop.trim()) params.set('drop', drop.trim())
    if (selectedMode) params.set('vehicle', selectedMode)
    router.push(`/user/book?${params.toString()}`)
  }

  const handleBecomeRider = () => {
    if (!userData) {
      setAuthOpen(true)
      return
    }
    if (userData.role === 'rider') {
      router.push('/rider/dashboard')
      return
    }
    if (userData.role === 'admin') {
      router.push('/admin/dashboard')
      return
    }
    router.push('/rider/onboarding/vehicle')
  }

  const getDashboardRoute = () => {
    if (userData?.role === 'rider') return '/rider/dashboard'
    if (userData?.role === 'admin') return '/admin/dashboard'
    return '/user/bookings'
  }

  const getRidesRoute = () => {
    if (userData?.role === 'rider') return '/rider/bookings'
    return '/user/bookings'
  }

  const userInitial = userData?.name?.charAt(0)?.toUpperCase() || 'U'
  const heroSym = `#v-${selectedMode}`

  // Check roles for visibility:
  // Rides: visible ONLY for user and rider
  // Become a rider: visible ONLY for regular user (hidden for rider and admin)
  const canSeeRidesTab = !!userData && (userData.role === 'user' || userData.role === 'rider')
  const canSeeBecomeRiderTab = !!userData && userData.role === 'user'

  return (
    <div id="ew" style={{ position: 'relative', background: 'var(--mist)', color: 'var(--ink)', fontFamily: "'Figtree', system-ui, sans-serif", overflowX: 'clip' }}>

      {/* ================= FLOATING NAV ================= */}
      <div style={{ position: 'sticky', top: '12px', zIndex: 60, height: 0, display: 'flex', justifyContent: 'center', padding: '0 12px' }}>
        <nav
          aria-label="Main"
          style={{
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            width: 'min(1080px, 100%)',
            boxSizing: 'border-box',
            height: '58px',
            padding: '0 8px 0 18px',
            borderRadius: '999px',
            background: 'rgba(255,255,255,.92)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid var(--line)',
            boxShadow: '0 18px 50px rgba(14,23,18,.14)',
          }}
        >
          {/* Brand Logo */}
          <Link href="/" aria-label="Easy Wheels home" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="15" fill="#0E1712" />
              <circle cx="16" cy="16" r="4.2" fill="#C9F23C" />
              <path d="M16 4.5v7M16 20.5v7M4.5 16h7M20.5 16h7" stroke="#C9F23C" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            <span className="disp" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-.03em' }}>
              Easy Wheels
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <Link className="navlink" href="/">Home</Link>
            
            {/* Rides tab: visible ONLY when logged in for user and rider role; routes to bookings per req 4 */}
            {canSeeRidesTab && (
              <Link
                className="navlink"
                href={getRidesRoute()}
                style={{ position: 'relative' }}
              >
                Rides
                {hasActiveBooking && (
                  <span style={{ position: 'absolute', top: '6px', right: '4px', display: 'flex', height: '8px', width: '8px' }}>
                    <span style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '9999px', background: '#EF4444', opacity: 0.75 }}></span>
                    <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '9999px', height: '8px', width: '8px', background: '#DC2626' }}></span>
                  </span>
                )}
              </Link>
            )}

            {/* Become a rider tab: visible ONLY for regular users (hidden for rider and admin per req 2) */}
            {canSeeBecomeRiderTab && (
              <Link className="navlink" href="/rider/onboarding/vehicle">Become a rider</Link>
            )}

            {/* Safety: links to separate dedicated safety page */}
            <Link className="navlink" href="/safety">Safety</Link>
          </div>

          {/* User Auth / Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!userData ? (
              /* When not logged in: Show Login button */
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="btn btn-ink"
                style={{ minHeight: '42px', padding: '0 20px', fontSize: '14px' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6" />
                </svg>
                Login
              </button>
            ) : (
              /* When logged in: On bigger screens, show Avatar only (Dashboard button removed per req 3) */
              <div style={{ position: 'relative' }} ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((p) => !p)}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--ink)',
                    color: 'var(--lime)',
                    fontWeight: 800,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: '2px solid rgba(201, 242, 60, 0.6)',
                    boxShadow: '0 4px 14px rgba(14,23,18,.2)',
                  }}
                  title={userData.name}
                  aria-label="User profile menu"
                >
                  {userInitial}
                </button>

                {profileOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: 0,
                      width: '250px',
                      background: '#fff',
                      borderRadius: '20px',
                      padding: '16px',
                      boxShadow: '0 20px 50px rgba(14,23,18,.18)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      zIndex: 100,
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '15px', color: 'var(--ink)' }}>{userData.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {userData.role} · {userData.email}
                      </p>
                    </div>
                    <div style={{ height: '1px', background: 'var(--line)' }} />

                    {/* Dashboard shortcut in dropdown */}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false)
                        router.push(getDashboardRoute())
                      }}
                      style={{
                        padding: '9px 12px',
                        background: 'var(--mist)',
                        borderRadius: '10px',
                        border: 0,
                        fontSize: '13px',
                        fontWeight: 600,
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>Dashboard</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'capitalize' }}>{userData.role}</span>
                    </button>

                    {/* My Rides: visible ONLY for regular users (removed for admin per req 2) */}
                    {userData.role === 'user' && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)
                          router.push('/user/bookings')
                        }}
                        style={{
                          padding: '9px 12px',
                          background: 'var(--mist)',
                          borderRadius: '10px',
                          border: 0,
                          fontSize: '13px',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: 'var(--ink)',
                        }}
                      >
                        My Rides
                      </button>
                    )}

                    {/* Rider Bookings: visible ONLY for rider role */}
                    {userData.role === 'rider' && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)
                          router.push('/rider/bookings')
                        }}
                        style={{
                          padding: '9px 12px',
                          background: 'var(--mist)',
                          borderRadius: '10px',
                          border: 0,
                          fontSize: '13px',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: 'var(--ink)',
                        }}
                      >
                        Rider Bookings
                      </button>
                    )}

                    {/* Become a rider: visible ONLY for regular users (removed for admin & rider per req 2) */}
                    {userData.role === 'user' && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false)
                          router.push('/rider/onboarding/vehicle')
                        }}
                        style={{
                          padding: '9px 12px',
                          background: 'var(--mist)',
                          borderRadius: '10px',
                          border: 0,
                          fontSize: '13px',
                          fontWeight: 600,
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: 'var(--ink)',
                        }}
                      >
                        Become a rider →
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        padding: '9px 12px',
                        background: '#FFF1F2',
                        color: '#BE123C',
                        borderRadius: '10px',
                        border: 0,
                        fontSize: '13px',
                        fontWeight: 700,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="btn btn-ink"
              style={{
                minHeight: '40px',
                width: '40px',
                padding: 0,
                borderRadius: '50%',
                display: 'none',
              }}
              aria-label="Toggle menu"
              id="mobile-toggle"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(14,23,18,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '24px 24px 0 0',
              padding: '20px 18px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
              <span className="disp" style={{ fontSize: '18px', fontWeight: 800 }}>Easy Wheels</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 0, fontSize: '20px', cursor: 'pointer', color: 'var(--ink)' }}
              >
                ✕
              </button>
            </div>
            <Link className="navlink" href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            
            {/* Rides tab on mobile: visible ONLY when logged in for user and rider */}
            {canSeeRidesTab && (
              <Link className="navlink" href={getRidesRoute()} onClick={() => setMobileMenuOpen(false)}>Rides</Link>
            )}

            {/* Become a rider tab on mobile: visible ONLY for regular user */}
            {canSeeBecomeRiderTab && (
              <Link className="navlink" href="/rider/onboarding/vehicle" onClick={() => setMobileMenuOpen(false)}>Become a rider</Link>
            )}

            {/* Safety page link */}
            <Link className="navlink" href="/safety" onClick={() => setMobileMenuOpen(false)}>Safety</Link>
            
            {userData ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    router.push(getDashboardRoute())
                  }}
                  className="btn btn-lime"
                  style={{ width: '100%', marginTop: '4px', minHeight: '46px', gap: '8px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                  </svg>
                  Dashboard ({userData.role})
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-ink"
                  style={{ width: '100%', minHeight: '44px' }}
                >
                  Logout ({userData.name})
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setAuthOpen(true)
                }}
                className="btn btn-ink"
                style={{ width: '100%', marginTop: '4px', minHeight: '46px' }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= HERO WITH LIVE CITY MAP ================= */}
      <header id="top" className="herotop" style={{ position: 'relative', minHeight: '800px', display: 'flex', flexDirection: 'column' }}>
        <div className="mapwrap" aria-hidden="false" style={{ position: 'absolute', inset: 0 }}>
          <svg
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label="Animated city map. A rider waits at a pickup point, a vehicle arrives, picks them up and drops them at their destination while bikes, autos, cars, EVs, loaders, and travellers drive around. Easy rides, every street."
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
            <defs>
              <pattern id="bld" width="36" height="36" patternUnits="userSpaceOnUse">
                <rect x="4" y="4" width="12" height="12" rx="2" fill="#DEE5D6" />
                <rect x="20" y="8" width="11" height="9" rx="2" fill="#E2E9DA" />
                <rect x="6" y="21" width="10" height="11" rx="2" fill="#E2E9DA" />
                <rect x="21" y="22" width="12" height="10" rx="2" fill="#DEE5D6" />
              </pattern>
              <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="2.2" floodColor="#0E1712" floodOpacity=".28" />
              </filter>
              <filter id="sh2" x="-20%" y="-20%" width="140%" height="160%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0E1712" floodOpacity=".18" />
              </filter>

              {/* Vehicle SVG definitions */}
              <g id="v-car">
                <rect x="-17" y="-8" width="34" height="16" rx="6" fill="#0E1712" />
                <rect x="-6" y="-6" width="13" height="12" rx="3" fill="#24372C" />
                <path d="M7 -6.5L12 -5V5L7 6.5Z" fill="#9CB8A8" />
                <path d="M-9 -5.5L-6.5 -6V6L-9 5.5Z" fill="#9CB8A8" />
                <rect x="13" y="-6.5" width="3" height="3" rx="1" fill="#FFF3B0" />
                <rect x="13" y="3.5" width="3" height="3" rx="1" fill="#FFF3B0" />
              </g>

              <g id="v-auto">
                <rect x="-14" y="-8.5" width="28" height="17" rx="6" fill="#16A34A" />
                <rect x="-11" y="-7" width="17" height="14" rx="4" fill="#FFD23F" />
                <path d="M6 -7L12 -4.5V4.5L6 7Z" fill="#0E1712" opacity=".75" />
                <rect x="12.5" y="-1.6" width="3.2" height="3.2" rx="1" fill="#FFF8D0" />
              </g>

              <g id="v-ev">
                <rect x="-17" y="-8" width="34" height="16" rx="6" fill="#19B394" />
                <rect x="-6" y="-6" width="13" height="12" rx="3" fill="#0F8F76" />
                <path d="M1.5 -4.2L-2 1H0L-1 5L3 -1H1Z" fill="#fff" />
                <path d="M7 -6.5L12 -5V5L7 6.5Z" fill="#0A5E4E" opacity=".7" />
                <path d="M-9 -5.5L-6.5 -6V6L-9 5.5Z" fill="#0A5E4E" opacity=".7" />
                <rect x="13" y="-6.5" width="3" height="3" rx="1" fill="#E6FFF8" />
                <rect x="13" y="3.5" width="3" height="3" rx="1" fill="#E6FFF8" />
              </g>

              <g id="v-bike">
                <rect x="-13" y="-2.4" width="26" height="4.8" rx="2.4" fill="#0E1712" />
                <rect x="7" y="-8" width="2.6" height="16" rx="1.3" fill="#0E1712" />
                <rect x="-5" y="-3.6" width="10" height="7.2" rx="3.2" fill="#C9F23C" />
                <ellipse cx="-3" cy="0" rx="4.6" ry="7" fill="#2D4A3B" />
                <circle cx="-1.5" cy="0" r="4" fill="#0E1712" />
              </g>

              <g id="v-loader">
                <rect x="-18" y="-8" width="36" height="16" rx="4" fill="#3D4A3E" />
                <rect x="-16.5" y="-6.5" width="20" height="13" rx="2" fill="#243126" />
                <rect x="-14" y="-4.5" width="8" height="9" rx="1.5" fill="#C9F23C" opacity=".85" />
                <rect x="-4.5" y="-4.5" width="6" height="9" rx="1" fill="#9CB8A8" opacity=".7" />
                <rect x="4.5" y="-7.5" width="12" height="15" rx="3.5" fill="#0E1712" />
                <path d="M8 -6L13.5 -4.5V4.5L8 6Z" fill="#9CB8A8" />
                <rect x="15" y="-6.5" width="3" height="3" rx="1" fill="#FFF3B0" />
                <rect x="15" y="3.5" width="3" height="3" rx="1" fill="#FFF3B0" />
              </g>

              <g id="v-traveller">
                <rect x="-20" y="-8.5" width="40" height="17" rx="5" fill="#0E1712" />
                <rect x="-15" y="-6.5" width="26" height="13" rx="3" fill="#1F3328" />
                <rect x="-13" y="-5" width="5.5" height="10" rx="1.5" fill="#9CB8A8" />
                <rect x="-5.5" y="-5" width="5.5" height="10" rx="1.5" fill="#9CB8A8" />
                <rect x="2" y="-5" width="5.5" height="10" rx="1.5" fill="#9CB8A8" />
                <path d="M12 -6.5L18 -4.5V4.5L12 6.5Z" fill="#CDE6BF" />
                <rect x="18.5" y="-6.5" width="3" height="3" rx="1" fill="#FFF3B0" />
                <rect x="18.5" y="3.5" width="3" height="3" rx="1" fill="#FFF3B0" />
              </g>
            </defs>

            {/* ground + buildings */}
            <rect width="1440" height="900" fill="#EAEFE4" />
            <rect width="1440" height="900" fill="url(#bld)" />

            {/* parks */}
            <rect x="374" y="154" width="212" height="172" rx="14" fill="#CDE6BF" />
            <rect x="1094" y="554" width="212" height="172" rx="14" fill="#CDE6BF" />
            <rect x="134" y="354" width="212" height="172" rx="14" fill="#CDE6BF" />
            <g fill="#B5D9A2">
              <circle cx="410" cy="190" r="14" />
              <circle cx="452" cy="232" r="16" />
              <circle cx="522" cy="200" r="13" />
              <circle cx="552" cy="282" r="15" />
              <circle cx="420" cy="292" r="12" />
              <circle cx="1130" cy="590" r="14" />
              <circle cx="1182" cy="640" r="16" />
              <circle cx="1252" cy="600" r="13" />
              <circle cx="1272" cy="690" r="15" />
              <circle cx="1142" cy="700" r="12" />
              <circle cx="180" cy="400" r="14" />
              <circle cx="262" cy="450" r="16" />
              <circle cx="310" cy="390" r="12" />
            </g>

            {/* river */}
            <path d="M-40,880 C200,820 380,905 620,855 S1000,800 1180,862 S1380,905 1480,862" fill="none" stroke="#BFDDE9" strokeWidth="58" />

            {/* road casing */}
            <g fill="none" stroke="#D3DBC9" strokeLinecap="butt">
              <path strokeWidth="12" d="M240,-20V920 M480,-20V920 M720,-20V920 M960,-20V920 M1200,-20V920 M-20,240H1460 M-20,440H1460 M-20,640H1460" />
              <path strokeWidth="23" d="M120,-20V920 M360,-20V920 M600,-20V920 M840,-20V920 M1080,-20V920 M1320,-20V920 M-20,140H1460 M-20,340H1460 M-20,540H1460 M-20,740H1460" />
            </g>

            {/* road surface */}
            <g fill="none" stroke="#FFFFFF" strokeLinecap="butt">
              <path strokeWidth="8" d="M240,-20V920 M480,-20V920 M720,-20V920 M960,-20V920 M1200,-20V920 M-20,240H1460 M-20,440H1460 M-20,640H1460" />
              <path strokeWidth="19" d="M120,-20V920 M360,-20V920 M600,-20V920 M840,-20V920 M1080,-20V920 M1320,-20V920 M-20,140H1460 M-20,340H1460 M-20,540H1460 M-20,740H1460" />
            </g>

            {/* centre dashes */}
            <path fill="none" stroke="#CBD4C2" strokeWidth="1.4" strokeDasharray="9 11" d="M120,-20V920 M360,-20V920 M600,-20V920 M840,-20V920 M1080,-20V920 M1320,-20V920 M-20,140H1460 M-20,340H1460 M-20,540H1460 M-20,740H1460" />

            {/* roundabout */}
            <circle cx="600" cy="540" r="27" fill="#FFFFFF" stroke="#D3DBC9" strokeWidth="3" />
            <circle cx="600" cy="540" r="12" fill="#CDE6BF" />

            {/* slogan along the road */}
            <defs>
              <path id="slogan" d="M-20,145H1460" />
            </defs>
            <text fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="700" letterSpacing="3.2" fill="#8FA095">
              <textPath href="#slogan">
                EASY RIDES · EVERY STREET · EASY RIDES · EVERY STREET · EASY RIDES · EVERY STREET · EASY RIDES · EVERY STREET · EASY RIDES · EVERY STREET · EASY RIDES
              </textPath>
            </text>

            {/* ============ ambient traffic: vehicles ============ */}
            {/* bike */}
            <g filter="url(#sh)">
              <g>
                <use href="#v-bike" transform="scale(1.15)" />
                <animateMotion dur="20s" begin="-6s" repeatCount="indefinite" rotate="auto" path="M1480,240H-40" />
              </g>
            </g>
            <g>
              <g transform="translate(0,-24)">
                <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#fff" stroke="rgba(14,23,18,.14)" />
                <text textAnchor="middle" y="4" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="700" fill="#0E1712">Bike</text>
              </g>
              <animateMotion dur="20s" begin="-6s" repeatCount="indefinite" path="M1480,240H-40" />
            </g>

            {/* auto */}
            <g filter="url(#sh)">
              <g>
                <use href="#v-auto" transform="scale(1.15)" />
                <animateMotion dur="26s" begin="-9s" repeatCount="indefinite" rotate="auto" path="M1200,-40V940" />
              </g>
            </g>
            <g>
              <g transform="translate(38,0)">
                <rect x="-24" y="-10" width="48" height="20" rx="10" fill="#fff" stroke="rgba(14,23,18,.14)" />
                <text textAnchor="middle" y="4" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="700" fill="#0E1712">Auto</text>
              </g>
              <animateMotion dur="26s" begin="-9s" repeatCount="indefinite" path="M1200,-40V940" />
            </g>

            {/* loader */}
            <g filter="url(#sh)">
              <g>
                <use href="#v-loader" transform="scale(1.1)" />
                <animateMotion dur="24s" begin="-15s" repeatCount="indefinite" rotate="auto" path="M-40,640H1480" />
              </g>
            </g>
            <g>
              <g transform="translate(0,-24)">
                <rect x="-26" y="-10" width="52" height="20" rx="10" fill="#fff" stroke="rgba(14,23,18,.14)" />
                <text textAnchor="middle" y="4" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="700" fill="#0E1712">Loader</text>
              </g>
              <animateMotion dur="24s" begin="-15s" repeatCount="indefinite" path="M-40,640H1480" />
            </g>

            {/* EV */}
            <g filter="url(#sh)">
              <g>
                <use href="#v-ev" transform="scale(1.15)" />
                <animateMotion dur="22s" begin="-5s" repeatCount="indefinite" rotate="auto" path="M600,940V-40" />
              </g>
            </g>
            <g>
              <g transform="translate(34,0)">
                <rect x="-20" y="-10" width="40" height="20" rx="10" fill="#fff" stroke="rgba(14,23,18,.14)" />
                <text textAnchor="middle" y="4" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="700" fill="#0E1712">EV</text>
              </g>
              <animateMotion dur="22s" begin="-5s" repeatCount="indefinite" path="M600,940V-40" />
            </g>

            {/* car */}
            <g filter="url(#sh)">
              <g>
                <use href="#v-car" transform="scale(1.15)" />
                <animateMotion dur="28s" begin="-18s" repeatCount="indefinite" rotate="auto" path="M1480,440H-40" />
              </g>
            </g>
            <g>
              <g transform="translate(0,-24)">
                <rect x="-22" y="-10" width="44" height="20" rx="10" fill="#fff" stroke="rgba(14,23,18,.14)" />
                <text textAnchor="middle" y="4" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="700" fill="#0E1712">Car</text>
              </g>
              <animateMotion dur="28s" begin="-18s" repeatCount="indefinite" path="M1480,440H-40" />
            </g>

            {/* traveller */}
            <g filter="url(#sh)">
              <g>
                <use href="#v-traveller" transform="scale(1.05)" />
                <animateMotion dur="30s" begin="-12s" repeatCount="indefinite" rotate="auto" path="M360,-40V940" />
              </g>
            </g>
            <g>
              <g transform="translate(42,0)">
                <rect x="-28" y="-10" width="56" height="20" rx="10" fill="#fff" stroke="rgba(14,23,18,.14)" />
                <text textAnchor="middle" y="4" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="700" fill="#0E1712">Traveller</text>
              </g>
              <animateMotion dur="30s" begin="-12s" repeatCount="indefinite" path="M360,-40V940" />
            </g>

            {/* featured ride route */}
            <path
              d="M840,340L840,522Q840,540 858,540L1062,540Q1080,540 1080,558L1080,722Q1080,740 1098,740L1320,740"
              fill="none"
              stroke="#0E1712"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="1 11"
              opacity="0"
            >
              <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.2;.26;.88;.94;1" dur="16s" repeatCount="indefinite" />
              <animate attributeName="strokeDashoffset" values="0;-48" dur="1.6s" repeatCount="indefinite" />
            </path>

            {/* destination pin */}
            <g transform="translate(1338,718)" filter="url(#sh2)">
              <path d="M0,22C-14,6 -16,-4 -16,-10A16,16 0 0 1 16,-10C16,-4 14,6 0,22Z" fill="#0E1712" />
              <rect x="-5.5" y="-15.5" width="11" height="11" rx="2.5" fill="#C9F23C" />
            </g>

            {/* pickup tag, drop tag, fare bubble */}
            <g opacity="1">
              <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.34;.4;.97;1" dur="16s" repeatCount="indefinite" />
              <g filter="url(#sh2)"><rect x="880" y="290" width="190" height="34" rx="17" fill="#fff" /></g>
              <circle cx="898" cy="307" r="5.5" fill="#0E1712" />
              <circle cx="898" cy="307" r="2" fill="#C9F23C" />
              <text x="912" y="311.5" fontFamily="Figtree, sans-serif" fontSize="13" fontWeight="700" fill="#0E1712">
                Pickup · Green Park
              </text>
            </g>

            <g opacity="0">
              <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.2;.26;.9;.95;1" dur="16s" repeatCount="indefinite" />
              <g filter="url(#sh2)"><rect x="1128" y="672" width="198" height="34" rx="17" fill="#fff" /></g>
              <rect x="1141" y="684" width="11" height="11" rx="2.5" fill="#0E1712" />
              <text x="1161" y="694.5" fontFamily="Figtree, sans-serif" fontSize="13" fontWeight="700" fill="#0E1712">
                Drop · Central Station
              </text>
            </g>

            <g opacity="0">
              <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.34;.4;.78;.82;1" dur="16s" repeatCount="indefinite" />
              <g filter="url(#sh2)"><rect x="898" y="578" width="156" height="36" rx="18" fill="#C9F23C" /></g>
              <text x="976" y="601" textAnchor="middle" fontFamily="Figtree, sans-serif" fontSize="14" fontWeight="800" fill="#0E1712">
                ₹140 · 12 min
              </text>
            </g>

            {/* passenger waiting at pickup */}
            <g transform="translate(862,338)" opacity="1">
              <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.3;.34;.99;1" dur="16s" repeatCount="indefinite" />
              <circle r="10" fill="none" stroke="#C9F23C" strokeWidth="3">
                <animate attributeName="r" values="9;28" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values=".9;0" dur="1.6s" repeatCount="indefinite" />
              </circle>
              <circle r="11" fill="#C9F23C" />
              <circle cy="-3.2" r="3.2" fill="#0E1712" />
              <path d="M-5,5.5Q-5,0.5 0,0.5Q5,0.5 5,5.5Z" fill="#0E1712" />
            </g>

            {/* passenger dropped at destination */}
            <g transform="translate(1306,756)" opacity="0">
              <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.8;.84;.94;.98;1" dur="16s" repeatCount="indefinite" />
              <circle r="11" fill="#C9F23C" />
              <circle cy="-3.2" r="3.2" fill="#0E1712" />
              <path d="M-5,5.5Q-5,0.5 0,0.5Q5,0.5 5,5.5Z" fill="#0E1712" />
              <g transform="translate(18,-16)">
                <circle r="9" fill="#0E1712" />
                <path d="M-4,0.2L-1,3.2L4,-2.8" fill="none" stroke="#C9F23C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>

            {/* The active featured vehicle */}
            <g filter="url(#sh)">
              <g>
                <g transform="scale(1.5)">
                  <use href={heroSym} />
                </g>
                <animateMotion
                  dur="16s"
                  repeatCount="indefinite"
                  rotate="auto"
                  calcMode="linear"
                  keyPoints="0;0.2649;0.2649;0.897;0.897;1;1"
                  keyTimes="0;0.22;0.34;0.78;0.86;0.94;1"
                  path="M840,-20L840,340L840,522Q840,540 858,540L1062,540Q1080,540 1080,558L1080,722Q1080,740 1098,740L1460,740"
                />
              </g>
            </g>

            {/* brand badge on map */}
            <g filter="url(#sh2)">
              <rect x="1000" y="170" width="350" height="52" rx="26" fill="#0E1712" />
            </g>
            <circle cx="1028" cy="196" r="9" fill="#C9F23C" />
            <path d="M1024,196l3,3l5,-6" fill="none" stroke="#0E1712" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="1048" y="202" fontFamily="Bricolage Grotesque, Figtree, sans-serif" fontSize="19" fontWeight="800" fill="#FFFFFF">
              Easy rides. Every street.
            </text>
          </svg>
        </div>

        {/* readability fade behind the copy */}
        <div
          className="herofade"
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'linear-gradient(90deg,rgba(243,246,239,.97) 0%,rgba(243,246,239,.92) 30%,rgba(243,246,239,.55) 46%,rgba(243,246,239,0) 62%)',
          }}
        />

        <div
          className="herobody"
          style={{
            position: 'relative',
            boxSizing: 'border-box',
            width: '100%',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '140px 20px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            pointerEvents: 'none',
          }}
        >
          <div style={{ maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '16px', pointerEvents: 'auto' }}>
            <p
              style={{
                margin: 0,
                display: 'inline-flex',
                alignSelf: 'flex-start',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: '#fff',
                border: '1px solid var(--line)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ink)', boxShadow: '0 0 0 3px var(--lime)' }} />
              Bikes · Autos · Cars · EVs · Loaders · Travellers
            </p>
            <h1
              className="disp"
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 'clamp(40px,7vw,96px)',
                lineHeight: .94,
                letterSpacing: '-.045em',
                textWrap: 'balance',
              }}
            >
              Rides made{' '}
              <span style={{ background: 'linear-gradient(transparent 62%,var(--lime) 62%,var(--lime) 92%,transparent 92%)', padding: '0 6px', margin: '0 -6px' }}>
                easy.
              </span>
            </h1>
            <p style={{ margin: 0, maxWidth: '470px', fontSize: 'clamp(15px,2.5vw,18px)', lineHeight: 1.5, color: 'var(--muted)', textWrap: 'pretty' }}>
              Pick the ride that fits the trip, then watch it come to you. No haggling, no waiting around.
            </p>
          </div>

          {/* booking card */}
          <form
            id="book"
            onSubmit={handleBookRide}
            style={{
              pointerEvents: 'auto',
              maxWidth: '500px',
              boxSizing: 'border-box',
              padding: 'clamp(18px, 3.5vw, 24px)',
              borderRadius: '26px',
              background: '#fff',
              border: '1px solid var(--line)',
              boxShadow: '0 34px 90px rgba(14,23,18,.16)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="field">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="8" fill="none" stroke="#0E1712" strokeWidth="3" />
                  <circle cx="12" cy="12" r="2.5" fill="#0E1712" />
                </svg>
                <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Pickup location</span>
                <input
                  type="text"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  placeholder="Pickup location"
                />
              </label>

              <label className="field">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <rect x="4" y="4" width="16" height="16" rx="3.5" fill="#0E1712" />
                </svg>
                <span style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Drop location</span>
                <input
                  type="text"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  placeholder="Where to?"
                />
              </label>
            </div>

            <div>
              <div className="fl" style={{ margin: '2px 0 8px' }}>Choose your ride</div>
              {/* Responsive 3x2 grid on small screens, 6 in 1 row on sm+ */}
              <div role="group" aria-label="Ride type" className="mchip-grid">
                {VEHICLE_MODES.map((m) => {
                  const isSelected = selectedMode === m.key
                  return (
                    <button
                      key={m.key}
                      type="button"
                      className={isSelected ? 'mchip mchip-on' : 'mchip'}
                      onClick={() => setSelectedMode(m.key)}
                      aria-pressed={isSelected}
                      title={m.desc}
                      style={{ width: '100%' }}
                    >
                      <svg width="32" height="18" viewBox="-20 -12 40 24" aria-hidden="true">
                        <use href={m.sym} />
                      </svg>
                      <span>{m.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {userData?.role === 'rider' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <div style={{ background: 'var(--mist)', border: '1px solid var(--line)', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <circle cx="5.5" cy="17.5" r="3.5" />
                    <circle cx="18.5" cy="17.5" r="3.5" />
                    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L9 9l4.5-3 3.5 4h4" />
                  </svg>
                  <span><strong>Driver Account:</strong> Riders cannot book passenger rides.</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/rider/dashboard')}
                  className="btn btn-ink"
                  style={{ width: '100%', boxSizing: 'border-box', minHeight: '52px', fontSize: '16px', gap: '8px' }}
                >
                  Go to Driver Dashboard
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            ) : userData?.role === 'admin' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <div style={{ background: 'var(--mist)', border: '1px solid var(--line)', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span><strong>Administrator:</strong> Use dashboard for system management.</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/admin/dashboard')}
                  className="btn btn-ink"
                  style={{ width: '100%', boxSizing: 'border-box', minHeight: '52px', fontSize: '16px', gap: '8px' }}
                >
                  Go to Admin Dashboard
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                type="submit"
                className="btn btn-ink"
                style={{ width: '100%', boxSizing: 'border-box', minHeight: '52px', fontSize: '16px', marginTop: '2px' }}
              >
                Book a ride
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            )}
          </form>
        </div>
      </header>

      {/* ================= RIDE MODES (HORIZONTAL SWIPE ON MOBILE) ================= */}
      <section id="rides" style={{ background: 'var(--ink)', color: '#fff', padding: 'clamp(50px, 8vw, 100px) 20px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <p className="fl" style={{ margin: 0, color: 'var(--lime)' }}>The fleet</p>
              <h2
                className="disp"
                style={{
                  margin: '12px 0 0',
                  maxWidth: '780px',
                  fontWeight: 800,
                  fontSize: 'clamp(32px, 5vw, 68px)',
                  lineHeight: 1,
                  letterSpacing: '-.04em',
                }}
              >
                Six ways to <span style={{ color: 'var(--lime)' }}>get there.</span>
              </h2>
            </div>
            <p className="md:hidden text-xs text-lime-400/80 font-semibold uppercase tracking-wider">
              Swipe across →
            </p>
          </div>
          <p style={{ margin: '14px 0 0', maxWidth: '520px', fontSize: 'clamp(14px, 2.5vw, 17px)', lineHeight: 1.5, color: '#A7B7AD' }}>
            Short hop or long haul, cargo or family tour. There is a verified ride for every trip in our fleet.
          </p>

          {/* Mobile: Horizontal swipe carousel with snap. Desktop: Multi-column grid */}
          <div
            className="flex overflow-x-auto pb-3 pt-2 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-6 gap-3.5 no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0"
            style={{ marginTop: '36px' }}
          >
            {VEHICLE_MODES.map((m) => (
              <article
                key={m.key}
                className="mcard shrink-0 w-[240px] md:w-auto snap-start cursor-pointer"
                onClick={() => setSelectedMode(m.key)}
              >
                <div className="vtile h-[125px] sm:h-[140px] relative flex items-center justify-center">
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: '50%',
                      height: '2px',
                      background: 'repeating-linear-gradient(90deg,#34503F 0 14px,transparent 14px 28px)',
                    }}
                  />
                  <svg className="drive" width="130" height="85" viewBox="-30 -20 60 40" aria-hidden="true" style={{ animationDelay: m.delay }}>
                    <use href={m.sym} />
                  </svg>
                </div>
                <div style={{ padding: '0 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="disp" style={{ margin: 0, fontSize: '22px', fontWeight: 800, letterSpacing: '-.03em' }}>
                      {m.title}
                    </h3>
                    {selectedMode === m.key && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--lime)', background: 'rgba(201,242,60,.15)', padding: '2px 8px', borderRadius: '999px' }}>
                        Selected
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.45, color: '#A7B7AD' }}>
                    {m.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BECOME A RIDER ================= */}
      <section id="rider" style={{ padding: 'clamp(16px, 4vw, 30px) 16px clamp(48px, 8vw, 100px)' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            boxSizing: 'border-box',
            background: 'var(--ink)',
            color: '#fff',
            borderRadius: 'clamp(24px, 5vw, 40px)',
            padding: 'clamp(24px, 5vw, 70px) clamp(16px, 4vw, 56px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 500px', maxWidth: '720px' }}>
              <p className="fl" style={{ margin: 0, color: 'var(--lime)' }}>Ride with us</p>
              <h2
                className="disp"
                style={{
                  margin: '12px 0 0',
                  fontWeight: 800,
                  fontSize: 'clamp(32px, 5.5vw, 72px)',
                  lineHeight: .98,
                  letterSpacing: '-.045em',
                  textWrap: 'balance',
                }}
              >
                Own a vehicle? <span style={{ color: 'var(--lime)' }}>Become a rider.</span>
              </h2>
              <p style={{ margin: '14px 0 0', maxWidth: '540px', fontSize: 'clamp(14px, 2.4vw, 17px)', lineHeight: 1.5, color: '#B4C4BA' }}>
                Join Easy Wheels with your bike, auto, car, EV, loader or traveller. Getting verified takes 8 short steps, and every one of them is online.
              </p>
              <div style={{ marginTop: '22px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 18px' }}>
                <button
                  type="button"
                  onClick={handleBecomeRider}
                  className="btn btn-lime"
                  style={{ minHeight: '50px', padding: '0 26px', fontSize: '15px' }}
                >
                  Become a rider
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 0,
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#fff',
                    borderBottom: '1px solid rgba(255,255,255,.4)',
                    paddingBottom: '2px',
                  }}
                >
                  Already applied? Login
                </button>
              </div>
            </div>

            <div style={{ flex: '0 1 300px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                <span className="disp" style={{ fontSize: 'clamp(64px, 12vw, 140px)', fontWeight: 800, lineHeight: .8, letterSpacing: '-.06em', color: 'var(--lime)' }}>
                  8
                </span>
                <span style={{ paddingBottom: '6px', fontSize: '15px', fontWeight: 700, lineHeight: 1.25, maxWidth: '110px' }}>
                  steps to get verified
                </span>
              </div>
              <div aria-label="Open to bikes, autos, cars, EVs, loaders and travellers" role="img" style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap', overflowX: 'auto', maxWidth: '100%' }} className="no-scrollbar">
                <svg width="34" height="22" viewBox="-24 -14 48 28" aria-hidden="true" style={{ background: '#16241C', borderRadius: '6px', flexShrink: 0 }}><use href="#v-bike" /></svg>
                <svg width="34" height="22" viewBox="-24 -14 48 28" aria-hidden="true" style={{ background: '#16241C', borderRadius: '6px', flexShrink: 0 }}><use href="#v-auto" /></svg>
                <svg width="34" height="22" viewBox="-24 -14 48 28" aria-hidden="true" style={{ background: '#16241C', borderRadius: '6px', flexShrink: 0 }}><use href="#v-car" /></svg>
                <svg width="34" height="22" viewBox="-24 -14 48 28" aria-hidden="true" style={{ background: '#16241C', borderRadius: '6px', flexShrink: 0 }}><use href="#v-ev" /></svg>
                <svg width="34" height="22" viewBox="-24 -14 48 28" aria-hidden="true" style={{ background: '#16241C', borderRadius: '6px', flexShrink: 0 }}><use href="#v-loader" /></svg>
                <svg width="34" height="22" viewBox="-24 -14 48 28" aria-hidden="true" style={{ background: '#16241C', borderRadius: '6px', flexShrink: 0 }}><use href="#v-traveller" /></svg>
              </div>
            </div>
          </div>

          {/* 2-column grid on mobile, 4-column on desktop */}
          <ol
            className="kcard-grid list-none p-0"
            style={{ margin: '36px 0 0' }}
          >
            <li className="kcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="disp" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>1</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4C4BA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                  <path d="M11 18.5h2" />
                </svg>
              </div>
              <h3 className="disp" style={{ margin: '2px 0 0', fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, letterSpacing: '-.02em' }}>Create account</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.4, color: '#B4C4BA' }}>Sign up with your mobile and confirm OTP.</p>
              <div className="kbar" role="img" aria-label="Step 1 of 8"><i style={{ width: '12.5%' }} /></div>
            </li>

            <li className="kcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="disp" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>2</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4C4BA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6" />
                </svg>
              </div>
              <h3 className="disp" style={{ margin: '2px 0 0', fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, letterSpacing: '-.02em' }}>Personal info</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.4, color: '#B4C4BA' }}>Name, date of birth and current address.</p>
              <div className="kbar" role="img" aria-label="Step 2 of 8"><i style={{ width: '25%' }} /></div>
            </li>

            <li className="kcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="disp" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>3</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4C4BA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2.5" />
                  <circle cx="9" cy="11" r="2.2" />
                  <path d="M5.8 16c.5-1.7 1.8-2.5 3.2-2.5s2.7.8 3.2 2.5M14.5 10h4M14.5 13h3" />
                </svg>
              </div>
              <h3 className="disp" style={{ margin: '2px 0 0', fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, letterSpacing: '-.02em' }}>Identity proof</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.4, color: '#B4C4BA' }}>Upload a government ID for verification.</p>
              <div className="kbar" role="img" aria-label="Step 3 of 8"><i style={{ width: '37.5%' }} /></div>
            </li>

            <li className="kcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="disp" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>4</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4C4BA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M7 10h6M7 14h4M16 10.5v3" />
                </svg>
              </div>
              <h3 className="disp" style={{ margin: '2px 0 0', fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, letterSpacing: '-.02em' }}>Driving licence</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.4, color: '#B4C4BA' }}>Valid licence for your vehicle category.</p>
              <div className="kbar" role="img" aria-label="Step 4 of 8"><i style={{ width: '50%' }} /></div>
            </li>

            <li className="kcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="disp" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>5</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4C4BA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 15l1.7-5.2A2 2 0 0 1 6.6 8.4h10.8a2 2 0 0 1 1.9 1.4L21 15v3H3z" />
                  <circle cx="7.5" cy="18" r="1.8" />
                  <circle cx="16.5" cy="18" r="1.8" />
                </svg>
              </div>
              <h3 className="disp" style={{ margin: '2px 0 0', fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, letterSpacing: '-.02em' }}>Vehicle details</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.4, color: '#B4C4BA' }}>Type, number and registration certificate.</p>
              <div className="kbar" role="img" aria-label="Step 5 of 8"><i style={{ width: '62.5%' }} /></div>
            </li>

            <li className="kcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="disp" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>6</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4C4BA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
                  <path d="M8.5 12l2.5 2.5L15.5 10" />
                </svg>
              </div>
              <h3 className="disp" style={{ margin: '2px 0 0', fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, letterSpacing: '-.02em' }}>Insurance & permits</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.4, color: '#B4C4BA' }}>Valid vehicle insurance and required permit.</p>
              <div className="kbar" role="img" aria-label="Step 6 of 8"><i style={{ width: '75%' }} /></div>
            </li>

            <li className="kcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="disp" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>7</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4C4BA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z" />
                  <circle cx="12" cy="13" r="3.5" />
                </svg>
              </div>
              <h3 className="disp" style={{ margin: '2px 0 0', fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, letterSpacing: '-.02em' }}>Selfie check</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.4, color: '#B4C4BA' }}>Quick live selfie to match your ID.</p>
              <div className="kbar" role="img" aria-label="Step 7 of 8"><i style={{ width: '87.5%' }} /></div>
            </li>

            <li className="kcard">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="disp" style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800 }}>8</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B4C4BA" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="6" width="18" height="14" rx="2.5" />
                  <path d="M3 10h18M16.5 15h1.5" />
                </svg>
              </div>
              <h3 className="disp" style={{ margin: '2px 0 0', fontSize: 'clamp(15px, 2.2vw, 21px)', fontWeight: 700, letterSpacing: '-.02em' }}>Payout setup</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 14px)', lineHeight: 1.4, color: '#B4C4BA' }}>Bank account or UPI to receive earnings.</p>
              <div className="kbar" role="img" aria-label="Step 8 of 8"><i style={{ width: '100%' }} /></div>
            </li>
          </ol>

          <p style={{ margin: '20px 0 0', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', lineHeight: 1.45, color: '#B4C4BA' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: 'none', marginTop: '2px' }}>
              <circle cx="12" cy="12" r="9.5" />
              <path d="M8 12.5l3 3 5-6" />
            </svg>
            After step 8, our team reviews your documents. You will be notified as soon as your account is approved.
          </p>
        </div>
      </section>

      {/* ================= SAFETY (HIGHLIGHTING 1-CLICK RIDE SHARING) ================= */}
      <section id="safety" style={{ padding: 'clamp(36px, 6vw, 60px) 20px clamp(48px, 8vw, 100px)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(360px,100%),1fr))', gap: '32px', alignItems: 'start' }}>
          <div>
            <p className="fl" style={{ margin: 0 }}>Safety and trust</p>
            <h2
              className="disp"
              style={{
                margin: '12px 0 0',
                fontWeight: 800,
                fontSize: 'clamp(30px, 4.5vw, 60px)',
                lineHeight: 1,
                letterSpacing: '-.04em',
                textWrap: 'balance',
              }}
            >
              Easy should also mean{' '}
              <span style={{ background: 'linear-gradient(transparent 62%,var(--lime) 62%,var(--lime) 92%,transparent 92%)', padding: '0 6px', margin: '0 -6px' }}>
                safe.
              </span>
            </h2>
            <p style={{ margin: '14px 0 0', maxWidth: '440px', fontSize: 'clamp(14px, 2.2vw, 17px)', lineHeight: 1.5, color: 'var(--muted)' }}>
              Every ride is built so you know what is happening before, during and after the trip. Share your trip live with family in a single click.
            </p>
            <div style={{ marginTop: '22px' }}>
              <Link
                href="/safety"
                className="btn btn-ink"
                style={{ minHeight: '46px', padding: '0 22px', fontSize: '14px', gap: '8px' }}
              >
                Explore Safety & 1-Click Sharing
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--lime)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <div className="fcard">
              <span style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1712" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="18" cy="5" r="2.6" />
                  <circle cx="6" cy="12" r="2.6" />
                  <circle cx="18" cy="19" r="2.6" />
                  <path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4" />
                </svg>
              </span>
              <h3 className="disp" style={{ margin: '4px 0 0', fontSize: 'clamp(16px, 2.2vw, 22px)', fontWeight: 700, letterSpacing: '-.02em' }}>1-Click Share</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 15px)', lineHeight: 1.45, color: 'var(--muted)' }}>Share live location & trip details with family in a single click.</p>
            </div>
            <div className="fcard">
              <span style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1712" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6" />
                </svg>
              </span>
              <h3 className="disp" style={{ margin: '4px 0 0', fontSize: 'clamp(16px, 2.2vw, 22px)', fontWeight: 700, letterSpacing: '-.02em' }}>Know your ride</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 15px)', lineHeight: 1.45, color: 'var(--muted)' }}>Driver and vehicle details shown beforehand.</p>
            </div>
            <div className="fcard">
              <span style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1712" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 4h12M6 20h12M8 4v3a4 4 0 0 0 8 0V4M8 20v-3a4 4 0 0 1 8 0v3" />
                </svg>
              </span>
              <h3 className="disp" style={{ margin: '4px 0 0', fontSize: 'clamp(16px, 2.2vw, 22px)', fontWeight: 700, letterSpacing: '-.02em' }}>Upfront fares</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 15px)', lineHeight: 1.45, color: 'var(--muted)' }}>See the transparent fare before booking, zero surprises.</p>
            </div>
            <div className="fcard">
              <span style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'var(--lime)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1712" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" />
                  <circle cx="12" cy="10" r="2.6" />
                </svg>
              </span>
              <h3 className="disp" style={{ margin: '4px 0 0', fontSize: 'clamp(16px, 2.2vw, 22px)', fontWeight: 700, letterSpacing: '-.02em' }}>Live tracking</h3>
              <p style={{ margin: 0, fontSize: 'clamp(12px, 1.8vw, 15px)', lineHeight: 1.45, color: 'var(--muted)' }}>Watch your ride move street by street in real time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section style={{ padding: '0 20px clamp(40px, 6vw, 90px)' }}>
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <h2 className="disp" style={{ margin: '0 0 24px', textAlign: 'center', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 54px)', letterSpacing: '-.04em' }}>
            Good to know
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <details open>
              <summary>
                How do I book a ride?
                <svg className="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p style={{ margin: '0 0 18px', fontSize: '15px', lineHeight: 1.55, color: 'var(--muted)' }}>
                Enter your pickup and drop, choose a bike, auto, car, EV, loader or traveller, and confirm. You can follow your ride on the map as it arrives.
              </p>
            </details>
            <details>
              <summary>
                Can I share my live ride details with family?
                <svg className="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p style={{ margin: '0 0 18px', fontSize: '15px', lineHeight: 1.55, color: 'var(--muted)' }}>
                Yes! With our 1-Click Family Share feature on our Safety page, you can share a live tracking link with anyone via WhatsApp or SMS. They don't need any app to follow you in real time.
              </p>
            </details>
            <details>
              <summary>
                Which ride should I choose?
                <svg className="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p style={{ margin: '0 0 18px', fontSize: '15px', lineHeight: 1.55, color: 'var(--muted)' }}>
                Bikes and autos suit quick solo trips, cars and EVs suit comfort and daily commutes, while loaders handle cargo and travellers comfortably accommodate families and groups.
              </p>
            </details>
            <details>
              <summary>
                Can I see the fare first?
                <svg className="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p style={{ margin: '0 0 18px', fontSize: '15px', lineHeight: 1.55, color: 'var(--muted)' }}>
                Yes. The transparent fare for each ride mode is calculated and displayed upfront before you confirm.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section style={{ padding: '0 16px clamp(40px, 6vw, 80px)' }}>
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            boxSizing: 'border-box',
            background: 'var(--lime)',
            borderRadius: 'clamp(24px, 5vw, 40px)',
            padding: 'clamp(30px, 6vw, 80px) clamp(18px, 4vw, 70px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <h2
            className="disp"
            style={{
              margin: 0,
              maxWidth: '820px',
              fontWeight: 800,
              fontSize: 'clamp(32px, 6vw, 84px)',
              lineHeight: .95,
              letterSpacing: '-.05em',
              textWrap: 'balance',
            }}
          >
            Your next ride is a few clicks away.
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {userData?.role === 'rider' ? (
              <button
                type="button"
                onClick={() => router.push('/rider/dashboard')}
                className="btn btn-ink"
                style={{ minHeight: '52px', padding: '0 28px', fontSize: '16px' }}
              >
                Go to Driver Dashboard
              </button>
            ) : userData?.role === 'admin' ? (
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="btn btn-ink"
                style={{ minHeight: '52px', padding: '0 28px', fontSize: '16px' }}
              >
                Go to Admin Dashboard
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBookRide}
                  className="btn btn-ink"
                  style={{ minHeight: '52px', padding: '0 28px', fontSize: '16px' }}
                >
                  Book a ride
                </button>
                {(!userData || userData.role === 'user') && (
                  <button
                    type="button"
                    onClick={handleBecomeRider}
                    className="btn"
                    style={{ minHeight: '52px', padding: '0 28px', fontSize: '16px', background: 'transparent', border: '2px solid var(--ink)', color: 'var(--ink)' }}
                  >
                    Become a rider
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="login" style={{ background: 'var(--ink)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* road with every ride type driving past */}
        <div aria-hidden="true" style={{ position: 'relative', height: '64px', borderBottom: '1px solid rgba(255,255,255,.12)', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '2px', background: 'repeating-linear-gradient(90deg,rgba(201,242,60,.55) 0 18px,transparent 18px 38px)' }} />
          <svg className="roll" width="60" height="36" viewBox="-24 -14 48 28" style={{ top: 'calc(50% - 18px)', animationDuration: '17s', animationDelay: '-2s' }}><use href="#v-bike" /></svg>
          <svg className="roll" width="60" height="36" viewBox="-24 -14 48 28" style={{ top: 'calc(50% - 18px)', animationDuration: '21s', animationDelay: '-14s' }}><use href="#v-auto" /></svg>
          <svg className="roll" width="60" height="36" viewBox="-24 -14 48 28" style={{ top: 'calc(50% - 18px)', animationDuration: '23s', animationDelay: '-19s' }}><use href="#v-car" /></svg>
          <svg className="roll" width="60" height="36" viewBox="-24 -14 48 28" style={{ top: 'calc(50% - 18px)', animationDuration: '20s', animationDelay: '-11s' }}><use href="#v-ev" /></svg>
          <svg className="roll" width="60" height="36" viewBox="-24 -14 48 28" style={{ top: 'calc(50% - 18px)', animationDuration: '25s', animationDelay: '-6s' }}><use href="#v-loader" /></svg>
          <svg className="roll" width="60" height="36" viewBox="-24 -14 48 28" style={{ top: 'calc(50% - 18px)', animationDuration: '27s', animationDelay: '-16s' }}><use href="#v-traveller" /></svg>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(40px, 6vw, 64px) 20px 0' }}>
          {/* footer top: brand + rider promo */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px 48px', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 300px', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
                  <circle cx="16" cy="16" r="15" fill="#C9F23C" />
                  <circle cx="16" cy="16" r="4.2" fill="#0E1712" />
                  <path d="M16 4.5v7M16 20.5v7M4.5 16h7M20.5 16h7" stroke="#0E1712" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <span className="disp" style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-.035em' }}>Easy Wheels</span>
              </div>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5, color: '#B4C4BA' }}>
                Bikes, autos, cars, EVs, loaders and travellers. Rides made easy, on every street of the city.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <a className="soc" href="#" aria-label="Instagram" style={{ width: '38px', height: '38px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
                  </svg>
                </a>
                <a className="soc" href="#" aria-label="X" style={{ width: '38px', height: '38px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 4l16 16M20 4L4 20" />
                  </svg>
                </a>
                <a className="soc" href="#" aria-label="LinkedIn" style={{ width: '38px', height: '38px' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 10v9M6 6.2v.1M11 19v-9M11 13.5c0-2 1.3-3.5 3.3-3.5S17.5 11.3 17.5 13.5V19" />
                  </svg>
                </a>
                <a className="soc" href="#" aria-label="YouTube" style={{ width: '38px', height: '38px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                    <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
                  </svg>
                </a>
              </div>
            </div>

            <div style={{ flex: '1 1 360px', maxWidth: '520px', boxSizing: 'border-box', padding: 'clamp(20px, 4vw, 26px)', borderRadius: '24px', background: 'var(--lime)', color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span className="fl" style={{ color: '#2E4A1E' }}>Drive with us</span>
              <h3 className="disp" style={{ margin: 0, fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.035em' }}>
                Own a bike, auto, car, EV, loader or traveller?
              </h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.45, color: '#1E3416' }}>
                Become a rider in 8 simple steps. Verification is fully online.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                {userData?.role === 'rider' ? (
                  <button
                    type="button"
                    onClick={() => router.push('/rider/dashboard')}
                    className="btn btn-ink"
                    style={{ minHeight: '44px', padding: '0 20px', fontSize: '14px' }}
                  >
                    Open Driver Dashboard
                  </button>
                ) : userData?.role === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => router.push('/admin/dashboard')}
                    className="btn btn-ink"
                    style={{ minHeight: '44px', padding: '0 20px', fontSize: '14px' }}
                  >
                    Open Admin Dashboard
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleBecomeRider}
                      className="btn btn-ink"
                      style={{ minHeight: '44px', padding: '0 20px', fontSize: '14px' }}
                    >
                      Become a rider
                    </button>
                    {!userData && (
                      <button
                        type="button"
                        onClick={() => setAuthOpen(true)}
                        className="btn"
                        style={{ minHeight: '44px', padding: '0 20px', fontSize: '14px', background: 'transparent', border: '2px solid var(--ink)', color: 'var(--ink)' }}
                      >
                        Login
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 2-column grid on mobile, 4-column on desktop */}
          <nav
            aria-label="Footer"
            className="footer-nav-grid pt-8 md:pt-11 border-t border-white/10 mt-8 md:mt-14"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span className="fl" style={{ color: '#7F9287', marginBottom: '6px' }}>Rides</span>
              {VEHICLE_MODES.map((m) => (
                <a
                  key={m.key}
                  className="flink"
                  href="#rides"
                  onClick={() => setSelectedMode(m.key)}
                >
                  {m.label}
                </a>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span className="fl" style={{ color: '#7F9287', marginBottom: '6px' }}>Company</span>
              <Link className="flink" href="/">Home</Link>
              <a className="flink" href="#rides">Fleet</a>
              <Link className="flink" href="/rider/onboarding/vehicle">Become a rider</Link>
              <Link className="flink" href="/safety">Safety</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span className="fl" style={{ color: '#7F9287', marginBottom: '6px' }}>Support</span>
              <a className="flink" href="#">Help centre</a>
              <a className="flink" href="#">Contact us</a>
              <a className="flink" href="#">FAQs</a>
              <a className="flink" href="#">Report issue</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span className="fl" style={{ color: '#7F9287', marginBottom: '6px' }}>Legal</span>
              <a className="flink" href="#">Terms & conditions</a>
              <a className="flink" href="#">Privacy policy</a>
              <a className="flink" href="#">Refund policy</a>
              <a className="flink" href="#">Cookie policy</a>
            </div>
          </nav>

          {/* big outlined wordmark */}
          <div
            aria-hidden="true"
            className="disp"
            style={{
              marginTop: '32px',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              fontSize: 'clamp(44px, 13vw, 190px)',
              fontWeight: 800,
              letterSpacing: '-.06em',
              lineHeight: .82,
              color: 'transparent',
              WebkitTextStroke: '1.2px rgba(201,242,60,.32)',
            }}
          >
            EASY WHEELS
          </div>

          <div style={{ marginTop: '28px', padding: '18px 0 28px', borderTop: '1px solid rgba(255,255,255,.12)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px 20px', fontSize: '13px', color: '#7F9287' }}>
            <span>© {new Date().getFullYear()} Easy Wheels. All rights reserved.</span>
            <span>Easy rides, every street.</span>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Style overrides for responsive media queries */}
      <style jsx global>{`
        @media (max-width: 900px) {
          #mobile-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </div>
  )
}

export default PublicHome
