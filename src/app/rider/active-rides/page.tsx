"use client";
import dynamic from "next/dynamic";
const LiveRideMap = dynamic(() => import("@/components/LiveRideMap"), { ssr: false });
import PanelContent from "@/components/PanelContent";
import { BookingStatus, IBooking } from "@/models/booking.model";
import axios from "axios";
import React, { useEffect, useState } from "react";

const MAP_STATUS: Record<BookingStatus, "arriving" | "ongoing" | "completed"> = {
    idle: "arriving",
    requested: "arriving",
    awaiting_payment: "arriving",
    confirmed: "arriving",
    started: "ongoing",
    completed: "completed",
    cancelled: "completed",
    rejected: "completed",
    expired: "completed"
}

function page() {
    const [booking, setBooking] = useState<IBooking | null>(null);
    const [loading, setLoading] = useState(false);
    const [driverPos, setDriverPosition] = useState<[number, number] | null>(null);
    const [pickupPosition, setPickupPosition] = useState<[number, number] | null>(null)
    const [dropPosition, setDropPosition] = useState<[number, number] | null>(null)

    const fetchActiveBooking = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/rider/active-rides");
            console.log(data);
            const activeBooking = Array.isArray(data.booking) ? data.booking[0] : data.booking;
            setBooking(activeBooking);
            if (activeBooking) {
                setPickupPosition([activeBooking.pickUpLocation.coordinates[1], activeBooking.pickUpLocation.coordinates[0]]);
                setDropPosition([activeBooking.dropLocation.coordinates[1], activeBooking.dropLocation.coordinates[0]]);
            }
        } catch (error) {

        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchActiveBooking();
    }, [])
    useEffect(() => {
        if (!navigator.geolocation) return;
        const watchId = navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude
            const lng = pos.coords.longitude
            setDriverPosition([lat, lng])
        }, (error) => {
            console.log(error.message)
        }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 });
        return () => navigator.geolocation.clearWatch(watchId)
    }, [])
    return (
        <div className="relative h-screen w-full flex flex-col md:flex-row overflow-hidden bg-zinc-950">
            {/* Map Area */}
            <div className="flex-1 relative h-[50vh] md:h-screen">
                <LiveRideMap 
                    driverLocation={driverPos} 
                    mapStatus={booking ? MAP_STATUS[booking.bookingStatus] : 'arriving'} 
                    pickupPosition={pickupPosition} 
                    dropPosition={dropPosition} 
                />
            </div>
            
            {/* Sidebar Panel */}
            {booking && (
                <div className="w-full md:w-[420px] h-[50vh] md:h-screen bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-900 overflow-y-auto">
                    <PanelContent 
                        booking={booking} 
                        mapStatus={MAP_STATUS[booking.bookingStatus]} 
                    />
                </div>
            )}
        </div>
    );
}
export default page