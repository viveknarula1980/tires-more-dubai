import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getPricingComparison, type PricingRow } from "@/lib/pricing.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/compare-pricing")({
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
        search: { redirect: redirectTo, message: "Your account does not have admin access." },
      });
    }
  },
  component: ComparePricingPage,
  head: () => ({
    meta: [
      { title: "Compare Pricing — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in again.");
  return { Authorization: `Bearer ${token}` };
}

type SortKey = "name" | "brand" | "shopPrice" | "sourcePrice" | "diff" | "discountPct";

function ComparePricingPage() {
  const fetchFn = useServerFn(getPricingComparison);
  const q = useQuery({
    queryKey: ["pricing-comparison"],
    queryFn: async () => fetchFn({ headers: await getAuthHeaders() }),
  });

  const [brand, setBrand] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [onlyMismatch, setOnlyMismatch] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("discountPct");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const rows = q.data?.rows ?? [];
  const brands = useMemo(() => {
    const map = new Map<string, string>();
    rows.forEach((r) => map.set(r.brandSlug, r.brand));
    return Array.from(map, ([slug, name]) => ({ slug, name })).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [rows]);

  const filtered = useMemo(() => {
    let list = rows;
    if (brand !== "all") list = list.filter((r) => r.brandSlug === brand);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(s) ||
          r.size.toLowerCase().includes(s) ||
          r.brand.toLowerCase().includes(s)
      );
    }
    if (onlyMismatch) list = list.filter((r) => r.sourcePrice == null || r.diff !== 0);

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
  }, [rows, brand, search, onlyMismatch, sortKey, sortDir]);

  const stats = useMemo(() => {
    const withSrc = filtered.filter((r) => r.sourcePrice != null);
    const avgDiscount =
      withSrc.length > 0
        ? withSrc.reduce((s, r) => s + (r.discountPct ?? 0), 0) / withSrc.length
        : 0;
    const above = filtered.filter((r) => (r.diff ?? 0) > 0).length;
    const below = filtered.filter((r) => (r.diff ?? 0) < 0).length;
    const equal = filtered.filter((r) => r.diff === 0).length;
    const missing = filtered.filter((r) => r.sourcePrice == null).length;
    return { total: filtered.length, avgDiscount, above, below, equal, missing };
  }, [filtered]);

  function toggleSort(k: SortKey) {
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
          <h1 className="text-3xl font-semibold tracking-tight">Compare pricing</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Compares your shop price against the last scraped source price (pitstoparabia.com)
            captured during import.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/admin/tireae-compare" className="underline">
            Compare vs tire.ae →
          </Link>
          <Link to="/admin/import" className="underline text-muted-foreground">
            ← Back to import
          </Link>
        </div>
      </div>

      <Card className="mt-6 p-4">
        <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto_auto] items-end">
          <div>
            <label className="text-xs font-medium block mb-1">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="all">All brands</option>
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
              placeholder="Model, size, brand…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={onlyMismatch}
              onChange={(e) => setOnlyMismatch(e.target.checked)}
            />
            Only mismatches / missing
          </label>
          <Button size="sm" variant="outline" onClick={() => q.refetch()} disabled={q.isFetching}>
            {q.isFetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <StatCard label="Rows" value={stats.total.toString()} />
        <StatCard label="Avg discount vs source" value={`${stats.avgDiscount.toFixed(1)}%`} />
        <StatCard label="Below source" value={stats.below.toString()} tone="ok" />
        <StatCard label="Above source" value={stats.above.toString()} tone="err" />
        <StatCard label="No source price" value={stats.missing.toString()} tone="muted" />
      </div>

      <Card className="mt-4 p-0 overflow-hidden">
        {q.isLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : q.error ? (
          <div className="p-6 text-sm text-destructive">{(q.error as Error).message}</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No tires match your filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b bg-muted/40">
                  <Th sortKey="name" active={sortKey} dir={sortDir} onClick={toggleSort}>
                    Tire
                  </Th>
                  <Th sortKey="brand" active={sortKey} dir={sortDir} onClick={toggleSort}>
                    Brand
                  </Th>
                  <th className="py-2 px-3">Size</th>
                  <Th sortKey="shopPrice" active={sortKey} dir={sortDir} onClick={toggleSort} right>
                    Shop (AED)
                  </Th>
                  <Th sortKey="sourcePrice" active={sortKey} dir={sortDir} onClick={toggleSort} right>
                    Source (AED)
                  </Th>
                  <Th sortKey="diff" active={sortKey} dir={sortDir} onClick={toggleSort} right>
                    Diff
                  </Th>
                  <Th sortKey="discountPct" active={sortKey} dir={sortDir} onClick={toggleSort} right>
                    Discount
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

function Row({ r }: { r: PricingRow }) {
  const diffTone =
    r.diff == null
      ? "text-muted-foreground"
      : r.diff < 0
        ? "text-emerald-600"
        : r.diff > 0
          ? "text-destructive"
          : "text-muted-foreground";
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30">
      <td className="py-2 px-3">
        <Link
          to="/shop/$slug"
          params={{ slug: r.slug }}
          className="font-medium hover:underline"
          target="_blank"
        >
          {r.name}
        </Link>
        {!r.inStock && (
          <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            Out of stock
          </span>
        )}
      </td>
      <td className="py-2 px-3">{r.brand}</td>
      <td className="py-2 px-3 tabular-nums">{r.size}</td>
      <td className="py-2 px-3 text-right tabular-nums">{r.shopPrice.toFixed(2)}</td>
      <td className="py-2 px-3 text-right tabular-nums">
        {r.sourcePrice != null ? r.sourcePrice.toFixed(2) : "—"}
      </td>
      <td className={`py-2 px-3 text-right tabular-nums ${diffTone}`}>
        {r.diff != null ? `${r.diff > 0 ? "+" : ""}${r.diff.toFixed(2)}` : "—"}
      </td>
      <td className={`py-2 px-3 text-right tabular-nums ${diffTone}`}>
        {r.discountPct != null ? `${r.discountPct.toFixed(1)}%` : "—"}
      </td>
    </tr>
  );
}

function Th({
  children,
  sortKey,
  active,
  dir,
  onClick,
  right,
}: {
  children: React.ReactNode;
  sortKey: SortKey;
  active: SortKey;
  dir: "asc" | "desc";
  onClick: (k: SortKey) => void;
  right?: boolean;
}) {
  const isActive = active === sortKey;
  return (
    <th
      className={`py-2 px-3 cursor-pointer select-none ${right ? "text-right" : ""}`}
      onClick={() => onClick(sortKey)}
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
