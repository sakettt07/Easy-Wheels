import { NextRequest } from "next/server";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";

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
        await booking.save();
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