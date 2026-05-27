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
            return Response.json({ message: "unauthorized" }, { status: 401 })
        }
        const user = await User.findOne({ email: session?.user?.email });
        if (!user) {
            return Response.json({ message: "user not found" }, { status: 400 })
        }
        const formData = await req.formData();
        const aadharFile = formData.get("aadhar") as Blob | null
        const licenseFile = formData.get("license") as Blob | null
        const rcFile = formData.get("rc") as Blob | null

        const aadharUrl = formData.get("aadharUrl") as string | null
        const licenseUrl = formData.get("licenseUrl") as string | null
        const vehicleRC = formData.get("vehicleRC") as string | null

        const hasAadhar = !!(aadharFile || aadharUrl)
        const hasLicense = !!(licenseFile || licenseUrl)
        const hasRc = !!(rcFile || vehicleRC)

        if (!hasAadhar || !hasLicense || !hasRc) {
            return Response.json({ message: "All documents are required" }, { status: 400 })
        }
        const updatePayload: any = { status: "pending" }
        if (aadharFile) {
            const url = await uploadOnCloud(aadharFile)
            if (!url) return Response.json({ message: "Aadhar upload failed" }, { status: 500 })
            updatePayload.aadharUrl = url
        } else if (aadharUrl) {
            updatePayload.aadharUrl = aadharUrl
        }
        // License — upload new file if provided, else keep existing URL
        if (licenseFile) {
            const url = await uploadOnCloud(licenseFile)
            if (!url) return Response.json({ message: "License upload failed" }, { status: 500 })
            updatePayload.licenseUrl = url
        } else if (licenseUrl) {
            updatePayload.licenseUrl = licenseUrl
        }
        // RC — upload new file if provided, else keep existing URL
        if (rcFile) {
            const url = await uploadOnCloud(rcFile)
            if (!url) return Response.json({ message: "Vehicle RC upload failed" }, { status: 500 })
            updatePayload.vehicleRC = url
        } else if (vehicleRC) {
            updatePayload.vehicleRC = vehicleRC
        }
        const riderDocs = await RiderDocs.findOneAndUpdate(
            { owner: user._id },
            { $set: updatePayload },
            { upsert: true, new: true }
        )
        if (user.riderOnboardingSteps < 2) {
            user.riderOnboardingSteps = 2
        }
        else {
            user.riderOnboardingSteps = 3

        }
        user.riderStatus = "pending"
        await user.save();
        return Response.json(riderDocs, { status: 201 })
    } catch (error) {
        return Response.json({ message: `Rider Document upload - ${error}` }, { status: 500 })
    }
}
export async function GET(req: NextRequest) {
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
        let docs = await RiderDocs.findOne({ owner: user._id });
        if (docs) {
            return Response.json(docs, { status: 200 })
        }
        else {
            return null;
        }
    } catch (error) {
        return Response.json({
            message: `Rider Documents data fetch : ${error}`
        }, { status: 500 })
    }
}