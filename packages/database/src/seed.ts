import { PrismaClient } from "../generated/client"
import { Prisma } from "../generated/client";
import { faker } from "@faker-js/faker";
import "dotenv/config";

const Prisma = new PrismaClient();

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



(async () => {
  try {
    await Promise.all(
      DEFAULT_USERS.map((user) =>
        Prisma.user.upsert({
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
    process.exit(1);
  } finally {
    await Prisma.$disconnect();
  }
})();