const prisma = require('./prismaClient');
const crypto = require('crypto');

async function testShareFlow() {
  try {
    console.log('Fetching first board...');
    const board = await prisma.board.findFirst();
    if (!board) {
      console.log('No board found in database. Seed the database first.');
      return;
    }
    console.log(`Found board: ID=${board.id}, Title="${board.title}"`);

    // 1. Generate token
    const token = crypto.randomBytes(16).toString('hex');
    console.log(`Generated share token: ${token}`);

    // 2. Save token to DB
    console.log('Saving share token to database...');
    const updatedBoard = await prisma.board.update({
      where: { id: board.id },
      data: { shareToken: token }
    });
    console.log('Token saved successfully. shareToken in DB:', updatedBoard.shareToken);

    // 3. Query board by share token
    console.log('Querying board by share token...');
    const sharedBoard = await prisma.board.findUnique({
      where: { shareToken: token },
      select: {
        id: true, title: true, background: true, ownerId: true, createdAt: true, updatedAt: true,
        members: {
          select: { userId: true, user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
        },
        labels: { select: { id: true, name: true, color: true } },
        lists: {
          orderBy: { order: 'asc' },
          select: {
            id: true, title: true, order: true, boardId: true, color: true,
            cards: {
              orderBy: { order: 'asc' },
              select: {
                id: true, title: true, description: true, order: true, dueDate: true, listId: true,
                labels: {
                  select: { label: { select: { id: true, name: true, color: true } } }
                },
                members: {
                  select: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
                },
                checklists: {
                  select: {
                    id: true, title: true,
                    items: { select: { id: true, content: true, isChecked: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!sharedBoard) {
      throw new Error('Board not found by share token!');
    }

    console.log('SUCCESS! Queried board details:');
    console.log(`- ID: ${sharedBoard.id}`);
    console.log(`- Title: ${sharedBoard.title}`);
    console.log(`- Members Count: ${sharedBoard.members.length}`);
    console.log(`- Lists Count: ${sharedBoard.lists.length}`);
    if (sharedBoard.lists.length > 0) {
      console.log(`- Cards in first list: ${sharedBoard.lists[0].cards.length}`);
    }

  } catch (err) {
    console.error('TEST FAILED:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testShareFlow();
