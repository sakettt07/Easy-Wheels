import connectDb from "@/lib/db";
import ChatMessage from "@/models/chatMessage.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { bookingId, senderRole, message } = await req.json();
        if (!bookingId || !senderRole || !message) {
            return NextResponse.json({ message: "All fields are required", status: 400 });
        }
        const chatMessage = await ChatMessage.create({
            bookingId,
            senderRole,
            message
        })
        return NextResponse.json({ message: "Message sent successfully", status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Internal server error at send message", status: 500 });
    }
}