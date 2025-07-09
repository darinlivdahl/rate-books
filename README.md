# Full Stack Web App - React + Express + PostgreSQL

A modern web application with a React frontend (built with Vite), an Express backend (Node.js), and a PostgreSQL database. Includes local authentication with Passport and secure password hashing with bcrypt.

The Rate Books web app allows users to browse best seller lists by category and rate and review books.

## 🧰 Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Vite](https://vitejs.dev/)
- `.env` file (see below)

## API Setup

### New York Times Books API

### Google OAUTH 2.0 API

## 📦 Installation

### 1. Clone the Repository
```
git clone https://github.com/darinlivdahl/ratebooks.git
cd ratebooks
```
### 2. Install Backend Dependencies
```
cd backend
npm install
```
### 3. Install Frontend Dependencies
```
cd ../frontend
npm install
```

## 🗃 Database Schema

Download [PostgreSQL](https://www.postgresql.org/) and create a database called **_ratebooks_**. Then use the query tool and run the following to create the necessary tables:

```
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
```
## ⚙️ Environment Variables

Create a `.env` file in the `backend/` directory:

```
PORT=8080
DB_USER=your_database_user
DB_HOST=your_database_host_or_localhost
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432
NYT_API_KEY=your_new_york_times_books_api_key
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL="http://localhost:8080/auth/google/ratebooks"
```

## 🚀 Running the App Locally

### 1. Start PostgreSQL

Ensure your local PostgreSQL service is running and the database is created.

### 2. Start the Backend Server
```
cd backend
node server.mjs
```
Server will run on http://localhost:8080

### 3. Start the Frontend with Vite
```
cd ../frontend
npm run dev
```
Frontend will run on http://localhost:8080

### 4. Or, start both Backend and Frontend concurrently
```
cd ../
npm run dev
```
Make sure you are in the root project folder _ratebooks_

