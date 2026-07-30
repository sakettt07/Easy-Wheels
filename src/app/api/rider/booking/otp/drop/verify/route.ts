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
        if (!booking.dropOTP || !booking.dropOTPExpire || booking.dropOTP !== otp || new Date() > booking.dropOTPExpire) {
            return NextResponse.json({
                message: "Invalid OTP"
            }, { status: 400 })
        }
        if (booking.paymentStatus === "cash") {
            booking.adminCommission = booking.fare * 0.10;
            booking.riderAmount = booking.fare - booking.adminCommission;
        }
        booking.bookingStatus = "completed"
        booking.paymentStatus = "paid"
        booking.dropOTP = ""
        booking.dropOTPExpire = undefined
        await booking.save()
        return NextResponse.json({
            message: "OTP verified successfully",
            booking
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({
            message: error.message || "Internal Server Error at Drop OTP verification"
        }, { status: 500 })
    }
}