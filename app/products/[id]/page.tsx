import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product-detail";
import { allDetailProducts, getDetailProduct } from "@/lib/product-details";

export const dynamicParams = false;
export function generateStaticParams() { return allDetailProducts.map((product) => ({ id: String(product.id) })); }

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const product = getDetailProduct(Number((await params).id));
  return product ? { title: `${product.name} | 다써바`, description: product.description } : {};
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = getDetailProduct(Number((await params).id));
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
