'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
    {
        question: "How quickly can I get a ride?",
        answer: "Our advanced matching algorithm connects you with the nearest driver within seconds. In most metropolitan areas, average pickup times are under 5 minutes."
    },
    {
        question: "Are your vehicles sanitized?",
        answer: "Yes, health and safety are our top priorities. All vehicles undergo a deep cleaning daily, and drivers are equipped with sanitizing materials between rides."
    },
    {
        question: "Can I book a ride in advance?",
        answer: "Absolutely. You can schedule rides up to 30 days in advance through our app. You'll receive a confirmation and driver details beforehand."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit and debit cards, digital wallets like Apple Pay and Google Pay, and corporate billing accounts for our enterprise clients."
    }
]

const FaqSection = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="py-24 bg-zinc-50 text-zinc-900">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-black mb-6"
                    >
                        Frequently Asked Questions
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-500 text-lg"
                    >
                        Everything you need to know about riding with Easy Wheels.
                    </motion.p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * idx }}
                            className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm"
                        >
                            <button
                                onClick={() => toggleFaq(idx)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                            >
                                <span className="font-bold text-lg">{faq.question}</span>
                                <motion.div
                                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronDown className="text-zinc-400" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {openIndex === idx && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-zinc-500 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FaqSection
