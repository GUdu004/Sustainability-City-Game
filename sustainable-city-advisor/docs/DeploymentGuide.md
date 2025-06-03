# Deployment Guide for Sustainability City Advisor

## Overview

This document provides instructions for deploying the Sustainability City Advisor application, which consists of a frontend built with React and a backend powered by Node.js. The application will be deployed on Google Cloud Platform (GCP) and Firebase.

## Prerequisites

Before deploying, ensure you have the following:

- A Google Cloud Platform account.
- Firebase account and project set up.
- Node.js and npm installed on your local machine.
- The Firebase CLI installed. You can install it using the following command:

```bash
npm install -g firebase-tools
```

## Deployment Steps

### 1. Frontend Deployment

1. **Build the React Application:**
   Navigate to the frontend directory and build the application using Vite:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

   This will create a `dist` folder containing the static assets for your application.

2. **Deploy to Firebase Hosting:**
   Initialize Firebase in your project if you haven't done so already:

   ```bash
   firebase init
   ```

   Select "Hosting" and follow the prompts to set up your project. When asked for the public directory, specify `dist`.

   Deploy the application:

   ```bash
   firebase deploy --only hosting
   ```

### 2. Backend Deployment

1. **Prepare the Node.js Application:**
   Navigate to the backend directory and install the necessary dependencies:

   ```bash
   cd backend
   npm install
   ```

2. **Deploy to Google Cloud Run:**
   Ensure you are authenticated with Google Cloud:

   ```bash
   gcloud auth login
   ```

   Set your project ID:

   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

   Build the Docker image for your backend application:

   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/sustainability-city-advisor-backend
   ```

   Deploy the image to Cloud Run:

   ```bash
   gcloud run deploy sustainability-city-advisor-backend --image gcr.io/YOUR_PROJECT_ID/sustainability-city-advisor-backend --platform managed
   ```

   Follow the prompts to configure the service, including selecting the region and allowing unauthenticated invocations if desired.

### 3. Database Setup

1. **Firestore Database:**
   Set up Firestore in your Firebase project to store game state, decision data, and user profiles. You can do this through the Firebase Console.

2. **Configure Environment Variables:**
   Ensure that your backend application can access the Firestore database and any other necessary environment variables. You can set these in the Google Cloud Console under your Cloud Run service settings.

### 4. Final Steps

- After deployment, test both the frontend and backend to ensure they are communicating correctly.
- Monitor the application using Firebase Analytics and Google Cloud Monitoring to gather insights and performance metrics.

## Conclusion

Following these steps will help you successfully deploy the Sustainability City Advisor application on Google Cloud Platform and Firebase. For any issues or further customization, refer to the official documentation for Firebase and Google Cloud services.