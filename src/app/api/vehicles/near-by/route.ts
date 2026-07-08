import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { longitude, latitude, vehicleType } = await req.json();
        if (!longitude || !latitude) {
            return NextResponse.json({
                message: "Coordinates not found"
            }, { status: 400 })
        }
        // TODO :
        // Fetch Riders which are online
        // Fetch those riders which are approved 
        // Fetch Within the 5KM pickup radius
        // Has the same selected VehicleType
        const riders = await User.find({
            role: "rider",
            isOnline: true,
            riderStatus: "approved",
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: 4000
                }
            }

        })
        const riderIds = riders.map(r => r._id);
        if (riderIds.length == 0) {
            return Response.json({
                message: "Vehicles not found",
            }, { status: 200 })
        }
        const vehicles = await Vehicle.find({
            owner: {
                $in: riderIds
            }, type: vehicleType, status: "approved", isActive: true
        }).lean();
        return NextResponse.json(vehicles, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { message: `Near by vehicles error ${error}` },
            { status: 500 }
        )
    }
}