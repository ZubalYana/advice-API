import mongoose, { Schema } from "mongoose";
import { IAdvice } from "../models/Advice";

const AdviceSchema: Schema<IAdvice> = new Schema(
    {
        type: { type: String, required: true },
        title: { type: String, required: true },
        text: { type: String, required: true },
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        verified: { type: Boolean, required: true, default: false },
    },
    { timestamps: true }
)

export default mongoose.model<IAdvice>("Advice", AdviceSchema)