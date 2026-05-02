import connectDb from "@/lib/db";
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

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
            name, email, password: hashedPassword
        })
        return NextResponse.json(
            user, { status: 201 }
        )
    } catch (error) {
        return NextResponse.json(
            { message: error.message },
            { status: 500 }
        )
    }
}