import mongoose, { Document } from "mongoose";

type VideoKYCStatus = "not_required" | "pending" | "in_progress" | "approved" | "rejected";
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: "user" | "rider" | "admin"
    isEmailVerified?: boolean;
    otp?: string;
    contact?: string;
    otpExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    riderOnboardingSteps: number;
    riderStatus: "pending" | "approved" | "rejected"
    rejectionReason?: string
    videoKYCStatus: VideoKYCStatus
    videoKYCRoomId: string
    VideoKYCRejectionReason: string
    socketId: string;
    location?: {
        type: "Point",
        coordinates: [number, number]
    };
    isOnline: boolean
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
    riderStatus: {
        type: String,
        default: "pending",
        enum: ["pending", "approved", "rejected"]
    },
    rejectionReason: {
        type: String
    },
    contact: {
        type: String
    },
    videoKYCStatus: {
        type: String,
        enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
        default: "not_required"
    },
    videoKYCRoomId: { type: String },
    VideoKYCRejectionReason: { type: String },
    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    },
    socketId: {
        type: String
    },
    location: {
        type: {
            type: String,
            enum: ["Point"]
        },
        coordinates: [Number]
    },
    isOnline: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});


userSchema.index({ location: "2dsphere" })

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

// 1:09