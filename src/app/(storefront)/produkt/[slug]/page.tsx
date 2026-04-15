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
    <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-text-secondary mb-6">
        <Link href="/" className="hover:text-text-primary transition-colors">
          Ballina
        </Link>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span className="text-text-primary font-bold line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        {/* Images */}
        <div className="lg:col-span-7">
          <ImageGallery images={allImages} title={product.title} />
        </div>

        {/* Info */}
        <div className="lg:col-span-5">
          <h1 className="text-[24px] lg:text-[28px] font-bold text-text-primary tracking-[-0.5px] leading-tight">
            {product.title}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className={`text-[24px] font-bold ${isOnSale ? "text-sale" : "text-text-primary"}`}>
              &euro;{price.toFixed(2)}
            </span>
            {isOnSale && (
              <span className="text-[16px] text-text-secondary line-through">
                &euro;{compareAt!.toFixed(2)}
              </span>
            )}
          </div>

          {isOnSale && (
            <p className="text-sale text-[13px] font-bold mt-1">
              Kurseni &euro;{(compareAt! - price).toFixed(2)}
            </p>
          )}

          {/* Add to cart */}
          <div className="mt-8">
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
              <h3 className="text-[14px] font-bold text-text-primary mb-3">Pershkrimi</h3>
              <p className="text-[14px] text-text-secondary leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Delivery info */}
          <div className="mt-6 border-t border-border pt-6">
            <h3 className="text-[14px] font-bold text-text-primary mb-3">Dergimi</h3>
            <ul className="text-[13px] text-text-secondary space-y-3">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E8F0E4] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                Dërgim 1-3 ditë punë
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E0EBF5] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                Paguaj me para në dorë (COD)
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFF0E0] flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </div>
                Kthim falas brenda 14 ditëve
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-20">
          <ProductCarousel title="Produkte të ngjashme" products={related} />
        </div>
      )}
    </div>
  );
}
