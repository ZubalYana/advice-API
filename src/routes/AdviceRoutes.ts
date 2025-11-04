import Advice from "../schemas/Advice";
import axios from 'axios'
import express from "express";

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { type, title, text, authorId } = req.body;
        if (!title || !text) {
            return res.status(400).json({ message: 'Title and text are required' });
        }

        const newAdvice = new Advice({
            type: type ?? "Other",
            title: title,
            text: text,
            authorId: authorId ?? "Anonymous"
        });

        const savedAdvice = await newAdvice.save();
        res.status(201).json(savedAdvice);
    }
    catch (err) {
        console.log('Error creating advice:', err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;