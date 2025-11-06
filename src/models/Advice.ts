import { Document } from "mongoose";

export interface IAdvice extends Document {
    type: string;
    title: string;
    text: string;
    authorId: string;
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}