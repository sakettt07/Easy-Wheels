'use client'
import React, { useState } from 'react';
import { AnimatePresence, motion } from "motion/react";
import { CircleDashed, Lock, Mail, User, X } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';

type propType = {
    open: boolean,
    onClose: () => void
}

type stepType = "login" | "signup" | "otp"

const AuthModal = ({ open, onClose }: propType) => {
    const [step, setStep] = useState<stepType>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const session = useSession();
    const handleSignup = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post("/api/auth/register", {
                name, email, password
            });
            setStep("otp");
            setLoading(false);
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.response.data.message);
        }
        finally {
            setLoading(false);
        }
    }
    const handleVerifyEmail = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post("/api/auth/verify-email", {
                email, otp: otp.join("")
            });
            setStep("login");
            setLoading(false);
        } catch (error: any) {
            console.error(error);
            setErrorMessage(error.response.data.message);
        }
        finally {
            setLoading(false);
        }
    }
    const handleLogin = async () => {
        try {
            setLoading(true);
            const res = await signIn("credentials", {
                email, password, redirect: false
            })
            setLoading(false);
            console.log(res)
        } catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    }

    const handleGoogleLogin = async () => {
        await signIn("google");
    }

    const handleChangeOtp = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;

        const updated = [...otp];
        updated[index] = value.slice(-1); // ensure single digit
        setOtp(updated);

        // move forward automatically
        if (value && index < otp.length - 1) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }
    };
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const pasteData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "") // keep only digits
            .slice(0, otp.length);

        const updated = pasteData.split("");

        const newOtp = [...otp];
        updated.forEach((val, i) => {
            newOtp[i] = val;
        });

        setOtp(newOtp);

        // focus last filled input
        const lastIndex = updated.length >= otp.length ? otp.length - 1 : updated.length;
        document.getElementById(`otp-${lastIndex}`)?.focus();
    };

    const handleKeyDownOtp = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.key === "Backspace") {
            const updated = [...otp];

            if (otp[index]) {
                // clear current value first
                updated[index] = "";
                setOtp(updated);
            } else if (index > 0) {
                // move back if empty
                document.getElementById(`otp-${index - 1}`)?.focus();
            }
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div exit={{
                        opacity: 0
                    }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='fixed inset-0 z-[90] bg-black/80 backdrop-blur-md'>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 40 }}
                            exit={{ opacity: 0, scale: 0.95, y: 40 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <div className='relative w-full max-w-md rounded-3x1 bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-black'>
                                <div className='absolute right-4 top-4 text-gray-500 hover:text-black transition' onClick={onClose}>
                                    <X size={20} />
                                </div>
                                <div className='mb-6 text-center'>
                                    <h1 className='text-3xl font-extrabold tracking-widest'>Easy Wheels</h1>
                                    <p className='mt-1 text-xs text-gray-500'>Premium Vehicle booking</p>
                                </div>
                                <button onClick={handleGoogleLogin} className='w-full h-11 rounded-xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:text-white transition hover:bg-black'>
                                    <Image src="/googlep.webp" alt="Google button" width={20} height={20} />Continue with Google</button>
                                <div className='flex items-center gap-4 my-6'>
                                    <div className='flex-1 h-px bg-black/10' />
                                    <div className='tex-xs text-gray-500'>OR</div>
                                    <div className='flex-1 h-px bg-black/10' />
                                </div>
                                <div>
                                    {step === "login" && (
                                        <motion.div initial={{
                                            opacity: 0, x: 20
                                        }} animate={{
                                            opacity: 1, x: 0
                                        }} className=''>
                                            <h1 className='text-xl font-semibold'>Welcome back</h1>
                                            <div className='mt-5 space-y-4'>
                                                <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                                                    <Mail size={18} className='text-gray-500' />
                                                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder='email' className='w-full bg-transparent outline-none text-sm' />
                                                </div>
                                                <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                                                    <Lock size={18} className='text-gray-500' />
                                                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Password' className='w-full bg-transparent outline-none text-sm' />
                                                </div>
                                                {/* {errorMessage && (<p className='text-red-500'>{errorMessage}</p>)} */}
                                                <button disabled={loading} onClick={handleLogin} className='w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center'>{!loading ? "Login" : <CircleDashed size={18} className='animate-spin' color='white' />}</button>

                                            </div>
                                            <p className='mt-6 text-center text-sm text-gray-500'>Don't have an account? <div onClick={() => setStep("signup")} className='text-black font-medium hover:underline'>Sign Up</div></p>

                                        </motion.div>
                                    )}
                                    {step === "signup" && (
                                        <motion.div initial={{
                                            opacity: 0, x: 20
                                        }} animate={{
                                            opacity: 1, x: 0
                                        }} className=''>
                                            <h1 className='text-xl font-semibold'>Create new Account !</h1>
                                            <div className='mt-5 space-y-4'>
                                                <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                                                    <User size={18} className='text-gray-500' />
                                                    <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder='fullname' className='w-full bg-transparent outline-none text-sm' />
                                                </div>
                                                <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                                                    <Mail size={18} className='text-gray-500' />
                                                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder='email' className='w-full bg-transparent outline-none text-sm' />
                                                </div>
                                                <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                                                    <Lock size={18} className='text-gray-500' />
                                                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder='Password' className='w-full bg-transparent outline-none text-sm' />
                                                </div>
                                                {errorMessage && (<p className='text-red-500'>{errorMessage}</p>)}
                                                <button disabled={loading} onClick={handleSignup} className='w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center'>{!loading ? "Send Otp" : <CircleDashed size={18} className='animate-spin' color='white' />}</button>

                                            </div>
                                            <p className='mt-6 text-center text-sm text-gray-500'>Already have an account? <div onClick={() => setStep("login")} className='text-black font-medium hover:underline'>Login</div></p>

                                        </motion.div>
                                    )}
                                    {step === "otp" && (
                                        <motion.div key="otp">
                                            <h2 className='tex-xl font-semibold'>Verify Email</h2>
                                            <div className="mt-6 flex justify-between gap-2">
                                                {otp.map((digit, i) => (
                                                    <input
                                                        key={i}
                                                        id={`otp-${i}`}
                                                        value={digit}
                                                        maxLength={1}
                                                        inputMode="numeric"
                                                        className="w-10 h-12 sm:w-12 text-center text-lg font-semibold rounded-xl bg-white border border-black/20 outline-none"

                                                        onChange={(e) => handleChangeOtp(i, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDownOtp(e, i)}
                                                        onPaste={handlePaste}
                                                    />
                                                ))}
                                            </div>
                                            <button onClick={handleVerifyEmail} className='mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold hover:text-gray-900 transition'>Verify and Create account</button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                        <motion.div />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AuthModal;

// 4:12