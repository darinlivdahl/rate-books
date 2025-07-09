import express from 'express';
import pool from '../db.mjs';

const router = express.Router();

router.get('/reviews/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    try {
        const client = await pool.connect();
        const query = {
            text: 'SELECT r.id,r.user_id,r.book_id,r.title,r.body,r.rating,u.name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.book_id = $1 ORDER BY r.created_date ASC',
            values: [bookId]
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