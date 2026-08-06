import mongoose from "mongoose";

export interface IReview {
    user: mongoose.Types.ObjectId,
    rider: mongoose.Types.ObjectId,
    rating: number,
    comment: string,
}

const reviewSchema = new mongoose.Schema<IReview>({
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
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
    }
}, {
    timestamps: true
});

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
