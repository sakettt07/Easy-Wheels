import ProtectedLayout from '@/components/ProtectedLayout'
import React from 'react'

export default function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedLayout allowedRole="user">
            {children}
        </ProtectedLayout>
    )
}
