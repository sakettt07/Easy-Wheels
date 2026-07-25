import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    senderRole: {
        type: String,
        enum: ["rider", "user"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
}, {
    timestamps: true
})

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);

export default ChatMessage;