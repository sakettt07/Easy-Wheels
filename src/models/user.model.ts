import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: "user" | "rider" | "admin"
    isEmailVerified?: boolean;
    otp?: string;
    contact?: string
    otpExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    riderOnboardingSteps: number
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "rider", "admin"]
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    riderOnboardingSteps: {
        type: Number,
        min: 0,
        max: 8,
        default: 0
    },
    contact: {
        type: String
    },
    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

// 1:09