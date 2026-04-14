"use client";

import Image from "next/image";
import { useState } from "react";

export function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [selected, setSelected] = useState(0);

  if (images.length === 0) {
    return <div className="w-full bg-card-bg aspect-square" />;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image - square, sharp corners */}
      <div className="relative w-full bg-card-bg aspect-square">
        <Image
          src={images[selected]}
          alt={`${title} - ${selected + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 flex-shrink-0 bg-card-bg relative ${
                i === selected ? "border-b-2 border-text" : ""
              }`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
