import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import razorpayRouter from './razorpayRoutes.js';
import authRouter from './authRoutes.js';
import uploadRouter from './uploadRoutes.js';
import coursesRouter from './coursesRoutes.js';
import enrollmentsRouter from './enrollmentsRoutes.js';
import progressRouter from './progressRoutes.js';
import adminRouter from './adminRoutes.js';
import usersRouter from './usersRoutes.js';
import applicationsRouter from './applicationsRoutes.js';
import configRouter from './configRoutes.js';
import webhookRouter from './webhookRoutes.js';
import adminPaymentRouter from './adminPaymentRoutes.js';
import contactRouter from './contactRoutes.js';
import blogsRouter from './blogsRoutes.js';
import studentStoriesRouter from './studentStoriesRoutes.js';
import { initDb } from './db.js';
import path from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setIO } from './realtime.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://192.168.0.20:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
// Ensure Express responds to preflight requests
app.options('*', cors());
app.use(express.json());
app.use('/uploads', express.static(path.resolve('server', 'uploads')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/razorpay', razorpayRouter);
app.use('/api/auth', authRouter);
app.use('/api/media', uploadRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/enrollments', enrollmentsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', adminPaymentRouter);
app.use('/api/users', usersRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/config', configRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/contact', contactRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/student-stories', studentStoriesRouter);

// Initialize DB on demand
app.post('/api/init-db', async (_req, res) => {
  try {
    await initDb();
    res.json({ message: 'Database initialized' });
  } catch (err) {
    console.error('Init DB error', err);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

const io = new SocketIOServer(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL
        : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', '*', 'http://192.168.0.20:3000'],
    credentials: true,
  },
});
setIO(io);

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Razorpay card-only server running on http://localhost:${PORT}`);
});
