import { auth } from "@/auth";
import uploadOnCloud from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json(
                {
                    message: "unauthorized"
                },
                { status: 401 }
            );
        }
        const rider = await User.findOne({ email: session.user.email })

        if (!rider) {
            return Response.json(
                {
                    message: "Rider not found"
                },
                { status: 400 }
            );
        }
        const vehicle = await Vehicle.findOne({ owner: rider._id })
        if (!rider) {
            return Response.json({
                message: "vehicle not found"
            }, { status: 400 })
        }
        const formData = await req.formData()
        const image = formData.get("vehicleImage") as File | null
        const baseFare = formData.get("baseFare")
        const waitingCharge = formData.get("waitingCharge")
        const pricePerKM = formData.get("pricePerKM")
        let updated = false

        if (image && image.size > 0) {
            const imageUrl = await uploadOnCloud(image)
            vehicle.imageUrl = imageUrl
            updated = true
        }
        if (baseFare !== null) {
            vehicle.baseFare = Number(baseFare)
            updated = true
        }
        if (waitingCharge !== null) {
            vehicle.waitingCharge = Number(waitingCharge)
            updated = true
        }
        if (pricePerKM !== null) {
            vehicle.pricePerKM = Number(pricePerKM)
            updated = true
        }
        if (updated == false) {
            return Response.json({ message: "Nothing to update" }, { status: 400 })
        }
        vehicle.status = "pending"
        vehicle.rejectionReason = undefined
        await vehicle.save()
        rider.riderOnboardingSteps = 6
        await rider.save()
        return Response.json({ message: "Pricing Submitted" }, { status: 200 })
    } catch (error) {
        console.log(error)
        return Response.json({ message: `Nothing to update ${error}` }, { status: 500 })
    }
}

export async function GET() {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json(
                {
                    message: "unauthorized"
                },
                { status: 401 }
            );
        }
        const rider = await User.findOne({ email: session.user.email })
        if (!rider) {
            return Response.json(
                {
                    message: "Rider not found"
                },
                { status: 400 }
            );
        }
        const vehicle = await Vehicle.findOne({ owner: rider._id })
        if (!rider) {
            return Response.json({
                message: "vehicle not found"
            }, { status: 400 })
        }
        return Response.json(vehicle, { status: 200 })
    } catch (error) {
        return Response.json(
            {
                message: `Pricing get error ${error}`
            },
            { status: 500 }
        );
    }
}