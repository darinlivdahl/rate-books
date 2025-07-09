import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.get('/proxy-image', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('Missing URL');
    
    try {
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        
        res.setHeader('Content-Type', contentType);
        response.body.pipe(res);
    } catch (err) {
        res.status(500).send('Failed to fetch image');
    }
});

export default router;