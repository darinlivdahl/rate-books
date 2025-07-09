import express from 'express';
import pool from '../db.mjs';

const router = express.Router();

router.get('/rating/:bookId', async (req, res) => {
    const bookId = req.params.bookId;
    try {
        const client = await pool.connect();
        const query = {
            text: 'SELECT id,rating FROM ratings WHERE book_id = $1',
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