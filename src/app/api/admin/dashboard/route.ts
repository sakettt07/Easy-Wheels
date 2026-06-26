import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email || session.user?.role !== "admin") {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const totalRiders = await User.countDocuments({ role: "rider" });
        const totalApprovedRiders = await User.countDocuments({ role: "rider", riderStatus: "approved" });
        const totalRejectedRiders = await User.countDocuments({ role: "rider", riderStatus: "rejected" });
        const totalPendingRiders = await User.countDocuments({ role: "rider", riderStatus: "pending" });

        const pendingRiderUsers = await User.find({
            role: "rider",
            riderStatus: "pending",
            riderOnboardingSteps: { $gte: 3 }
        })
        const riderIds = pendingRiderUsers.map((p) => p._id);
        const riderVehicles = await Vehicle.find({
            owner: { $in: riderIds }
        })
        const vehicleTypeMap = new Map(
            riderVehicles.map((v) => [String(v.owner), v.type])
        )
        const pendingRiderReviews = pendingRiderUsers.map((p) => ({
            _id: p._id,
            name: p.name,
            email: p.email,
            vehicleType: vehicleTypeMap.get(String(p._id))
        }));
        const pendingVehicles = await Vehicle.find({
            status: "pending"
        }).populate("owner")

        return NextResponse.json({
            pendingVehicles,
            stats: {
                totalRiders, totalApprovedRiders, totalPendingRiders, totalRejectedRiders
            }, pendingRiderReviews
        }, {
            status: 200
        });
    } catch (error) {
        return NextResponse.json({
            message: `Dashboard error: ${error}`
        }, { status: 500 })
    }
}