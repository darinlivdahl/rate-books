import express from 'express';
import pool from '../db.mjs';

const router = express.Router();

router.get('/review/:reviewId', async (req, res) => {
    const reviewId = req.params.reviewId;
    try {
        const client = await pool.connect();
        const query = {
            text: 'SELECT id,user_id,book_id,title,body,rating FROM reviews WHERE id = $1',
            values: [reviewId]
        };
        const result = await client.query(query);
        res.json(result.rows);
        client.release(); // Release the client back to the pool
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal server error, ' + err.message });
    }
});

export default router;