# Video Assessment Platform

A platform for research participants to view generated videos and rate them on accuracy, bias, representativeness, and stereotypes.

## Project Structure

- `client/`: React frontend (Vite + TailwindCSS + TypeScript)
- `server/`: Node.js/Express backend + PostgreSQL database

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `ADMIN_PASSWORD`: Password for admin dashboard access
- `NODE_ENV`: Set to `production` in production
- `PORT`: Server port (default: 3001)

For the client, you can optionally set:
- `VITE_API_URL`: API base URL (defaults to http://localhost:3001 in development)

## Local Development

1.  **Install Dependencies**
    ```bash
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Set Up Environment Variables**
    - Create `server/.env` file with required variables
    - Ensure PostgreSQL is running and DATABASE_URL is configured

3.  **Run the Application**
    - **Server**: `cd server && npm start` (Runs on port 3001)
    - **Client**: `cd client && npm run dev` (Runs on port 5173)

## Deployment to Render

This application is configured for deployment to Render using `render.yaml`:

1. Push code to GitHub
2. Connect your GitHub repository to Render
3. Render will automatically detect `render.yaml` and create:
   - PostgreSQL database service
   - Web service (builds client and serves from Express)
4. Set the `ADMIN_PASSWORD` environment variable in Render dashboard
5. Other environment variables (DATABASE_URL, JWT_SECRET) are auto-configured

## Usage

1.  Open the client URL
2.  Complete consent and demographics forms
3.  Watch tutorial and complete attention check
4.  Watch videos and rate them using the sliders
5.  Submit and proceed to the next video
6.  Complete debrief form

## Admin Dashboard

Access the admin dashboard at `/admin` route. Login with the configured `ADMIN_PASSWORD` to:
- View participant demographics and responses
- View all video ratings
- Export data as CSV

## Data

- Data is stored in PostgreSQL database
- Videos should be placed in `server/public/`
- Video metadata can be configured in `server/video_metadata.json`
