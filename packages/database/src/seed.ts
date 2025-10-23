import { prisma } from "./client";
import { faker } from "@faker-js/faker";

import type { User } from "../generated/client";

const DEFAULT_USERS: Array<Pick<User, "name" | "email">> = [
  { name: "Tim Apple", email: "tim@apple.com" },
];

const RUSSIAN_WORDS = [
  { word: "здравствуйте", translation: "hello (formal)", partOfSpeech: "interjection" },
  { word: "спасибо", translation: "thank you", partOfSpeech: "interjection" },
  { word: "работа", translation: "work", partOfSpeech: "noun" },
  { word: "дом", translation: "home", partOfSpeech: "noun" },
  { word: "время", translation: "time", partOfSpeech: "noun" },
];

// Simple sample articles
const SAMPLE_ARTICLES = [
  {
    title: "Новости дня",
    content: "Сегодня в России произошло много интересных событий.",
    difficulty: "beginner",
    source: "example.com/news",
  },
  {
    title: "Экономика России",
    content: "Российская экономика продолжает расти.",
    difficulty: "intermediate",
    source: "example.com/business",
  },
];

// # Seed function

// (async () => {
//   try {
//     console.log("🧹 Clearing old data...");
//     await prisma.user.deleteMany();
//     await prisma.word.deleteMany();
//     await prisma.article.deleteMany();

//     console.log("🌱 Seeding users...");
//     for (const user of DEFAULT_USERS) {
//       await prisma.user.upsert({
//         where: { email: user.email },
//         update: user,
//         create: user,
//       });
//     }

//     console.log("📚 Seeding words...");
//     await prisma.word.createMany({ data: RUSSIAN_WORDS });

//     console.log("📰 Seeding articles...");
//     await prisma.article.createMany({ data: SAMPLE_ARTICLES });

//     console.log("✅ Seed complete!");
//   } catch (error) {
//     console.error("❌ Error seeding data:", error);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// })();

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
