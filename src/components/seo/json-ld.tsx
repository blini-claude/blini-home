/**
 * Renders a JSON-LD structured-data script. Server component — the object is
 * serialized at render time so crawlers see it in the initial HTML.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
