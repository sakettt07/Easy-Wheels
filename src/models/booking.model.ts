import mongoose from "mongoose";

type BookingStatus = "requested" | "awaiting_payment" | "confirmed" | "started"
    | "completed" | "cancelled" | "rejected" | "expired"
type PaymentStatus = "pending" | "paid" | "failed" | "cash"
interface IBooking {
    user: mongoose.Types.ObjectId,
    rider: mongoose.Types.ObjectId,
    vehicle: mongoose.Types.ObjectId,
    pickupAddress: string,
    dropAddress: string,
    pickUpLocation: {
        type: "Point",
        coordinates: [number, number]
    }
    dropLocation: {
        type: "Point",
        coordinates: [number, number]
    }
    fare: number,
    userMobileNumber: string,
    riderMobileNumber: string,
    bookingStatus: BookingStatus,
    paymentStatus: PaymentStatus,
    paymentDeadline: Date,
    adminCommission: number,
    riderAmount: number,
    pickupOTP: string,
    pickupOTPExpire: Date,
    dropOTP: string,
    dropOTPExpire: Date,
    createdAt?: Date
    updatedAt: Date
}
const bookingSchema = new mongoose.Schema<IBooking>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    pickupAddress: {
        type: String,
        required: true
    },
    dropAddress: {
        type: String,
        required: true
    },
    pickUpLocation: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    },
    dropLocation: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }
    },
    fare: {
        type: Number,
        required: true
    },
    userMobileNumber: {
        type: String,
        required: true
    },
    riderMobileNumber: {
        type: String,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: ["requested", "awaiting_payment", "confirmed", "started", "completed", "cancelled", "rejected", "expired"],
        default: "requested"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "cash"],
        default: "pending"
    },
    paymentDeadline: {
        type: Date,
    },
    adminCommission: {
        type: Number,
        required: true,
        default: 0
    },
    riderAmount: {
        type: Number,
        required: true,
        default: 0
    },
    pickupOTP: {
        type: String,
        required: true
    },
    pickupOTPExpire: {
        type: Date,
        required: true
    },
    dropOTP: {
        type: String,
        required: true
    },
    dropOTPExpire: {
        type: Date,
        required: true
    },

}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;