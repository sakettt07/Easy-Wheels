import { auth } from "@/auth";
import connectDb from "@/lib/db";
import RiderBank from "@/models/riderBank.model";
import RiderDocs from "@/models/riderDocs.model";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        await connectDb();
        const { rejectionReason } = await req.json();
        const session = await auth();
        if (!session || !session.user?.email || session.user?.role !== "admin") {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        };
        const riderId = (await context.params).id
        const rider = await User.findById(riderId);
        if (!rider || rider.role !== "rider") {
            return Response.json({
                message: "rider not found"
            }, { status: 400 })
        };
        rider.riderStatus = "rejected"
        rider.rejectionReason = rejectionReason
        await rider.save();
        return Response.json({
            message: `Rider rejected `
        }, { status: 200 })
    } catch (error) {
        return Response.json({
            message: `Rider details get error : ${error}`
        }, { status: 500 })
    }
}