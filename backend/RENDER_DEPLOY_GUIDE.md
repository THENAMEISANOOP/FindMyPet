# Render Deployment Guide - Backend

To fix the deployment error and ensure your backend runs correctly on Render, please follow these steps:

## 1. Code Changes Applied
I have already updated your `backend/package.json` with the following:
- Added `"build": "tsc"` to compile your TypeScript code.
- Added `"start": "node dist/server.js"` to run the compiled JavaScript in production.

## 2. Render Dashboard Configuration
In your Render Service settings, update the following fields:

| Field | Value |
| :--- | :--- |
| **Root Directory** | `backend` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

## 3. Environment Variables
Ensure you have added the following variables in the Render "Environment" tab (refer to your local `backend/.env`):
- `MONGO_URI`
- `PORT` (Render handles this, but set to `5000` if your code defaults to it)
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `EMAIL_USER`, `EMAIL_PASS`

---
Once these settings are updated, Render should be able to find the `package.json` in the `backend` folder and deploy successfully.
