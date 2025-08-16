import { faker } from "@faker-js/faker";
import "dotenv/config";
import { PrismaClient  } from "../generated/client";

import type { Prisma, User } from "../generated/client";
import { prisma } from "./client";

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.article.deleteMany();
  await prisma.user.deleteMany();
  await prisma.words.deleteMany();

  const users = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.user.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          role: 'student'
        },
      })
    )
  );

  console.log(`✅ Created ${users.length} users`);

  // --- seed words ---
  const words = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.words.create({
        data: {
          word: faker.word.sample(),
          translation: faker.word.sample(),
          definition: faker.lorem.sentence(),
          partOfSpeech: faker.helpers.arrayElement(['noun', 'verb', 'adjective']),
          pronunciation: faker.word.sample(),
          frequency: faker.number.int({ min: 100, max: 1000 }),
        },
      })
    )
  );

  console.log(`✅ Created ${words.length} words`);

  // --- seed articles ---
  const articles = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.article.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs({ min: 2, max: 5 }),
          difficulty: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
          author: faker.person.fullName(),
          publishedAt: faker.date.recent({ days: 30 }),
          createdAt: faker.date.past({ years: 1 }),
        },
      })
    )
  );

  console.log(`✅ Created ${articles.length} articles`);

  console.log('🌾 Seed complete — database disconnected.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });