import connectDb from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
    } catch (error) {
        return NextResponse.json({ message: "Internal server error at get all ai suggestions", status: 500 });
    }
}