const prisma = require('./prismaClient');

async function test() {
  try {
    const user = await prisma.user.findFirst();
    console.log('SUCCESS:', user);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
