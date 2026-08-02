import { logger } from "@/lib/logger";
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
        booking.bookingStatus = "cancelled"
        await booking.save();
        return Response.json({
            message: "Booking cancelled successfully"
        }, { status: 200 })

    } catch (error: any) {
        logger.error("Error cancelling booking", error);
        return Response.json({
            message: `Internal server error at cancelling booking ${error}`
        }, { status: 500 })
    }
}