import ProtectedLayout from '@/components/ProtectedLayout'
import React from 'react'

export default function RiderLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedLayout allowedRole="rider">
            {children}
        </ProtectedLayout>
    )
}
