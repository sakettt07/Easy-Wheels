import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

const vehicle_regex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/;
export async function POST(req: Request) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const user = await User.findOne({ email: session?.user?.email });
        if (!user) {
            return NextResponse.json({
                message: "user not found"
            }, { status: 400 })
        }
        const { type, vehicleNumber, vehicleModel } = await req.json();
        if (!type || !vehicleModel || !vehicleNumber) {
            return NextResponse.json({
                message: "All fields are required"
            }, { status: 400 })
        }
        const cleaned = vehicleNumber.replace(/\s+/g, "").toUpperCase();
        if (!vehicle_regex.test(cleaned)) {
            return NextResponse.json({
                message: "Invalid Vehicle Number"
            }, { status: 400 })
        }
        const vehicleNumberUp = cleaned.toUpperCase();


        let vehicle = await Vehicle.findOne({
            owner: user?._id
        })
        if (vehicle) {
            vehicle.type = type
            vehicle.vehicleNumber = vehicleNumberUp
            vehicle.vehicleModel = vehicleModel
            vehicle.status = "pending"
            if (user.riderOnboardingSteps < 2) {
                user.riderOnboardingSteps = 2
                user.riderStatus = "pending"
                await vehicle.save()

            }
            else {
                user.riderOnboardingSteps = 3
                user.riderStatus = "pending"
                await vehicle.save()
            }
            await vehicle.save()
            return NextResponse.json(vehicle, { status: 200 })
        }
        const duplicateVehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumberUp })
        if (duplicateVehicle) {
            return NextResponse.json({
                message: "Vehicle already registered"
            }, { status: 400 })
        }
        vehicle = await Vehicle.create({
            owner: user._id,
            type, vehicleNumber: vehicleNumberUp, vehicleModel
        })
        if (user.riderOnboardingSteps < 1) {
            user.riderOnboardingSteps = 1
        }

        user.role = "rider"
        user.riderStatus = "pending"
        await user.save()
        return NextResponse.json(vehicle, { status: 200 })

    } catch (error) {
        return NextResponse.json({
            message: `vehicle ${error}`
        }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return NextResponse.json({
                message: "unauthorized"
            }, { status: 401 })
        }
        const user = await User.findOne({ email: session?.user?.email });
        if (!user) {
            return NextResponse.json({
                message: "user not found"
            }, { status: 400 })
        }
        let vehicle = await Vehicle.findOne({ owner: user._id });
        if (vehicle) {
            return NextResponse.json(vehicle, { status: 200 })
        }
        else {
            return NextResponse.json(
                {
                    message: "Vehicle details not found",
                },
                { status: 400 })
        }

    } catch (error) {
        return NextResponse.json({
            message: `vehicle data fetch ${error}`
        }, { status: 500 })
    }
}