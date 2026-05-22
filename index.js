const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors'); // 👈 Added CORS
const app = express();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

// Allow frontend to talk to backend
app.use(cors()); 
app.use(express.json());

// ── 1. SIGNUP ENDPOINT ──
app.post('/signup', async (req, res) => {
    try {
        const { name, mail, phonenumber, age, city, password, role } = req.body;

        if (!name || !mail || !phonenumber || !age || !city || !password || !role) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const existingUser = await prisma.user.findUnique({ where: { mail } });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                mail,
                phonenumber,
                age: Number(age),
                city,
                password: hashedPassword,
                role,
            },
        });

        // Don't send the password back to the frontend!
        delete user.password;
        return res.status(201).json({ message: 'Signup successful', user });

    } catch (error) {
        console.error("Signup error:", error.message);
        return res.status(500).json({ error: 'Unable to create user.' });
    }
});

// ── 2. LOGIN ENDPOINT (NEW) ──
app.post('/login', async (req, res) => {
    try {
        const { mail, password } = req.body;

        const user = await prisma.user.findUnique({ where: { mail } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        delete user.password;
        return res.status(200).json({ message: 'Login successful', user });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ error: 'Unable to log in.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});