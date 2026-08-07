import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();

        const { riderId, rating, comment, bookingId } = await req.json();




    } catch (error) {

    }
}