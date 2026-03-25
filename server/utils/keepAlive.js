const keepAlive = () => {
  const PORT = process.env.PORT || 3001;
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

  setInterval(async () => {
    try {
      const res = await fetch(`${url}/api/health`);
      const data = await res.json();
      console.log(`[Keep-Alive] Pinged at ${new Date(data.timestamp).toISOString()}`);
    } catch (err) {
      console.error('[Keep-Alive] Ping failed:', err.message);
    }
  }, 540000); // 9 minutes

  console.log(`[Keep-Alive] Started — pinging ${url}/api/health every 9 minutes`);
};

module.exports = keepAlive;
