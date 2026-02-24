# Portfolio Dashboard

This is a portfolio tracking dashboard consisting of a Next.js frontend and a Node.js/Express backend. The backend fetches financial data from Yahoo Finance and Google Finance, caches it, and serves it to the frontend.

## Prerequisites

- Node.js (version 20 or higher recommended)
- npm

## Project Structure

- `frontend/`: Next.js frontend application.
- `backend/`: Node.js Express backend server.

## Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

## Running the Application Locally

You will need to run both the frontend and backend servers simultaneously in separate terminal windows.

### Starting the Backend

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will start on port 3001 (or the port specified in your `.env` file). The background worker will begin fetching data immediately.

### Starting the Frontend

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend application will be available at `http://localhost:3000`.

## Notes

- The backend caches the portfolio data and refreshes it in the background every 60 seconds.
- During the initial backend data fetch, the frontend might display a "warming up" state.
