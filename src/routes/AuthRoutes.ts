import User from "../schemas/User";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required." });
        }

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: "user"
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    }
    catch (err) {
        console.log('Error registering user:', err);
        res.status(500).json({ message: 'Server error' });
    }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET ?? '',
            { expiresIn: '1d' }
        );

        res.status(200).json({ token: token });
    }
    catch (err) {
        console.log('Error logging user in:', err);
        res.status(500).json({ message: 'Server error' });
    }
})

export default router;