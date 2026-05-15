import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, ChevronUp, X } from "lucide-react";

const widths = [155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305,315,325];
const profiles = [30,35,40,45,50,55,60,65,70,75,80];
const rims = [13,14,15,16,17,18,19,20,21,22];

export function StickyBottomSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [w, setW] = useState<number | "">("");
  const [p, setP] = useState<number | "">("");
  const [r, setR] = useState<number | "">("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const search: Record<string, number> = {};
    if (w) search.width = Number(w);
    if (p) search.profile = Number(p);
    if (r) search.rim = Number(r);
    navigate({ to: "/shop", search });
  };

  return (
    <>
      <div className="h-16 lg:h-20" aria-hidden />
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <div className="container mx-auto px-3 lg:px-4">
          {/* Mobile: collapsed trigger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="lg:hidden w-full flex items-center justify-between gap-3 py-3"
          >
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy">
              <Search className="h-4 w-4 text-brand" /> Search Tyres by Size
            </span>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Desktop: inline form */}
          <form onSubmit={submit} className="hidden lg:flex items-center gap-3 py-3">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy shrink-0">
              <Search className="h-4 w-4 text-brand" /> Search by Size
            </span>
            <select className="sb-select" value={w} onChange={(e) => setW(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Width</option>
              {widths.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select className="sb-select" value={p} onChange={(e) => setP(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Profile</option>
              {profiles.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select className="sb-select" value={r} onChange={(e) => setR(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Rim</option>
              {rims.map((x) => <option key={x} value={x}>R{x}</option>)}
            </select>
            <button className="sb-btn ml-auto"><Search className="h-4 w-4" /> Find Tyres</button>
          </form>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setOpen(false)}>
          <div className="w-full bg-background rounded-t-2xl p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold uppercase tracking-wide">Search by Size</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submit} className="grid grid-cols-3 gap-2">
              <select className="sb-select" value={w} onChange={(e) => setW(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Width</option>
                {widths.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <select className="sb-select" value={p} onChange={(e) => setP(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Profile</option>
                {profiles.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <select className="sb-select" value={r} onChange={(e) => setR(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Rim</option>
                {rims.map((x) => <option key={x} value={x}>R{x}</option>)}
              </select>
              <button className="sb-btn col-span-3"><Search className="h-4 w-4" /> Find Tyres</button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .sb-select { flex: 1; min-width: 0; height: 42px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--background); color: var(--foreground); font-size: 14px; }
        .sb-select:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in oklch, var(--brand) 25%, transparent); }
        .sb-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 20px; border-radius: 8px; background: var(--brand); color: var(--brand-foreground); font-weight: 700; font-size: 14px; white-space: nowrap; }
        .sb-btn:hover { opacity: .92; }
      `}</style>
    </>
  );
}
