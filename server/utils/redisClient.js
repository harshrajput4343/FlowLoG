const { Redis } = require('@upstash/redis');

let client = null;

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (redisUrl && redisToken) {
  try {
    client = new Redis({
      url: redisUrl,
      token: redisToken,
    });
    console.log('[Redis] Upstash REST client ready');
  } catch (err) {
    console.error('[Redis] Failed to init:', err.message);
    client = null;
  }
} else {
  console.log('[Redis] Disabled (no UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN set)');
}

const getCache = async (key) => {
  if (!client) return null;
  try {
    const data = await client.get(key);
    return data || null;
  } catch (err) {
    console.error('[Redis] GET error:', err.message);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds = 60) => {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (err) {
    console.error('[Redis] SET error:', err.message);
  }
};

const deleteCache = async (key) => {
  if (!client) return;
  try {
    await client.del(key);
  } catch (err) {
    console.error('[Redis] DEL error:', err.message);
  }
};

const deleteCachePattern = async (pattern) => {
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys && keys.length > 0) {
      await Promise.all(keys.map(k => client.del(k)));
    }
  } catch (err) {
    console.error('[Redis] Pattern DEL error:', err.message);
  }
};

module.exports = { getCache, setCache, deleteCache, deleteCachePattern };
