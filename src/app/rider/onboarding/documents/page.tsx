'use client'
import { logger } from "@/lib/logger";
import React, { useEffect, useRef, useState } from 'react'
import { motion } from "motion/react";
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDashed, Clock, Upload, X } from 'lucide-react';
import axios from 'axios';
import useGetMe from '@/hooks/useGetMe';

const SceneDocs = () => (
    <svg viewBox="0 0 280 160" fill="none" className="w-full max-w-[200px]">
        <rect x="66" y="18" width="120" height="132" rx="10" fill="white" fillOpacity="0.05" />
        <rect x="78" y="28" width="120" height="132" rx="10" fill="white" fillOpacity="0.12" stroke="white" strokeOpacity="0.18" strokeWidth="1.5" />
        {[55, 72, 86, 100, 114, 128].map((y, i) => <rect key={i} x="96" y={y} width={i % 2 === 0 ? 72 : 54} height="5" rx="2.5" fill="white" fillOpacity="0.18" />)}
        <path d="M138 148 C122 141 112 129 112 115V103L138 96L164 103V115C164 129 154 141 138 148Z" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
        <path d="M131 122 L136 127 L146 114" stroke="white" strokeOpacity="0.9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {[[32, 28], [240, 22], [258, 130], [22, 138]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.5" fill="white" fillOpacity="0.3" />)}
    </svg>
)

const labelCls = 'text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-400 block mb-1.5'

type DocsType = "aadhar" | "license" | "rc"

const ACCEPTED: Record<DocsType, string> = {
    aadhar: "image/jpeg,image/png,application/pdf",
    license: "image/jpeg,image/png,application/pdf",
    rc: "image/jpeg,image/png,application/pdf",
}

// ── Uploaded preview circle ──────────────────────────────────
const UploadedPreview = ({ url }: { url: string | null }) => {
    if (!url) {
        // Blank placeholder circle
        return (
            <div className='w-12 h-12 shrink-0 rounded-full border-2 border-dashed border-zinc-200 bg-zinc-50 flex items-center justify-center'>
                <div className='w-5 h-5 rounded-full bg-zinc-100' />
            </div>
        )
    }

    // Check if it's a PDF (no image to show)
    const isPdf = url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('application/pdf')

    return (
        <div className='relative w-12 h-12 shrink-0 group'>
            {isPdf ? (
                <div className='w-12 h-12 rounded-full border-2 border-green-300 bg-green-50 flex items-center justify-center'>
                    <span className='text-[8px] font-black text-green-600 uppercase tracking-tight'>PDF</span>
                </div>
            ) : (
                <img
                    src={url}
                    alt="Uploaded document"
                    className='w-12 h-12 rounded-full object-cover border-2 border-green-300 shadow-sm'
                />
            )}
            {/* Green tick overlay */}
            <div className='absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-green-300 flex items-center justify-center'>
                <CheckCircle2 size={11} className='text-green-500' />
            </div>
            {/* Hover: view full */}
            <a
                href={url}
                target='_blank'
                rel='noopener noreferrer'
                onClick={e => e.stopPropagation()}
                className='absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'
            >
                <span className='text-[8px] font-black text-white uppercase tracking-tight'>View</span>
            </a>
        </div>
    )
}

// ── Upload box ───────────────────────────────────────────────
interface UploadBoxProps {
    label: string
    doc: DocsType
    file: File | null
    uploadedUrl: string | null
    inputRef: React.RefObject<HTMLInputElement>
    onChange: (doc: DocsType, file: File | null) => void
    onClear: (doc: DocsType) => void
}

const UploadBox = ({ label, doc, file, uploadedUrl, inputRef, onChange, onClear }: UploadBoxProps) => (
    <div>
        <p className={labelCls}>{label}</p>
        <div className='flex items-center gap-3'>

            {/* Uploaded preview circle (always visible) */}
            <UploadedPreview url={uploadedUrl} />

            {/* Input area */}
            <div
                onClick={() => inputRef.current?.click()}
                className={`flex items-center gap-3 flex-1 py-3 px-4 rounded-xl border-2 border-dashed cursor-pointer transition-all group
                    ${file
                        ? 'border-zinc-300 bg-zinc-50'
                        : uploadedUrl
                            ? 'border-zinc-200 bg-zinc-50 hover:border-zinc-300'
                            : 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-white'
                    }`}
            >
                <Upload size={14} className={`shrink-0 transition-colors ${file || uploadedUrl ? 'text-zinc-400' : 'text-zinc-300 group-hover:text-zinc-500'}`} />
                <span className={`text-xs transition-colors truncate flex-1 ${file ? 'text-zinc-700 font-medium' : 'text-zinc-400'}`}>
                    {file ? file.name : uploadedUrl ? 'Replace document' : 'Click to upload'}
                </span>
                {file ? (
                    <>
                        <CheckCircle2 size={13} className='text-green-500 shrink-0' />
                        <button
                            type="button"
                            onClick={e => { e.stopPropagation(); onClear(doc) }}
                            className='shrink-0 w-5 h-5 rounded-full bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center transition-colors'
                        >
                            <X size={10} className='text-zinc-600' />
                        </button>
                    </>
                ) : (
                    <span className='text-[10px] text-zinc-300 shrink-0'>JPG, PNG, PDF</span>
                )}
            </div>
        </div>

        {/* Hidden file input */}
        <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED[doc]}
            className='hidden'
            onChange={e => {
                const f = e.target.files?.[0] ?? null
                onChange(doc, f)
                e.target.value = ""
            }}
        />
    </div>
)

// ── Page ─────────────────────────────────────────────────────
interface ExistingDocs {
    aadharUrl: string | null
    licenseUrl: string | null
    vehicleRC: string | null
    status: string | null
}

export default function DocumentsPage() {
    const router = useRouter()
    const { refresh: refreshUserData, loading: refreshing } = useGetMe()
    const [loading, setLoading] = useState(false)
    const [fetchingDocs, setFetchingDocs] = useState(true)
    const [errorMessage, setErrorMessage] = useState("")

    const [docs, setDocs] = useState<Record<DocsType, File | null>>({
        aadhar: null, license: null, rc: null,
    })

    const [existingDocs, setExistingDocs] = useState<ExistingDocs>({
        aadharUrl: null, licenseUrl: null, vehicleRC: null, status: null,
    })

    const aadharRef = useRef<HTMLInputElement>(null)
    const licenseRef = useRef<HTMLInputElement>(null)
    const rcRef = useRef<HTMLInputElement>(null)

    const handleChange = (doc: DocsType, file: File | null) => {
        if (!file) return
        setDocs(prev => ({ ...prev, [doc]: file }))
        setErrorMessage("")
    }

    const handleClear = (doc: DocsType) => {
        setDocs(prev => ({ ...prev, [doc]: null }))
    }

    // New file selected OR already uploaded = can continue
    const canContinue =
        (docs.aadhar || existingDocs.aadharUrl) &&
        (docs.license || existingDocs.licenseUrl) &&
        (docs.rc || existingDocs.vehicleRC)

    // Fetch existing docs on mount
    useEffect(() => {
        const handleGetRiderDocs = async () => {
            try {
                setFetchingDocs(true)
                const { data } = await axios.get("/api/rider/onboarding/documents")
                setExistingDocs({
                    aadharUrl: data.aadharUrl ?? null,
                    licenseUrl: data.licenseUrl ?? null,
                    vehicleRC: data.vehicleRC ?? null,
                    status: data.status ?? null,
                })
            } catch (error: any) {
                // 404 = no docs yet, that's fine
                if (error?.response?.status !== 404) {
                    logger.error("Error fetching docs:", error)
                }
            } finally {
                setFetchingDocs(false)
            }
        }
        handleGetRiderDocs()
    }, [])

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const formData = new FormData()

            // For each slot: send new File if selected,
            // otherwise pass existing URL so API keeps the already-uploaded file.
            if (docs.aadhar) {
                formData.append("aadhar", docs.aadhar)
            } else if (existingDocs.aadharUrl) {
                formData.append("aadharUrl", existingDocs.aadharUrl)
            }

            if (docs.license) {
                formData.append("license", docs.license)
            } else if (existingDocs.licenseUrl) {
                formData.append("licenseUrl", existingDocs.licenseUrl)
            }

            if (docs.rc) {
                formData.append("rc", docs.rc)
            } else if (existingDocs.vehicleRC) {
                formData.append("vehicleRC", existingDocs.vehicleRC)
            }

            const { data } = await axios.post("/api/rider/onboarding/documents", formData)
            logger.info("Submitted documents:", data)

            // Refresh user data to reflect the updated onboarding step
            await refreshUserData()

            // Small delay to ensure data is updated before redirect
            setTimeout(() => {
                router.push('/rider/onboarding/bank')
            }, 300)
        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message ?? "Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4 pt-20'>
            <div className='fixed inset-0 pointer-events-none opacity-[0.025]'
                style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className='w-full max-w-3xl bg-white rounded-[24px] shadow-[0_8px_50px_rgba(0,0,0,0.09)] overflow-hidden'
            >
                <div className='flex'>

                    {/* ── Left panel ── */}
                    <div className='hidden lg:flex flex-col justify-between w-[260px] shrink-0 bg-gradient-to-br from-stone-900 to-neutral-800 p-6'>
                        <div>
                            <span className='inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-white/55 border border-white/15 rounded-full px-2.5 py-1'>
                                <span className='w-1.5 h-1.5 rounded-full bg-green-400' />Secure & Private
                            </span>
                            <h2 className='mt-4 text-lg font-black text-white leading-snug tracking-tight'>Your data is encrypted end‑to‑end</h2>
                            <p className='mt-2 text-xs text-white/45 leading-relaxed'>Bank-grade security keeps your documents safe and private.</p>
                        </div>
                        <div className='flex justify-center my-4'><SceneDocs /></div>
                        <div className='rounded-xl border border-white/10 bg-white/5 px-4 py-3'>
                            <p className='text-2xl font-black text-white'>256-bit</p>
                            <p className='text-[10px] text-white/35 mt-0.5'>AES encryption</p>
                        </div>
                    </div>

                    {/* ── Right panel ── */}
                    <div className='flex-1 flex flex-col p-6 sm:p-7 min-w-0'>

                        {/* Header */}
                        <div className='flex items-center gap-3 mb-5'>
                            <button onClick={() => router.back()}
                                className='w-8 h-8 shrink-0 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all'>
                                <ArrowLeft size={14} />
                            </button>
                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center gap-2 mb-0.5'>
                                    <span className='text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400'>Step 2 of 3</span>
                                    <div className='flex items-center gap-1'>
                                        <div className='w-1.5 h-1.5 rounded-full bg-zinc-900' />
                                        <div className='w-4 h-1.5 rounded-full bg-zinc-900' />
                                        <div className='w-1.5 h-1.5 rounded-full bg-zinc-200' />
                                    </div>
                                </div>
                                <h1 className='text-lg font-black text-zinc-900 tracking-tight leading-none'>Your Documents</h1>
                                <p className='text-[11px] text-zinc-400 mt-0.5'>Upload required KYC documents</p>
                            </div>
                        </div>

                        {/* Status banner if docs already submitted */}
                        {existingDocs.status && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-4 border text-[11px] font-semibold
                                    ${existingDocs.status === 'verified'
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : existingDocs.status === 'rejected'
                                            ? 'bg-red-50 border-red-200 text-red-700'
                                            : 'bg-amber-50 border-amber-200 text-amber-700'
                                    }`}
                            >
                                {existingDocs.status === 'verified'
                                    ? <CheckCircle2 size={13} />
                                    : <Clock size={13} />
                                }
                                {existingDocs.status === 'verified'
                                    ? 'Documents verified successfully'
                                    : existingDocs.status === 'rejected'
                                        ? 'Documents rejected — please re-upload'
                                        : 'Documents submitted and under review (24 hrs)'
                                }
                            </motion.div>
                        )}

                        {/* Upload fields */}
                        <div className='flex-1 space-y-4'>
                            {fetchingDocs ? (
                                // Skeleton loaders
                                <div className='space-y-4'>
                                    {[1, 2, 3].map(i => (
                                        <div key={i}>
                                            <div className='w-24 h-2.5 bg-zinc-100 rounded-full mb-2 animate-pulse' />
                                            <div className='flex items-center gap-3'>
                                                <div className='w-12 h-12 rounded-full bg-zinc-100 animate-pulse shrink-0' />
                                                <div className='flex-1 h-12 rounded-xl bg-zinc-100 animate-pulse' />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <UploadBox
                                        label="Aadhaar / ID Proof"
                                        doc="aadhar"
                                        file={docs.aadhar}
                                        uploadedUrl={existingDocs.aadharUrl}
                                        inputRef={aadharRef}
                                        onChange={handleChange}
                                        onClear={handleClear}
                                    />
                                    <UploadBox
                                        label="Driving Licence (Front & Back)"
                                        doc="license"
                                        file={docs.license}
                                        uploadedUrl={existingDocs.licenseUrl}
                                        inputRef={licenseRef}
                                        onChange={handleChange}
                                        onClear={handleClear}
                                    />
                                    <UploadBox
                                        label="Vehicle RC Document"
                                        doc="rc"
                                        file={docs.rc}
                                        uploadedUrl={existingDocs.vehicleRC}
                                        inputRef={rcRef}
                                        onChange={handleChange}
                                        onClear={handleClear}
                                    />
                                </>
                            )}

                            <div className='flex items-start gap-2.5 p-3 rounded-xl bg-zinc-50 border border-zinc-100'>
                                <CheckCircle2 size={13} className='text-zinc-400 mt-0.5 shrink-0' />
                                <p className='text-[11px] text-zinc-400 leading-relaxed'>
                                    Documents reviewed within 24 hrs. Hover over a circle to view the uploaded file.
                                </p>
                            </div>

                            {errorMessage && (
                                <motion.p
                                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                                    className='text-xs text-red-500 font-medium text-center'
                                >
                                    {errorMessage}
                                </motion.p>
                            )}
                        </div>

                        {/* CTA */}
                        <div className='mt-5'>
                            <motion.button
                                whileHover={canContinue && !loading ? { scale: 1.01 } : {}}
                                whileTap={canContinue && !loading ? { scale: 0.975 } : {}}
                                disabled={!canContinue || loading || fetchingDocs}
                                onClick={handleSubmit}
                                className='w-full py-3.5 rounded-2xl bg-zinc-900 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:enabled:bg-black'
                            >
                                {loading
                                    ? <><CircleDashed size={15} className='animate-spin' /> Uploading...</>
                                    : <>Continue to Bank & Payout <ArrowRight size={14} /></>
                                }
                            </motion.button>
                            <p className='text-center text-[10px] text-zinc-300 mt-2.5'>Your data is encrypted and secure</p>
                        </div>

                    </div>
                </div>
            </motion.div>
        </div>
    )
}