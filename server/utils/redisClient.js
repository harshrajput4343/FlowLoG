const { createClient } = require('redis');

let client = null;
let isConnected = false;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log('[Redis] Disabled (no REDIS_URL set)');
    return;
  }

  try {
    client = createClient({ url: redisUrl });

    client.on('error', (err) => {
      console.error('[Redis] Error:', err.message);
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('[Redis] Connected');
      isConnected = true;
    });

    client.on('disconnect', () => {
      console.log('[Redis] Disconnected');
      isConnected = false;
    });

    await client.connect();
  } catch (err) {
    console.error('[Redis] Failed to connect:', err.message);
    client = null;
    isConnected = false;
  }
};

const getCache = async (key) => {
  if (!client || !isConnected) return null;
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('[Redis] GET error:', err.message);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 60) => {
  if (!client || !isConnected) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    console.error('[Redis] SET error:', err.message);
  }
};

const deleteCache = async (key) => {
  if (!client || !isConnected) return;
  try {
    await client.del(key);
  } catch (err) {
    console.error('[Redis] DEL error:', err.message);
  }
};

const deleteCachePattern = async (pattern) => {
  if (!client || !isConnected) return;
  try {
    const keys = [];
    for await (const key of client.scanIterator({ MATCH: pattern })) {
      keys.push(key);
    }
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (err) {
    console.error('[Redis] Pattern DEL error:', err.message);
  }
};

// Initialize on module load
initRedis();

module.exports = { getCache, setCache, deleteCache, deleteCachePattern };
