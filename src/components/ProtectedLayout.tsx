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
            toast.error("Please login to access")
            router.push('/')
        } else if (status === 'authenticated') {
            if (allowedRole && userData?.role && userData.role !== allowedRole) {
                toast.error(`Access denied. Must be a ${allowedRole}.`)
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
