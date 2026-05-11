import mongoose from "mongoose";


interface IRiderDocs {
    owner: mongoose.Types.ObjectId,
    aadharUrl: string,
    vehicleRC: string,
    licenseUrl: string,
    status: "pending" | "approved" | "rejected",
    rejectionReason?: string,
    createdAt: Date,
    updatedAt: Date
}

const riderDocsSchema = new mongoose.Schema<IRiderDocs>({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    aadharUrl: {
        type: String,
    },
    vehicleRC: {
        type: String,
    },
    licenseUrl: {
        type: String,
    },

    status: {
        type: String,
        enum: ["approved", "rejected", "pending"],
        default: "pending"
    },
    rejectionReason: {
        type: String,
    },

}, {
    timestamps: true
})

const RiderDocs = mongoose.models.RiderDocs || mongoose.model("RiderDocs", riderDocsSchema);
export default RiderDocs;