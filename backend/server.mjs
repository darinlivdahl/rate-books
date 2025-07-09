import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
import { setupStrategies } from './auth/strategies.mjs';
import path from "path";
import { fileURLToPath } from "url";

/* Import Routes */
import authRoutes from './routes/auth.mjs';
import menuRoutes from './routes/menu.mjs';
import bookRoutes from './routes/books.mjs';
import proxyImageRoutes from './routes/proxy-image.mjs';
import createReviewRoutes from './routes/create-review.mjs';
import getReviewRoutes from './routes/get-review.mjs';
import updateReviewRoutes from './routes/update-review.mjs';
import deleteReviewRoutes from './routes/delete-review.mjs';
import reviewRoutes from './routes/reviews.mjs';
import getRatingRoutes from './routes/get-rating.mjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: `http://localhost:${PORT}`, credentials: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());
setupStrategies(passport);

app.use('/auth', authRoutes);
app.use('/api', menuRoutes);
app.use('/api', bookRoutes);
app.use('/api', proxyImageRoutes);
app.use('/api', createReviewRoutes);
app.use('/api', getReviewRoutes);
app.use('/api', updateReviewRoutes);
app.use('/api', deleteReviewRoutes);
app.use('/api', reviewRoutes);
app.use('/api', getRatingRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
