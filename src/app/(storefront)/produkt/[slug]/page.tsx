import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { ImageGallery } from "@/components/storefront/image-gallery";
import { ProductCarousel } from "@/components/storefront/product-carousel";
import { AddToCartButton } from "./add-to-cart-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.title} — BLINI HOME`,
    description: product.description?.substring(0, 160) || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = Number(product.price);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const isOnSale = compareAt && compareAt > price;
  const allImages = product.images.length > 0 ? product.images : product.thumbnail ? [product.thumbnail] : [];

  const related = await getRelatedProducts(product.id, product.category, 6);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text">Kryefaqja</Link>
        <span className="mx-2">/</span>
        <span className="text-text">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <ImageGallery images={allImages} title={product.title} />

        {/* Info */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">{product.title}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className={`text-3xl font-bold tracking-tight ${isOnSale ? "text-sale" : "text-text"}`}>
              €{price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-lg text-text-secondary line-through">
                €{compareAt!.toFixed(2)}
              </span>
            )}
          </div>

          {isOnSale && (
            <p className="text-sale text-sm font-semibold mt-1">
              Kurseni €{(compareAt! - price).toFixed(2)}
            </p>
          )}

          {/* Add to cart */}
          <div className="mt-6">
            <AddToCartButton
              product={{
                id: product.id,
                title: product.title,
                price,
                thumbnail: product.thumbnail,
                slug: product.slug,
              }}
            />
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-[15px] font-semibold mb-3">Përshkrimi</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery info */}
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-[15px] font-semibold mb-3">Dërgimi</h3>
            <ul className="text-sm text-text-secondary space-y-2">
              <li>📦 Dërgim 1-3 ditë pune</li>
              <li>💰 Paguaj me para në dorë (COD)</li>
              <li>🔄 Kthim falas brenda 14 ditëve</li>
            </ul>
          </div>

          {/* Source store */}
          <p className="text-xs text-text-secondary mt-6">
            Burimi: {product.sourceStore === "shporta" ? "Shporta.shop" : product.sourceStore === "tregu" ? "Tregu.shop" : "BennyGroup"}
          </p>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-16">
          <ProductCarousel title="Produkte të ngjashme" products={related} />
        </div>
      )}
    </div>
  );
}
