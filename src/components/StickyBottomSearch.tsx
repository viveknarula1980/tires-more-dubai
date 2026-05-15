import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Search, ChevronUp, X, Ruler, Car } from "lucide-react";
import { getVehicleMakes, getVehicleModels, lookupVehicleSize } from "@/lib/catalog.functions";

const widths = [155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305,315,325];
const profiles = [30,35,40,45,50,55,60,65,70,75,80];
const rims = [13,14,15,16,17,18,19,20,21,22];
const years = Array.from({ length: 12 }, (_, i) => 2026 - i);

export function StickyBottomSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"size" | "vehicle">("size");

  // Size search
  const [w, setW] = useState<number | "">("");
  const [p, setP] = useState<number | "">("");
  const [r, setR] = useState<number | "">("");

  // Vehicle search
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number | "">("");
  const [err, setErr] = useState("");

  const fetchMakes = useServerFn(getVehicleMakes);
  const fetchModels = useServerFn(getVehicleModels);
  const lookup = useServerFn(lookupVehicleSize);

  useEffect(() => {
    fetchMakes().then(setMakes).catch(() => {});
  }, [fetchMakes]);

  useEffect(() => {
    if (!make) { setModels([]); return; }
    fetchModels({ data: { make } }).then(setModels).catch(() => setModels([]));
    setModel("");
  }, [make, fetchModels]);

  const submitSize = (e: React.FormEvent) => {
    e.preventDefault();
    const search: Record<string, number> = {};
    if (w) search.width = Number(w);
    if (p) search.profile = Number(p);
    if (r) search.rim = Number(r);
    navigate({ to: "/shop", search });
  };

  const submitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!make || !model || !year) return;
    try {
      const v = await lookup({ data: { make, model, year: Number(year) } });
      if (!v) { setErr("No size match — try size search."); return; }
      navigate({
        to: "/shop",
        search: { width: v.recommended_width, profile: v.recommended_profile, rim: v.recommended_rim },
      });
    } catch {
      setErr("Lookup failed.");
    }
  };

  return (
    <>
      <div className="h-20 lg:h-20" aria-hidden />
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)]">
        <div className="container mx-auto px-3 lg:px-4">
          {/* Mobile collapsed trigger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="lg:hidden w-full flex items-center justify-between gap-3 py-3"
          >
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-navy">
              <Search className="h-4 w-4 text-brand" /> Search Tyres
            </span>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Desktop: single row with mode toggle */}
          <div className="hidden lg:flex items-center gap-4 py-3">
            {/* Mode tabs */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setMode("size")}
                className={`sb-mode ${mode === "size" ? "sb-mode-active" : ""}`}
                title="Search by Size"
              >
                <Ruler className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Size</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("vehicle")}
                className={`sb-mode ${mode === "vehicle" ? "sb-mode-active" : ""}`}
                title="Search by Vehicle"
              >
                <Car className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Vehicle</span>
              </button>
            </div>

            <div className="w-px h-10 bg-border shrink-0" />

            {mode === "size" ? (
              <form onSubmit={submitSize} className="flex items-center gap-3 flex-1 min-w-0">
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
            ) : (
              <form onSubmit={submitVehicle} className="flex items-center gap-3 flex-1 min-w-0">
                <select className="sb-select" value={make} onChange={(e) => setMake(e.target.value)}>
                  <option value="">Make</option>
                  {makes.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <select className="sb-select" value={model} onChange={(e) => setModel(e.target.value)} disabled={!make}>
                  <option value="">Model</option>
                  {models.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <select className="sb-select" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">Year</option>
                  {years.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <button className="sb-btn sb-btn-outline ml-auto" disabled={!make || !model || !year}>
                  <Search className="h-4 w-4" /> Find Tyres
                </button>
              </form>
            )}
          </div>
          {err && mode === "vehicle" && (
            <p className="hidden lg:block text-xs text-destructive pb-2 pl-[88px]">{err}</p>
          )}
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setOpen(false)}>
          <div className="w-full bg-background rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold uppercase tracking-wide">Search Tyres</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile mode tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setMode("size")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  mode === "size" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Ruler className="h-4 w-4" /> By Size
              </button>
              <button
                type="button"
                onClick={() => setMode("vehicle")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                  mode === "vehicle" ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Car className="h-4 w-4" /> By Vehicle
              </button>
            </div>

            {mode === "size" ? (
              <form onSubmit={submitSize} className="grid grid-cols-3 gap-2">
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
                <button className="sb-btn col-span-3"><Search className="h-4 w-4" /> Find by Size</button>
              </form>
            ) : (
              <form onSubmit={submitVehicle} className="grid grid-cols-3 gap-2">
                <select className="sb-select" value={make} onChange={(e) => setMake(e.target.value)}>
                  <option value="">Make</option>
                  {makes.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <select className="sb-select" value={model} onChange={(e) => setModel(e.target.value)} disabled={!make}>
                  <option value="">Model</option>
                  {models.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <select className="sb-select" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">Year</option>
                  {years.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                <button className="sb-btn sb-btn-outline col-span-3" disabled={!make || !model || !year}>
                  <Search className="h-4 w-4" /> Find by Vehicle
                </button>
                {err && <p className="col-span-3 text-xs text-destructive">{err}</p>}
              </form>
            )}
          </div>
        </div>
      )}

      <style>{`
        .sb-select { flex: 1; min-width: 0; height: 40px; padding: 0 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--background); color: var(--foreground); font-size: 14px; }
        .sb-select:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in oklch, var(--brand) 25%, transparent); }
        .sb-select:disabled { opacity: .55; }
        .sb-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 20px; border-radius: 8px; background: var(--brand); color: var(--brand-foreground); font-weight: 700; font-size: 13px; white-space: nowrap; text-transform: uppercase; letter-spacing: .03em; }
        .sb-btn:hover { opacity: .92; }
        .sb-btn:disabled { opacity: .5; cursor: not-allowed; }
        .sb-btn-outline { background: transparent; color: var(--navy, var(--foreground)); border: 2px solid var(--brand); }
        .sb-btn-outline:hover { background: var(--brand); color: var(--brand-foreground); opacity: 1; }
        .sb-mode { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; width: 52px; height: 46px; border-radius: 8px; border: 1px solid var(--border); background: var(--muted); color: var(--muted-foreground); transition: all .15s; cursor: pointer; }
        .sb-mode:hover { border-color: var(--brand); color: var(--brand); }
        .sb-mode-active { background: var(--brand); color: var(--brand-foreground); border-color: var(--brand); }
        .sb-mode-active:hover { color: var(--brand-foreground); }
      `}</style>
    </>
  );
}
