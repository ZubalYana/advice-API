import { Document } from "mongoose";

export interface IAdvice extends Document {
    type: string;
    title: string;
    text: string;
    authorId: string; //id of the user who created the advice. Works with authorization ( to be provided asap )
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}