import { logger } from "@/lib/logger";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const user = await User.findOne({ email: session?.user?.email });
        if (!user) {
            return Response.json({
                message: "Rider not found"
            }, { status: 400 })
        }
        const booking = await Booking.find({
            rider: user._id,
            bookingStatus: {
                $in: ["confirmed", "started"]
            }
        }).populate("user").populate("vehicle").populate("rider");
        return Response.json({
            message: "Fetching active rides successfully",
            booking
        }, { status: 200 })
    } catch (error: any) {
        logger.error("Error fetching active rides", error);
        return Response.json({
            message: `Internal server error at active rides ${error}`
        }, { status: 500 })
    }
}