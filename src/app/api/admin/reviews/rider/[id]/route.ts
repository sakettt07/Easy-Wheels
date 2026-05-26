import { auth } from "@/auth";
import connectDb from "@/lib/db";
import RiderBank from "@/models/riderBank.model";
import RiderDocs from "@/models/riderDocs.model";
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
        const riderId = (await context.params).id
        const rider = await User.findById(riderId);
        if (!rider || rider.role !== "rider") {
            return Response.json({
                message: "rider not found"
            }, { status: 400 })
        }
        const vehicle = await Vehicle.findOne({ owner: riderId });
        const documents = await RiderDocs.findOne({ owner: riderId });
        const bank = await RiderBank.findOne({ owner: riderId });
        return Response.json({
            rider,
            vehicle: vehicle || null,
            documents: documents || null,
            bank: bank || null
        }, {
            status: 200
        })
    } catch (error) {
        return Response.json({
            message: `Rider details get error : ${error}`
        }, { status: 400 })
    }
}