import { PrismaClient, Visibility, Role, Permission, NotificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: demoPassword,
      role: Role.USER,
      emailVerified: true,
    },
  });

  // Create sample notes
  const sampleNotes = [
    {
      title: 'Welcome to Notes Management',
      description: `# Welcome to Notes Management System

This is your first note! Here are some features you can explore:

## Features
- **Rich Text Support**: Write notes with markdown formatting
- **Version Control**: Every change is automatically versioned
- **Sharing**: Share notes with other users
- **Real-time Updates**: See changes in real-time
- **Search**: Find notes quickly with powerful search

## Getting Started
1. Create new notes using the "New Note" button
2. Edit this note to see version control in action
3. Share notes with other users
4. Use tags to organize your notes

Happy note-taking! 📝`,
      tags: ['welcome', 'tutorial', 'getting-started'],
      visibility: Visibility.PUBLIC,
      authorId: admin.id,
    },
    {
      title: 'Project Ideas',
      description: `# Project Ideas

## Web Development
- [ ] Personal portfolio website
- [ ] E-commerce platform
- [ ] Social media dashboard
- [ ] Task management app

## Mobile Apps
- [ ] Expense tracker
- [ ] Fitness companion
- [ ] Recipe organizer
- [ ] Language learning app

## Data Science
- [ ] Stock price predictor
- [ ] Weather analysis
- [ ] Customer segmentation
- [ ] Recommendation system`,
      tags: ['projects', 'ideas', 'development'],
      visibility: Visibility.PRIVATE,
      authorId: demoUser.id,
    },
    {
      title: 'Meeting Notes - Q1 Planning',
      description: `# Q1 Planning Meeting
**Date**: January 15, 2024
**Attendees**: Team leads, Product managers

## Agenda
1. Review Q4 performance
2. Set Q1 objectives
3. Resource allocation
4. Timeline planning

## Key Decisions
- Focus on user experience improvements
- Allocate 30% of resources to new features
- Monthly sprint reviews
- Quarterly team retrospectives

## Action Items
- [ ] Create detailed project timelines
- [ ] Set up monitoring dashboards
- [ ] Schedule team training sessions
- [ ] Review and update documentation`,
      tags: ['meeting', 'planning', 'q1', 'work'],
      visibility: Visibility.SHARED,
      authorId: admin.id,
    },
  ];

  for (const noteData of sampleNotes) {
    // Remove authorId from noteData for note creation, set via relation
    const { authorId, ...noteCreateData } = noteData;
    const note = await prisma.note.create({
      data: {
        ...noteCreateData,
        author: { connect: { id: authorId } },
      },
      include: { author: true },
    });

    // Create initial version for each note
    await prisma.noteVersion.create({
      data: {
        noteId: note.id,
        title: note.title,
        description: note.description, // Use description as initial content
        version: 1,
        createdBy: note.authorId,
      },
    });

    console.log(`✅ Created note: ${note.title}`);
  }

  // Share the "Meeting Notes" with demo user
  const meetingNote = await prisma.note.findFirst({
    where: { title: 'Meeting Notes - Q1 Planning' },
  });

  if (meetingNote) {
    await prisma.noteUser.create({
      data: {
        noteId: meetingNote.id,
        userId: demoUser.id,
        permission: Permission.VIEW,
      },
    });

    // Create a notification for the shared note
    await prisma.notification.create({
      data: {
        userId: demoUser.id,
        type: NotificationType.NOTE_SHARED,
        message: `Admin User shared a note "${meetingNote.title}" with you`,
        metadata: { noteId: meetingNote.id, sharedByUserId: admin.id },
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Demo Accounts:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Demo User: demo@example.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });