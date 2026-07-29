import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDb()
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({
                message: "Unauthorized"
            }, { status: 401 })
        }
        const { riderId, vehicleId, pickupAddress, dropAddress, pickUpLocation, dropLocation, fare, mobileNumber } = await request.json();
        if (!riderId || !vehicleId || !pickupAddress || !dropAddress || !pickUpLocation.coordinates || !dropLocation.coordinates || !fare || !mobileNumber) {
            return NextResponse.json({
                message: "Bad Request"
            }, { status: 400 })
        }
        const rider = await User.findById(riderId)
        if (!rider) {
            return NextResponse.json({
                message: "Rider not found"
            }, { status: 404 })
        }
        const existing = await Booking.findOne({
            user: session.user.id,
            bookingStatus: { $in: ["requested", "awaiting_payment", "confirmed", "started"] }
        })
        if (existing) {
            return NextResponse.json({
                message: "You have already one pending booking"
            }, { status: 400 })
        }


        const booking = await Booking.create({
            user: session.user.id,
            rider: riderId,
            vehicle: vehicleId,
            pickupAddress,
            dropAddress,
            pickUpLocation,
            dropLocation,
            fare,
            userMobileNumber: mobileNumber,
            riderMobileNumber: rider.contact || "Not provided",
            bookingStatus: "requested",
        })
        await axios.post(`${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL}/emit`, {
            event: "new-booking",
            to: riderId,
            data: booking
        })

        return NextResponse.json({
            message: "Booking created successfully",
            booking
        }, {
            status: 200
        })

    } catch (error: any) {
        console.log("Booking Create Error:", error.message || error)
        return NextResponse.json({
            message: error.message || "Internal Server Error"
        }, { status: 500 })
    }

}