import connectDb from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const { bookingId } = await req.json();
        if (!bookingId) {
            return NextResponse.json({ message: "All fields are required", status: 400 });
        }
        const chatMessages = await ChatMessage.find({ bookingId }).sort({ createdAt: 1 });
        return NextResponse.json({ chatMessages, status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error at get all messages", status: 500 });
    }
}