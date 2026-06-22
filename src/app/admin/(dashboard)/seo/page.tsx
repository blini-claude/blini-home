import { AdminHeader } from "@/components/admin/admin-header";
import { isGoogleConfigured } from "@/lib/google/auth";
import { gscTotals, gscByDate, gscTopQueries, gscTopPages } from "@/lib/google/gsc";
import { ga4Totals, ga4Channels, ga4TopPages, ga4Devices, ga4TopCountries } from "@/lib/google/ga4";

export const dynamic = "force-dynamic";

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}
function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: daysStr } = await searchParams;
  const days = [7, 28, 90].includes(Number(daysStr)) ? Number(daysStr) : 28;
  const configured = isGoogleConfigured();

  if (!configured) {
    return (
      <>
        <AdminHeader title="SEO & Google" subtitle="Analitika nga Google Search Console + GA4" />
        <div className="p-6 md:p-8">
          <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-8 max-w-[680px]">
            <h3 className="text-[16px] font-bold text-[#062F35] mb-2">Lidhja me Google ende s&apos;është konfiguruar</h3>
            <p className="text-[13px] text-[rgba(18,18,18,0.6)] leading-relaxed mb-4">
              Sapo të vendoset çelësi i service-account dhe ID-të e Google, kjo faqe do të tregojë
              kërkimet kryesore në Google, klikimet, përshtypjet dhe trafikun e faqes.
            </p>
            <ul className="text-[13px] text-[rgba(18,18,18,0.6)] space-y-1.5 list-disc pl-5">
              <li>Çelësi JSON i service-account (te <code className="font-mono">/root/blini-home-ga-sa-key.json</code> ose env <code className="font-mono">GOOGLE_SA_KEY_B64</code>)</li>
              <li><code className="font-mono">GA4_PROPERTY_ID</code> — ID numerik i property-t GA4</li>
              <li><code className="font-mono">GSC_SITE_URL</code> — p.sh. <code className="font-mono">sc-domain:home.blini.world</code></li>
              <li><code className="font-mono">NEXT_PUBLIC_GA_MEASUREMENT_ID</code> — G-XXXXXXX (matja në faqe)</li>
            </ul>
          </div>
        </div>
      </>
    );
  }

  const [gTotals, gDates, gQueries, gPages, aTotals, aChannels, aPages, aDevices, aCountries] =
    await Promise.all([
      gscTotals(days),
      gscByDate(days),
      gscTopQueries(days, 20),
      gscTopPages(days, 15),
      ga4Totals(days),
      ga4Channels(days),
      ga4TopPages(days, 12),
      ga4Devices(days),
      ga4TopCountries(days, 10),
    ]);

  const maxDateClicks = Math.max(1, ...gDates.map((d) => d.clicks));

  return (
    <>
      <AdminHeader title="SEO & Google" subtitle="Search Console + Google Analytics" />
      <div className="p-6 md:p-8 space-y-6">
        {/* Range selector */}
        <div className="flex gap-1 bg-white rounded-[10px] border border-[#E8E8E8] p-1 w-fit">
          {[7, 28, 90].map((d) => (
            <a
              key={d}
              href={`/admin/seo?days=${d}`}
              className={`px-3.5 py-1.5 text-[11px] font-bold rounded-[6px] transition-colors ${
                d === days ? "bg-[#062F35] text-white" : "text-[rgba(18,18,18,0.5)] hover:bg-[#F5F5F5]"
              }`}
            >
              {d} ditë
            </a>
          ))}
        </div>

        {/* Search Console KPIs */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)] mb-3">
            Google Search (Search Console)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi label="Klikime" value={fmt(gTotals.clicks)} />
            <Kpi label="Përshtypje" value={fmt(gTotals.impressions)} />
            <Kpi label="CTR" value={pct(gTotals.ctr)} />
            <Kpi label="Pozicioni mesatar" value={gTotals.position.toFixed(1)} />
          </div>
        </section>

        {/* Clicks by date */}
        {gDates.length > 0 && (
          <section className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)] mb-4">
              Klikime sipas ditës
            </h3>
            <div className="flex items-end gap-[2px] h-[120px]">
              {gDates.map((d) => (
                <div key={d.date} className="flex-1 group relative flex flex-col justify-end" title={`${d.date}: ${d.clicks} klikime`}>
                  <div
                    className="bg-[#062F35] rounded-t-[2px] min-h-[2px] group-hover:bg-[#FFC334] transition-colors"
                    style={{ height: `${(d.clicks / maxDateClicks) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top queries */}
          <RankTable
            title="Kërkimet kryesore"
            cols={["Kërkimi", "Klik.", "Përsh.", "Poz."]}
            rows={gQueries.map((r) => [
              r.keys?.[0] ?? "—",
              fmt(r.clicks),
              fmt(r.impressions),
              r.position.toFixed(1),
            ])}
            empty="Ende s'ka të dhëna kërkimi (mund të duhen disa ditë pas verifikimit)."
          />
          {/* Top pages (GSC) */}
          <RankTable
            title="Faqet kryesore (Google)"
            cols={["Faqja", "Klik.", "Përsh.", "CTR"]}
            rows={gPages.map((r) => [
              (r.keys?.[0] ?? "—").replace("https://home.blini.world", "") || "/",
              fmt(r.clicks),
              fmt(r.impressions),
              pct(r.ctr),
            ])}
            empty="Ende s'ka të dhëna."
          />
        </div>

        {/* GA4 KPIs */}
        <section>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.5)] mb-3">
            Trafiku i faqes (Google Analytics)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Kpi label="Përdorues" value={fmt(aTotals.activeUsers)} />
            <Kpi label="Sesione" value={fmt(aTotals.sessions)} />
            <Kpi label="Shikime faqesh" value={fmt(aTotals.pageViews)} />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RankTable
            title="Burimet e trafikut"
            cols={["Kanali", "Përdorues"]}
            rows={aChannels.map((c) => [c.channel || "—", fmt(c.users)])}
            empty="Ende s'ka të dhëna trafiku."
          />
          <RankTable
            title="Faqet më të vizituara"
            cols={["Faqja", "Shikime"]}
            rows={aPages.map((p) => [p.page || "—", fmt(p.views)])}
            empty="Ende s'ka të dhëna trafiku."
          />
          <RankTable
            title="Pajisjet"
            cols={["Pajisja", "Përdorues"]}
            rows={aDevices.map((d) => [d.device || "—", fmt(d.users)])}
            empty="Ende s'ka të dhëna."
          />
          <RankTable
            title="Shtetet"
            cols={["Shteti", "Përdorues"]}
            rows={aCountries.map((c) => [c.country || "—", fmt(c.users)])}
            empty="Ende s'ka të dhëna."
          />
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] p-5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[rgba(18,18,18,0.45)]">{label}</p>
      <p className="text-[26px] font-extrabold text-[#062F35] tracking-[-0.5px] mt-1">{value}</p>
    </div>
  );
}

function RankTable({
  title,
  cols,
  rows,
  empty,
}: {
  title: string;
  cols: string[];
  rows: (string | number)[][];
  empty: string;
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#F0F0F0]">
        <h3 className="text-[12px] font-bold text-[#062F35]">{title}</h3>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-[12px] text-[rgba(18,18,18,0.4)] text-center">{empty}</p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0F0F0]">
              {cols.map((c, i) => (
                <th
                  key={c}
                  className={`text-[10px] font-bold text-[rgba(18,18,18,0.4)] uppercase tracking-wider px-5 py-2 ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className="border-b border-[#F8F8F8] last:border-0 hover:bg-[#FAFBFC]">
                {r.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-5 py-2.5 text-[12px] ${
                      ci === 0
                        ? "text-left font-semibold text-[#062F35] truncate max-w-[260px]"
                        : "text-right text-[rgba(18,18,18,0.6)] tabular-nums"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
