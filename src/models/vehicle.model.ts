import mongoose from "mongoose";

export type vehicleType = "bike" | "car" | "loader" | "auto" | "ev" | "traveller"

export interface IVehicle {
    owner: mongoose.Types.ObjectId
    type: vehicleType,
    vehicleModel: string,
    vehicleNumber: string,
    imageUrl?: string,
    baseFare?: number,
    pricePerKM?: number,
    waitingCharge?: number,
    status: "pending" | "approved" | "rejected",
    rejectionReason?: string,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date
}

const vehicleSchema = new mongoose.Schema<IVehicle>({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["bike", "car", "loader", "auto", "ev", "traveller"],
        required: true
    },
    vehicleNumber: {
        type: String,
        required: true,
        unique: true
    },
    vehicleModel: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    baseFare: {
        type: Number
    },
    pricePerKM: {
        type: Number
    },
    waitingCharge: {
        type: Number
    },
    status: {
        type: String,
        enum: ["approved", "rejected", "pending"],
        default: "pending"
    },
    rejectionReason: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
})

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;