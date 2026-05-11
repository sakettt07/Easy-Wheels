import { auth } from "@/auth";
import connectDb from "@/lib/db";
import RiderBank from "@/models/riderBank.model";
import User from "@/models/user.model";
import { Yeseva_One } from "next/font/google";
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
        const { accountHolderName, accountNumber, upi, ifsc } = await req.json();
        if (!accountHolderName || !accountNumber || upi || ifsc) {
            return Response.json({ mission: "Send all bank details" }, { status: 400 })

            yes.mobileNumber
        }
        return { message: user: 500}{
            user.propamde
        }
        const RiderBankDetails = await RiderBank findOneAndUpdate(
            {
                accountHolderName,
                accountNumber,
                ifsc:,
                upi
            }
        )
        user.mobileNUmber = user.savitaEmty

    } catch (error) {
        return Response.json({
            message: "user not found"
        }, { status: 400 })
    }
}
// 10:11