import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendEmail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { bookingId, otp } = await req.json();
        const booking = await Booking.findById(bookingId).populate("user");
        if (!booking) {
            return NextResponse.json({
                message: "Booking not found"
            }, { status: 404 })
        }
        if (!booking.pickupOTP || !booking.pickupOTPExpire || booking.pickupOTP !== otp || new Date() > booking.pickupOTPExpire) {
            return NextResponse.json({
                message: "Invalid OTP"
            }, { status: 400 })
        }
        booking.bookingStatus = "started"
        booking.pickupOTP = ""
        booking.pickupOTPExpire = undefined
        await booking.save()
        return NextResponse.json({
            message: "OTP verified successfully",
            booking
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({
            message: error.message || "Internal Server Error at Pickup OTP verification"
        }, { status: 500 })
    }
}