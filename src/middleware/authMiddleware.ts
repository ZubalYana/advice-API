import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "secret") as { userId: String };
        req.user = { userId: decoded.userId };
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
}