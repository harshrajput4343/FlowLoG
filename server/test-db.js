const prisma = require('./prismaClient');

async function run() {
  try {
    console.log('Adding shareToken column...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Board" ADD COLUMN IF NOT EXISTS "shareToken" TEXT;
    `);
    console.log('Creating unique index...');
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Board_shareToken_key" ON "Board"("shareToken");
    `);
    console.log('SUCCESS!');
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
