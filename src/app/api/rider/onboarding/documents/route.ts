import { auth } from "@/auth";
import uploadOnCloud from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import RiderDocs from "@/models/riderDocs.model";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
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
            updatePayload.aadharUrl = url
        }
        if (license) {
            const url = await uploadOnCloud(license)
            if (!url) {
                return Response.json({
                    message: "License upload failed"
                }, { status: 500 })
            }
            updatePayload.licenseUrl = url
        }
        if (rc) {
            const url = await uploadOnCloud(rc)
            if (!url) {
                return Response.json({
                    message: "Vehicle RC upload failed"
                }, { status: 500 })
            }
            updatePayload.vehicleRC = url
        }
        const riderDocs = await RiderDocs.findOneAndUpdate({ owner: user._id }, { $set: updatePayload }, { upsert: true, new: true })

        if (user.riderOnboardingSteps < 2) {
            user.riderOnboardingSteps = 2
        }
        await user.save();
        return Response.json(
            riderDocs, { status: 201 })
    } catch (error) {
        return Response.json({
            message: `Rider Document upload - ${error}`
        }, { status: 500 })
    }
}