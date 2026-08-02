'use client'
import { logger } from "@/lib/logger";
import { getSocket } from '@/lib/socket';
import React, { useEffect, useRef } from 'react'

const GeoUpdater = ({ userId }: { userId: string }) => {
    const socketRef = useRef<any>(null);
    const watcherRef = useRef<number | null>(null);

    useEffect(() => {
        if (!userId) return;

        if (!navigator.geolocation) {
            logger.error('[GeoUpdater] Geolocation not supported');
            return;
        }

        const socket = getSocket();
        socketRef.current = socket;

        // Wait for socket to be connected before emitting identity
        const connectHandler = () => {
            logger.info({ userId }, '[GeoUpdater] Socket connected, emitting identity:');
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
                logger.info('[GeoUpdater] Cleared geolocation watcher');
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
                logger.info(locationData, '[GeoUpdater] Emitting location:');
                logger.info('[GeoUpdater] Socket connected status:', socket.connected);
                socket.emit("update-location", locationData);
            },
            (err: any) => {
                logger.error('[GeoUpdater] Geolocation error:', err.code, err.message);
                logger.error('[GeoUpdater] Full error object:', err);
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