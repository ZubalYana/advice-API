import "express";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            userId: String;
            role?: String;
        }
    }
}