"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { ActivityPill } from "@/components/storefront/activity-pill";
import { StarRating } from "@/components/storefront/star-rating";
import { getProductRating } from "@/lib/reviews";

interface UpsellProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  thumbnail: string | null;
  images: string[];
  isFeatured: boolean;
  category: string;
}

export function UpsellProducts() {
  const { items, addItem, subtotal } = useCart();
  const [products, setProducts] = useState<UpsellProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (items.length === 0) return;
    const ids = items.map((i) => i.productId).join(",");
    fetch(`/api/recommendations?ids=${ids}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[rgba(18,18,18,0.55)] text-[16px] mb-4">Shporta juaj është bosh</p>
        <Link href="/" className="text-[13px] font-bold text-[#062F35] underline underline-offset-4">
          Kthehu në kryefaqje
        </Link>
      </div>
    );
  }

  const deliveryFee = subtotal >= 30 ? 0 : 2.5;
  const amountForFreeShipping = subtotal < 30 ? (30 - subtotal) : 0;

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[24px] md:text-[32px] font-extrabold text-[#062F35] tracking-[-0.5px]">
          Para se të përfundoni...
        </h1>
        <p className="text-[15px] text-[rgba(18,18,18,0.6)] mt-2">
          Klientë të tjerë blenë gjithashtu këto produkte
        </p>
      </div>

      {/* Free shipping progress */}
      {amountForFreeShipping > 0 && (
        <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-4 mb-8 text-center">
          <p className="text-[14px] text-[#062F35]">
            <span className="font-bold">Vetëm €{amountForFreeShipping.toFixed(2)}</span> larg nga dërgimi{" "}
            <span className="font-bold text-[#2E7D32]">FALAS!</span>
          </p>
          <div className="mt-2 h-2 bg-[#E0E0E0] rounded-full overflow-hidden max-w-[300px] mx-auto">
            <div
              className="h-full bg-[#2E7D32] rounded-full transition-all duration-500"
              style={{ width: `${Math.min((subtotal / 30) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {amountForFreeShipping === 0 && (
        <div className="bg-[#E8F5E9] border border-[#A5D6A7] rounded-xl p-4 mb-8 text-center">
          <p className="text-[14px] text-[#2E7D32] font-bold">
            ✓ Dërgimi juaj është FALAS!
          </p>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-[#E8E8E8] rounded-lg" style={{ aspectRatio: "3/4" }} />
              <div className="mt-2 h-4 bg-[#E8E8E8] rounded w-3/4" />
              <div className="mt-1 h-3 bg-[#E8E8E8] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => {
            const price = Number(product.price);
            const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
            const isOnSale = compareAt && compareAt > price;
            const imgSrc = product.thumbnail || product.images[0] || null;
            const { rating, count } = getProductRating(product.id, price);
            const isAdded = addedIds.has(product.id);

            return (
              <div key={product.id} className="group flex flex-col">
                {/* Image */}
                <Link
                  href={`/produkt/${product.slug}`}
                  className="block relative overflow-hidden rounded-lg bg-[#E8E8E8]"
                  style={{ aspectRatio: "3/4" }}
                >
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={product.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                  {isOnSale && (
                    <span className="absolute top-2 left-2 bg-[#FFC334] text-[#062F35] text-[11px] font-bold px-2 py-0.5 rounded-md">
                      -{Math.round(((compareAt! - price) / compareAt!) * 100)}%
                    </span>
                  )}
                </Link>

                {/* Info */}
                <div className="mt-2 flex-1 flex flex-col">
                  <Link href={`/produkt/${product.slug}`}>
                    <h3 className="text-[14px] font-bold text-[#062F35] leading-tight line-clamp-1">
                      {product.title.split(/\s+/).slice(0, 4).join(" ")}
                    </h3>
                  </Link>

                  <div className="mt-1">
                    <ActivityPill
                      productId={product.id}
                      price={price}
                      isFeatured={product.isFeatured}
                      isOnSale={!!isOnSale}
                      variant="compact"
                    />
                  </div>

                  <div className="mt-0.5">
                    <StarRating rating={rating} count={count} size="sm" />
                  </div>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className={`text-[15px] font-bold ${isOnSale ? "text-[#D4A017]" : "text-[#062F35]"}`}>
                      &euro;{price.toFixed(2)}
                    </span>
                    {isOnSale && (
                      <span className="text-[12px] text-[rgba(18,18,18,0.4)] line-through">
                        &euro;{compareAt!.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to cart button */}
                <button
                  onClick={() => {
                    addItem({
                      productId: product.id,
                      quantity: 1,
                      price,
                      title: product.title,
                      thumbnail: product.thumbnail,
                      slug: product.slug,
                    });
                    setAddedIds((prev) => new Set(prev).add(product.id));
                  }}
                  disabled={isAdded}
                  className={`w-full mt-2 text-[13px] font-bold py-2.5 rounded-lg border-2 transition-colors cursor-pointer ${
                    isAdded
                      ? "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]"
                      : "bg-[#062F35] text-white border-[#062F35] hover:bg-transparent hover:text-[#062F35]"
                  }`}
                >
                  {isAdded ? "✓ U shtua" : "Shto në shportë"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom actions */}
      <div className="mt-10 flex flex-col items-center gap-4">
        <Link
          href="/porosia"
          className="w-full max-w-[400px] bg-[#062F35] text-white text-center py-4 rounded-xl text-[15px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
        >
          Vazhdo me porosinë — &euro;{(subtotal + deliveryFee).toFixed(2)}
        </Link>
        <Link
          href="/porosia"
          className="text-[13px] text-[rgba(18,18,18,0.5)] hover:text-[#062F35] transition-colors underline underline-offset-4"
        >
          Jo faleminderit, vazhdo direkt
        </Link>
      </div>
    </div>
  );
}
