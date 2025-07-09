import express from 'express';
import axios from 'axios';
import dotenv from "dotenv";
import { nytBaseEndpoint } from '../globalConstants.js';

dotenv.config();

const router = express.Router();

router.get('/books/:listName', async (req, res) => {
    try {
        const response = await axios.get(nytBaseEndpoint + '/lists/current/' + req.params.listName, {
            params: {
                'api-key': process.env.NYT_API_KEY,
            }
        });
        res.status(200).json(response.data.results.books);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Axios error with a response from the server
            res.status(error.response.status).json({
                message: error.response.data.message || 'Error fetching data from external API',
            });
        } else {
            // Other types of errors (e.g., network issues)
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

export default router;