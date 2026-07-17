import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const user = await User.findOne({ email: session?.user?.email })
        const booking = await Booking.findOne({
            user: user._id
        })
        if (!booking) {
            return NextResponse.json({
                message: "booking not found"
            }, { status: 404 })
        }
        return NextResponse.json({

        })


    } catch (error) {
        return Response.json({
            message: `Internal server error at accept booking ${error}`
        }, { status: 500 })
    }
}