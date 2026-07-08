'use client'
import { getSocket } from '@/lib/socket';
import React, { useEffect, useRef } from 'react'

const GeoUpdater = ({ userId }: { userId: string }) => {
    const socketRef = useRef<any>(null);
    const watcherRef = useRef<number | null>(null);

    useEffect(() => {
        if (!userId) return;

        if (!navigator.geolocation) {
            console.error('[GeoUpdater] Geolocation not supported');
            return;
        }

        const socket = getSocket();
        socketRef.current = socket;

        // Wait for socket to be connected before emitting identity
        const connectHandler = () => {
            console.log('[GeoUpdater] Socket connected, emitting identity:', userId);
            socket.emit("identity", userId);
            startWatchingLocation(socket, userId);
        };

        if (socket.connected) {
            connectHandler();
        } else {
            socket.on('connect', connectHandler);
        }

        return () => {
            if (watcherRef.current !== null) {
                navigator.geolocation.clearWatch(watcherRef.current);
                console.log('[GeoUpdater] Cleared geolocation watcher');
            }
            socket.off('connect', connectHandler);
        };
    }, [userId]);

    const startWatchingLocation = (socket: any, userId: string) => {
        if (watcherRef.current !== null) {
            navigator.geolocation.clearWatch(watcherRef.current);
        }

        watcherRef.current = navigator.geolocation.watchPosition(
            ({ coords }) => {
                const locationData = {
                    userId,
                    latitude: coords.latitude,
                    longitude: coords.longitude
                };
                console.log('[GeoUpdater] Emitting location:', locationData);
                console.log('[GeoUpdater] Socket connected status:', socket.connected);
                socket.emit("update-location", locationData);
            },
            (err) => {
                console.error('[GeoUpdater] Geolocation error:', err.code, err.message);
                console.error('[GeoUpdater] Full error object:', err);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 10000
            }
        );
    };

    return null;
}

export default GeoUpdater