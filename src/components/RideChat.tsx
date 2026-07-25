'use client'

import React from 'react'
import { motion } from 'motion/react'
import { X, Send, Bot } from 'lucide-react'
import { IBooking } from '@/models/booking.model'

export default function RideChat({ onClose, currentRole, booking }: { onClose: () => void, currentRole: string, booking: IBooking }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[100] bg-white md:absolute md:inset-auto md:right-4 md:bottom-4 md:h-[500px] md:w-[380px] md:rounded-2xl md:shadow-2xl flex flex-col md:border md:border-zinc-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50 md:rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900">Support Chat</h3>
                        <p className="text-xs text-zinc-500">AI Assistant & User</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center hover:bg-zinc-300 transition-colors">
                    <X className="w-4 h-4 text-zinc-600" />
                </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-white flex flex-col gap-4">
                <div className="self-start bg-zinc-100 text-zinc-800 px-4 py-2.5 rounded-2xl rounded-tl-none max-w-[85%] text-sm">
                    Hello! Chat options are being integrated. For urgent matters, please use the Call button.
                </div>
                <div className="self-end bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] text-sm shadow-sm">
                    Got it, thanks!
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-100 bg-white md:rounded-b-2xl">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-zinc-100 border-none rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 transition-shadow"
                    />
                    <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors shrink-0 shadow-sm">
                        <Send className="w-4 h-4 text-white ml-0.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}
