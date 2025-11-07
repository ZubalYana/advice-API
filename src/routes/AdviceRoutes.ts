import Advice from "../schemas/Advice";
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
const router = express.Router();

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