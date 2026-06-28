import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email || session.user?.role !== "admin") {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const vehicleId = (await context.params).id
        const vehicle = await Vehicle.findById(vehicleId);

        if (!vehicle) {
            return Response.json({
                message: "Vehicle not found"
            },
                { status: 400 }
            );
        }
        vehicle.status = "approved"
        vehicle.rejectionReason = undefined
        await vehicle.save();

        const rider = await User.findById(vehicle.owner)
        if (!rider) {
            return Response.json({
                message: "Rider not found"
            },
                { status: 400 }
            );
        }
        rider.riderOnboardingSteps = 7
        await rider.save();
        return Response.json(
            vehicle, { status: 200 }
        )

    } catch (error) {
        return Response.json({
            message: `Admin vehicle approved get error ${error}`
        },
            { status: 500 }
        );
    }
}