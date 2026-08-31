import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  { name: "Cottage Skirt — Sage", category: "skirt", price: 120, description: "Midi cottage skirt, elastic waist.", inStock: true },
  { name: "Cottage Skirt — Rust", category: "skirt", price: 120, description: "Midi cottage skirt, elastic waist.", inStock: true },
  { name: "Everyday Joggers — Charcoal", category: "joggers", price: 95, description: "Fleece-lined joggers with side pockets.", inStock: true },
  { name: "Everyday Joggers — Sand", category: "joggers", price: 95, description: "Fleece-lined joggers with side pockets.", inStock: true },
  { name: "Wrap Dress — Wine", category: "dress", price: 160, description: "Knee-length wrap dress, tie waist.", inStock: true },
  { name: "Wrap Dress — Forest", category: "dress", price: 160, description: "Knee-length wrap dress, tie waist.", inStock: true },
  { name: "Basic Top — Mustard", category: "top", price: 60, description: "Cropped rib-knit basic top.", inStock: true },
  { name: "Basic Top — Cream", category: "top", price: 60, description: "Cropped rib-knit basic top.", inStock: true }
];

async function main() {
  for (const p of products) {
    await prisma.product.create({ data: p });
  }
  console.log(`Seeded ${products.length} placeholder products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
