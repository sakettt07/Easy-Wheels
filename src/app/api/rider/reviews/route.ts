import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Review from "@/models/review.model";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { auth } from "@/auth";

export async function GET(req: Request) {
    try {
        await connectDb();
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Fetch all reviews where the rider is the logged-in user
        const reviews = await Review.find({ rider: session.user.id })
            .populate("user", "name email")
            .populate("booking", "createdAt dropAddress pickupAddress")
            .sort({ createdAt: -1 });

        // Calculate average rating
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
            : 0;

        return NextResponse.json({
            reviews,
            averageRating: Number(averageRating),
            totalReviews
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: "Failed to fetch reviews", error: error.message }, { status: 500 });
    }
}
