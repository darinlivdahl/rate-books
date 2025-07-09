import pool from '../db.mjs';

export const updateBookRating = async (bookId) => {
    
    try {
        const getRatingsClient = await pool.connect();
        const getRatingsQuery = {
            text: 'SELECT rating FROM reviews WHERE book_id = $1',
            values: [bookId]
        };
        const getRatingsResult = await getRatingsClient.query(getRatingsQuery);
        getRatingsClient.release(); // Release the client back to the pool

        // Get average rating from all book reviews
        let averageRating = 0;
        let ratingSum = 0;
        getRatingsResult.rows.forEach(r => {
            ratingSum += r.rating;
        });
        averageRating = Math.floor(ratingSum / getRatingsResult.rows.length) || 0;
        
        /*
            Create or update book rating in database
            Format date for database columns
        */
        const today = new Date();
        const formattedDate = today.toISOString().slice(0, 10);
        try {
            const setBookRatingClient = await pool.connect();
            const query = `
                INSERT INTO ratings (book_id, rating, created_date, modified_date)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (book_id)
                DO UPDATE SET rating = EXCLUDED.rating, modified_date = EXCLUDED.modified_date;
            `;
            await setBookRatingClient.query(query, [bookId, averageRating, formattedDate, formattedDate]);
            setBookRatingClient.release();
        } catch (error) {
            console.error('Error during upsert: ', error);
        }
    } catch (error) {
        console.error('Error during get book ratings: ', error);
    }
};