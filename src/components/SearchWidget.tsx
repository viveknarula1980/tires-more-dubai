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
    <div className="bg-card text-card-foreground rounded-xl shadow-2xl border border-border overflow-hidden">
      <div className="flex">
        {(["size", "vehicle"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 px-4 text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === t ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t === "size" ? "Search by Size" : "Search by Vehicle"}
          </button>
        ))}
      </div>
      <div className="p-5">
        {tab === "size" ? (
          <form onSubmit={onSize} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select className="select-base" value={w} onChange={(e) => setW(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Width</option>
              {widths.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select className="select-base" value={p} onChange={(e) => setP(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Profile</option>
              {profiles.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select className="select-base" value={r} onChange={(e) => setR(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Rim</option>
              {rims.map((x) => <option key={x} value={x}>R{x}</option>)}
            </select>
            <button className="btn-brand"><Search className="h-4 w-4" /> Find Tyres</button>
          </form>
        ) : (
          <form onSubmit={onVehicle} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select className="select-base" value={make} onChange={(e) => setMake(e.target.value)}>
              <option value="">Make</option>
              {makes.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select className="select-base" value={model} onChange={(e) => setModel(e.target.value)} disabled={!make}>
              <option value="">Model</option>
              {models.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <select className="select-base" value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Year</option>
              {years.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
            <button className="btn-brand" disabled={!make || !model || !year}><Search className="h-4 w-4" /> Find Tyres</button>
            {err && <p className="col-span-full text-sm text-destructive">{err}</p>}
          </form>
        )}
      </div>
      <style>{`
        .select-base { width: 100%; height: 44px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--border); background: var(--background); color: var(--foreground); font-size: 14px; }
        .select-base:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px color-mix(in oklch, var(--brand) 25%, transparent); }
        .btn-brand { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; border-radius: 8px; background: var(--brand); color: var(--brand-foreground); font-weight: 700; font-size: 14px; transition: opacity .15s; }
        .btn-brand:hover { opacity: .92; } .btn-brand:disabled { opacity: .5; }
      `}</style>
    </div>
  );
}
