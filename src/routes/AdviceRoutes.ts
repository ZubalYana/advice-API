import Advice from "../schemas/Advice";
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

/**
 * @swagger
 * /advice:
 *   post:
 *     summary: Create a new advice
 *     tags: [Advice]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - text
 *             properties:
 *               type:
 *                 type: string
 *                 example: Motivation
 *               title:
 *                 type: string
 *                 example: Drink more water
 *               text:
 *                 type: string
 *                 example: Staying hydrated improves focus and mood.
 *     responses:
 *       201:
 *         description: Advice created successfully
 *       400:
 *         description: Missing title or text
 *       401:
 *         description: Unauthorized (no token)
 *       500:
 *         description: Server error
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { type, title, text, authorId } = req.body;
        if (!title || !text) {
            return res.status(400).json({ message: 'Title and text are required' });
        }

        const newAdvice = new Advice({
            type: type ?? "Other",
            title: title,
            text: text,
            authorId: req.user?.userId
        });

        const savedAdvice = await newAdvice.save();
        res.status(201).json(savedAdvice);
    }
    catch (err) {
        console.log('Error creating advice:', err);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * @swagger
 * /advice:
 *   get:
 *     summary: Get all advice
 *     description: Admin sees ALL advice. Users see only VERIFIED advice.
 *     tags: [Advice]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of advice
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const filter = req.user?.role === "admin" ? {} : { verified: true };
        const advice = await Advice.find(filter);
        res.status(200).json(advice);
    }
    catch (err) {
        console.log('Error getting advice:', err);
        res.status(500).json({ message: "Server error" });
    }
})

/**
 * @swagger
 * /advice/my:
 *   get:
 *     summary: Get logged user's advice
 *     tags: [Advice]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's own advice
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authMiddleware, async (req, res) => {
    const advice = await Advice.find({ authorId: req.user?.userId });
    res.json(advice);
})

/**
 * @swagger
 * /advice/{id}:
 *   get:
 *     summary: Get advice by ID
 *     tags: [Advice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB advice ID
 *     responses:
 *       200:
 *         description: Advice found
 *       404:
 *         description: Advice not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const advice = await Advice.findById(req.params.id);
        res.status(200).json(advice);
    }
    catch (err) {
        console.log('Error getting advice:', err);
        res.status(500).json({ message: "Server error" });
    }
})

/**
 * @swagger
 * /advice/{id}:
 *   delete:
 *     summary: Delete advice by ID
 *     description: Only the author or admin can delete the advice
 *     tags: [Advice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Advice deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not owner/admin)
 *       404:
 *         description: Advice not found
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const advice = await Advice.findById(req.params.id);

        if (!advice) {
            return res.status(404).json({ message: "Advice not found" });
        }

        if (advice.authorId.toString() !== req.user?.userId && req.user?.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to delete this advice" });
        }

        await advice.deleteOne();
        res.status(200).json(advice);
    }
    catch (err) {
        console.log('Error deleting advice:', err);
        res.status(500).json({ message: 'Server error' });
    }
})

/**
 * @swagger
 * /advice/{id}:
 *   put:
 *     summary: Update advice by ID
 *     tags: [Advice]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       200:
 *         description: Advice updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Advice not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const advice = await Advice.findById(req.params.id);

        if (!advice) {
            return res.status(404).json({ message: "Advice not found" });
        }

        if (advice.authorId.toString() !== req.user?.userId && req.user?.role !== "admin") {
            return res.status(403).json({ message: 'Not authorized to edit' })
        }

        const updatedAdvice = await Advice.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        );

        res.status(200).json(updatedAdvice);
    }
    catch (err) {
        console.log('Error updating advice:', err);
        res.status(500).json({ message: 'Server error' });
    }
})

export default router;