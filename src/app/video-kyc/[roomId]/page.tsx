'use client'
import React, { useEffect, useRef, useState } from 'react'
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import {
    CheckCircle2, Mic, MicOff, PhoneOff,
    Video, VideoOff, XCircle, Shield, Wifi,
    AlertTriangle, Loader2, User
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

// ── Pre-flight check chip ─────────────────────────────────────
const CheckItem = ({ label, ok }: { label: string; ok: boolean }) => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all
        ${ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
        {ok
            ? <CheckCircle2 size={12} className='text-emerald-400 shrink-0' />
            : <div className='w-3 h-3 rounded-full border-2 border-zinc-600 shrink-0' />
        }
        {label}
    </div>
)

// ── Approve confirm modal ─────────────────────────────────────
const ApproveModal = ({ open, onClose, onConfirm, loading }: {
    open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean
}) => (
    <AnimatePresence>
        {open && (
            <>
                <motion.div
                    className='fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm'
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                />
                <div className='fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none'>
                    <motion.div
                        initial={{ scale: 0.88, opacity: 0, y: 16 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.88, opacity: 0, y: 16 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                        className='bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-7 pointer-events-auto'
                    >
                        {/* Icon */}
                        <div className='w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-5'>
                            <CheckCircle2 size={22} className='text-emerald-500' strokeWidth={1.8} />
                        </div>

                        <h2 className='text-lg font-black text-white tracking-tight'>Approve Video KYC?</h2>
                        <p className='text-sm text-zinc-400 mt-2 leading-relaxed'>
                            You are confirming that the rider's identity has been verified successfully during this call.
                        </p>

                        {/* Summary */}
                        <div className='mt-5 p-4 rounded-xl bg-emerald-500/8 border border-emerald-500/15 space-y-2'>
                            {['Identity documents verified', 'Face matched with Aadhaar', 'Live person confirmed'].map(item => (
                                <div key={item} className='flex items-center gap-2'>
                                    <CheckCircle2 size={12} className='text-emerald-500 shrink-0' />
                                    <span className='text-xs font-semibold text-emerald-400'>{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className='flex items-center gap-3 mt-6'>
                            <button
                                onClick={onClose}
                                className='flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-zinc-400 hover:bg-white/5 transition-all'
                            >
                                Cancel
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={onConfirm}
                                disabled={loading}
                                className='flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-60'
                            >
                                {loading
                                    ? <Loader2 size={14} className='animate-spin' />
                                    : <CheckCircle2 size={14} />
                                }
                                Confirm Approval
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </>
        )}
    </AnimatePresence>
)

// ── Reject modal with reason ──────────────────────────────────
const RejectModal = ({ open, onClose, onConfirm, loading }: {
    open: boolean; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean
}) => {
    const [reason, setReason] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (open) {
            setReason('')
            setTimeout(() => textareaRef.current?.focus(), 120)
        }
    }, [open])

    const canSubmit = reason.trim().length >= 10

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className='fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm'
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className='fixed inset-0 z-[1001] flex items-center justify-center p-4 pointer-events-none'>
                        <motion.div
                            initial={{ scale: 0.88, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 16 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className='bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-7 pointer-events-auto'
                        >
                            {/* Icon */}
                            <div className='w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mb-5'>
                                <XCircle size={22} className='text-red-500' strokeWidth={1.8} />
                            </div>

                            <h2 className='text-lg font-black text-white tracking-tight'>Reject Video KYC?</h2>
                            <p className='text-sm text-zinc-400 mt-2 leading-relaxed'>
                                Provide a clear reason. The rider will be notified and can reapply after making corrections.
                            </p>

                            {/* Reason textarea */}
                            <div className='mt-5'>
                                <label className='text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-500 block mb-2'>
                                    Rejection Reason <span className='text-red-500'>*</span>
                                </label>
                                <textarea
                                    ref={textareaRef}
                                    rows={4}
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder='e.g. Face did not match Aadhaar photo, or documents were unclear during the call...'
                                    className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/40 focus:bg-white/8 transition-all resize-none leading-relaxed'
                                />
                                <div className='flex items-center justify-between mt-1.5'>
                                    {!canSubmit && reason.trim().length > 0 ? (
                                        <p className='text-[10px] text-red-500 font-medium'>Minimum 10 characters</p>
                                    ) : <span />}
                                    <p className='text-[10px] text-zinc-600 ml-auto'>{reason.trim().length} chars</p>
                                </div>
                            </div>

                            <div className='flex items-center gap-3 mt-6'>
                                <button
                                    onClick={onClose}
                                    className='flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold text-zinc-400 hover:bg-white/5 transition-all'
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => canSubmit && onConfirm(reason.trim())}
                                    disabled={!canSubmit || loading}
                                    className='flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed'
                                >
                                    {loading
                                        ? <Loader2 size={14} className='animate-spin' />
                                        : <XCircle size={14} />
                                    }
                                    Confirm Rejection
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

// ── Success toast ─────────────────────────────────────────────
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold shadow-2xl border
            ${type === 'success'
                ? 'bg-emerald-950 border-emerald-500/30 text-emerald-400'
                : 'bg-red-950 border-red-500/30 text-red-400'}`}
    >
        {type === 'success'
            ? <CheckCircle2 size={15} className='text-emerald-500' />
            : <AlertTriangle size={15} className='text-red-500' />
        }
        {message}
    </motion.div>
)

// ── Page ─────────────────────────────────────────────────────
const page = () => {
    const { userData } = useSelector((state: RootState) => state.user)
    const { roomId } = useParams()
    const router = useRouter()

    const [joined, setJoined] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isMicOn, setIsMicOn] = useState(true)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [camReady, setCamReady] = useState(false)
    const [micReady, setMicReady] = useState(false)
    const [permError, setPermError] = useState('')
    const [loginError, setLoginError] = useState('')

    // Admin modal state
    const [approveOpen, setApproveOpen] = useState(false)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [aLoading, setALoading] = useState(false)
    const [rLoading, setRLoading] = useState(false)
    const [actionError, setActionError] = useState('')
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const previewRef = useRef<HTMLVideoElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const joinTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const isAdmin = userData?.role === 'admin'

    // Show toast then auto-hide
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3500)
    }

    // ── Camera / mic preview ──────────────────────────────────
    useEffect(() => {
        if (joined) return
        let localStream: MediaStream
        const init = async () => {
            try {
                localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                setStream(localStream)
                setCamReady(true)
                setMicReady(true)
                if (previewRef.current) previewRef.current.srcObject = localStream
            } catch (err: any) {
                setPermError('Camera or microphone access was denied. Please allow access and refresh.')
            }
        }
        init()
        return () => {
            localStream?.getTracks().forEach(t => t.stop())
            if (joinTimeoutRef.current) clearTimeout(joinTimeoutRef.current)
        }
    }, [])

    const toggleCamera = () => {
        if (!stream) return
        const enabled = !isCameraOn
        stream.getVideoTracks().forEach(t => { t.enabled = enabled })
        setIsCameraOn(enabled)
    }

    const toggleMic = () => {
        if (!stream) return
        const enabled = !isMicOn
        stream.getAudioTracks().forEach(t => { t.enabled = enabled })
        setIsMicOn(enabled)
    }

    const startCall = async () => {
        if (!containerRef.current) return
        setLoading(true)
        setLoginError('')
        try {
            stream?.getTracks().forEach(t => t.stop())
            const appId = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID)
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!
            if (!appId || !serverSecret) throw new Error('Missing Zego configuration.')

            const displayName = isAdmin ? 'Admin' : `${userData?.name} (${userData?.email})`
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appId, serverSecret, roomId?.toString()!, `user_${userData?._id}`, displayName
            )
            const zp = ZegoUIKitPrebuilt.create(kitToken)

            joinTimeoutRef.current = setTimeout(() => {
                setLoading(false)
                setLoginError('Connection timed out. Please check your credentials and try again.')
            }, 12000)

            zp.joinRoom({
                container: containerRef.current,
                scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
                showPreJoinView: false,
                onJoinRoom: () => {
                    if (joinTimeoutRef.current) clearTimeout(joinTimeoutRef.current)
                    setJoined(true)
                    setLoading(false)
                },
                onLeaveRoom: () => setJoined(false),
            })
        } catch (err: any) {
            setLoginError(err.message || 'Failed to initialize the call.')
            setLoading(false)
            if (joinTimeoutRef.current) clearTimeout(joinTimeoutRef.current)
        }
    }

    // ── Admin: approve KYC ────────────────────────────────────
    const handleApprove = async () => {
        try {
            setALoading(true)
            setActionError('')
            await axios.post('/api/admin/video-kyc/complete', { roomId, action: 'approved' })
            setApproveOpen(false)
            showToast('KYC approved successfully', 'success')
            setTimeout(() => router.push('/admin/dashboard'), 2000)
        } catch (err: any) {
            setActionError(err?.response?.data?.message ?? 'Approval failed. Please try again.')
        } finally {
            setALoading(false)
        }
    }

    // ── Admin: reject KYC ─────────────────────────────────────
    const handleReject = async (reason: string) => {
        try {
            setRLoading(true)
            setActionError('')
            await axios.post('/api/admin/video-kyc/complete', { roomId, action: 'rejected', reason: reason })
            setRejectOpen(false)
            showToast('KYC rejected and rider notified', 'error')
            setTimeout(() => router.push('/'), 2000)
        } catch (err: any) {
            setActionError(err?.response?.data?.message ?? 'Rejection failed. Please try again.')
        } finally {
            setRLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#0a0a0a] text-white flex flex-col'>

            {/* ── Top bar ── */}
            <div className='shrink-0 px-6 py-3.5 border-b border-white/8 flex items-center justify-between gap-4 bg-black/40 backdrop-blur-sm'>
                <div className='flex items-center gap-4'>
                    <Image src="/navLogos.png" alt="Easy Wheels" width={72} height={58} priority className='brightness-0 invert opacity-90' />
                    <div className='h-5 w-px bg-white/10' />
                    <div className='flex items-center gap-2'>
                        <div className={`w-1.5 h-1.5 rounded-full ${joined ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                        <span className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400'>
                            {isAdmin ? 'Admin Verification' : 'Rider Video KYC'}
                        </span>
                    </div>
                </div>

                {/* Actions — only visible during call */}
                <AnimatePresence>
                    {joined && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className='flex items-center gap-2'
                        >
                            {isAdmin && (
                                <>
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => { setActionError(''); setApproveOpen(true) }}
                                        className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-black transition-all'
                                    >
                                        <CheckCircle2 size={13} /> Approve KYC
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => { setActionError(''); setRejectOpen(true) }}
                                        className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black transition-all'
                                    >
                                        <XCircle size={13} /> Reject
                                    </motion.button>
                                    <div className='w-px h-5 bg-white/10' />
                                </>
                            )}
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={() => setJoined(false)}
                                className='flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-black transition-all'
                            >
                                <PhoneOff size={13} /> End Call
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action error (below top bar, not in modal) */}
            <AnimatePresence>
                {actionError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className='px-6 py-3 bg-red-950 border-b border-red-500/20 flex items-center gap-2 text-xs text-red-400 font-semibold'
                    >
                        <AlertTriangle size={13} className='shrink-0' />
                        {actionError}
                        <button onClick={() => setActionError('')} className='ml-auto text-red-500 hover:text-red-300 transition-colors'>
                            <XCircle size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main ── */}
            <div className='flex-1 relative'>

                {/* Zego container */}
                <div
                    ref={containerRef}
                    className={`absolute inset-0 transition-opacity duration-300 ${joined ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                />

                {/* Pre-join screen */}
                <AnimatePresence>
                    {!joined && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}
                            className='absolute inset-0 flex items-center justify-center px-4 py-10'
                        >
                            <div className='w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start'>

                                {/* Left: camera preview */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    className='space-y-4'
                                >
                                    <div className='relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-zinc-900'>
                                        <video ref={previewRef} autoPlay playsInline muted className='w-full h-full object-cover' />
                                        {!isCameraOn && (
                                            <div className='absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center gap-3'>
                                                <div className='w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center'>
                                                    <User size={28} className='text-zinc-600' />
                                                </div>
                                                <p className='text-xs text-zinc-500'>Camera is off</p>
                                            </div>
                                        )}
                                        {permError && (
                                            <div className='absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-3 px-6 text-center'>
                                                <AlertTriangle size={24} className='text-amber-500' />
                                                <p className='text-xs text-zinc-400 leading-relaxed'>{permError}</p>
                                            </div>
                                        )}
                                        <div className='absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10'>
                                            <div className='w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse' />
                                            <span className='text-[9px] font-black uppercase tracking-[0.15em] text-white/70'>Preview</span>
                                        </div>
                                        <div className='absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-3'>
                                            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleCamera}
                                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${isCameraOn ? 'bg-white text-black border-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                                {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                                            </motion.button>
                                            <motion.button whileTap={{ scale: 0.9 }} onClick={toggleMic}
                                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all border ${isMicOn ? 'bg-white text-black border-white' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                                            </motion.button>
                                        </div>
                                    </div>
                                    <div className='flex gap-2 flex-wrap'>
                                        <CheckItem label='Camera' ok={camReady && isCameraOn} />
                                        <CheckItem label='Microphone' ok={micReady && isMicOn} />
                                        <CheckItem label='Connection' ok={camReady} />
                                    </div>
                                </motion.div>

                                {/* Right: info + join */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                                    className='space-y-7 lg:pt-2'
                                >
                                    <div>
                                        <div className='flex items-center gap-2 mb-3'>
                                            <div className='w-6 h-6 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center'>
                                                <Shield size={12} className='text-zinc-400' />
                                            </div>
                                            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500'>
                                                {isAdmin ? 'KYC Verification Session' : 'Identity Verification'}
                                            </span>
                                        </div>
                                        <h1 className='text-3xl sm:text-4xl font-black tracking-tight leading-tight'>
                                            {isAdmin ? 'Verify Rider\nIdentity' : 'Secure\nVideo KYC'}
                                        </h1>
                                        <p className='text-sm text-zinc-400 mt-3 leading-relaxed'>
                                            {isAdmin
                                                ? "Join the call to verify the rider's identity documents in real time."
                                                : 'A quick 5-minute call with our team. Keep your Aadhaar and documents nearby.'}
                                        </p>
                                    </div>

                                    <div className='space-y-2.5'>
                                        <p className='text-[9px] font-black uppercase tracking-[0.18em] text-zinc-600'>Before you join</p>
                                        {(isAdmin
                                            ? ["Rider's documents are uploaded", 'Admin panel is open', 'Stable connection']
                                            : ['Aadhaar card is nearby', "You're in a well-lit space", 'Stable internet connection']
                                        ).map(item => (
                                            <div key={item} className='flex items-center gap-2.5'>
                                                <div className='w-4 h-4 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0'>
                                                    <CheckCircle2 size={9} className='text-emerald-500' />
                                                </div>
                                                <span className='text-xs text-zinc-400'>{item}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {roomId && (
                                        <div className='flex items-center gap-3 px-4 py-3 rounded-xl bg-white/4 border border-white/8'>
                                            <Wifi size={13} className='text-zinc-500 shrink-0' />
                                            <div className='min-w-0'>
                                                <p className='text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600'>Room</p>
                                                <p className='text-xs text-zinc-400 truncate font-mono'>{roomId}</p>
                                            </div>
                                        </div>
                                    )}

                                    {loginError && (
                                        <div className='p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 space-y-1 leading-relaxed'>
                                            <div className='flex items-center gap-1.5 font-bold text-red-300'>
                                                <AlertTriangle size={13} className='shrink-0' /> Call Connection Failed
                                            </div>
                                            <p>{loginError}</p>
                                        </div>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.975 }}
                                        onClick={startCall}
                                        disabled={loading || !!permError}
                                        className='w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-white text-black text-sm font-black tracking-tight transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100'
                                    >
                                        {loading
                                            ? <><Loader2 size={16} className='animate-spin' /> Connecting…</>
                                            : <><Video size={16} /> Join Secure Call</>
                                        }
                                    </motion.button>

                                    <p className='text-[10px] text-zinc-600 text-center leading-relaxed'>
                                        End-to-end encrypted · No recording without consent
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Modals ── */}
            <ApproveModal
                open={approveOpen}
                onClose={() => setApproveOpen(false)}
                onConfirm={handleApprove}
                loading={aLoading}
            />
            <RejectModal
                open={rejectOpen}
                onClose={() => setRejectOpen(false)}
                onConfirm={handleReject}
                loading={rLoading}
            />

            {/* ── Toast ── */}
            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} />}
            </AnimatePresence>
        </div>
    )
}

export default page