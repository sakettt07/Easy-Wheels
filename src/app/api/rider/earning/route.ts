import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import RiderDocs from "@/models/riderDocs.model";
import RiderBank from "@/models/riderBank.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ message: "unauthorized" }, { status: 401 });
        }
        
        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return Response.json({ message: "Rider not found" }, { status: 400 });
        }

        const bookings = await Booking.find({
            rider: user._id,
            bookingStatus: "completed"
        }).sort({ createdAt: 1 });

        let totalEarnings = 0;
        let totalCommission = 0;
        let totalRides = bookings.length;

        const chartDataMap: Record<string, number> = {};

        bookings.forEach(booking => {
            const amount = booking.riderAmount || 0;
            const comm = booking.adminCommission || 0;
            totalEarnings += amount;
            totalCommission += comm;

            const date = new Date(booking.createdAt);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            chartDataMap[dateStr] = (chartDataMap[dateStr] || 0) + amount;
        });

        // Add today if empty
        if (Object.keys(chartDataMap).length === 0) {
            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            chartDataMap[today] = 0;
        }

        const chartData = Object.keys(chartDataMap).map(date => ({
            date,
            earnings: chartDataMap[date]
        }));

        const vehicle = await Vehicle.findOne({ user: user._id });
        const docs = await RiderDocs.findOne({ rider: user._id });
        const bank = await RiderBank.findOne({ rider: user._id });

        return Response.json({
            message: "Rider earnings fetched successfully",
            stats: {
                totalEarnings,
                totalCommission,
                totalRides
            },
            chartData,
            profile: {
                vehicle,
                docs,
                bank
            }
        }, { status: 200 });

    } catch (error: any) {
        return Response.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}