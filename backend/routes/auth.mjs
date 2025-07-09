import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../models/userModel.mjs';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser({ name, email, password: hashedPassword });
        res.status(201).json(newUser);
    } catch (err) {
        console.log(JSON.stringify(err));
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ user: req.user });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/ratebooks', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('http://localhost:8080'); //TODO use environment variables
});

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.sendStatus(200);
    });
});

router.get('/current-user', (req, res) => {
    res.json({ user: req.user || null });
});

export default router;