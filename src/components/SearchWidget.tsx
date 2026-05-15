import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getVehicleMakes, getVehicleModels, lookupVehicleSize } from "@/lib/catalog.functions";
import { Search } from "lucide-react";

const widths = [155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305,315,325];
const profiles = [30,35,40,45,50,55,60,65,70,75,80];
const rims = [13,14,15,16,17,18,19,20,21,22];
const years = Array.from({ length: 12 }, (_, i) => 2026 - i);

export function SearchWidget() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"size" | "vehicle">("size");

  const [w, setW] = useState<number | "">("");
  const [p, setP] = useState<number | "">("");
  const [r, setR] = useState<number | "">("");

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
    if (!make) return setModels([]);
    fetchModels({ data: { make } }).then(setModels).catch(() => setModels([]));
    setModel("");
  }, [make, fetchModels]);

  const onSize = (e: React.FormEvent) => {
    e.preventDefault();
    const search: Record<string, number> = {};
    if (w) search.width = Number(w);
    if (p) search.profile = Number(p);
    if (r) search.rim = Number(r);
    navigate({ to: "/shop", search });
  };

  const onVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!make || !model || !year) return;
    try {
      const v = await lookup({ data: { make, model, year: Number(year) } });
      if (!v) {
        setErr("No size match found — try size search instead.");
        return;
      }
      navigate({
        to: "/shop",
        search: { width: v.recommended_width, profile: v.recommended_profile, rim: v.recommended_rim },
      });
    } catch {
      setErr("Lookup failed. Please try again.");
    }
  };

  return (
    <div className="text-white">
      {/* By Dimensions / By Vehicle pills */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {(["size", "vehicle"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center justify-center gap-2 h-12 rounded-md text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === t
                ? "bg-amber-400 text-black"
                : "bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            {t === "size" ? "By Dimensions" : "By Vehicle"}
          </button>
        ))}
      </div>

      {tab === "size" ? (
        <form onSubmit={onSize} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Width">
              <select className="qt-select" value={w} onChange={(e) => setW(e.target.value ? Number(e.target.value) : "")}>
                <option value="">—</option>
                {widths.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Ratio">
              <select className="qt-select" value={p} onChange={(e) => setP(e.target.value ? Number(e.target.value) : "")}>
                <option value="">—</option>
                {profiles.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Diameter">
              <select className="qt-select" value={r} onChange={(e) => setR(e.target.value ? Number(e.target.value) : "")}>
                <option value="">—</option>
                {rims.map((x) => <option key={x} value={x}>R{x}</option>)}
              </select>
            </Field>
          </div>
          <button className="qt-search-btn">
            <Search className="h-4 w-4" /> Search
          </button>
        </form>
      ) : (
        <form onSubmit={onVehicle} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Make">
              <select className="qt-select" value={make} onChange={(e) => setMake(e.target.value)}>
                <option value="">—</option>
                {makes.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Model">
              <select className="qt-select" value={model} onChange={(e) => setModel(e.target.value)} disabled={!make}>
                <option value="">—</option>
                {models.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="Year">
              <select className="qt-select" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}>
                <option value="">—</option>
                {years.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
          </div>
          <button className="qt-search-btn" disabled={!make || !model || !year}>
            <Search className="h-4 w-4" /> Search
          </button>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </form>
      )}

      <style>{`
        .qt-select { width: 100%; height: 44px; padding: 0 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); background: #fff; color: #0b0d10; font-size: 18px; font-weight: 700; }
        .qt-select:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in oklch, var(--brand) 25%, transparent); }
        .qt-search-btn { width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 52px; border-radius: 6px; background: var(--brand); color: var(--brand-foreground); font-weight: 800; font-size: 16px; letter-spacing: 0.08em; text-transform: uppercase; transition: background .15s; }
        .qt-search-btn:hover { background: color-mix(in oklch, var(--brand) 88%, black); }
        .qt-search-btn:disabled { opacity: .5; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-white/60 mb-1 font-semibold">{label}</span>
      {children}
    </label>
  );
}
