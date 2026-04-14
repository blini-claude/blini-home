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
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-6">
        <Link href="/" className="hover:text-text flex items-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        </Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary/50">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-text">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Images - slightly larger */}
        <div className="lg:col-span-7">
          <ImageGallery images={allImages} title={product.title} />
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{product.title}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            <span className={`text-2xl font-bold ${isOnSale ? "text-sale" : "text-text"}`}>
              €{price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-base text-text-secondary line-through">
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
              <h3 className="text-[15px] font-bold mb-3">Përshkrimi</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery info */}
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-[15px] font-bold mb-3">Dërgimi</h3>
            <ul className="text-sm text-text-secondary space-y-2.5">
              <li className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                Dërgim 1-3 ditë pune
              </li>
              <li className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Paguaj me para në dorë (COD)
              </li>
              <li className="flex items-center gap-2.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                Kthim falas brenda 14 ditëve
              </li>
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
