import { prisma } from "@/lib/prisma";
import ProductManager from "./ProductManager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  const plain = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: Number(p.price),
    description: p.description,
    image: p.image,
    inStock: p.inStock
  }));

  return <ProductManager initialProducts={plain} />;
}
