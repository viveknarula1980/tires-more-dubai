import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { discoverBrandModelUrls, importBrandBatch } from "@/lib/import.functions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

function AdminImportPage() {
  const discover = useServerFn(discoverBrandModelUrls);
  const importBatch = useServerFn(importBrandBatch);

  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [totals, setTotals] = useState({ inserted: 0, updated: 0, failed: 0, models: 0 });

  const push = (msg: string, tone: LogEntry["tone"] = "info") =>
    setLog((l) => [...l, { ts: new Date().toLocaleTimeString(), msg, tone }]);

  async function runSync(brandSlug: string) {
    setRunning(true);
    setLog([]);
    setTotals({ inserted: 0, updated: 0, failed: 0, models: 0 });
    try {
      push(`Discovering ${brandSlug} model pages on pitstoparabia.com…`);
      const { urls } = await discover({ data: { brandSlug } });
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
          const { results } = await importBatch({ data: { brandSlug, urls: chunk } });
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
      setRunning(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Tire price import</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pulls live pricing from pitstoparabia.com, applies a 15% discount, and upserts into your
        catalog. Existing tires (matched by slug) get price + spec updates; new sizes are inserted.
      </p>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-medium">Continental</h2>
            <p className="text-sm text-muted-foreground">
              Source: pitstoparabia.com/en/tyres/brands/continental
            </p>
          </div>
          <Button onClick={() => runSync("continental")} disabled={running}>
            {running ? "Syncing…" : "Sync Continental"}
          </Button>
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
