import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', icon: '💻' },
  { name: 'Tools', icon: '🔧' },
  { name: 'Camping & Outdoors', icon: '🏕️' },
  { name: 'Vehicles', icon: '🚗' },
  { name: 'Sports Equipment', icon: '⚽' },
  { name: 'Photography', icon: '📷' },
  { name: 'Party Supplies', icon: '🎉' },
  { name: 'Musical Instruments', icon: '🎸' },
  { name: 'Books & Media', icon: '📚' },
  { name: 'Home Appliances', icon: '🏠' },
];

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories) {
    await prisma.listingCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        icon: cat.icon,
      },
    });
  }
  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
