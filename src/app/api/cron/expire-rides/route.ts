import { NextResponse } from "next/server";
import Booking from "@/models/booking.model";
import connectDb from "@/lib/db";

export async function POST(req: Request) {
    try {
        await connectDb();

        const activeStatuses = ['requested', 'confirmed', 'started'];

        // Find bookings that are active but older than the start of today, or simply just 
        // the user said "if the day ends". So let's find any active booking where createdAt is before today.
        // Wait, if it runs at midnight, it expires EVERYTHING that is still active.
        // Let's just expire all bookings that are in activeStatuses.
        // If a ride is started at 11:50 PM, should it expire at 11:59 PM? That might be an edge case.
        // Let's assume ANY active ride gets expired by the end-of-day cron.

        const result = await Booking.updateMany(
            { bookingStatus: { $in: activeStatuses } },
            { $set: { bookingStatus: 'expired' } }
        );

        return NextResponse.json(
            { message: "Active rides expired successfully", modifiedCount: result.modifiedCount },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { message: "Failed to expire rides", error: error.message },
            { status: 500 }
        );
    }
}
