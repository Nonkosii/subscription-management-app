// server/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';

// Import routes
import servicesRouter from './routes/services.js';
import subscriptionsRouter from './routes/subscriptions.js';
import authRouter from './routes/auth.js';
import transactionsRouter from './routes/transactions.js';
import telcoRouter from './routes/telco.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectTimeout: 10000,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Error handling
io.engine.on("connection_error", (err) => {
  console.log("Socket.IO connection error:", err.code, err.message);
});

// Store connected users
const connectedUsers = new Map();

// CORS middleware for REST API
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Other middleware
app.use(express.json());

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/services', servicesRouter);
app.use('/subscriptions', subscriptionsRouter);
app.use('/auth', authRouter);
app.use('/transactions', transactionsRouter);
app.use('/telco', telcoRouter);

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Listen for user registration
  socket.on('register-user', (msisdn) => {
    connectedUsers.set(socket.id, msisdn);
    socket.broadcast.emit('user-connected', msisdn);
    console.log(`User registered: ${msisdn}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const msisdn = connectedUsers.get(socket.id);
    if (msisdn) {
      connectedUsers.delete(socket.id);
      socket.broadcast.emit('user-disconnected', msisdn);
      console.log(`User disconnected: ${msisdn}`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});