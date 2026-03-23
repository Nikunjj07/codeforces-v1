import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/db';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';
import { initSocket } from './socket';

import authRoutes from './routes/auth.routes';
import contestRoutes from './routes/contest.routes';
import problemRoutes from './routes/problem.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────
initSocket(server);

// ── Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(env.COOKIE_SECRET));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ─────────────────────────────────────────
app.use('/api', apiRateLimiter);

// ── Health check ──────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────
const start = async () => {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log(`🚀 CodeArena server running on http://localhost:${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
  });
};

start();

export { app, server };
