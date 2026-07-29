import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendEmail";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { bookingId } = await req.json();
        const booking = await Booking.findById(bookingId).populate("user");
        if (!booking) {
            return NextResponse.json({
                message: "Booking not found"
            }, { status: 404 })
        }
        const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
        const dropOTP = generateOTP();
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000);
        booking.dropOTP = dropOTP;
        booking.dropOTPExpire = otpExpire;
        await booking.save();
        if (booking.user.email) {
            await sendMail(
                booking.user.email,
                "Easy Wheels - Drop OTP",
                `Your drop OTP is <strong>${dropOTP}</strong>`
            )
        }
        return NextResponse.json({
            message: "OTP sent successfully",
            booking
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({
            message: error.message || "Internal Server Error"
        }, { status: 500 })
    }
}