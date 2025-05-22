import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator with full access",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Regular user with limited access",
    },
  });

  console.log({ adminRole, userRole });

  // Create admin user
  const adminPassword = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { email: "admin@travelblog.com" },
    update: {},
    create: {
      email: "admin@travelblog.com",
      name: "Admin User",
      password: adminPassword,
      roleId: adminRole.id,
      bio: "Blog administrator",
    },
  });

  console.log({ admin });

  // Create regular user
  const userPassword = await hashPassword("user123");
  const user = await prisma.user.upsert({
    where: { email: "user@travelblog.com" },
    update: {},
    create: {
      email: "user@travelblog.com",
      name: "Regular User",
      password: userPassword,
      roleId: userRole.id,
      bio: "Travel enthusiast",
    },
  });

  console.log({ user });

  // Create categories
  const categories = [
    {
      name: "Adventure",
      description: "Thrilling and exciting travel experiences",
    },
    { name: "Beach", description: "Sun, sand, and surf destinations" },
    { name: "City", description: "Urban exploration and city life" },
    { name: "Culture", description: "Cultural experiences and heritage" },
    {
      name: "Food",
      description: "Culinary journeys and gastronomic adventures",
    },
    { name: "Nature", description: "Nature retreats and wildlife experiences" },
  ];

  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
    console.log({ category: result });
  }

  // Create sample posts
  const adventureCategory = await prisma.category.findUnique({
    where: { name: "Adventure" },
  });
  const beachCategory = await prisma.category.findUnique({
    where: { name: "Beach" },
  });
  const cityCategory = await prisma.category.findUnique({
    where: { name: "City" },
  });
  const natureCategory = await prisma.category.findUnique({
    where: { name: "Nature" },
  });
  const cultureCategory = await prisma.category.findUnique({
    where: { name: "Culture" },
  });

  if (adventureCategory && beachCategory && cityCategory) {
    const post1 = await prisma.post.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: "Hiking in the Swiss Alps",
        content:
          "Experience the breathtaking views of the Swiss Alps on this amazing hiking trail. The journey begins in Lucerne, a picturesque city known for its preserved medieval architecture and sits amid snowcapped mountains on Lake Lucerne. From there, you'll head to the starting point of the trail, where the real adventure begins.\n\nThe trail offers a mix of challenging ascents and peaceful walks through lush meadows dotted with wildflowers. The air is crisp and clean, and the silence is broken only by the occasional bell from a grazing cow or the distant sound of a waterfall.\n\nMake sure to bring proper hiking boots, layered clothing, and plenty of water. The weather in the Alps can change quickly, so being prepared is essential.\n\nThe highlight of the trip is reaching the summit, where you're rewarded with panoramic views of the surrounding peaks and valleys. It's the perfect spot for photos and a well-deserved rest before heading back down.",
        published: true,
        location: "Swiss Alps, Switzerland",
        authorId: admin.id,
        categories: {
          connect: [
            { id: adventureCategory.id },
            ...(natureCategory ? [{ id: natureCategory.id }] : []),
          ],
        },
      },
    });

    const post2 = await prisma.post.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: "Beach Paradise in Bali",
        content:
          "Discover the stunning beaches of Bali and experience the ultimate tropical getaway. Bali, often called the Island of the Gods, is known for its lush landscapes, pristine beaches, and vibrant culture.\n\nThe beaches in Bali offer something for everyone. For surfing enthusiasts, the beaches of Kuta and Uluwatu provide perfect waves. If you're looking for a more relaxed vibe, head to Nusa Dua or Sanur, where calm waters and clean beaches await.\n\nBeyond the beaches, Bali is home to ancient temples, terraced rice fields, and a rich cultural heritage. Don't miss the opportunity to watch a traditional Balinese dance performance or participate in a cooking class to learn about local cuisine.\n\nThe best time to visit is during the dry season, from April to October, when you can enjoy sunny days and comfortable temperatures. Accommodations range from luxury resorts to cozy homestays, making Bali an accessible destination for all types of travelers.",
        published: true,
        location: "Bali, Indonesia",
        authorId: user.id,
        categories: {
          connect: [{ id: beachCategory.id }],
        },
      },
    });

    const post3 = await prisma.post.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: "Exploring the Streets of Tokyo",
        content:
          "Navigate the bustling streets and hidden gems of Tokyo, a city of contrasts. Tokyo, Japan's busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples.\n\nStart your journey in Shibuya, known for its famous crossing where thousands of people cross at once. Then head to Shinjuku for some of the best street food and shopping experiences. Don't miss Asakusa, home to the ancient Senso-ji Temple, and Ueno Park, perfect for a peaceful stroll.\n\nThe city's efficient public transportation system makes it easy to navigate between districts. The Tokyo Metro and JR lines can take you anywhere you need to go, though be prepared for crowded trains during rush hour.\n\nFood lovers will be in heaven, with options ranging from Michelin-starred restaurants to tiny ramen shops hidden in alleys. Don't leave without trying authentic sushi, ramen, and tempura.\n\nWhether you're interested in technology, fashion, history, or cuisine, Tokyo offers an unforgettable urban adventure for every type of traveler.",
        published: true,
        location: "Tokyo, Japan",
        authorId: admin.id,
        categories: {
          connect: [
            { id: cityCategory.id },
            ...(cultureCategory ? [{ id: cultureCategory.id }] : []),
          ],
        },
      },
    });

    console.log({ post1, post2, post3 });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
