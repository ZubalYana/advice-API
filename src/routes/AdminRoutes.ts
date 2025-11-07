import Advice from "../schemas/Advice";
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

/**
 * @swagger
 * /advice/{id}/verify:
 *   put:
 *     summary: Verify an advice (Admin only)
 *     tags: [Advice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the advice to verify
 *     responses:
 *       200:
 *         description: Advice verified successfully
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden — only admins can verify advice
 *       404:
 *         description: Advice not found
 *       500:
 *         description: Server error
 */
router.put('/:id/verify', authMiddleware, async (req, res) => {
    try {
        if (!req.user?.role || req.user.role !== 'admin') {
            return res.status(403).json({ message: "Admin only" });
        }

        const advice = await Advice.findById(req.params.id);

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