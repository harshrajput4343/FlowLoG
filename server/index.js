const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('FlowLog API is running');
});

// API Routes
app.use('/api/boards', require('./routes/boards'));
app.use('/api/lists', require('./routes/lists'));
app.use('/api/cards', require('./routes/cards'));
app.use('/api/labels', require('./routes/labels'));
app.use('/api/checklists', require('./routes/checklists'));
app.use('/api/members', require('./routes/members'));
app.use('/api/invitations', require('./routes/invitations'));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful Custom Shutdown??
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
