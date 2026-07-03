import { getSocket } from '@/lib/socket';
import React, { useEffect, useRef } from 'react'

const GeoUpdater = ({ userId }: { userId: string }) => {
    const socketRef = useRef<any>(null);

    useEffect(() => {
        if (!userId) return;

        if (!navigator.geolocation) return;

        socketRef.current = getSocket()
        socketRef.current.emit("identity")
    }, [userId])
    return (
        <div>GeoUpdater</div>
    )
}

export default GeoUpdater