import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ message: "unauthorized" }, { status: 401 });
        }
        
        const admin = await User.findOne({ email: session.user.email, role: 'admin' });
        if (!admin) {
            return Response.json({ message: "Forbidden" }, { status: 403 });
        }

        const completedRides = await Booking.find({ bookingStatus: 'completed' })
            .populate('user', 'name email')
            .populate('rider', 'name email')
            .sort({ createdAt: -1 });

        const breakdown = completedRides.map(ride => ({
            _id: ride._id,
            date: ride.createdAt,
            userName: (ride.user as any)?.name || 'Unknown User',
            riderName: (ride.rider as any)?.name || 'Unknown Rider',
            fare: ride.fare || 0,
            riderEarning: ride.riderAmount || 0,
            adminCommission: ride.adminCommission || 0,
            paymentStatus: ride.paymentStatus
        }));

        return Response.json({
            message: "Earning breakdown fetched successfully",
            breakdown
        }, { status: 200 });

    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}
