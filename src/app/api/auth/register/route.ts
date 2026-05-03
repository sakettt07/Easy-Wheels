import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendEmail";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json();
        await connectDb();
        if (!name.trim() || !email.trim() || !password.trim()) {
            return NextResponse.json({
                message: "These fields are required",
            }, {
                status: 400
            })
        }
        let user = await User.findOne({ email });
        if (user && user.isEmailVerified) {
            return NextResponse.json({
                message: "Email already exist!"
            }, {
                status: 400
            })
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

        if (password.length < 6) {
            return NextResponse.json({
                message: "Password must be at least 6 chracters"
            },
                { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        if (user && !user.isEmailVerified) {
            user.name = name,
                user.password = hashedPassword,
                user.email = email,
                user.otp = otp,
                user.otpExpiresAt = otpExpiresAt
            await user.save()
        }
        else {
            user = await User.create({
                name, email, password: hashedPassword, otp, otpExpiresAt
            })
        }
        await sendMail(
            email, "Your OTP for Email",
            `<h2>Your Email verification OTP is <strong>${otp}</strong></h2>`
        )
        return NextResponse.json(
            user, { status: 201 }
        )
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}