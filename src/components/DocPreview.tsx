'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ExternalLink, FileText, ImageIcon, X, ZoomIn } from 'lucide-react'

interface DocPreviewProps {
    label: string
    url?: string | null
}

const DocPreview = ({ label, url }: DocPreviewProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [pdfOpen, setPdfOpen] = useState(false)

    // Detect type from URL
    const isImage = !!url?.match(/\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i)
    const isPdf = !!url?.match(/\.pdf(\?|$)/i) || (!!url && !isImage)

    // ── No URL ────────────────────────────────────────────────
    if (!url) {
        return (
            <div className='flex items-center gap-3 p-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50'>
                <div className='w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0'>
                    <ImageIcon size={16} className='text-zinc-300' />
                </div>
                <div>
                    <p className='text-xs font-bold text-zinc-400'>{label}</p>
                    <p className='text-[10px] text-zinc-300 mt-0.5'>Not uploaded yet</p>
                </div>
            </div>
        )
    }

    // ── Image preview ─────────────────────────────────────────
    if (isImage) {
        return (
            <>
                <div className='group relative flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 bg-white transition-all'>
                    {/* Thumbnail */}
                    <div
                        className='relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-zinc-100 cursor-zoom-in'
                        onClick={() => setLightboxOpen(true)}
                    >
                        <img src={url} alt={label} className='w-full h-full object-cover' />
                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center'>
                            <ZoomIn size={14} className='text-white opacity-0 group-hover:opacity-100 transition-opacity' />
                        </div>
                    </div>

                    {/* Info */}
                    <div className='flex-1 min-w-0'>
                        <p className='text-xs font-bold text-zinc-700'>{label}</p>
                        <p className='text-[10px] text-zinc-400 mt-0.5 truncate'>{url.split('/').pop()}</p>
                    </div>

                    {/* Actions */}
                    <div className='flex items-center gap-1.5 shrink-0'>
                        <button
                            onClick={() => setLightboxOpen(true)}
                            className='w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all'
                            title='View full size'
                        >
                            <ZoomIn size={13} />
                        </button>
                        <a
                            href={url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all'
                            title='Open in new tab'
                        >
                            <ExternalLink size={13} />
                        </a>
                    </div>
                </div>

                {/* ── Lightbox ── */}
                <AnimatePresence>
                    {lightboxOpen && (
                        <motion.div
                            className='fixed inset-0 z-[999] flex items-center justify-center p-4'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setLightboxOpen(false)}
                        >
                            {/* Backdrop */}
                            <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' />

                            {/* Image */}
                            <motion.div
                                initial={{ scale: 0.85, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.85, opacity: 0 }}
                                transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                                className='relative max-w-4xl max-h-[90vh] z-10'
                                onClick={e => e.stopPropagation()}
                            >
                                <img
                                    src={url}
                                    alt={label}
                                    className='max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl'
                                />
                                {/* Top bar */}
                                <div className='absolute top-3 left-3 right-3 flex items-center justify-between'>
                                    <span className='text-[10px] font-black uppercase tracking-[0.18em] text-white/70 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm'>
                                        {label}
                                    </span>
                                    <div className='flex items-center gap-2'>
                                        <a
                                            href={url}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all'
                                            title='Open in new tab'
                                        >
                                            <ExternalLink size={13} />
                                        </a>
                                        <button
                                            onClick={() => setLightboxOpen(false)}
                                            className='w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center text-white transition-all'
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        )
    }

    // ── PDF preview ───────────────────────────────────────────
    return (
        <>
            <div className='flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 bg-white transition-all'>
                {/* PDF icon tile */}
                <div className='w-14 h-14 shrink-0 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center justify-center gap-0.5'>
                    <FileText size={18} className='text-red-500' strokeWidth={1.8} />
                    <span className='text-[8px] font-black text-red-400 uppercase tracking-tight'>PDF</span>
                </div>

                {/* Info */}
                <div className='flex-1 min-w-0'>
                    <p className='text-xs font-bold text-zinc-700'>{label}</p>
                    <p className='text-[10px] text-zinc-400 mt-0.5 truncate'>{url.split('/').pop()?.split('?')[0]}</p>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-1.5 shrink-0'>
                    <button
                        onClick={() => setPdfOpen(true)}
                        className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold hover:bg-black transition-all'
                    >
                        <FileText size={11} />
                        View
                    </button>
                    <a
                        href={url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='w-7 h-7 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition-all'
                        title='Open in new tab'
                    >
                        <ExternalLink size={13} />
                    </a>
                </div>
            </div>

            {/* ── PDF modal with iframe ── */}
            <AnimatePresence>
                {pdfOpen && (
                    <motion.div
                        className='fixed inset-0 z-[999] flex items-center justify-center p-4'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPdfOpen(false)}
                    >
                        <div className='absolute inset-0 bg-black/75 backdrop-blur-sm' />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
                            className='relative w-full max-w-4xl h-[88vh] z-10 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col'
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal header */}
                            <div className='flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 bg-white shrink-0'>
                                <div className='flex items-center gap-2.5'>
                                    <div className='w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center'>
                                        <FileText size={14} className='text-red-500' />
                                    </div>
                                    <div>
                                        <p className='text-xs font-black text-zinc-900'>{label}</p>
                                        <p className='text-[10px] text-zinc-400 truncate max-w-[300px]'>{url.split('/').pop()?.split('?')[0]}</p>
                                    </div>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <a
                                        href={url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 text-[11px] font-bold hover:bg-zinc-50 transition-all'
                                    >
                                        <ExternalLink size={12} /> Open in tab
                                    </a>
                                    <button
                                        onClick={() => setPdfOpen(false)}
                                        className='w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 transition-all'
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* iframe */}
                            <iframe
                                src={`${url}#toolbar=0`}
                                className='flex-1 w-full border-0'
                                title={label}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default DocPreview