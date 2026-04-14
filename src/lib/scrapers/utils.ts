export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ëë]/g, "e")
    .replace(/[çç]/g, "c")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}

export function makeUniqueSlug(baseSlug: string, sourceStore: string, sourceId: string): string {
  return `${baseSlug}-${sourceStore}-${sourceId}`.substring(0, 250);
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 2000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BliniHome/1.0)",
          ...options.headers,
        },
      });
      if (response.ok) return response;
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("retry-after") || "5");
        await new Promise((r) => setTimeout(r, retryAfter * 1000));
        continue;
      }
      if (i === retries - 1) return response;
    } catch (err) {
      if (i === retries - 1) throw err;
    }
    await new Promise((r) => setTimeout(r, delay * (i + 1)));
  }
  throw new Error(`Failed to fetch ${url} after ${retries} retries`);
}

export function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

export function extractTextContent(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
