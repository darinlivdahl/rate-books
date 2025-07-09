import express from 'express';
import pool from '../db.mjs';
import { updateBookRating } from '../models/ratingModel.mjs';

const router = express.Router();

router.post('/delete-review', async (req, res) => {
    const { id, bookId } = req.body;
    try {
        const client = await pool.connect();
        const query = {
            text: 'DELETE FROM reviews WHERE id = $1',
            values: [id]
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