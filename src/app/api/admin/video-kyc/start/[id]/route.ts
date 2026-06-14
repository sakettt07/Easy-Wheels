import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
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

        const riderId = (await context.params).id;

        const rider = await User.findById(riderId);

        if (!rider || rider.role !== "rider") {
            return Response.json(
                {
                    message: "rider not found"
                },
                { status: 400 }
            );
        }

        const roomId = `${rider._id}`;

        rider.videoKYCRoomId = roomId;
        rider.videoKYCStatus = "in_progress";
        rider.riderOnboardingSteps = 4;

        await rider.save();

        return Response.json(
            {
                roomId
            },
            { status: 200 }
        );
    } catch (error) {
        return Response.json(
            {
                message: `Rider Video KYC ${error}`
            },
            { status: 500 }
        );
    }
}