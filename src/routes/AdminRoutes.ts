import Advice from "../schemas/Advice";
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

router.put('/:id/verify', authMiddleware, async (req, res) => {
    try {
        const { adviceId } = req.body;

        if (!req.user?.role || req.user.role !== 'admin') {
            return res.status(403).json({ message: "Admin only" });
        }

        const advice = await Advice.findById(adviceId);

        if (!advice) {
            return res.status(404).json({ message: "Advice not found" });
        }

        advice.verified = true;
        await advice.save();

        res.status(200).json({ message: "Advice verified successfully" });
    }
    catch (err) {
        console.log('Error verifying advice:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


export default router;