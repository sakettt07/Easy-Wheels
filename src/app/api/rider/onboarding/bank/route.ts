import { auth } from "@/auth";
import connectDb from "@/lib/db";
import RiderBank from "@/models/riderBank.model";
import User from "@/models/user.model";
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
        const { accountHolderName, accountNumber, upi, ifsc, contact } = await req.json();
        if (!accountHolderName || !accountNumber || !upi || !ifsc || !contact) {
            return Response.json({ message: "Enter all bank details" }, { status: 400 })
        }
        const riderBankDetails = await RiderBank.findOneAndUpdate({
            owner: user?._id
        },
            {
                accountHolderName,
                accountNumber,
                ifsc,
                upi,
                status: "added"
            },
            { upsert: true, new: true }
        )
        user.contact = contact
        user.riderOnboardingSteps = 3
        user.riderStatus = "pending"
        await user.save()
        return Response.json(riderBankDetails, { status: 201 })

    } catch (error) {
        return Response.json({
            message: `Partner bank error : ${error}`
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
        const riderBankDetails = await RiderBank.findOne({
            owner: user._id
        })
        if (riderBankDetails) {
            return Response.json(riderBankDetails, { status: 200 })
        }
        else {
            return null;
        }
    } catch (error) {
        return Response.json({
            message: `Partner bank details fetching error : ${error}`
        }, { status: 500 })
    }
}
// 10:11