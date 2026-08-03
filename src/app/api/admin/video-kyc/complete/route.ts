import { logger } from "@/lib/logger";
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email || session.user?.role !== "admin") {
            return Response.json(
                {
                    message: "unauthorized"
                },
                { status: 401 }
            );
        }
        const { roomId, action, reason } = await req.json()
        if (!roomId) {
            return Response.json(
                {
                    message: "roomId is required"
                },
                { status: 400 }
            );
        }
        if (!["approved", "rejected"].includes(action)) {
            return Response.json(
                {
                    message: "invalid action"
                },
                { status: 400 }
            );
        }
        const rider = await User.findOne({
            videoKYCRoomId: roomId,
            role: "rider"
        })
        if (!rider) {
            return Response.json(
                {
                    message: "Rider not found"
                },
                { status: 404 }
            );
        }
        if (action === "approved") {
            rider.videoKYCStatus = "approved"
            rider.VideoKYCRejectionReason = undefined
            rider.riderOnboardingSteps = 5
        }
        if (action === "rejected") {
            if (!reason) {
                return Response.json(
                    {
                        message: "Reason is required"
                    },
                    { status: 400 }
                )
            }
            rider.videoKYCStatus = "rejected"
            rider.VideoKYCRejectionReason = reason.trim()
            rider.riderOnboardingSteps = 4
        }

        await rider.save();
        return Response.json(
            {
                message: "Action completed successfully"
            },
            { status: 200 }
        );

    } catch (error: any) {
        logger.error("error in", error);
        return Response.json(
            {
                message: "Internal server error"
            },
            { status: 500 }
        );
    }
}