import express from 'express';
import pool from '../db.mjs';
import { updateBookRating } from '../models/ratingModel.mjs';

const router = express.Router();

router.post('/update-review', async (req, res) => {
    const { id, bookId, reviewTitle, reviewBody, reviewRating } = req.body;
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10);

    try {
        const client = await pool.connect();
        const query = {
            text: 'UPDATE reviews SET title = $1, body = $2, rating = $3, modified_date = $4 WHERE id = $5',
            values: [reviewTitle, reviewBody, reviewRating, formattedDate, id]
        }
        const result = await client.query(query);
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