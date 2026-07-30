import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ message: "unauthorized" }, { status: 401 });
        }
        
        const admin = await User.findOne({ email: session.user.email, role: 'admin' });
        if (!admin) {
            return Response.json({ message: "Forbidden" }, { status: 403 });
        }

        const users = await User.find({}).sort({ createdAt: -1 });

        return Response.json({
            message: "Users fetched successfully",
            users
        }, { status: 200 });

    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDb();
        const session = await auth();
        if (!session || !session.user?.email) {
            return Response.json({ message: "unauthorized" }, { status: 401 });
        }
        
        const admin = await User.findOne({ email: session.user.email, role: 'admin' });
        if (!admin) {
            return Response.json({ message: "Forbidden" }, { status: 403 });
        }

        const { userId, isBanned } = await req.json();

        const updatedUser = await User.findByIdAndUpdate(userId, { isBanned }, { new: true });
        
        if (!updatedUser) {
            return Response.json({ message: "User not found" }, { status: 404 });
        }

        return Response.json({
            message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
            user: updatedUser
        }, { status: 200 });

    } catch (error: any) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}
