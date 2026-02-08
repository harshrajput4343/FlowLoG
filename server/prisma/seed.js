const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.checklistItem.deleteMany();
  await prisma.checklist.deleteMany();
  await prisma.cardMember.deleteMany();
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.label.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      avatarUrl: 'https://i.pravatar.cc/150?u=demo',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?u=alice',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      avatarUrl: 'https://i.pravatar.cc/150?u=bob',
    },
  });

  console.log('Created users:', user1.name, user2.name, user3.name);

  // Create Board
  const board = await prisma.board.create({
    data: {
      title: 'Project Alpha',
      ownerId: user1.id,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  });

  console.log('Created board:', board.title);

  // Add members to board
  await prisma.boardMember.createMany({
    data: [
      { boardId: board.id, userId: user1.id },
      { boardId: board.id, userId: user2.id },
      { boardId: board.id, userId: user3.id },
    ],
  });

  // Create Labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: 'Bug', color: '#eb5a46', boardId: board.id } }),
    prisma.label.create({ data: { name: 'Feature', color: '#61bd4f', boardId: board.id } }),
    prisma.label.create({ data: { name: 'High Priority', color: '#f2d600', boardId: board.id } }),
    prisma.label.create({ data: { name: 'Design', color: '#c377e0', boardId: board.id } }),
    prisma.label.create({ data: { name: 'Backend', color: '#0079bf', boardId: board.id } }),
    prisma.label.create({ data: { name: 'Frontend', color: '#00c2e0', boardId: board.id } }),
  ]);

  console.log('Created labels:', labels.length);

  // Create Lists
  const todoList = await prisma.list.create({
    data: { title: 'To Do', order: 0, boardId: board.id },
  });

  const inProgressList = await prisma.list.create({
    data: { title: 'In Progress', order: 1, boardId: board.id },
  });

  const reviewList = await prisma.list.create({
    data: { title: 'In Review', order: 2, boardId: board.id },
  });

  const doneList = await prisma.list.create({
    data: { title: 'Done', order: 3, boardId: board.id },
  });

  console.log('Created lists');

  // Create Cards with labels, members, and checklists
  const card1 = await prisma.card.create({
    data: {
      title: 'Research Competitors',
      description: 'Analyze top 5 competitors in the market and document their features.',
      order: 0,
      listId: todoList.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  await prisma.cardLabel.createMany({
    data: [
      { cardId: card1.id, labelId: labels[2].id }, // High Priority
      { cardId: card1.id, labelId: labels[1].id }, // Feature
    ],
  });

  await prisma.cardMember.create({
    data: { cardId: card1.id, userId: user2.id },
  });

  const checklist1 = await prisma.checklist.create({
    data: {
      title: 'Research Tasks',
      cardId: card1.id,
      items: {
        create: [
          { content: 'Identify top 5 competitors', isChecked: true },
          { content: 'Document feature comparison', isChecked: false },
          { content: 'Create summary report', isChecked: false },
        ],
      },
    },
  });

  // Card 2
  const card2 = await prisma.card.create({
    data: {
      title: 'Design Mockups',
      description: 'Create UI/UX mockups for the main dashboard.',
      order: 1,
      listId: todoList.id,
    },
  });

  await prisma.cardLabel.create({
    data: { cardId: card2.id, labelId: labels[3].id }, // Design
  });

  // Card 3 - In Progress
  const card3 = await prisma.card.create({
    data: {
      title: 'Setup Development Environment',
      description: 'Configure the project repository, CI/CD pipeline, and development tools.',
      order: 0,
      listId: inProgressList.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
  });

  await prisma.cardLabel.createMany({
    data: [
      { cardId: card3.id, labelId: labels[4].id }, // Backend
      { cardId: card3.id, labelId: labels[5].id }, // Frontend
    ],
  });

  await prisma.cardMember.createMany({
    data: [
      { cardId: card3.id, userId: user1.id },
      { cardId: card3.id, userId: user3.id },
    ],
  });

  const checklist2 = await prisma.checklist.create({
    data: {
      title: 'Setup Checklist',
      cardId: card3.id,
      items: {
        create: [
          { content: 'Initialize Git repository', isChecked: true },
          { content: 'Setup ESLint and Prettier', isChecked: true },
          { content: 'Configure CI/CD pipeline', isChecked: false },
          { content: 'Setup Docker containers', isChecked: false },
        ],
      },
    },
  });

  // Card 4 - In Review
  const card4 = await prisma.card.create({
    data: {
      title: 'API Authentication Module',
      description: 'Implement JWT-based authentication for the REST API.',
      order: 0,
      listId: reviewList.id,
    },
  });

  await prisma.cardLabel.createMany({
    data: [
      { cardId: card4.id, labelId: labels[4].id }, // Backend
      { cardId: card4.id, labelId: labels[1].id }, // Feature
    ],
  });

  await prisma.cardMember.create({
    data: { cardId: card4.id, userId: user3.id },
  });

  // Card 5 - Done
  const card5 = await prisma.card.create({
    data: {
      title: 'Project Kickoff Meeting',
      description: 'Initial team meeting to discuss project goals and timeline.',
      order: 0,
      listId: doneList.id,
    },
  });

  // Card 6 - Bug card
  const card6 = await prisma.card.create({
    data: {
      title: 'Fix Login Page Styling',
      description: 'The login button is misaligned on mobile devices.',
      order: 2,
      listId: todoList.id,
    },
  });

  await prisma.cardLabel.createMany({
    data: [
      { cardId: card6.id, labelId: labels[0].id }, // Bug
      { cardId: card6.id, labelId: labels[5].id }, // Frontend
    ],
  });

  console.log('Created cards with labels, members, and checklists');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
