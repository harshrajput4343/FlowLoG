const prisma = require('../prismaClient');

const keepAlive = () => {
  const PORT = process.env.PORT || 3001;
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

  // HTTP Keep-Alive (Every 9 minutes)
  setInterval(async () => {
    try {
      const res = await fetch(`${url}/api/health`);
      const data = await res.json();
      console.log(`[Keep-Alive] HTTP Pinged at ${new Date(data.timestamp).toISOString()}`);
    } catch (err) {
      console.error('[Keep-Alive] HTTP Ping failed:', err.message);
    }
  }, 540000); // 9 minutes

  // DB Keep-Alive to prevent Supabase auto-pause (Every 4 minutes)
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[Keep-Alive] DB Pinged at ${new Date().toISOString()}`);
    } catch (e) {
      console.error('[Keep-Alive] DB ping failed:', e.message);
    }
  }, 240000); // 4 minutes

  console.log(`[Keep-Alive] Started — pinging HTTP every 9m and DB every 4m`);
};

module.exports = keepAlive;
