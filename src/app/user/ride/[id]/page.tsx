"use client";
import dynamic from "next/dynamic";
const LiveRideMap = dynamic(() => import("@/components/LiveRideMap"), { ssr: false });
import PanelContent from "@/components/PanelContent";
import { motion } from "motion/react";
import { BookingStatus, IBooking } from "@/models/booking.model";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";

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

export default function Page() {
    const params = useParams();
    const bookingId = params?.id as string;

    const [booking, setBooking] = useState<IBooking | null>(null);
    const [loading, setLoading] = useState(false);
    const [driverPos, setDriverPosition] = useState<[number, number] | null>(null);
    const [pickupPosition, setPickupPosition] = useState<[number, number] | null>(null)
    const [dropPosition, setDropPosition] = useState<[number, number] | null>(null)

    const fetchActiveBooking = async () => {
        if (!bookingId) return;
        try {
            setLoading(true);
            const { data } = await axios.post("/api/user/active-ride", {
                bookingId: bookingId
            });
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
    }, [bookingId])
    useEffect(() => {
        const socket = getSocket();
        socket.emit("join-ride", bookingId);
        socket.on("driver-location-update", (data) => {
            console.log(data);
            setDriverPosition([data.latitude, data.longitude])
        })

        return () => {
            socket.emit("leave-rider", bookingId);
        }
    }, [bookingId])

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative h-screen w-full flex flex-col md:flex-row overflow-hidden bg-zinc-950">
            {/* Map Area - Full height on mobile so drawer overlays it */}
            <div className="w-full md:flex-1 relative h-screen">
                <LiveRideMap
                    driverLocation={driverPos}
                    mapStatus={booking ? MAP_STATUS[booking.bookingStatus] : 'arriving'}
                    pickupPosition={pickupPosition}
                    dropPosition={dropPosition}
                />
            </div>

            {/* Sidebar / Drawer Panel */}
            {booking && (
                <>
                    {/* Desktop Sidebar */}
                    <div className="hidden md:block w-[420px] h-screen bg-zinc-950 border-l border-zinc-900 overflow-hidden relative z-50">
                        <PanelContent
                            booking={booking}
                            mapStatus={MAP_STATUS[booking.bookingStatus]}
                        />
                    </div>

                    {/* Mobile Drawer */}
                    <motion.div
                        initial={false}
                        animate={{ height: isExpanded ? '90vh' : '50vh' }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="md:hidden absolute bottom-0 left-0 w-full bg-zinc-950 border-t border-zinc-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 flex flex-col overflow-hidden"
                    >
                        {/* Drag Handle */}
                        <div
                            className="w-full flex justify-center items-center py-4 cursor-pointer bg-zinc-950 shrink-0 touch-none"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <div className="w-12 h-1.5 bg-zinc-700 rounded-full hover:bg-zinc-600 transition-colors"></div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-hidden">
                            <PanelContent
                                booking={booking}
                                mapStatus={MAP_STATUS[booking.bookingStatus]}
                            />
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    );
}
