CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL DEFAULT '',
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100)
);

CREATE TABLE reviews(
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    book_id NUMERIC(13, 0) NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_date DATE,
    modified_date DATE
);

CREATE TABLE ratings(
    id SERIAL PRIMARY KEY,
    book_id NUMERIC(13, 0) NOT NULL UNIQUE,
    rating INTEGER CHECK (rating >= 0 AND rating <= 5),
    created_date DATE,
    modified_date DATE
);