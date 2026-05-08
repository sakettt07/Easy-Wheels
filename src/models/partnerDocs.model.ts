import mongoose from "mongoose";


interface IPartnerDocs {
    owner: mongoose.Types.ObjectId,
    aadharUrl: string,
    vehicleRC: string,
    licenseUrl: string,
    status: "pending" | "approved" | "rejected",
    rejectionReason?: string,
    createdAt: Date,
    updatedAt: Date
}

const partnerDocsSchema = new mongoose.Schema<IPartnerDocs>({
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

const PartnerDocs = mongoose.models.PartnerDocs || mongoose.model("PartnerDocs", partnerDocsSchema);
export default PartnerDocs;