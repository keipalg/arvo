# Arvo — Value Your Art

Arvo is a handcraft business web app for makers who want to create, not calculate.
. This README explains how to run the project locally, where key pieces live, and pointers to useful scripts and files.

## Quick overview
- Frontend: React + TypeScript + Vite app in [apps/frontend](apps/frontend)
- Backend: Node + TypeScript server with tRPC and Drizzle in [apps/backend](apps/backend)
- Shared types/package: [packages/shared](packages/shared)

## Requirements / Env
At minimum:
- Node 18+ and npm

## Local dev
1. Install dependencies (root or per-package depending on workspace tooling)
```sh
npm install
npm run dev
