import { logger } from "@/lib/logger";
import connectDb from "@/lib/db";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const geminiUrl = process.env.GEMINI_API_URL!

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const { lastMessage, role } = await req.json();
        if (!lastMessage || !role) {
            return NextResponse.json({ message: "All fields are required", status: 400 });
        }
        const prompt = `You are an AI reply suggestion system for a vehicle booking chat application.
        Generate short, smart, human-like quick reply suggestions based on:
        - ROLE (DRIVER or USER)
        - RECENT_MESSAGE
        
        Rules:
        - Return Exactly 3 suggestions
        - Keep replies short (3-12 words)
        - Match the conversation context and tone
        - Driver replies should sound professional and helpful
        - User replies should sound natural and conversational
        - Avoid repetitive or generic suggestions
        - Return only valid JSON
        
        
        Output format:
        {
          suggestions: [
            "Reply 1",
            "Reply 2",
            "Reply 3",
          ]
        }
          
        Input:
        ROLE: "${role}"
        RECENT_MESSAGE: ${lastMessage}`
        const response = await axios.post(geminiUrl, {
            "contents": [
                {
                    "parts": [
                        { "text": `${prompt}` }
                    ]
                }
            ]
        })
        const suggestion = response.data?.candidates?.[0]?.content?.parts?.[0]?.text
        const parsedSuggestion = JSON.parse(suggestion)

        return NextResponse.json({
            success: true,
            data: parsedSuggestion
        });
    } catch (error) {
        logger.info(error);
        return NextResponse.json({ message: "Internal server error at get all ai suggestions", status: 500 });
    }
}