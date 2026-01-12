# Indense

A production-grade material management application for construction sites with multi-platform mobile support (Android + iOS).

## Features

- Multi-site material indent management
- Role-based access control (Site Engineer, Purchase Team, Director)
- Multi-level approval workflow
- Offline vendor procurement tracking
- Partial receipt and damage reporting
- Monthly reporting with Excel exports
- Full audit logging

## Tech Stack

- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Mobile**: React Native + Expo + TypeScript

## Getting Started

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL
npx prisma migrate dev
npm run seed
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Site Engineer | engineer1@example.com | password123 |
| Purchase Team | purchase1@example.com | password123 |
| Director | director@example.com | password123 |
