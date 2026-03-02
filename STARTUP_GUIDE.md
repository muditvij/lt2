# Linktrip Setup & Run Guide

This document outlines the necessary terminal commands to start the Linktrip application locally. The application consists of a Node.js Express backend and a React (Vite) frontend.

## Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
Ensure you have installed the dependencies for both the frontend and backend. If not, run `npm install` in both the `backend` and `frontend` directories.

## Starting the Application

You will need two separate terminal windows (or tabs) to run the front and backend simultaneously.

### 1. Start the Backend Server

Open your first terminal and navigate to the `backend` directory:

```bash
cd backend
npm run dev
```

This will run the server using `nodemon`, which automatically restarts the server when file changes in the directory are detected. Note that we are using `--ignore uploads/` so that photo uploads don't trigger a server restart.

### 2. Start the Frontend Application

Open a second terminal window and navigate to the `frontend` directory:

```bash
cd frontend
npm run dev
```

This will start the Vite development server. You can then open your browser and navigate to the URL provided by Vite (typically `http://localhost:5173`).

## Available Scripts Reference

### Backend (`/backend/package.json`)
- `npm start`: Starts the server normally (`node server.js`).
- `npm run dev`: Starts the server in development mode with auto-reloading (`nodemon`).

### Frontend (`/frontend/package.json`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the production-ready code.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs ESLint to find issues in your code.
