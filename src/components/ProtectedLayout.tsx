'use client'
import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export default function ProtectedLayout({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'user' | 'rider' | 'admin' }) {
    const { status } = useSession()
    const { userData } = useSelector((state: RootState) => state.user)
    const router = useRouter()
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        if (status === 'unauthenticated') {
            toast.error("Please log in to continue")
            router.push('/')
        } else if (status === 'authenticated') {
            if (allowedRole && userData?.role && userData.role !== allowedRole) {
                if (allowedRole === 'user' && userData.role === 'rider') {
                    toast.error("This section is reserved for passengers. Rider accounts cannot book rides.")
                } else if (allowedRole === 'user' && userData.role === 'admin') {
                    toast.error("Administrator account detected. Please use a passenger account to book rides.")
                } else if (allowedRole === 'rider') {
                    toast.error("Rider onboarding required. Please complete registration to access the driver portal.")
                } else if (allowedRole === 'admin') {
                    toast.error("Access restricted. Administrator privileges required.")
                } else {
                    toast.error(`Access restricted. Requires a ${allowedRole} account.`)
                }
                router.push('/')
            } else {
                setIsChecking(false)
            }
        }
    }, [status, router, userData, allowedRole])

    if (status === 'loading' || isChecking) {
        return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>
    }

    return <>{children}</>
}
