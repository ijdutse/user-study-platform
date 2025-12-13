# Video Assessment Platform

A platform for research participants to view generated videos and rate them on accuracy, bias, representativeness, and stereotypes.

## Project Structure

- `client/`: React frontend (Vite + TailwindCSS)
- `server/`: Node.js/Express backend + SQLite database

## Setup

1.  **Install Dependencies**
    ```bash
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Run the Application**
    - **Server**: `cd server && node server.js` (Runs on port 3001)
    - **Client**: `cd client && npm run dev` (Runs on port 5173)

## Usage

1.  Open the client URL (usually http://localhost:5173).
2.  Watch the video presented.
3.  Rate the video using the sliders.
4.  Submit and proceed to the next video.

## Data

- Data is stored in `server/assessment.db` (SQLite).
- Videos should be placed in `server/public/`.
