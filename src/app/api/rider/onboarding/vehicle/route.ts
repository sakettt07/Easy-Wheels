import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Vehicle from "@/models/vehicle.model";
import { number } from "motion";
import { NextRequest } from "next/server";

const vehicle_regex = /^[A-Z]{2}[0-9]{1,2}[0-9]{4}$/;
export async function POST(req: Request) {
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
        const { type, vehicleNumber, vehicleModel } = await req.json();
        if (!type || !vehicleModel || vehicleNumber) {
            return Response.json({
                message: "user not found"
            }, { status: 400 })
        }
        if (vehicle_regex.test(vehicleNumber)) {
            return Response.json({
                message: "Invalid Vehicle Number"
            }, { status: 400 })
        }
        const vehicleNumberUp = vehicleNumber.toUpperCase();
        const duplicateVehicle = await Vehicle.findOne({ vehicleNumber: vehicleNumberUp })
        if (duplicateVehicle) {
            return Response.json({
                message: "Vehicle already registered"
            }, { status: 400 })
        }

        let vehicle = await Vehicle.findOne({
            owner: session.user?.id
        })
        if (vehicle) {
            vehicle.type = type
            vehicle.vehicleNumber = vehicleNumber
            vehicle.vehicleModel = vehicleModel
            vehicle.status = "pending"
            await vehicle.save()
            return Response.json(vehicle, { status: 200 })
        }
        vehicle = await Vehicle.create({
            type, vehicleNumber: vehicleNumberUp, vehicleModel
        })
        if (user.riderOnboardingSteps < 1) {
            user.riderOnboardingSteps = 1
        }
        user.role = "rider"
        await user.save()
        return Response.json(vehicle, { status: 200 })

    } catch (error) {
        return Response.json({
            message: `vehicle ${error}`
        }, { status: 500 })
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
        let vehicle = await Vehicle.findOne({ owner: user._id });
        if (vehicle) {
            return Response.json(vehicle, { status: 200 })
        }
        else {
            return null;
        }

    } catch (error) {
        return Response.json({
            message: `vehicle data fetch ${error}`
        }, { status: 500 })
    }
}