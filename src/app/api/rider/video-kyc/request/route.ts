import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const user = await User.findOne({ email: session?.user?.email });
        if (!user) {
            return Response.json({
                message: "user not found"
            }, { status: 400 })
        }
        if (user.videoKYCStatus !== "rejected") {
            return Response.json({
                message: "You can't request video kyc again"
            }, { status: 400 })
        }
        user.videoKYCStatus = "pending"
        user.VideoKYCRejectionReason = undefined
        user.videoKYCRoomId = undefined

        await user.save();
        return Response.json({
            message: "Video kyc request sent successfully"
        }, { status: 200 })

    } catch (error) {
        console.error("error in", error)
        return Response.json({
            message: "Internal server error"
        }, { status: 500 })
    }
}