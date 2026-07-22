import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const bookings = await Booking.find({
            user: session.user.id,
        }).populate("user rider vehicle").sort({ createdAt: -1 })
        return NextResponse.json({
            message: "Fetch User pending bookings",
            bookings: bookings
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            message: `Internal server error at rider bookings fetch ${error}`
        }, { status: 500 })
    }
}