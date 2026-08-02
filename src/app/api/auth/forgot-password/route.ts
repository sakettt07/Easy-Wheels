import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendEmail";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        await connectDb();

        if (!email?.trim()) {
            return NextResponse.json({
                message: "Email is required",
            }, {
                status: 400
            });
        }

        const user = await User.findOne({ email });
        
        // We always return 200 to prevent email enumeration, but only send email if user exists
        if (user) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

            user.otp = otp;
            user.otpExpiresAt = otpExpiresAt;
            await user.save();

            await sendMail(
                email,
                "Password Reset OTP - Easy Wheels",
                `<h2>Your password reset OTP is <strong>${otp}</strong></h2><p>This OTP will expire in 10 minutes.</p>`
            );
        }

        return NextResponse.json({
            message: "If your email is registered, you will receive a password reset OTP shortly."
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
