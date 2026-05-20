import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {

}
export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email || session.user?.role !=== "admin") {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const totalRiders = await User.countDocuments({ role: "rider" });
        const totalApprovedRiders = await
    } catch (error) {

    }
}