"use client";
import LiveRideMap from "@/components/LiveRideMap";
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
            setBooking(data.booking);
            if (data.booking) {
                setPickupPosition([data.booking.pickupLocation.coordinates[1], data.booking.pickupLocation.coordinates[0]]);
                setDropPosition([data.booking.dropLocation.coordinates[1], data.booking.dropLocation.coordinates[0]]);
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
            setDriverPosition([lng, lat])
        }, (error) => {
            console.log(error.message)
        }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 2000 });
        return () => navigator.geolocation.clearWatch(watchId)
    }, [])
    return (
        <div>
            <LiveRideMap driverLocation={driverPos} mapStatus={MAP_STATUS[booking?.bookingStatus!]} pickupPosition={pickupPosition} dropPosition={dropPosition} />
        </div>
    );
}
export default page