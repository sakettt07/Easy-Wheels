import connectDb from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();


    } catch (error) {
        return Response.json({
            message: `Internal server error at accept booking ${error}`
        }, { status: 500 })
    }
}