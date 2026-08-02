import { logger } from "@/lib/logger";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ booking: null })
        }
        const user = await User.findOne({ email: session?.user?.email })
        const booking = await Booking.findOne({
            user: user._id,
            bookingStatus: { $in: ["requested", "awaiting_payment", "confirmed", "started"] }
        })
        if (!booking) {
            return NextResponse.json({
                booking: "idle"
            })
        }

        // Lazy expiration check
        if (booking.bookingStatus === "requested" || booking.bookingStatus === "awaiting_payment") {
            const now = new Date().getTime();
            // Use updatedAt so if they just accepted it, they have 5 mins to pay
            const lastUpdate = new Date(booking.updatedAt || booking.createdAt).getTime();
            const diffInMinutes = (now - lastUpdate) / (1000 * 60);

            if (diffInMinutes > 5) {
                booking.bookingStatus = "expired";
                await booking.save();

                if (booking.rider) {
                    try {
                        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
                            event: "new-booking", // Tells rider to refresh their pending requests
                            to: booking.rider.toString(),
                            data: { bookingId: booking._id }
                        });
                    } catch (err: any) {
                        logger.error("Socket emit failed on expiration", err);
                    }
                }

                return NextResponse.json({
                    booking: "idle"
                });
            }
        }

        return NextResponse.json({
            booking
        })


    } catch (error) {
        return Response.json({
            message: `Internal server error at accept booking ${error}`
        }, { status: 500 })
    }
}