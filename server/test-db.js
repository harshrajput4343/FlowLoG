const prisma = require('./prismaClient');

async function test() {
  try {
    const board = await prisma.board.findFirst();
    console.log('BOARD FIELDS:', Object.keys(board));
    console.log('BOARD shareToken:', board.shareToken);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
