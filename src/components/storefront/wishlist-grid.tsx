"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";

export function WishlistGrid() {
  const { items, remove, clear } = useWishlist();
  const { addItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-[72px] h-[72px] rounded-full bg-[#F5F5F5] flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <h2 className="text-[20px] font-bold text-[#062F35] mb-2 tracking-[-0.4px]">
          Lista juaj është bosh
        </h2>
        <p className="text-[14px] text-[rgba(18,18,18,0.55)] max-w-sm mx-auto mb-6">
          Kliko zemrën mbi produktet për t&apos;i ruajtur këtu dhe për t&apos;u kthyer më vonë.
        </p>
        <Link
          href="/koleksion/te-gjitha"
          className="inline-block bg-[#062F35] text-white px-6 py-3 rounded-[8px] text-[14px] font-bold border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors"
        >
          Zbulo produktet
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-[rgba(18,18,18,0.55)]">
          {items.length} {items.length === 1 ? "produkt" : "produkte"}
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("Fshi të gjitha produktet nga lista?")) clear();
          }}
          className="text-[12px] text-[rgba(18,18,18,0.4)] hover:text-[#C62828] transition-colors font-medium"
        >
          Fshi të gjitha
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group flex flex-col bg-white rounded-[10px] border border-[#EFEFEF] overflow-hidden"
          >
            <Link
              href={`/produkt/${item.slug}`}
              className="block relative bg-[#F5F5F5]"
              style={{ aspectRatio: "3/4" }}
            >
              {item.thumbnail && (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  remove(item.productId);
                }}
                aria-label="Hiq nga lista"
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 hover:bg-white shadow-sm flex items-center justify-center transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#062F35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </Link>
            <div className="p-3 flex-1 flex flex-col">
              <Link href={`/produkt/${item.slug}`}>
                <h3 className="text-[13px] font-bold text-[#062F35] leading-[18px] line-clamp-2 min-h-[36px]">
                  {item.title}
                </h3>
              </Link>
              <p className="text-[14px] font-bold text-[#062F35] mt-1">
                &euro;{item.price.toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() =>
                  addItem({
                    productId: item.productId,
                    quantity: 1,
                    price: item.price,
                    title: item.title,
                    thumbnail: item.thumbnail,
                    slug: item.slug,
                  })
                }
                className="w-full mt-2.5 bg-[#062F35] text-white text-[12px] font-bold py-2 rounded-[8px] border-2 border-[#062F35] hover:bg-transparent hover:text-[#062F35] transition-colors cursor-pointer"
              >
                Shto në shportë
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
