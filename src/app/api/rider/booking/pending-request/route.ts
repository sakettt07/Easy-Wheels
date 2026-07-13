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
        const count = await Booking.countDocuments({
            rider: user._id,
            bookingStatus: "requested"
        })
        return Response.json({
            message: "success",
            count: count
        }, { status: 200 })
    } catch (error) {
        console.error("error in pending request", error);
        return Response.json({
            message: "Internal server error"
        }, { status: 500 })
    }
}