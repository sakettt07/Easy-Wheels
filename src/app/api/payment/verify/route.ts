import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Booking from "@/models/booking.model";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { bookingId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = await req.json();
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest("hex") as string;

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ message: "Invalid Payment", success: false }, { status: 400 })
        }
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ message: "Booking Not Found", success: false }, { status: 404 })
        }
        booking.paymentStatus = "paid";
        booking.bookingStatus = "confirmed";
        booking.adminCommission = booking.fare * 0.10;
        booking.riderAmount = booking.fare - booking.adminCommission;
        const savedBooking = await booking.save();
        return NextResponse.json({ message: "Payment Verified", success: true, savedBooking }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: `Internal Server Error verify ${error}`, success: false }, { status: 500 })
    }
}