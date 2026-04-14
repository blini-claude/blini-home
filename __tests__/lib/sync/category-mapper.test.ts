import { describe, it, expect } from "vitest";
import { mapCategory, getCollectionSlugs } from "@/lib/sync/category-mapper";

describe("mapCategory", () => {
  it("should map shporta categories", () => {
    expect(mapCategory("Shtepiake")).toBe("Shtëpi");
    expect(mapCategory("Kitchen")).toBe("Kuzhinë");
    expect(mapCategory("Kujdesi Personal")).toBe("Bukuri");
    expect(mapCategory("Teknologji")).toBe("Teknologji");
  });

  it("should map tregu categories", () => {
    expect(mapCategory("Femije/Bebe")).toBe("Fëmijë");
    expect(mapCategory("Sporte/Aktivitete")).toBe("Sporte");
    expect(mapCategory("Veshmbathje")).toBe("Veshje");
  });

  it("should map benny categories", () => {
    expect(mapCategory("Personal Care")).toBe("Bukuri");
    expect(mapCategory("Gaming")).toBe("Teknologji");
    expect(mapCategory("Baby Monitors")).toBe("Fëmijë");
  });

  it("should fallback to Të përgjithshme for unknown", () => {
    expect(mapCategory("something random")).toBe("Të përgjithshme");
    expect(mapCategory("")).toBe("Të përgjithshme");
  });
});

describe("getCollectionSlugs", () => {
  it("should include nen-10 for cheap products", () => {
    const slugs = getCollectionSlugs({ price: 5, category: "Shtëpi" });
    expect(slugs).toContain("nen-10");
    expect(slugs).toContain("shtepi-kuzhine");
  });

  it("should not include nen-10 for expensive products", () => {
    const slugs = getCollectionSlugs({ price: 25, category: "Teknologji" });
    expect(slugs).not.toContain("nen-10");
    expect(slugs).toContain("teknologji");
  });

  it("should map categories to collection slugs", () => {
    expect(getCollectionSlugs({ price: 20, category: "Fëmijë" })).toContain("femije-lodra");
    expect(getCollectionSlugs({ price: 20, category: "Bukuri" })).toContain("bukuri-kujdes");
  });
});
