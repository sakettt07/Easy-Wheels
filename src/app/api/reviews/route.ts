import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Review from "@/models/review.model";
import Booking from "@/models/booking.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        await connectDb();
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { bookingId, riderId, rating, comment } = await req.json();

        if (!bookingId || !riderId || !rating) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Check if already reviewed
        const existingReview = await Review.findOne({ booking: bookingId, user: session.user.id });
        if (existingReview) {
            return NextResponse.json({ message: "You have already reviewed this ride" }, { status: 400 });
        }

        // Create review
        const newReview = await Review.create({
            booking: bookingId,
            user: session.user.id,
            rider: riderId,
            rating: Number(rating),
            comment
        });

        // Update booking isReviewed
        await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });

        return NextResponse.json({ message: "Review submitted successfully", review: newReview }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
