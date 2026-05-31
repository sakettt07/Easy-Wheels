import mongoose from "mongoose";


export interface IRiderBank {
    owner: mongoose.Types.ObjectId,
    accountHolderName: string,
    accountNumber: string,
    ifsc: string,
    upi?: string;
    contact: string;
    status: "not_added" | "added" | "verified",
    createdAt: Date,
    updatedAt: Date
}

const riderBankSchema = new mongoose.Schema<IRiderBank>({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true
    },
    contact: {
        type: String,
    },
    ifsc: {
        type: String,
        required: true,
        uppercase: true
    },
    upi: {
        type: String,
    },
    status: {
        type: String,
        enum: ["not_added", "added", "verified"],
        default: "not_added"
    },
}, {
    timestamps: true
})

const RiderBank = mongoose.models.RiderBank || mongoose.model("RiderBank", riderBankSchema);
export default RiderBank;