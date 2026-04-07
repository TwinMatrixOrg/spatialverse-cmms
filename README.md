# SpatialVerse CMMS

A comprehensive, spatially-aware Computerized Maintenance Management System by TwinMatrix Technologies.

## Overview

SpatialVerse CMMS is designed for Facilities Management (FM) companies, featuring a live spatial digital twin layer powered by MapLibre maps. It competes with industry leaders like Maximo, Facilio, Limble, and UpKeep while offering unique spatial visualization capabilities.

## Project Structure

```
spatialverse-cmms/
├── api/                    # FeathersJS v5 backend (Node.js)
├── web/                    # React 19 + Vite admin dashboard
├── shared/                 # Shared TypeScript types
├── docker-compose.yml      # PostgreSQL + Redis local dev
├── package.json            # Root workspace (npm workspaces)
└── README.md
```

## Tech Stack

### Frontend (web/)
- React 19 + TypeScript + Vite
- MUI v6 (Material UI)
- Zustand for state management
- MapLibre GL JS for spatial maps
- React Router v6
- Recharts for analytics
- date-fns for date handling

### Backend (api/)
- FeathersJS v5 with Express adapter
- PostgreSQL + Knex.js
- BullMQ + Redis for job queues
- JWT authentication
- TypeScript

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Development Setup

1. Start the database services:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
npm install
```

3. Start the API server:
```bash
npm run dev:api
```

4. Start the web app:
```bash
npm run dev:web
```

## Deployment

### Web Application
The web app deploys to `/cmms/` path:

```bash
npm run deploy:web
```

### API Server
The API runs on port 9002.

## Demo

Live demo available at: https://demos.twinmatrix.com/cmms

## License

Proprietary - TwinMatrix Technologies
