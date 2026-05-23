import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { discoverBrandModelUrls, importBrandBatch, getSyncReport } from "@/lib/import.functions";
import { importDakarForgedRims, importKmcWheels, importRrwWheels, importBajaWheels } from "@/lib/rims-import.functions";
import { syncTireImages, getTireImagesReport } from "@/lib/tire-images.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/import")({
  beforeLoad: async ({ location }) => {
    // Skip on SSR — the browser client has no session storage on the server,
    // so it would always redirect. The check re-runs on the client.
    if (typeof window === "undefined") return;
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData } = sessionData.session
      ? await supabase.auth.getUser()
      : { data: { user: null } };
    const user = userData.user;
    if (!user) {
      throw redirect({ to: "/login", search: { redirect: redirectTo } });
    }
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      throw redirect({
        to: "/login",
        search: { redirect: redirectTo, message: "Your account does not have admin access." },
      });
    }
  },
  component: AdminImportPage,
  head: () => ({
    meta: [
      { title: "Tire Import — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type LogEntry = { ts: string; msg: string; tone?: "info" | "ok" | "err" };
type BrandEntry = { slug: string; name: string; sourceSlug?: string };

const BRANDS: BrandEntry[] = [
  { slug: "continental", name: "Continental" },
  { slug: "bridgestone", name: "Bridgestone" },
  { slug: "michelin", name: "Michelin" },
  { slug: "nexen", name: "Nexen" },
  { slug: "pirelli", name: "Pirelli" },
  { slug: "falken", name: "Falken" },
  { slug: "goodyear", name: "Goodyear" },
  { slug: "hankook", name: "Hankook" },
  { slug: "maxxis", name: "Maxxis" },
  { slug: "roadstone", name: "Roadstone" },
  { slug: "zeetex", name: "Zeetex" },
  { slug: "dunlop", name: "Dunlop" },
  { slug: "kumho", name: "Kumho", sourceSlug: "kumhotyre" },
  { slug: "cooper", name: "Cooper Tires", sourceSlug: "coopertires" },
];

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in again before running a sync.");
  return { Authorization: `Bearer ${token}` };
}

function AdminImportPage() {
  const discover = useServerFn(discoverBrandModelUrls);
  const importBatch = useServerFn(importBrandBatch);
  const fetchReport = useServerFn(getSyncReport);

  const reportQ = useQuery({
    queryKey: ["sync-report"],
    queryFn: async () => fetchReport({ headers: await getAuthHeaders() }),
  });

  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [totals, setTotals] = useState({ inserted: 0, updated: 0, failed: 0, models: 0 });

  const push = (msg: string, tone: LogEntry["tone"] = "info") =>
    setLog((l) => [...l, { ts: new Date().toLocaleTimeString(), msg, tone }]);

  async function runSync(brand: BrandEntry) {
    setActiveBrand(brand.slug);
    setLog([]);
    setTotals({ inserted: 0, updated: 0, failed: 0, models: 0 });
    try {
      push(`Discovering ${brand.name} model pages on pitstoparabia.com…`);
      const { urls } = await discover({
        data: { brandSlug: brand.slug, sourceSlug: brand.sourceSlug },
        headers: await getAuthHeaders(),
      });
      push(`Found ${urls.length} model pages. Scraping in batches of 5…`, "ok");

      const chunkSize = 5;
      let inserted = 0;
      let updated = 0;
      let failed = 0;
      let models = 0;

      for (let i = 0; i < urls.length; i += chunkSize) {
        const chunk = urls.slice(i, i + chunkSize);
        push(`Batch ${Math.floor(i / chunkSize) + 1}: ${chunk.length} models…`);
        try {
          const { results } = await importBatch({
            data: { brandSlug: brand.slug, urls: chunk },
            headers: await getAuthHeaders(),
          });
          for (const r of results) {
            models++;
            if (r.ok) {
              inserted += r.inserted;
              updated += r.updated;
              push(
                `  ✓ ${r.url.split("/").pop()} — +${r.inserted} new, ~${r.updated} updated`,
                "ok"
              );
            } else {
              failed++;
              push(`  ✗ ${r.url.split("/").pop()} — ${r.error}`, "err");
            }
          }
          setTotals({ inserted, updated, failed, models });
        } catch (e) {
          push(`Batch failed: ${e instanceof Error ? e.message : String(e)}`, "err");
        }
      }
      push(
        `Done. ${models} models • ${inserted} inserted • ${updated} updated • ${failed} failed.`,
        "ok"
      );
    } catch (e) {
      push(e instanceof Error ? e.message : String(e), "err");
    } finally {
      setActiveBrand(null);
      reportQ.refetch();
    }
  }

  const running = activeBrand !== null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Tire price import</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pulls live pricing from pitstoparabia.com, applies a 15% discount, and upserts into your
        catalog. Existing tires (matched by slug) get price + spec updates; new sizes are inserted.
      </p>

      {/* SYNC REPORT */}
      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-medium">Sync report</h2>
            <p className="text-xs text-muted-foreground">
              Last sync derived from the most recent tire added per brand.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => reportQ.refetch()} disabled={reportQ.isFetching}>
            {reportQ.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
        {reportQ.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : reportQ.error ? (
          <p className="text-sm text-destructive">{(reportQ.error as Error).message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <th className="py-2 pr-3">Brand</th>
                  <th className="py-2 pr-3 text-right">Tires</th>
                  <th className="py-2 pr-3 text-right">In stock</th>
                  <th className="py-2 pr-3 text-right">Price range (AED)</th>
                  <th className="py-2 pr-3 text-right">Avg</th>
                  <th className="py-2 pr-3">Last sync</th>
                </tr>
              </thead>
              <tbody>
                {reportQ.data?.rows.map((r) => (
                  <tr key={r.slug} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{r.name}</td>
                    <td className="py-2 pr-3 text-right">{r.count}</td>
                    <td className="py-2 pr-3 text-right">{r.inStock}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {r.minPrice != null
                        ? `${r.minPrice.toFixed(0)} – ${r.maxPrice!.toFixed(0)}`
                        : "—"}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums">
                      {r.avgPrice != null ? r.avgPrice.toFixed(0) : "—"}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">
                      {r.lastSync ? new Date(r.lastSync).toLocaleString() : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-6 p-6">
        <h2 className="font-medium mb-4">Brands</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {BRANDS.map((b) => (
            <div
              key={b.slug}
              className="flex items-center justify-between gap-3 rounded-md border p-3"
            >
              <div className="min-w-0">
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  /tyres/brands/{b.sourceSlug ?? b.slug}
                </div>
              </div>
              <Button size="sm" onClick={() => runSync(b)} disabled={running}>
                {activeBrand === b.slug ? "Syncing…" : "Sync"}
              </Button>
            </div>
          ))}
        </div>

        {(totals.models > 0 || running) && (
          <div className="mt-4 grid grid-cols-4 gap-3 text-center text-sm">
            <Stat label="Models" value={totals.models} />
            <Stat label="Inserted" value={totals.inserted} />
            <Stat label="Updated" value={totals.updated} />
            <Stat label="Failed" value={totals.failed} />
          </div>
        )}
      </Card>

      <TireImagesSection />

      <TireImagesReportSection />

      <RimsImportSection />




      {log.length > 0 && (
        <Card className="mt-6 p-4 max-h-[60vh] overflow-auto font-mono text-xs">
          {log.map((l, i) => (
            <div
              key={i}
              className={
                l.tone === "err"
                  ? "text-destructive"
                  : l.tone === "ok"
                    ? "text-foreground"
                    : "text-muted-foreground"
              }
            >
              <span className="opacity-60">[{l.ts}]</span> {l.msg}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

type RimResult = {
  source: string;
  total: number;
  inserted: number;
  updated: number;
  failed: number;
  failures: { sku: string; error: string }[];
};

type RimSource = { key: string; label: string; sub: string };

const RIM_SOURCES: RimSource[] = [
  { key: "dakar", label: "Dakar Forged", sub: "tunerstop.com/wheelbrand/Dakar Forged" },
  { key: "kmc", label: "KMC Wheels", sub: "kmcwheels.com/wheels/all-wheels" },
  { key: "rrw", label: "RRW (Relations Race Wheels)", sub: "tunerstop.com/wheelbrand/Relations Race Wheels" },
  { key: "baja", label: "Baja Built Wheels", sub: "bajabuiltwheels.com/collections/all" },
];

function RimsImportSection() {
  const importDakar = useServerFn(importDakarForgedRims);
  const importKmc = useServerFn(importKmcWheels);
  const importRrw = useServerFn(importRrwWheels);
  const importBaja = useServerFn(importBajaWheels);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [result, setResult] = useState<(RimResult & { label: string }) | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(src: RimSource) {
    setActiveKey(src.key);
    setResult(null);
    setError(null);
    try {
      const fn =
        src.key === "kmc"
          ? importKmc
          : src.key === "rrw"
            ? importRrw
            : src.key === "baja"
              ? importBaja
              : importDakar;
      const r = (await fn({ headers: await getAuthHeaders() })) as RimResult;
      setResult({ ...r, label: src.label });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActiveKey(null);
    }
  }

  const running = activeKey !== null;

  return (
    <Card className="mt-6 p-6">
      <h2 className="font-medium mb-1">Rims</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Imports the rim catalog from external sources. No prices are stored — rims
        are quote-only. Existing rims (matched by slug) get spec + image updates.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {RIM_SOURCES.map((src) => (
          <div
            key={src.key}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div className="min-w-0">
              <div className="font-medium">{src.label}</div>
              <div className="text-xs text-muted-foreground truncate">{src.sub}</div>
            </div>
            <Button size="sm" onClick={() => run(src)} disabled={running}>
              {activeKey === src.key ? "Syncing…" : "Sync"}
            </Button>
          </div>
        ))}
      </div>

      {error && <div className="mt-4 text-sm text-destructive">{error}</div>}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="text-xs text-muted-foreground">Last run: {result.label}</div>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <Stat label="Found" value={result.total} />
            <Stat label="Inserted" value={result.inserted} />
            <Stat label="Updated" value={result.updated} />
            <Stat label="Failed" value={result.failed} />
          </div>
          {result.failures.length > 0 && (
            <div className="rounded-md border p-3 font-mono text-xs max-h-60 overflow-auto">
              {result.failures.map((f, i) => (
                <div key={i} className="text-destructive">
                  {f.sku} — {f.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

type ImageOutcome = {
  tireSlug: string;
  tireName: string;
  ok: boolean;
  matchedProduct?: string;
  score?: number;
  imageUrl?: string;
  error?: string;
  skipped?: boolean;
};

function TireImagesSection() {
  const sync = useServerFn(syncTireImages);
  const [brandSlug, setBrandSlug] = useState<string>(BRANDS[0]?.slug ?? "");
  const [sourceUrl, setSourceUrl] = useState<string>("");
  const [onlyMissing, setOnlyMissing] = useState<boolean>(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImageOutcome[] | null>(null);
  const [scrapedCount, setScrapedCount] = useState<number>(0);

  async function run() {
    if (!sourceUrl) {
      setError("Paste the brand's source URL first.");
      return;
    }
    setRunning(true);
    setError(null);
    setResults(null);
    try {
      const r = await sync({
        data: { brandSlug, sourceUrl, onlyMissing },
        headers: await getAuthHeaders(),
      });
      setScrapedCount(r.scrapedCount);
      setResults(r.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  const okCount = results?.filter((r) => r.ok).length ?? 0;
  const skipCount = results?.filter((r) => r.skipped).length ?? 0;
  const failCount = results?.filter((r) => !r.ok && !r.skipped).length ?? 0;

  return (
    <Card className="mt-6 p-6">
      <h2 className="font-medium mb-1">Tire images</h2>
      <p className="text-xs text-muted-foreground mb-4">
        Pulls product images from a brand's official website (e.g.
        {" "}<code className="text-xs">https://tires.bridgestone.com</code>), matches them to
        tires in the catalog by model name, downloads them to Lovable Cloud storage, and updates
        each tire's main image.
      </p>

      <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto] items-end">
        <div>
          <label className="text-xs font-medium block mb-1">Brand</label>
          <select
            value={brandSlug}
            onChange={(e) => setBrandSlug(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            disabled={running}
          >
            {BRANDS.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">Source URL</label>
          <Input
            type="url"
            placeholder="https://tires.bridgestone.com/..."
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            disabled={running}
          />
        </div>
        <Button onClick={run} disabled={running || !sourceUrl}>
          {running ? "Syncing…" : "Sync images"}
        </Button>
      </div>

      <label className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={onlyMissing}
          onChange={(e) => setOnlyMissing(e.target.checked)}
          disabled={running}
        />
        Only update tires that don't have an image yet
      </label>

      {error && <div className="mt-4 text-sm text-destructive">{error}</div>}

      {results && (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <Stat label="Scraped" value={scrapedCount} />
            <Stat label="Updated" value={okCount} />
            <Stat label="Skipped" value={skipCount} />
            <Stat label="Failed" value={failCount} />
          </div>
          <div className="rounded-md border max-h-[60vh] overflow-auto font-mono text-xs">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 px-3 py-2 border-b last:border-0 ${
                  r.ok ? "" : r.skipped ? "text-muted-foreground" : "text-destructive"
                }`}
              >
                <span className="w-4">{r.ok ? "✓" : r.skipped ? "·" : "✗"}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate">{r.tireName}</div>
                  {r.matchedProduct && (
                    <div className="opacity-70">
                      → {r.matchedProduct}
                      {typeof r.score === "number" && ` (${(r.score * 100).toFixed(0)}%)`}
                    </div>
                  )}
                  {r.error && <div className="opacity-70">{r.error}</div>}
                </div>
                {r.imageUrl && (
                  <img
                    src={r.imageUrl}
                    alt=""
                    className="h-10 w-10 object-contain rounded bg-white border"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}



function TireImagesReportSection() {
  const fetchReport = useServerFn(getTireImagesReport);
  const [expanded, setExpanded] = useState<string | null>(null);
  const q = useQuery({
    queryKey: ["tire-images-report"],
    queryFn: async () => fetchReport({ headers: await getAuthHeaders() }),
  });

  const totals = q.data?.rows.reduce(
    (a, r) => ({
      total: a.total + r.total,
      withImage: a.withImage + r.withImage,
      missing: a.missing + r.missing,
    }),
    { total: 0, withImage: 0, missing: 0 }
  );

  return (
    <Card className="mt-6 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-medium">Tire image coverage</h2>
          <p className="text-xs text-muted-foreground">
            How many tires per brand have a product image set. Click a row to see what's missing.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => q.refetch()}
          disabled={q.isFetching}
        >
          {q.isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : q.error ? (
        <p className="text-sm text-destructive">{(q.error as Error).message}</p>
      ) : (
        <>
          {totals && (
            <div className="grid grid-cols-4 gap-3 text-center text-sm mb-4">
              <Stat label="Tires" value={totals.total} />
              <Stat label="With image" value={totals.withImage} />
              <Stat label="Missing" value={totals.missing} />
              <Stat
                label="Coverage %"
                value={totals.total ? Math.round((totals.withImage / totals.total) * 100) : 0}
              />
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
                  <th className="py-2 pr-3">Brand</th>
                  <th className="py-2 pr-3 text-right">Tires</th>
                  <th className="py-2 pr-3 text-right">With image</th>
                  <th className="py-2 pr-3 text-right">Missing</th>
                  <th className="py-2 pr-3">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {q.data?.rows.map((r) => {
                  const pct = Math.round(r.coverage * 100);
                  const isOpen = expanded === r.slug;
                  return (
                    <Fragment key={r.slug}>
                      <tr
                        className="border-b last:border-0 cursor-pointer hover:bg-muted/40"
                        onClick={() => setExpanded(isOpen ? null : r.slug)}
                      >
                        <td className="py-2 pr-3 font-medium">
                          <span className="inline-block w-3 opacity-60">{isOpen ? "▾" : "▸"}</span>{" "}
                          {r.name}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums">{r.total}</td>
                        <td className="py-2 pr-3 text-right tabular-nums">{r.withImage}</td>
                        <td
                          className={`py-2 pr-3 text-right tabular-nums ${r.missing > 0 ? "text-destructive" : ""}`}
                        >
                          {r.missing}
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full ${pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-destructive"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                      {isOpen && r.missing > 0 && (
                        <tr key={`${r.slug}-missing`} className="border-b last:border-0 bg-muted/20">
                          <td colSpan={5} className="py-3 pl-8 pr-3">
                            <div className="text-xs font-medium mb-2 text-muted-foreground">
                              Missing images ({r.missing})
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {r.missingList.map((m) => (
                                <span
                                  key={m.slug}
                                  className="inline-block rounded border px-2 py-0.5 text-xs bg-background"
                                >
                                  {m.name}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
