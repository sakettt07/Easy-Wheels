import { NextRequest } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import axios from "axios";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const { id } = await context.params;
        if (!id) {
            return Response.json({
                message: "Booking id is required"
            }, { status: 400 })
        }
        const booking = await Booking.findById(id);
        if (!booking) {
            return Response.json({
                message: "Booking not found"
            }, { status: 404 })
        }
        booking.bookingStatus = "rejected"
        await booking.save()
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
            event: "booking-rejected",
            to: booking.user,
            data: booking.bookingStatus
        })
        return Response.json({
            message: "Booking rejected successfully"
        }, { status: 200 })
    } catch (error) {
        console.error("Error rejecting booking", error);
        return Response.json({
            message: `Internal server error at reject booking ${error}`
        }, { status: 500 })
    }
}