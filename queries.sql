CREATE TABLE note(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    quiz_keyword VARCHAR(50) NOT NULL,
    reference_url TEXT,
    created_date DATE,
    modified_date DATE
);

CREATE TABLE category(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE category_item(
    category_id INTEGER REFERENCES category(id),
    note_id INTEGER REFERENCES note(id),
    PRIMARY KEY (category_id, note_id)
);

CREATE TABLE quiz(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE quiz_item(
    quiz_id INTEGER REFERENCES quiz(id),
    note_id INTEGER REFERENCES note(id),
    PRIMARY KEY (quiz_id, note_id)
);