import { prisma } from "./client";
<<<<<<< HEAD
import { faker } from "@faker-js/faker";
import "dotenv/config";

import type { Prisma, User } from "../generated/client";

const RUSSIAN_WORDS: Prisma.WordCreateManyInput[] = [
{ word: "дом", translation: "house/home", definition: "dwelling", partOfSpeech: "noun", pronunciation: "dom", frequency: 700, examples: [] },
];

// Simple sample articles
const SAMPLE_ARTICLES: Prisma.ArticleCreateManyInput[] = [
  {
    title: "Новости дня",
    content: "Сегодня в России произошло много интересных событий.",
    difficulty: "beginner",
    wordCount: 7,
    readingTime: 1, // minutes
    source: "example.com/news",
  },
  {
    title: "Экономика России",
    content: "Российская экономика продолжает расти.",
    difficulty: "intermediate",
    wordCount: 4,
    readingTime: 1, // minutes
    source: "example.com/business",
  },
];

type SeedUser = {
  name: string;
  email: string;
  role: "student";
};

const DEFAULT_USERS: SeedUser[] = [
  {
    name: "Tim Cook",
    email: "tim@apple.com",
    role: "student",
  },
];

for (let i = 0; i < 5; i++) {
  DEFAULT_USERS.push({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: "student",
  });
}



// # Seed function

async function runSeed() {
  try {
    console.log("🧹 Clearing old data...");
    await prisma.article.deleteMany();
    await prisma.word.deleteMany();
    await prisma.user.deleteMany();

    console.log("🌱 Seeding users...");

    for (const user of DEFAULT_USERS) {
      await prisma.user.upsert({
        where: { email: user.email! },
        update: { ...user },
        create: { ...user },
      });
    }

    console.log("📚 Seeding words...");
    await prisma.word.createMany({ data: RUSSIAN_WORDS });

    console.log("📰 Seeding articles...");
    await prisma.article.createMany({ data: SAMPLE_ARTICLES });

    console.log("✅ Seed complete!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
=======

import type { User } from "../generated/client";

const DEFAULT_USERS = [
  // Add your own user to pre-populate the database with
  {
    name: "Tim Apple",
    email: "tim@apple.com",
  },
] as Array<Partial<User>>;

(async () => {
  try {
    await Promise.all(
      DEFAULT_USERS.map((user) =>
        prisma.user.upsert({
          where: {
            email: user.email!,
          },
          update: {
            ...user,
          },
          create: {
            ...user,
          },
        })
      )
    );
  } catch (error) {
    console.error(error);
>>>>>>> 1b19f68 (Add in other packages and apps for starter)
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
<<<<<<< HEAD
}

runSeed();

// (async () => {
//   try {
//     await Promise.all(
//       DEFAULT_USERS.map((user) =>
//         prisma.user.upsert({
//           where: {
//             email: user.email!,
//           },
//           update: {
//             ...user,
//           },
//           create: {
//             ...user,
//           },
//         })
//       )
//     );
//   } catch (error) {
//     console.error(error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// })();
=======
})();
>>>>>>> 1b19f68 (Add in other packages and apps for starter)
