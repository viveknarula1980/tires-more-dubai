import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  compareBrandWithTireAe,
  exportTireAeCsv,
  type TireAeCompareRow,
} from "@/lib/tireae-compare.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type Brand = { id: string; name: string; slug: string };

export const Route = createFileRoute("/admin/tireae-compare")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const redirectTo = `${location.pathname}${location.search}${location.hash}`;
    const { data: sessionData } = await supabase.auth.getSession();
    const { data: userData } = sessionData.session
      ? await supabase.auth.getUser()
      : { data: { user: null } };
    const user = userData.user;
    if (!user) throw redirect({ to: "/login", search: { redirect: redirectTo } });
    const { data: role } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!role) {
      throw redirect({
        to: "/login",
        search: {
          redirect: redirectTo,
          message: "Your account does not have admin access.",
        },
      });
    }
  },
  component: TireAeComparePage,
  head: () => ({
    meta: [
      { title: "Tire.ae Price Compare — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function TireAeComparePage() {
  const runFn = useServerFn(compareBrandWithTireAe);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandSlug, setBrandSlug] = useState<string>("");
  const [search, setSearch] = useState("");
  const [onlyMatched, setOnlyMatched] = useState(true);
  const [sortKey, setSortKey] = useState<
    "name" | "size" | "shopPrice" | "tireAeMin" | "diffVsMin" | "discountPctVsMin" | "tireAeCount"
  >("discountPctVsMin");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    supabase
      .from("brands")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => {
        const list = (data ?? []) as Brand[];
        setBrands(list);
        if (list[0] && !brandSlug) setBrandSlug(list[0].slug);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mut = useMutation({
    mutationFn: async (slug: string) => {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error("Please sign in again.");
      return runFn({
        data: { brandSlug: slug },
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  });

  const rows: TireAeCompareRow[] = mut.data?.rows ?? [];

  const exportFn = useServerFn(exportTireAeCsv);
  const exportMut = useMutation({
    mutationFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error("Please sign in again.");
      const res = await exportFn({ headers: { Authorization: `Bearer ${token}` } });
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date().toISOString().slice(0, 10);
      a.download = `tire-ae-export-${date}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return res;
    },
  });

  const filtered = useMemo(() => {
    let list = rows;
    if (onlyMatched) list = list.filter((r) => r.tireAeCount > 0);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) => r.name.toLowerCase().includes(s) || r.size.toLowerCase().includes(s)
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [rows, search, onlyMatched, sortKey, sortDir]);

  const stats = useMemo(() => {
    const matched = rows.filter((r) => r.tireAeCount > 0);
    const cheaper = matched.filter((r) => (r.diffVsMin ?? 0) < 0).length;
    const pricier = matched.filter((r) => (r.diffVsMin ?? 0) > 0).length;
    const avgPct =
      matched.length > 0
        ? matched.reduce((s, r) => s + (r.discountPctVsMin ?? 0), 0) / matched.length
        : 0;
    return { total: rows.length, matched: matched.length, cheaper, pricier, avgPct };
  }, [rows]);

  function toggleSort(k: typeof sortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Compare vs tire.ae</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a brand, then fetch live prices from tire.ae and match by exact size
            (width / profile / rim) against your catalog.
          </p>
        </div>
        <Link to="/admin/compare-pricing" className="text-sm underline text-muted-foreground">
          ← Internal price compare
        </Link>
      </div>


      <Card className="mt-4 p-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="text-sm">
          <div className="font-medium">Export tire.ae listings to CSV</div>
          <div className="text-xs text-muted-foreground">
            Scrapes every brand in your catalog from tire.ae and downloads a CSV
            (brand, name, price AED, size, item id).
          </div>
        </div>
        <div className="flex items-center gap-3">
          {exportMut.data && (
            <span className="text-xs text-muted-foreground">
              {exportMut.data.total} rows · {exportMut.data.brandCount} brands
              {exportMut.data.errors.length > 0 &&
                ` · ${exportMut.data.errors.length} brand error(s)`}
            </span>
          )}
          <Button
            variant="secondary"
            onClick={() => exportMut.mutate()}
            disabled={exportMut.isPending}
          >
            {exportMut.isPending ? "Scraping tire.ae…" : "Download CSV"}
          </Button>
        </div>
      </Card>
      {exportMut.error && (
        <div className="mt-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {(exportMut.error as Error).message}
        </div>
      )}

      <Card className="mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr_auto_auto] items-end">
          <div>
            <label className="text-xs font-medium block mb-1">Brand</label>
            <select
              value={brandSlug}
              onChange={(e) => setBrandSlug(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Search</label>
            <Input
              placeholder="Model or size…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={onlyMatched}
              onChange={(e) => setOnlyMatched(e.target.checked)}
            />
            Only rows matched on tire.ae
          </label>
          <Button
            onClick={() => brandSlug && mut.mutate(brandSlug)}
            disabled={!brandSlug || mut.isPending}
          >
            {mut.isPending ? "Fetching tire.ae…" : "Fetch from tire.ae"}
          </Button>
        </div>
      </Card>

      {mut.error && (
        <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {(mut.error as Error).message}
        </div>
      )}
      {mut.data?.scrapeError && (
        <div className="mt-4 rounded-md border border-amber-500/40 bg-amber-50 p-3 text-sm text-amber-800">
          tire.ae scrape warning: {mut.data.scrapeError}
        </div>
      )}

      {mut.data && (
        <>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <StatCard label="Your tires" value={stats.total.toString()} />
            <StatCard
              label="tire.ae listings"
              value={mut.data.tireAeCount.toString()}
              tone="muted"
            />
            <StatCard label="Size matched" value={stats.matched.toString()} />
            <StatCard label="Cheaper than tire.ae" value={stats.cheaper.toString()} tone="ok" />
            <StatCard label="Pricier than tire.ae" value={stats.pricier.toString()} tone="err" />
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Average vs tire.ae min: {stats.avgPct.toFixed(1)}% (positive = we're below tire.ae)
          </div>
        </>
      )}

      <Card className="mt-4 p-0 overflow-hidden">
        {!mut.data && !mut.isPending ? (
          <div className="p-6 text-sm text-muted-foreground">
            Pick a brand and click "Fetch from tire.ae" to run the comparison.
          </div>
        ) : mut.isPending ? (
          <div className="p-6 text-sm text-muted-foreground">
            Scraping tire.ae/{brandSlug}… this can take 10–30s.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No matches for the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
                  <Th k="name" active={sortKey} dir={sortDir} onClick={toggleSort}>
                    Tire
                  </Th>
                  <Th k="size" active={sortKey} dir={sortDir} onClick={toggleSort}>
                    Size
                  </Th>
                  <Th k="shopPrice" active={sortKey} dir={sortDir} onClick={toggleSort} right>
                    Your price
                  </Th>
                  <Th k="tireAeMin" active={sortKey} dir={sortDir} onClick={toggleSort} right>
                    tire.ae min
                  </Th>
                  <Th k="tireAeCount" active={sortKey} dir={sortDir} onClick={toggleSort} right>
                    Listings
                  </Th>
                  <Th k="diffVsMin" active={sortKey} dir={sortDir} onClick={toggleSort} right>
                    Diff
                  </Th>
                  <Th
                    k="discountPctVsMin"
                    active={sortKey}
                    dir={sortDir}
                    onClick={toggleSort}
                    right
                  >
                    vs min
                  </Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <Row key={r.id} r={r} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function Row({ r }: { r: TireAeCompareRow }) {
  const tone =
    r.diffVsMin == null
      ? "text-muted-foreground"
      : r.diffVsMin < 0
        ? "text-emerald-600"
        : r.diffVsMin > 0
          ? "text-destructive"
          : "text-muted-foreground";
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className="border-b last:border-0 hover:bg-muted/30">
        <td className="py-2 px-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="font-medium hover:underline text-left"
            disabled={r.matches.length === 0}
          >
            {r.name}
          </button>
          {!r.inStock && (
            <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Out of stock
            </span>
          )}
        </td>
        <td className="py-2 px-3 tabular-nums">{r.size}</td>
        <td className="py-2 px-3 text-right tabular-nums">{r.shopPrice.toFixed(2)}</td>
        <td className="py-2 px-3 text-right tabular-nums">
          {r.tireAeMin != null ? r.tireAeMin.toFixed(2) : "—"}
          {r.tireAeMax != null && r.tireAeMax !== r.tireAeMin && (
            <span className="text-xs text-muted-foreground"> / {r.tireAeMax.toFixed(0)}</span>
          )}
        </td>
        <td className="py-2 px-3 text-right tabular-nums">{r.tireAeCount || "—"}</td>
        <td className={`py-2 px-3 text-right tabular-nums ${tone}`}>
          {r.diffVsMin != null
            ? `${r.diffVsMin > 0 ? "+" : ""}${r.diffVsMin.toFixed(2)}`
            : "—"}
        </td>
        <td className={`py-2 px-3 text-right tabular-nums ${tone}`}>
          {r.discountPctVsMin != null ? `${r.discountPctVsMin.toFixed(1)}%` : "—"}
        </td>
      </tr>
      {open && r.matches.length > 0 && (
        <tr className="bg-muted/20 border-b">
          <td colSpan={7} className="px-3 py-2">
            <div className="text-xs text-muted-foreground mb-1">tire.ae listings for this size:</div>
            <ul className="text-xs space-y-0.5">
              {r.matches.map((m, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{m.name}</span>
                  <span className="tabular-nums font-medium">{m.price.toFixed(2)} AED</span>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}
    </>
  );
}

function Th({
  children,
  k,
  active,
  dir,
  onClick,
  right,
}: {
  children: React.ReactNode;
  k:
    | "name"
    | "size"
    | "shopPrice"
    | "tireAeMin"
    | "diffVsMin"
    | "discountPctVsMin"
    | "tireAeCount";
  active: string;
  dir: "asc" | "desc";
  onClick: (k: never) => void;
  right?: boolean;
}) {
  const isActive = active === k;
  return (
    <th
      className={`py-2 px-3 cursor-pointer select-none ${right ? "text-right" : ""}`}
      onClick={() => onClick(k as never)}
    >
      <span className={isActive ? "text-foreground" : ""}>
        {children}
        {isActive ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </span>
    </th>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "err" | "muted";
}) {
  const color =
    tone === "ok"
      ? "text-emerald-600"
      : tone === "err"
        ? "text-destructive"
        : tone === "muted"
          ? "text-muted-foreground"
          : "";
  return (
    <div className="rounded-md border p-3">
      <div className={`text-2xl font-semibold ${color}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
