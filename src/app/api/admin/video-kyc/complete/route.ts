import { auth } from "@/auth";
import connectDb from "@/lib/db";
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

    } catch (error) {

    }
}