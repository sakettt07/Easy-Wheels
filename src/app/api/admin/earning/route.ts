import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Booking from "@/models/booking.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email || session.user?.role !== "admin") {
            return Response.json({ message: "unauthorized" }, { status: 401 });
        }
        
        const bookings = await Booking.find({
            bookingStatus: "completed"
        }).sort({ createdAt: 1 });

        let totalRevenue = 0; 
        let grossVolume = 0; 
        let totalRides = bookings.length;

        const chartDataMap: Record<string, { revenue: number, volume: number }> = {};
        
        let cashPayments = 0;
        let onlinePayments = 0;

        bookings.forEach(booking => {
            const revenue = booking.adminCommission || 0;
            const volume = booking.fare || 0;
            totalRevenue += revenue;
            grossVolume += volume;

            if (booking.paymentStatus === 'cash') cashPayments++;
            else onlinePayments++;

            const date = new Date(booking.createdAt);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!chartDataMap[dateStr]) chartDataMap[dateStr] = { revenue: 0, volume: 0 };
            chartDataMap[dateStr].revenue += revenue;
            chartDataMap[dateStr].volume += volume;
        });

        if (Object.keys(chartDataMap).length === 0) {
            const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            chartDataMap[today] = { revenue: 0, volume: 0 };
        }

        const chartData = Object.keys(chartDataMap).map(date => ({
            date,
            revenue: chartDataMap[date].revenue,
            volume: chartDataMap[date].volume
        }));

        const activeUsers = await User.countDocuments({ role: 'user' });
        const activeRiders = await User.countDocuments({ role: 'rider', riderStatus: 'approved' });

        return Response.json({
            message: "Admin earnings fetched successfully",
            stats: {
                totalRevenue,
                grossVolume,
                totalRides,
                activeUsers,
                activeRiders,
                paymentBreakdown: {
                    cash: cashPayments,
                    online: onlinePayments
                }
            },
            chartData
        }, { status: 200 });

    } catch (error: any) {
        return Response.json({ message: error.message || "Internal Server Error" }, { status: 500 });
    }
}