import { auth } from "@/auth";
import uploadOnCloud from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { form } from "motion/react-client";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const user = await User.findOne({ email: session?.user?.email });
        if (!user) {
            return Response.json({
                message: "user not found"
            }, { status: 400 })
        }
        const formData = await req.formData();
        const aadhar = formData.get("aadhar") as Blob | null
        const license = formData.get("license") as Blob | null
        const rc = formData.get("rc") as Blob | null
        if (!aadhar || !rc || !license) {
            return Response.json({
                message: "All documents are required"
            }, { status: 400 })
        }

        const updatePayload: any = {
            status: "pending",
        }
        if (aadhar) {
            const url = await uploadOnCloud(aadhar)
            if (!url) {
                return Response.json({
                    message: "Aadhar upload failed"
                }, { status: 500 })
            }
            // 10:02
        }
    } catch (error) {
        return Response.json({
            message: `Document upload - ${error}`
        }, { status: 500 })
    }
}