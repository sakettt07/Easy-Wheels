import { auth } from "@/auth";
import connectDb from "@/lib/db";
import RiderBank from "@/models/riderBank.model";
import RiderDocs from "@/models/riderDocs.model";
import User from "@/models/user.model";
import { param } from "motion/react-client";
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
        if (rider.riderStatus === "approved") {
            return Response.json({
                message: "rider already approved"
            }, { status: 400 })
        }
        const documents = await RiderDocs.findOne({ owner: riderId });
        const bank = await RiderBank.findOne({ owner: riderId });
        if (!documents || !bank) {
            return Response.json({
                message: `Rider didn't completed the onboarding steps`
            }, { status: 400 })
        }
        rider.riderStatus = "approved"
        rider.videoKYCStatus = "pending"
        rider.riderOnboardingSteps = 4
        await rider.save();
        documents.status = "approved"
        await documents.save();
        bank.status = "verified"
        await bank.save()
        return Response.json({
            message: `Rider approved successfully`
        }, { status: 200 })

    } catch (error) {
        return Response.json({
            message: `Rider details get error : ${error}`
        }, { status: 500 })
    }
}