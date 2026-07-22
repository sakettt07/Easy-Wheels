import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest } from "next/server"
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const { id } = await context.params;
        if (!id) {
            return Response.json({
                message: "Booking id is required"
            }, { status: 400 })
        }
        const booking = await Booking.findById(id);

        if (!booking || (booking.bookingStatus !== "requested" && booking.bookingStatus !== "awaiting_payment")) {
            return Response.json({
                message: "Booking not found or status is not valid for confirmation"
            }, { status: 400 })
        }
        booking.bookingStatus = "confirmed"
        booking.paymentStatus = "cash"
        await booking.save();
        return Response.json({
            message: "Booking confirmed successfully"
        }, { status: 200 })

    } catch (error) {
        console.error("Error confirming booking", error);
        return Response.json({
            message: `Internal server error at confirming booking ${error}`
        }, { status: 500 })
    }
}