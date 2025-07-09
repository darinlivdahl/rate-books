import pool from '../db.mjs';

export const findUserByEmail = async (email) => {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    client.release();
    return res.rows[0];
};

export const findUserById = async (id) => {
    const client = await pool.connect();
    const res = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    client.release();
    return res.rows[0];
};

export const createUser = async ({ name, email, password }) => {
    const client = await pool.connect();
    const res = await client.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, password]
    );
    client.release();
    return res.rows[0];
};