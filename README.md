# Mobile Goods Inspection App

Mobile application for digital goods inspection. The project was developed as an IHK final apprenticeship project and contains a React Native / Expo client and a Node.js / Express backend.

The goal of the app is to replace a paper-based goods inspection process with a digital workflow for structured data entry, photo documentation and PDF report generation.

## Features

- Digital goods inspection workflow
- Structured data entry for deliveries and inspection results
- Photo documentation with mobile image handling
- Role-based user management
- PDF report generation
- Backend API for data handling and reporting logic
- Separation between mobile client and backend server

## Tech Stack

### Client

- React Native
- Expo
- TypeScript
- React Navigation
- Expo Camera / Image Picker
- Expo File System
- Expo Print / Sharing

### Server

- Node.js
- Express.js
- MongoDB / Mongoose
- JWT authentication
- bcrypt password hashing
- Multer for file uploads
- Puppeteer for PDF generation
- Jest for backend tests

## Project Structure

```text
client/   React Native / Expo mobile application
server/   Node.js / Express backend API
```

## Architecture Overview

The mobile client is responsible for the inspection workflow, user interaction and photo/document handling.  
The backend provides API endpoints, authentication, data persistence and report-generation logic.

```text
Mobile App  ->  REST API  ->  MongoDB
                  |
                  -> PDF generation / file handling
```

## Setup

### Client

```bash
cd client
npm install
npm start
```

### Server

```bash
cd server
npm install
npm start
```

Environment variables and external service configuration are intentionally not included in the public repository.

## Tests

The backend contains Jest test scripts for selected controller and authentication logic.

```bash
cd server
npm test
```

## Context

This project was developed as part of my final IHK project for the apprenticeship as **Fachinformatiker für Anwendungsentwicklung**.

It demonstrates practical experience with mobile development, backend APIs, database handling, authentication, file uploads and PDF generation.
