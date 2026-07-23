import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Vehicle from "@/models/vehicle.model";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }

        // Explicitly reference models to prevent tree-shaking
        User;
        Vehicle;

        const bookings = await Booking.find({
            rider: session.user.id,
        }).populate("user rider vehicle").sort({ createdAt: -1 })
        return NextResponse.json({
            message: "Fetch Rider pending bookings",
            bookings: bookings
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            message: `Internal server error at rider bookings fetch ${error}`
        }, { status: 500 })
    }
}