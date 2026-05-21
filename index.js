const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcrypt');

app.use(express.json());

app.post('/signup', async (req, res) => {
    try {
        const { name, mail, phonenumber, age, city, password, role } = req.body;

        if (!name || !mail || !phonenumber || !age || !city || !password || !role) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { mail }
        });

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

        return res.status(201).json({ message: 'Signup successful', user });

    } catch (error) {
        console.error("Signup error:", error.message);
        return res.status(500).json({ error: 'Unable to create user.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});