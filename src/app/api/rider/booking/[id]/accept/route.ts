import { NextRequest } from "next/server";

export async function POST(reque: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        if (!id) {
            return Response.json({
                message: "Booking id is required"
            }, { status: 400 })
        }

    } catch (error) {

    }
}