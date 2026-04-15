import { InstantSearch } from "@/components/storefront/instant-search";

export default function SearchPage() {
  return (
    <div className="px-5 mx-auto py-8 md:py-12" style={{ maxWidth: 1440 }}>
      <h1 className="text-[28px] md:text-[36px] font-bold text-[#062F35] tracking-[-1.5px] leading-tight mb-5">
        Kerko
      </h1>
      <InstantSearch variant="page" />
    </div>
  );
}
