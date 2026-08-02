import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, otp, newPassword } = await req.json();
        await connectDb();

        if (!email?.trim() || !otp?.trim() || !newPassword?.trim()) {
            return NextResponse.json({
                message: "Email, OTP, and new password are required",
            }, {
                status: 400
            });
        }

        const user = await User.findOne({ email });

        if (!user || user.otp !== otp) {
            return NextResponse.json({
                message: "Invalid OTP or email",
            }, {
                status: 400
            });
        }

        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            return NextResponse.json({
                message: "OTP has expired. Please request a new one.",
            }, {
                status: 400
            });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({
                message: "Password must be at least 6 characters",
            }, { 
                status: 400 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        // If the user's email wasn't verified before, verifying via password reset also counts
        user.isEmailVerified = true; 
        
        await user.save();

        return NextResponse.json({
            message: "Password reset successfully. You can now login."
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
