import { logger } from "@/lib/logger";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const { bookingId } = await req.json();
        if (!bookingId) {
            return Response.json({
                message: "Booking ID is required"
            }, { status: 400 })
        }
        const booking = await Booking.findById(bookingId).populate("user").populate("vehicle").populate("rider");
        return Response.json({
            message: "Fetching active rides successfully",
            booking
        }, { status: 200 })
    } catch (error: any) {
        logger.error("Error fetching active rides", error);
        return Response.json({
            message: `Internal server error at active rides user ${error}`
        }, { status: 500 })
    }
}