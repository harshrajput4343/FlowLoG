const express = require('express');
const keepAlive = require('./utils/keepAlive');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Basic Route
app.get('/', (req, res) => {
  res.send('FlowLog API is running');
});

// Health check endpoint (used by keep-alive)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API Routes
app.use('/api/boards', require('./routes/boards'));
app.use('/api/lists', require('./routes/lists'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/labels', require('./routes/labels'));
app.use('/api/checklists', require('./routes/checklists'));
app.use('/api/members', require('./routes/members'));
app.use('/api/invitations', require('./routes/invitations'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/payment', require('./routes/payment'));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  keepAlive();
});

// Graceful Custom Shutdown??
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
