import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email || session.user?.role !== "admin") {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const rider = await User.find({
            role: "rider",
            videoKYCStatus: { $in: ["pending", "in_progress"] }
        })
        return Response.json({
            rider
        }, { status: 200 })
    } catch (error) {
        return Response.json({
            message: `RIder KYC get error: ${error}`
        }, { status: 500 })
    }
}