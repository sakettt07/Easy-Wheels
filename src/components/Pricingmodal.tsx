'use client'
import { logger } from "@/lib/logger";
import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from 'motion/react'
import { IVehicle } from "@/models/vehicle.model"
import {
    ImagePlus, IndianRupee, X, CheckCircle2,
    Car, Loader2, Info, RefreshCw
} from "lucide-react"
import axios from "axios"

type PropsType = {
    open: boolean
    onClose: () => void
    data: IVehicle | null
    onSuccess?: () => void | Promise<void>
}

const inputCls = 'w-full outline-none text-sm text-zinc-900 placeholder:text-zinc-300 bg-transparent'
const labelCls = 'text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 block mb-1.5'

const PricingModal = ({ open, onClose, data, onSuccess }: PropsType) => {
    // New file selection
    const [image, setImage] = useState<File | null>(null)
    // Preview: either object URL from new file, or existing imageUrl from API
    const [preview, setPreview] = useState<string | null>(null)

    const [baseFare, setBaseFare] = useState("")
    const [pricePerKM, setPricePerKM] = useState("")
    const [waitingCharge, setWaitingCharge] = useState("")

    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(false)
    const [error, setError] = useState("")

    // Track whether data was previously saved (to change button label)
    const [hasExisting, setHasExisting] = useState(false)

    const canSave = baseFare.trim() && pricePerKM.trim() && waitingCharge.trim()

    // ── Fetch existing pricing when modal opens ───────────────
    useEffect(() => {
        if (!open) return

        const fetchPricing = async () => {
            try {
                setFetching(true)
                setError("")
                const { data: vehicle } = await axios.get('/api/rider/onboarding/pricing')

                // Pre-fill fields — ?? "" ensures controlled inputs
                setBaseFare(vehicle.baseFare != null ? String(vehicle.baseFare) : "")
                setPricePerKM(vehicle.pricePerKM != null ? String(vehicle.pricePerKM) : "")
                setWaitingCharge(vehicle.waitingCharge != null ? String(vehicle.waitingCharge) : "")

                // Show existing uploaded image if present
                if (vehicle.imageUrl) {
                    setPreview(vehicle.imageUrl)
                    setHasExisting(true)
                }

                if (vehicle.baseFare || vehicle.pricePerKM || vehicle.waitingCharge) {
                    setHasExisting(true)
                }
            } catch (err: any) {
                // 404 = no pricing yet, fine — just leave fields empty
                if (err?.response?.status !== 404) {
                    logger.error("Error fetching pricing:", err)
                }
            } finally {
                setFetching(false)
            }
        }

        fetchPricing()
    }, [open])

    // ── Reset on close ────────────────────────────────────────
    const handleClose = () => {
        if (loading) return
        // Reset local state so re-opening is fresh from API
        setImage(null)
        setPreview(null)
        setBaseFare("")
        setPricePerKM("")
        setWaitingCharge("")
        setHasExisting(false)
        setError("")
        onClose()
    }

    const handleSave = async () => {
        if (!canSave) return
        try {
            setLoading(true)
            setError("")
            const formData = new FormData()
            if (image) formData.append("vehicleImage", image)
            formData.append("baseFare", baseFare.trim())
            formData.append("pricePerKM", pricePerKM.trim())
            formData.append("waitingCharge", waitingCharge.trim())

            await axios.post("/api/rider/onboarding/pricing", formData)
            onSuccess?.()
            handleClose()
        } catch (err: any) {
            setError(err?.response?.data?.message ?? "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className='fixed inset-0 z-1000 bg-black/55 backdrop-blur-sm'
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <div className='fixed inset-0 z-1001 flex items-center justify-center p-4 pointer-events-none'>
                        <motion.div
                            initial={{ scale: 0.88, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.88, opacity: 0, y: 16 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className='bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto'
                        >
                            {/* Header */}
                            <div className='flex items-center justify-between px-6 py-5 border-b border-zinc-100'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center'>
                                        <IndianRupee size={15} className='text-zinc-600' />
                                    </div>
                                    <div>
                                        <h2 className='text-base font-black text-zinc-900 tracking-tight'>
                                            {hasExisting ? 'Update Pricing & Image' : 'Pricing & Image'}
                                        </h2>
                                        {data && (
                                            <p className='text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5'>
                                                <Car size={9} /> {data.type} · {data.vehicleNumber}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className='w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all text-zinc-500'
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className='px-6 py-5 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto'>

                                {/* Skeleton while fetching */}
                                {fetching ? (
                                    <div className='space-y-4'>
                                        <div className='h-40 bg-zinc-100 rounded-2xl animate-pulse' />
                                        {[1, 2, 3].map(i => (
                                            <div key={i}>
                                                <div className='w-20 h-2 bg-zinc-100 rounded-full mb-2 animate-pulse' />
                                                <div className='h-11 bg-zinc-100 rounded-xl animate-pulse' />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        {/* Vehicle image */}
                                        <div>
                                            <p className={labelCls}>Vehicle Photo</p>
                                            <label
                                                htmlFor='vehicleImageInput'
                                                className={`relative flex flex-col items-center justify-center h-40 rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all
                                                    ${preview ? 'border-zinc-200' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'}`}
                                            >
                                                {preview ? (
                                                    <>
                                                        <img src={preview} alt='Vehicle' className='absolute inset-0 w-full h-full object-cover' />
                                                        {/* Hover: change photo */}
                                                        <div className='absolute inset-0 bg-black/0 hover:bg-black/35 transition-all flex flex-col items-center justify-center gap-2'>
                                                            <RefreshCw size={18} className='text-white opacity-0 group-hover:opacity-100' />
                                                            <span className='text-[10px] font-black uppercase tracking-[0.15em] text-white opacity-0 hover:opacity-100 transition-opacity'>
                                                                Change Photo
                                                            </span>
                                                        </div>
                                                        {/* Check badge */}
                                                        <div className='absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center'>
                                                            <CheckCircle2 size={13} className='text-white' />
                                                        </div>
                                                        {/* "Tap to change" pill */}
                                                        <div className='absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full'>
                                                            <span className='text-[9px] font-black uppercase tracking-[0.12em] text-white/80'>Tap to change</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className='flex flex-col items-center gap-2 text-zinc-400'>
                                                        <div className='w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center'>
                                                            <ImagePlus size={20} className='text-zinc-400' />
                                                        </div>
                                                        <div className='text-center'>
                                                            <p className='text-xs font-semibold text-zinc-500'>Click to upload vehicle photo</p>
                                                            <p className='text-[10px] text-zinc-300 mt-0.5'>JPG, PNG up to 10MB</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <input
                                                    id='vehicleImageInput'
                                                    type='file'
                                                    accept='image/*'
                                                    className='hidden'
                                                    onChange={e => {
                                                        const file = e.target.files?.[0]
                                                        if (!file) return
                                                        setImage(file)
                                                        // Revoke old object URL to avoid memory leak
                                                        if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview)
                                                        setPreview(URL.createObjectURL(file))
                                                    }}
                                                />
                                            </label>
                                        </div>

                                        {/* Pricing fields */}
                                        <div className='space-y-3'>
                                            <p className={labelCls}>Pricing Details</p>

                                            <div>
                                                <label className={labelCls}>Base Fare</label>
                                                <div className='flex items-center gap-2 border border-zinc-100 rounded-xl px-3.5 py-2.5 bg-zinc-50 focus-within:border-zinc-400 focus-within:bg-white transition-all'>
                                                    <IndianRupee size={14} className='text-zinc-400 shrink-0' />
                                                    <input type='number' min='0' className={inputCls} value={baseFare} onChange={e => setBaseFare(e.target.value)} placeholder='e.g. 30' />
                                                    <span className='text-[10px] text-zinc-300 shrink-0'>flat</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelCls}>Price Per KM</label>
                                                <div className='flex items-center gap-2 border border-zinc-100 rounded-xl px-3.5 py-2.5 bg-zinc-50 focus-within:border-zinc-400 focus-within:bg-white transition-all'>
                                                    <IndianRupee size={14} className='text-zinc-400 shrink-0' />
                                                    <input type='number' min='0' className={inputCls} value={pricePerKM} onChange={e => setPricePerKM(e.target.value)} placeholder='e.g. 12' />
                                                    <span className='text-[10px] text-zinc-300 shrink-0'>/km</span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className={labelCls}>Waiting Charge</label>
                                                <div className='flex items-center gap-2 border border-zinc-100 rounded-xl px-3.5 py-2.5 bg-zinc-50 focus-within:border-zinc-400 focus-within:bg-white transition-all'>
                                                    <IndianRupee size={14} className='text-zinc-400 shrink-0' />
                                                    <input type='number' min='0' className={inputCls} value={waitingCharge} onChange={e => setWaitingCharge(e.target.value)} placeholder='e.g. 2' />
                                                    <span className='text-[10px] text-zinc-300 shrink-0'>/min</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Live preview summary */}
                                        {(baseFare || pricePerKM || waitingCharge) && (
                                            <div className='flex items-start gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100'>
                                                <Info size={13} className='text-zinc-400 mt-0.5 shrink-0' />
                                                <p className='text-[11px] text-zinc-400 leading-relaxed'>
                                                    Customer pays <strong className='text-zinc-700'>₹{baseFare || '—'}</strong> base
                                                    + <strong className='text-zinc-700'>₹{pricePerKM || '—'}/km</strong>
                                                    + <strong className='text-zinc-700'>₹{waitingCharge || '—'}/min</strong> waiting
                                                </p>
                                            </div>
                                        )}

                                        {/* API error */}
                                        {error && (
                                            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                                className='text-xs text-red-500 font-semibold'>
                                                * {error}
                                            </motion.p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className='flex items-center gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50'>
                                <button
                                    onClick={handleClose}
                                    disabled={loading || fetching}
                                    className='flex-1 py-3 rounded-2xl border border-zinc-200 text-sm font-bold text-zinc-500 hover:bg-zinc-100 transition-all disabled:opacity-50'
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={canSave && !loading && !fetching ? { scale: 1.01 } : {}}
                                    whileTap={canSave && !loading && !fetching ? { scale: 0.975 } : {}}
                                    onClick={handleSave}
                                    disabled={!canSave || loading || fetching}
                                    className='flex-1 py-3 rounded-2xl bg-zinc-900 hover:bg-black text-white text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed'
                                >
                                    {loading
                                        ? <><Loader2 size={15} className='animate-spin' /> Saving…</>
                                        : hasExisting
                                            ? <><RefreshCw size={15} /> Update Pricing</>
                                            : <><CheckCircle2 size={15} /> Save Pricing</>
                                    }
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

export default PricingModal