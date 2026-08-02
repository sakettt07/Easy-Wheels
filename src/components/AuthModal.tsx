'use client'
import React, { useState } from 'react';
import { AnimatePresence, motion } from "motion/react";
import { CircleDashed, Lock, Mail, User, X } from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { logger } from '../lib/logger';

type propType = {
    open: boolean,
    onClose: () => void
}

type stepType = "login" | "signup" | "otp" | "forgot-password" | "reset-otp" | "new-password"

const AuthModal = ({ open, onClose }: propType) => {
    const [step, setStep] = useState<stepType>("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const session = useSession();
    const router = useRouter();
    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            setErrorMessage("All fields are required.");
            return;
        }
        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.post("/api/auth/register", {
                name, email, password
            });
            setErrorMessage("");
            setStep("otp");
            setLoading(false);
        } catch (error: any) {
            logger.error(error);
            setErrorMessage(error.response?.data?.message || "Signup failed");
            setLoading(false);
        }
    }
    const handleVerifyEmail = async () => {
        if (!email.trim() || otp.join("").length < 6) {
            setErrorMessage("Please enter the complete OTP.");
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.post("/api/auth/verify-email", {
                email, otp: otp.join("")
            });
            setErrorMessage("");
            setStep("login");
            setLoading(false);
        } catch (error: any) {
            logger.error(error);
            setErrorMessage(error.response?.data?.message || "Verification failed");
            setLoading(false);
        }
    }
    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            setErrorMessage("Email and password are required.");
            return;
        }
        try {
            setLoading(true);
            const res = await signIn("credentials", {
                email, password, redirect: false
            })
            if (res?.ok && !res?.error) {
                // Refresh server components and navigate to home
                router.refresh();
                router.push('/');
                onClose();
                // Reset form
                setEmail("");
                setPassword("");
                setErrorMessage("");
            } else {
                let msg = "Invalid email or password.";
                if (res?.error === "user_not_found" || res?.error?.includes("user_not_found") || res?.code === "user_not_found") {
                    msg = "No account found with this email.";
                } else if (res?.error === "incorrect_password" || res?.error?.includes("incorrect_password") || res?.code === "incorrect_password") {
                    msg = "Incorrect password. Please try again.";
                } else if (res?.error !== "CredentialsSignin" && res?.error) {
                    msg = res.error;
                }
                setErrorMessage(msg);
            }
            setLoading(false);
        } catch (error: any) {
            logger.error("Login error:", error);
            // In case NextAuth throws an error object instead of returning it
            let msg = "An error occurred. Please try again.";
            if (error?.message?.includes("user_not_found") || error?.type === "user_not_found") {
                msg = "No account found with this email.";
            } else if (error?.message?.includes("incorrect_password") || error?.type === "incorrect_password") {
                msg = "Incorrect password. Please try again.";
            } else if (error?.message?.includes("CredentialsSignin")) {
                msg = "Invalid email or password.";
            }
            setErrorMessage(msg);
            setLoading(false);
        }
    }

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setErrorMessage("Email is required.");
            return;
        }
        try {
            setLoading(true);
            await axios.post("/api/auth/forgot-password", { email });
            setErrorMessage("");
            setStep("reset-otp");
            setLoading(false);
        } catch (error: any) {
            logger.error(error);
            setErrorMessage(error.response?.data?.message || "Something went wrong");
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email.trim() || otp.join("").length < 6 || !password.trim()) {
            setErrorMessage("All fields are required and OTP must be complete.");
            return;
        }
        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters.");
            return;
        }
        try {
            setLoading(true);
            await axios.post("/api/auth/reset-password", {
                email,
                otp: otp.join(""),
                newPassword: password
            });
            setErrorMessage("");
            setStep("login");
            setLoading(false);
            // reset fields
            setPassword("");
            setOtp(["", "", "", "", "", ""]);
        } catch (error: any) {
            logger.error(error);
            setErrorMessage(error.response?.data?.message || "Reset failed");
            setLoading(false);
        }
    };

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
                                                <div className='flex justify-end'>
                                                    <div onClick={() => { setErrorMessage(""); setStep("forgot-password"); }} className='text-xs font-medium hover:underline cursor-pointer text-gray-500'>Forgot Password?</div>
                                                </div>
                                                {errorMessage && (<p className='text-red-500 text-sm font-medium'>{errorMessage}</p>)}
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
                                    {step === "forgot-password" && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            <h1 className='text-xl font-semibold'>Reset Password</h1>
                                            <p className="text-sm text-gray-500 mt-2">Enter your email to receive an OTP.</p>
                                            <div className='mt-5 space-y-4'>
                                                <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                                                    <Mail size={18} className='text-gray-500' />
                                                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder='Email address' className='w-full bg-transparent outline-none text-sm' />
                                                </div>
                                                {errorMessage && (<p className='text-red-500 text-sm font-medium'>{errorMessage}</p>)}
                                                <button disabled={loading} onClick={handleForgotPassword} className='w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center'>{!loading ? "Send OTP" : <CircleDashed size={18} className='animate-spin' color='white' />}</button>
                                            </div>
                                            <div onClick={() => { setErrorMessage(""); setStep("login"); }} className='mt-6 text-center text-sm font-medium hover:underline cursor-pointer'>Back to Login</div>
                                        </motion.div>
                                    )}

                                    {step === "reset-otp" && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            <h2 className='text-xl font-semibold'>Enter OTP</h2>
                                            <p className="text-sm text-gray-500 mt-2">Enter the OTP sent to your email.</p>
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
                                            <button onClick={() => { setErrorMessage(""); setStep("new-password"); }} className='mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition text-sm flex items-center justify-center'>Verify OTP</button>
                                            <div onClick={() => { setErrorMessage(""); setStep("login"); }} className='mt-6 text-center text-sm font-medium hover:underline cursor-pointer'>Back to Login</div>
                                        </motion.div>
                                    )}

                                    {step === "new-password" && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                            <h1 className='text-xl font-semibold'>New Password</h1>
                                            <p className="text-sm text-gray-500 mt-2">Enter your new password below.</p>
                                            <div className='mt-5 space-y-4'>
                                                <div className='flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3'>
                                                    <Lock size={18} className='text-gray-500' />
                                                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder='New Password' className='w-full bg-transparent outline-none text-sm' />
                                                </div>
                                                {errorMessage && (<p className='text-red-500 text-sm font-medium'>{errorMessage}</p>)}
                                                <button disabled={loading} onClick={handleResetPassword} className='w-full h-11 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 transition flex items-center justify-center'>{!loading ? "Reset Password" : <CircleDashed size={18} className='animate-spin' color='white' />}</button>
                                            </div>
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