import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest } from "next/server";

export async function GET(reque: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const { id } = await context.params;
        if (!id) {
            return Response.json({
                message: "Booking id is required"
            }, { status: 400 })
        }
        const booking = await Booking.findById(id);

        if (!booking || booking.bookingStatus != "requested") {
            return Response.json({
                message: "Booking not found or status is not requested"
            }, { status: 400 })
        }
        booking.bookingStatus = "awaiting_payment"
        booking.paymentDeadline = new Date(Date.now() + 5 * 60 * 1000);
        await booking.save();
        return Response.json({
            message: "Booking accepted successfully"
        }, { status: 200 })

    } catch (error) {
        console.error("Error accepting booking", error);
        return Response.json({
            message: `Internal server error at accept booking ${error}`
        }, { status: 500 })
    }
}