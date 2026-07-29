'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, Bot, RefreshCw } from 'lucide-react'
import { IBooking } from '@/models/booking.model'
import axios from 'axios'
import { getSocket } from '@/lib/socket'

type message = {
    bookingId: string
    senderRole: "rider" | "user"
    message: string
    createdAt?: string
}

export default function RideChat({ currentRole, booking }: { currentRole: string, booking: IBooking }) {
    const otherName = currentRole === "user" ? (booking.rider as any)?.name : (booking.user as any)?.name
    const fallbackName = currentRole === "user" ? "Driver" : "Passenger"

    const [messages, setMessages] = useState<message[]>([]);
    const [lastMessage, setLastMessage] = useState("");
    const [text, setText] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 50);
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim()) return;

        const currentText = text;
        setText("");

        // Optimistic update
        setMessages(prev => [...prev, {
            bookingId: (booking as any)._id,
            senderRole: currentRole as "rider" | "user",
            message: currentText,
            createdAt: new Date().toISOString()
        }]);
        setLastMessage(currentText);
        const socket = getSocket();
        socket.emit("chat-message", {
            bookingId: (booking as any)._id,
            senderRole: currentRole,
            message: currentText
        });
        
        try {
            await axios.post("/api/chat/send", {
                bookingId: (booking as any)._id,
                senderRole: currentRole,
                message: currentText
            });
        } catch (error) {
            console.log("Error sending message", error);
        }
    }

    const getMessages = async () => {
        try {
            const { data } = await axios.get(`/api/chat/getall`, {
                params: {
                    bookingId: (booking as any)._id
                }
            })
            if (data.chatMessages) {
                setMessages(data.chatMessages);
                if (data.chatMessages.length > 0) {
                    setLastMessage(data.chatMessages[data.chatMessages.length - 1].message);
                }
            }
        } catch (error) {
            console.log("Error fetching messages", error);
        }
    }
    useEffect(() => {
        const socket = getSocket();
        
        const handleMessage = ({ bookingId: incomingId, senderRole, message: incomingMessage }: { bookingId: string, senderRole: string, message: string }) => {
            if (incomingId === (booking as any)._id) {
                setMessages(prev => [...prev, {
                    bookingId: incomingId,
                    senderRole: senderRole as "rider" | "user",
                    message: incomingMessage,
                    createdAt: new Date().toISOString()
                }]);
                setLastMessage(incomingMessage);
            }
        };

        socket.on("chat-message", handleMessage);

        return () => {
            socket.off("chat-message", handleMessage);
        }
    }, [booking])

    useEffect(() => {
        getMessages();
    }, []);

    const getAI = async (force = false) => {
        if (!force && suggestions.length > 0) return;
        setLoadingSuggestions(true);
        try {
            const { data } = await axios.post("/api/chat/ai-suggestions", {
                role: currentRole,
                lastMessage: lastMessage || "Hello"
            });
            if (data.success && data.data && data.data.suggestions) {
                setSuggestions(data.data.suggestions);
            }
        } catch (error) {
            console.log("Error fetching AI suggestions", error);
        } finally {
            setLoadingSuggestions(false);
        }
    }

    const toggleSuggestions = () => {
        const willShow = !showSuggestions;
        setShowSuggestions(willShow);
        if (willShow) {
            getAI();
        }
    }

    const formatTime = (isoString?: string) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col bg-[#0f0f11] rounded-2xl overflow-hidden mt-4 border border-zinc-800 shadow-sm"
        >
            {/* Header info */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#0f0f11]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1a1a1c] border border-zinc-800 flex items-center justify-center font-bold text-white uppercase relative">
                        {otherName ? otherName.charAt(0) : fallbackName.charAt(0)}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f0f11]"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-base capitalize">{otherName || fallbackName}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-[11px] text-emerald-500 font-medium tracking-wide">Active Now</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 min-h-[200px] max-h-[300px] bg-[#0f0f11]">
                {messages.length === 0 && (
                    <div className="text-center text-zinc-500 text-sm mt-4">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isMe = msg.senderRole === currentRole;
                    return (
                        <div key={idx} className={`max-w-[85%] flex flex-col ${isMe ? 'self-end' : 'self-start'}`}>
                            <div className={`text-sm px-4 py-2.5 rounded-2xl shadow-sm ${isMe ? 'bg-black border border-zinc-800 text-white rounded-br-none' : 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-bl-none'}`}>
                                {msg.message}
                            </div>
                            <span className={`text-[10px] text-zinc-500 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                {formatTime(msg.createdAt)}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#0f0f11] border-t border-zinc-800 relative">
                <AnimatePresence>
                    {showSuggestions && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 mx-3 bg-[#1a1a1c] border border-zinc-800 shadow-xl rounded-2xl p-3 overflow-hidden z-10"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-purple-400 text-[11px] font-bold uppercase tracking-wider">
                                    <Bot className="w-4 h-4" />
                                    AI Suggestions
                                </div>
                                <button onClick={() => getAI(true)} disabled={loadingSuggestions} className="text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 flex items-center gap-1 text-[11px] font-medium">
                                    <RefreshCw className={`w-3 h-3 ${loadingSuggestions ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {loadingSuggestions ? (
                                    <>
                                        <div className="h-9 bg-zinc-800 rounded-xl animate-pulse"></div>
                                        <div className="h-9 bg-zinc-800 rounded-xl animate-pulse"></div>
                                        <div className="h-9 bg-zinc-800 rounded-xl animate-pulse"></div>
                                    </>
                                ) : (
                                    suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setText(suggestion);
                                                setShowSuggestions(false);
                                            }}
                                            className="text-left w-full bg-[#0f0f11] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-xl px-4 py-2.5 text-sm transition-colors text-ellipsis overflow-hidden whitespace-nowrap"
                                        >
                                            {suggestion}
                                        </button>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={sendMessage} className="flex items-center gap-2 relative">
                    <button
                        type="button"
                        onClick={toggleSuggestions}
                        className={`absolute left-1.5 w-9 h-9 rounded-xl flex items-center justify-center transition-colors z-10 ${showSuggestions ? 'bg-purple-600 text-white shadow-sm' : 'bg-transparent text-zinc-400 hover:text-purple-400 hover:bg-[#1a1a1c]'}`}
                    >
                        <Bot className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-[#1a1a1c] border border-zinc-800 text-white rounded-2xl pr-10 py-3.5 text-sm outline-none focus:border-zinc-700 transition-all placeholder:text-zinc-600"
                        style={{ paddingLeft: '3.25rem' }}
                    />
                    <button type="submit" disabled={!text.trim()} className="absolute right-2 w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-purple-500 disabled:opacity-50 transition-colors z-10">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </motion.div>
    )
}
