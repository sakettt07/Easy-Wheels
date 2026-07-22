import connectDb from "@/lib/db";
import razorpay from "@/lib/razorpay";
import Booking from "@/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { bookingId } = await req.json();
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 })
        }

        const orderDetails = await razorpay.orders.create({
            amount: booking.fare * 100,
            currency: "INR",
            receipt: `booking_${booking._id}`
        })

        booking.bookingStatus = "awaiting_payment"

        await booking.save();
        return NextResponse.json({ orderDetails }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }
}