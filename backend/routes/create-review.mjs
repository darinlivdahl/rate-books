import express from 'express';
import pool from '../db.mjs';
import { updateBookRating } from '../models/ratingModel.mjs';

const router = express.Router();

router.post('/create-review', async (req, res) => {
    const { userId, bookId, reviewTitle, reviewBody, reviewRating } = req.body;
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10);

    try {
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO reviews (user_id, book_id, title, body, rating, created_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [userId, bookId, reviewTitle, reviewBody, reviewRating, formattedDate]
        );
        res.status(201).json({ success: true, data: result.rows[0] });
        client.release(); // Release the client back to the pool

        // Update average book rating after review CRUD
        updateBookRating(bookId);
        
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal server error, ' + err.message });
    }    
});

export default router;