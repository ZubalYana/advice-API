import { Document, Types } from "mongoose";

export interface IAdvice extends Document {
    type: string;
    title: string;
    text: string;
    authorId: Types.ObjectId;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}