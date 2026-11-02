'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'
import { RootState, AppDispatch } from '@/redux/store'
import { setUserData } from '@/redux/userSlice'
import AuthModal from '@/components/AuthModal'

const SafetyPage = () => {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { userData } = useSelector((state: RootState) => state.user)

  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const familyContacts = [
    { id: 1, name: 'Mom (Shashi)', phone: '+91 98765 43210', relation: 'Mother', autoShare: true },
    { id: 2, name: 'Priya (Sister)', phone: '+91 91234 56789', relation: 'Sibling', autoShare: true },
    { id: 3, name: 'Dad (Ramesh)', phone: '+91 98111 22334', relation: 'Father', autoShare: true },
  ]

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

  const handleLogout = async () => {
    await signOut({ redirect: false })
    dispatch(setUserData(null))
    setProfileOpen(false)
    setMobileMenuOpen(false)
    router.refresh()
  }

  const getDashboardRoute = () => {
    if (userData?.role === 'rider') return '/rider/dashboard'
    if (userData?.role === 'admin') return '/admin/dashboard'
    return '/user/bookings'
  }

  const userInitial = userData?.name?.charAt(0)?.toUpperCase() || 'U'
  const canSeeRidesTab = !!userData && (userData.role === 'user' || userData.role === 'rider')
  const canSeeBecomeRiderTab = !!userData && userData.role === 'user'
  const getRidesRoute = () => (userData?.role === 'rider' ? '/rider/bookings' : '/user/bookings')

  return (
    <div id="ew" style={{ position: 'relative', background: 'var(--mist)', color: 'var(--ink)', fontFamily: "'Figtree', system-ui, sans-serif", overflowX: 'clip', minHeight: '100vh' }}>

      {/* SVG Sprite for Vehicle SVGs used in footer and animated banners */}
      <svg style={{ display: 'none' }} aria-hidden="true">
        <defs>
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
      </svg>

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
              <Link className="navlink" href={getRidesRoute()}>Rides</Link>
            )}

            {/* Become a rider tab: visible ONLY for regular users (hidden for rider and admin per req 2) */}
            {canSeeBecomeRiderTab && (
              <Link className="navlink" href="/rider/onboarding/vehicle">Become a rider</Link>
            )}

            {/* Active Safety Tab */}
            <Link
              className="navlink"
              href="/safety"
              style={{
                background: 'var(--ink)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)' }}></span>
              Safety
            </Link>
          </div>

          {/* User Auth / Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!userData ? (
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
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  aria-expanded={profileOpen}
                  aria-label="Account menu"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'var(--ink)',
                    color: 'var(--lime)',
                    border: '2px solid var(--lime)',
                    fontWeight: 800,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(14,23,18,.15)',
                  }}
                >
                  {userInitial}
                </button>

                {profileOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '52px',
                      width: '240px',
                      background: '#fff',
                      borderRadius: '20px',
                      padding: '12px',
                      boxShadow: '0 24px 60px rgba(14,23,18,.18)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid var(--line)' }}>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: '15px' }}>{userData.name || 'User'}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                        {userData.role} · {userData.email}
                      </p>
                    </div>

                    <Link
                      href={getDashboardRoute()}
                      onClick={() => setProfileOpen(false)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: 'var(--ink)',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: 'var(--mist)',
                      }}
                    >
                      Dashboard
                    </Link>

                    {/* Bookings link: visible for user and rider role; hidden for admin per req 2 */}
                    {userData.role !== 'admin' && (
                      <Link
                        href={userData.role === 'rider' ? '/rider/bookings' : '/user/bookings'}
                        onClick={() => setProfileOpen(false)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          color: 'var(--ink)',
                          fontSize: '14px',
                          fontWeight: 600,
                          background: 'var(--mist)',
                        }}
                      >
                        My Bookings
                      </Link>
                    )}

                    {/* Become a rider: visible ONLY for regular users (hidden for rider and admin per req 2) */}
                    {userData.role === 'user' && (
                      <Link
                        href="/rider/onboarding/vehicle"
                        onClick={() => setProfileOpen(false)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '12px',
                          textDecoration: 'none',
                          color: 'var(--ink)',
                          fontSize: '14px',
                          fontWeight: 600,
                          background: 'var(--mist)',
                        }}
                      >
                        Become a rider →
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: 0,
                        background: '#FEE2E2',
                        color: '#991B1B',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'left',
                        marginTop: '4px',
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="mob-only"
              id="mobile-toggle"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '1px solid var(--line)',
                background: '#fff',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="mob-only"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: 'rgba(14,23,18,.5)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            padding: '80px 20px 20px',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '18px', fontWeight: 700, textDecoration: 'none', color: 'var(--ink)' }}
            >
              Home
            </Link>

            {canSeeRidesTab && (
              <Link
                href={getRidesRoute()}
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '18px', fontWeight: 700, textDecoration: 'none', color: 'var(--ink)' }}
              >
                Rides
              </Link>
            )}

            {canSeeBecomeRiderTab && (
              <Link
                href="/rider/onboarding/vehicle"
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '18px', fontWeight: 700, textDecoration: 'none', color: 'var(--ink)' }}
              >
                Become a rider
              </Link>
            )}

            <Link
              href="/safety"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '18px', fontWeight: 700, textDecoration: 'none', color: 'var(--ink)' }}
            >
              Safety
            </Link>

            <div style={{ height: '1px', background: 'var(--line)', margin: '6px 0' }} />

            {!userData ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setAuthOpen(true)
                }}
                className="btn btn-ink"
                style={{ minHeight: '48px', fontSize: '15px' }}
              >
                Login
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                  Signed in as <strong>{userData.email}</strong> ({userData.role})
                </p>
                <Link
                  href={getDashboardRoute()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-lime"
                  style={{ minHeight: '46px', fontSize: '14px' }}
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn"
                  style={{ minHeight: '46px', background: '#FEE2E2', color: '#991B1B', border: 0, fontSize: '14px' }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= HERO SECTION ================= */}
      <section style={{ padding: 'clamp(90px, 12vw, 130px) 20px 40px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(460px, 100%), 1fr))', gap: '48px', alignItems: 'center' }}>
          
          {/* Left: Vision Copy (Clean, without dummy buttons) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              EASYWHEELS SHIELD · 1-CLICK LIVE RIDE SHARING
            </p>

            <h1
              className="disp"
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 'clamp(36px, 6vw, 76px)',
                lineHeight: 0.98,
                letterSpacing: '-.04em',
                textWrap: 'balance',
              }}
            >
              Your loved ones,{' '}
              <span style={{ background: 'linear-gradient(transparent 60%, var(--lime) 60%, var(--lime) 90%, transparent 90%)', padding: '0 6px', margin: '0 -6px' }}>
                one click away.
              </span>
            </h1>

            <p style={{ margin: 0, fontSize: 'clamp(15px, 2.2vw, 18px)', lineHeight: 1.55, color: 'var(--muted)', textWrap: 'pretty' }}>
              EasyWheels gives you complete peace of mind. Share your live GPS location, driver details, and arrival times directly with your family members in a single click — no app download required for them.
            </p>
          </div>

          {/* Right: Running Ride Illustration with Live Sharing to Family Contacts */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <svg
              viewBox="0 0 540 430"
              style={{ width: '100%', maxWidth: '520px', height: 'auto', overflow: 'visible' }}
              aria-label="Running ride illustration: Passenger in moving ride sharing live location with family via mobile"
              role="img"
            >
              <defs>
                <linearGradient id="shieldCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#15261E" />
                  <stop offset="100%" stopColor="#0B130F" />
                </linearGradient>
                <linearGradient id="headlightBeamGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFF8D0" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FFF8D0" stopOpacity="0" />
                </linearGradient>
                <filter id="svgSoftShadow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#0E1712" floodOpacity="0.22" />
                </filter>
              </defs>

              {/* Main Illustration Card Background */}
              <rect x="10" y="10" width="520" height="410" rx="30" fill="url(#shieldCardBg)" stroke="rgba(201,242,60,0.22)" strokeWidth="1.5" filter="url(#svgSoftShadow)" />

              {/* Radar Grid Circles radiating from vehicle */}
              <circle cx="270" cy="285" r="95" fill="none" stroke="rgba(201,242,60,0.08)" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="270" cy="285" r="165" fill="none" stroke="rgba(201,242,60,0.05)" strokeWidth="1" strokeDasharray="6 8" />

              {/* Live Signal Pulse Waves emitting from user mobile phone */}
              <circle cx="272" cy="272" r="14" fill="none" stroke="#C9F23C" strokeWidth="2.5" opacity="0.8">
                <animate attributeName="r" values="8;38" dur="2.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="272" cy="272" r="14" fill="none" stroke="#16A34A" strokeWidth="2" opacity="0.6">
                <animate attributeName="r" values="14;56" dur="2.2s" begin="0.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="2.2s" begin="0.7s" repeatCount="indefinite" />
              </circle>

              {/* Beaming signal curves from passenger phone to family contacts */}
              {/* Curve to Contact 1: Mom */}
              <path d="M272,272 Q200,200 135,135" fill="none" stroke="#C9F23C" strokeWidth="2.2" strokeDasharray="5 5" opacity="0.85">
                <animate attributeName="strokeDashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
              </path>

              {/* Curve to Contact 2: Dad */}
              <path d="M272,272 Q330,190 410,130" fill="none" stroke="#C9F23C" strokeWidth="2.2" strokeDasharray="5 5" opacity="0.85">
                <animate attributeName="strokeDashoffset" values="0;-20" dur="1.2s" repeatCount="indefinite" />
              </path>

              {/* Curve to Contact 3: Sister */}
              <path d="M272,272 Q290,235 315,218" fill="none" stroke="#C9F23C" strokeWidth="2.2" strokeDasharray="5 5" opacity="0.85">
                <animate attributeName="strokeDashoffset" values="0;-20" dur="1.1s" repeatCount="indefinite" />
              </path>

              {/* Top Bar Status Chip */}
              <g transform="translate(140, 32)">
                <rect width="260" height="32" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(201,242,60,0.4)" strokeWidth="1" />
                <circle cx="18" cy="16" r="5" fill="#C9F23C">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <text x="32" y="21" fontFamily="Figtree, sans-serif" fontSize="12" fontWeight="800" fill="#FFFFFF" letterSpacing="0.04em">
                  LIVE SHIELD · 1-CLICK SYNCED
                </text>
              </g>

              {/* Contact Node 1: Mom (Top Left) */}
              <g transform="translate(35, 80)">
                <rect width="180" height="56" rx="16" fill="#FFFFFF" stroke="#0E1712" strokeWidth="1" filter="url(#svgSoftShadow)" />
                <circle cx="28" cy="28" r="18" fill="#E8F8D0" />
                <g transform="translate(19, 19)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#16A34A" aria-hidden="true">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </g>
                <text x="56" y="24" fontFamily="Figtree, sans-serif" fontSize="13" fontWeight="800" fill="#0E1712">Mom</text>
                <text x="56" y="42" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="600" fill="#16A34A">Live Route Active</text>
                <circle cx="162" cy="20" r="4" fill="#16A34A">
                  <animate attributeName="r" values="3;6;3" dur="1.6s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Contact Node 2: Dad (Top Right) */}
              <g transform="translate(325, 75)">
                <rect width="180" height="56" rx="16" fill="#FFFFFF" stroke="#0E1712" strokeWidth="1" filter="url(#svgSoftShadow)" />
                <circle cx="28" cy="28" r="18" fill="#0E1712" />
                <g transform="translate(19, 19)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9F23C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </g>
                <text x="56" y="24" fontFamily="Figtree, sans-serif" fontSize="13" fontWeight="800" fill="#0E1712">Dad</text>
                <text x="56" y="42" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="600" fill="#56665D">ETA: 12 min · Safe</text>
              </g>

              {/* Contact Node 3: Sister (Middle Right - Wide Box with 55px Right Padding) */}
              <g transform="translate(315, 188)">
                <rect width="195" height="56" rx="16" fill="#FFFFFF" stroke="#0E1712" strokeWidth="1" filter="url(#svgSoftShadow)" />
                <circle cx="28" cy="28" r="18" fill="#E8F8D0" />
                <g transform="translate(19, 19)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </g>
                <text x="56" y="24" fontFamily="Figtree, sans-serif" fontSize="13" fontWeight="800" fill="#0E1712">Sister</text>
                <text x="56" y="42" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="600" fill="#16A34A">Live GPS Shared</text>
              </g>

              {/* Roadway & Speed Dashes */}
              <g transform="translate(30, 360)">
                <rect x="0" y="0" width="480" height="24" rx="12" fill="#1B2D23" />
                <line x1="0" y1="12" x2="480" y2="12" stroke="#C9F23C" strokeWidth="3" strokeDasharray="22 18" opacity="0.9">
                  <animate attributeName="strokeDashoffset" values="0;-80" dur="1.2s" repeatCount="indefinite" />
                </line>
              </g>

              {/* The Running Vehicle (Toyota Innova EV profile) */}
              <g transform="translate(160, 260)">
                <ellipse cx="110" cy="98" rx="105" ry="8" fill="#070C09" opacity="0.6" />
                <path d="M12,78 L28,48 Q40,32 75,28 L150,28 Q175,28 195,50 L212,65 Q220,72 220,82 L220,88 L5,88 L5,82 Q5,78 12,78 Z" fill="#0E1712" stroke="#24372C" strokeWidth="1.5" />
                <path d="M15,76 L216,76" stroke="#C9F23C" strokeWidth="2.5" strokeLinecap="round" />

                {/* Vehicle Cabin Windows */}
                <path d="M42,48 L75,34 L120,34 L120,72 L32,72 Z" fill="#2E4839" opacity="0.8" />
                <path d="M126,34 L165,34 L190,52 L198,72 L126,72 Z" fill="#2E4839" opacity="0.8" />

                {/* PASSENGER INSIDE CABIN SHARING RIDE */}
                <g transform="translate(72, 40)">
                  <circle cx="16" cy="10" r="7" fill="#C9F23C" />
                  <path d="M7,30 C7,22 12,18 16,18 C20,18 25,22 25,30 Z" fill="#EAEFE4" />
                  <path d="M22,26 L36,20" stroke="#EAEFE4" strokeWidth="3" strokeLinecap="round" />
                  <rect x="34" y="10" width="10" height="18" rx="2.5" fill="#0E1712" stroke="#C9F23C" strokeWidth="1.5" />
                  <rect x="35.5" y="12" width="7" height="12" rx="1" fill="#C9F23C">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.2s" repeatCount="indefinite" />
                  </rect>
                </g>

                {/* Driver Silhouette in Front */}
                <g transform="translate(142, 42)">
                  <circle cx="14" cy="9" r="6.5" fill="#56665D" />
                  <path d="M6,28 C6,21 10,18 14,18 C18,18 22,21 22,28 Z" fill="#3D4A3E" />
                  <line x1="24" y1="20" x2="28" y2="28" stroke="#0E1712" strokeWidth="2.5" strokeLinecap="round" />
                </g>

                {/* Headlights beam */}
                <polygon points="220,70 270,62 270,92 220,84" fill="url(#headlightBeamGlow)" opacity="0.4" />
                <circle cx="218" cy="77" r="4" fill="#FFF8D0" />
                <rect x="4" y="74" width="3.5" height="8" rx="1.5" fill="#EF4444" />

                {/* Front Wheel */}
                <g transform="translate(170, 88)">
                  <circle cx="0" cy="0" r="17" fill="#0E1712" stroke="#24372C" strokeWidth="2" />
                  <circle cx="0" cy="0" r="10" fill="#1B2D23" />
                  <circle cx="0" cy="0" r="4" fill="#C9F23C" />
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#C9F23C" strokeWidth="1.5">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.5s" repeatCount="indefinite" />
                  </line>
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#C9F23C" strokeWidth="1.5">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.5s" repeatCount="indefinite" />
                  </line>
                </g>

                {/* Rear Wheel */}
                <g transform="translate(52, 88)">
                  <circle cx="0" cy="0" r="17" fill="#0E1712" stroke="#24372C" strokeWidth="2" />
                  <circle cx="0" cy="0" r="10" fill="#1B2D23" />
                  <circle cx="0" cy="0" r="4" fill="#C9F23C" />
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#C9F23C" strokeWidth="1.5">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.5s" repeatCount="indefinite" />
                  </line>
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#C9F23C" strokeWidth="1.5">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.5s" repeatCount="indefinite" />
                  </line>
                </g>
              </g>

              {/* Floating Vehicle Info Pill */}
              <g transform="translate(25, 230)">
                <rect width="180" height="34" rx="12" fill="#0E1712" stroke="rgba(255,255,255,0.15)" strokeWidth="1" filter="url(#svgSoftShadow)" />
                <circle cx="16" cy="17" r="4.5" fill="#C9F23C" />
                <text x="28" y="21" fontFamily="Figtree, sans-serif" fontSize="11" fontWeight="800" fill="#FFFFFF">
                  Toyota Innova EV · DL 01
                </text>
              </g>
            </svg>
          </div>

        </div>
      </section>

      {/* ================= 1-CLICK RIDE SHARING SHOWCASE ================= */}
      <section id="demo-share" style={{ padding: '0 20px clamp(48px, 8vw, 100px)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          
          <div
            style={{
              background: 'var(--ink)',
              color: '#fff',
              borderRadius: 'clamp(26px, 5vw, 36px)',
              padding: 'clamp(24px, 5vw, 48px)',
              boxShadow: '0 30px 90px rgba(14,23,18,.25)',
              border: '1px solid rgba(201, 242, 60, 0.25)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))',
              gap: 'clamp(24px, 4vw, 48px)',
              alignItems: 'center',
            }}
          >
            {/* Left: Simulated Live Ride Card */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.12em', color: 'var(--lime)', textTransform: 'uppercase' }}>
                  Live Ride Simulator
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    background: 'rgba(22, 163, 74, 0.2)',
                    color: '#4ADE80',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ADE80' }}></span>
                  Active Trip
                </span>
              </div>

              {/* Ride Details Card */}
              <div
                style={{
                  marginTop: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '20px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Vehicle & Driver info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '14px',
                        background: 'var(--lime)',
                        color: 'var(--ink)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '18px',
                      }}
                    >
                      RS
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Rajesh Sharma</h4>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#A7B7AD' }}>
                        4.92 ★ · 1,420+ rides · Police Verified
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '3px 8px', background: '#24372C', color: 'var(--lime)', borderRadius: '6px', fontSize: '12px', fontWeight: 800 }}>
                      DL 01 AB 8924
                    </span>
                    <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#A7B7AD' }}>Toyota EV</p>
                  </div>
                </div>

                {/* Route visualization */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lime)' }}></span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>Pickup:</span>
                    <span style={{ color: '#CBD5E1' }}>Green Park Market, Block B</span>
                  </div>
                  <div style={{ width: '2px', height: '12px', background: 'rgba(255,255,255,0.2)', marginLeft: '3px' }}></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#EF4444' }}></span>
                    <span style={{ color: '#fff', fontWeight: 700 }}>Drop:</span>
                    <span style={{ color: '#CBD5E1' }}>Central Station, Platform 1 Exit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Vision & Trusted Family Network Controls */}
            <div>
              <h3 className="disp" style={{ margin: 0, fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, letterSpacing: '-.03em' }}>
                How 1-Click Sharing <span style={{ color: 'var(--lime)' }}>works.</span>
              </h3>
              <p style={{ margin: '12px 0 0', fontSize: '15px', lineHeight: 1.55, color: '#B4C4BA' }}>
                Before boarding or at any point during your journey, click the share button. Your family instantly receives a secure web link showing your live position on the city map.
              </p>

              {/* Trusted Network List */}
              <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#CBD5E1' }}>Your Trusted Contacts ({familyContacts.length})</span>
                </div>

                {familyContacts.map((contact) => (
                  <div
                    key={contact.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '14px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff' }}>{contact.name}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94A3B8' }}>{contact.relation} · {contact.phone}</p>
                    </div>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: '1px solid',
                        borderColor: contact.autoShare ? 'var(--lime)' : 'rgba(255,255,255,0.2)',
                        background: contact.autoShare ? 'rgba(201,242,60,0.15)' : 'transparent',
                        color: contact.autoShare ? 'var(--lime)' : '#94A3B8',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {contact.autoShare ? '✓ 1-Click Ready' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 3 Pillars of 1-Click Sharing */}
          <div
            style={{
              marginTop: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            <div
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--mist)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Real-Time GPS Tracking</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
                Your contacts can watch your trip progress on an active live map with real-time ETA and exact vehicle coordinates updated every 3 seconds.
              </p>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--mist)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>No App Needed For Family</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
                Your family doesn&apos;t need to download an app or register an account. The secure link opens instantly in any mobile or desktop web browser.
              </p>
            </div>

            <div
              style={{
                background: '#fff',
                border: '1px solid var(--line)',
                borderRadius: '24px',
                padding: '28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: 'var(--mist)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ink)',
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Instant SOS Integration</h4>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
                If you ever press SOS during a trip, your emergency contacts and our 24/7 Safety Command Centre receive an instant priority alert simultaneously.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ================= COMPREHENSIVE SAFETY PILLARS ================= */}
      <section style={{ padding: 'clamp(40px, 6vw, 80px) 20px', maxWidth: '1240px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 48px' }}>
          <p
            style={{
              margin: '0 0 10px',
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '999px',
              background: '#fff',
              border: '1px solid var(--line)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.06em',
            }}
          >
            Built-in protection
          </p>
          <h2 className="disp" style={{ margin: 0, fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-.035em' }}>
            Four pillars of EasyWheels safety.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Pillar 1 */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--lime)', background: 'var(--ink)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              01
            </span>
            <h3 style={{ margin: '18px 0 8px', fontSize: '18px', fontWeight: 800 }}>100% Verified Drivers</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Every driver undergoes complete background verification, police clearance, driving license inspection, and vehicle fitness certification before taking their first ride.
            </p>
          </div>

          {/* Pillar 2 */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--lime)', background: 'var(--ink)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              02
            </span>
            <h3 style={{ margin: '18px 0 8px', fontSize: '18px', fontWeight: 800 }}>24/7 Safety Command</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Our dedicated round-the-clock safety operations team monitors active rides for route deviations, unexpected stops, and sudden delays to ensure passenger well-being.
            </p>
          </div>

          {/* Pillar 3 */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--lime)', background: 'var(--ink)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              03
            </span>
            <h3 style={{ margin: '18px 0 8px', fontSize: '18px', fontWeight: 800 }}>End-to-End Privacy</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
              Your phone number and private contact details are never exposed to drivers. All communication is routed securely through encrypted in-app channels.
            </p>
          </div>

          {/* Pillar 4 */}
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', border: '1px solid var(--line)' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--lime)', background: 'var(--ink)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              04
            </span>
            <h3 style={{ margin: '18px 0 8px', fontSize: '18px', fontWeight: 800 }}>Instant Emergency SOS</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>
              One tap connects you directly to local police dispatch (112) while immediately transmitting live telemetry, vehicle license, and driver details to emergency responders.
            </p>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section style={{ padding: '0 20px clamp(48px, 8vw, 96px)', maxWidth: '1240px', margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--lime)',
            color: 'var(--ink)',
            borderRadius: 'clamp(24px, 4vw, 36px)',
            padding: 'clamp(32px, 6vw, 64px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div style={{ maxWidth: '620px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              Ride with total confidence
            </p>
            <h2 className="disp" style={{ margin: 0, fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 800, letterSpacing: '-.03em' }}>
              Peace of mind for you. Total reassurance for your family.
            </h2>
          </div>
          <div>
            <Link
              href="/"
              className="btn btn-ink"
              style={{ minHeight: '52px', padding: '0 28px', fontSize: '16px' }}
            >
              Book a Ride
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer id="login" style={{ background: 'var(--ink)', color: '#fff', position: 'relative', overflow: 'hidden', marginTop: '60px' }}>
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
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,.06)', fontSize: '12px', color: '#B4C4BA' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)' }} />
                  Live GPS
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,.06)', fontSize: '12px', color: '#B4C4BA' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)' }} />
                  Fixed fares
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: 'rgba(255,255,255,.06)', fontSize: '12px', color: '#B4C4BA' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--lime)' }} />
                  Verified drivers
                </span>
              </div>
            </div>

            {/* rider promo callout */}
            <div style={{ flex: '1 1 320px', maxWidth: '440px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lime)' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '.08em', color: 'var(--lime)', textTransform: 'uppercase' }}>Drive with us</span>
              </div>
              <h3 className="disp" style={{ margin: 0, fontSize: '22px', fontWeight: 800, lineHeight: 1.15 }}>
                Own a bike, auto, car, EV, loader or traveller?
              </h3>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.45, color: '#B4C4BA' }}>
                Onboard in 8 quick steps, start taking trips, and keep 100% of your tips with daily payouts.
              </p>
              <Link href="/rider/onboarding/vehicle" className="btn btn-lime" style={{ alignSelf: 'flex-start', minHeight: '44px', padding: '0 20px', fontSize: '14px' }}>
                Become a rider →
              </Link>
            </div>
          </div>

          {/* footer middle: link columns */}
          <div className="footer-nav-grid" style={{ margin: '48px 0 32px' }}>
            <div>
              <p style={{ margin: '0 0 14px', fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', color: 'var(--lime)', textTransform: 'uppercase' }}>Rides</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link href="/" className="flink">Bike</Link></li>
                <li><Link href="/" className="flink">Auto</Link></li>
                <li><Link href="/" className="flink">Car</Link></li>
                <li><Link href="/" className="flink">EV</Link></li>
                <li><Link href="/" className="flink">Loader</Link></li>
                <li><Link href="/" className="flink">Traveller</Link></li>
              </ul>
            </div>

            <div>
              <p style={{ margin: '0 0 14px', fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', color: 'var(--lime)', textTransform: 'uppercase' }}>Company</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link href="/" className="flink">Home</Link></li>
                <li><Link href="/#fleet" className="flink">Fleet</Link></li>
                <li><Link href="/rider/onboarding/vehicle" className="flink">Become a rider</Link></li>
                <li><Link href="/safety" className="flink" style={{ color: 'var(--lime)' }}>Safety</Link></li>
              </ul>
            </div>

            <div>
              <p style={{ margin: '0 0 14px', fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', color: 'var(--lime)', textTransform: 'uppercase' }}>Support</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link href="/#faq" className="flink">Help centre</Link></li>
                <li><a href="mailto:support@easywheels.com" className="flink">Contact us</a></li>
                <li><Link href="/#faq" className="flink">FAQs</Link></li>
                <li><a href="mailto:safety@easywheels.com" className="flink">Report an issue</a></li>
              </ul>
            </div>

            <div>
              <p style={{ margin: '0 0 14px', fontSize: '12px', fontWeight: 800, letterSpacing: '.1em', color: 'var(--lime)', textTransform: 'uppercase' }}>Legal</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><a href="#" className="flink">Terms of service</a></li>
                <li><a href="#" className="flink">Privacy policy</a></li>
                <li><a href="#" className="flink">Rider terms</a></li>
                <li><a href="#" className="flink">Safety standards</a></li>
              </ul>
            </div>
          </div>

          {/* footer bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '24px 0 36px', display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#7E9185' }}>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} Easy Wheels Technologies Pvt. Ltd. All rights reserved.
            </p>
            <p style={{ margin: 0 }}>
              Bikes · Autos · Cars · EVs · Loaders · Travellers · Every street.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}

export default SafetyPage
