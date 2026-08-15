'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    riderId: string;
    onSuccess: () => void;
}

export default function ReviewModal({ isOpen, onClose, bookingId, riderId, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        try {
            setLoading(true);
            await axios.post("/api/reviews", {
                bookingId,
                riderId,
                rating,
                comment
            });
            toast.success("Review submitted successfully!");
            onSuccess();
            onClose();
            // Reset for future
            setRating(0);
            setComment("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6 mt-2">
                            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Rate your Ride</h2>
                            <p className="text-neutral-500 text-sm mt-1">How was your experience with the rider?</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-colors ${
                                                    star <= (hoverRating || rating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'fill-neutral-100 text-neutral-200'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <span className="text-sm font-semibold text-neutral-400 h-5">
                                    {rating > 0 && ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'][rating - 1]}
                                </span>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Leave a comment <span className="text-neutral-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tell us about your ride..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-neutral-700"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || rating === 0}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Feedback'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
