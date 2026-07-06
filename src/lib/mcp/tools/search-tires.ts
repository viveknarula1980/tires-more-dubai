import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

function admin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "search_tires",
  title: "Search tires",
  description:
    "Search the tire catalog by brand slug, tire size (width/profile/rim), vehicle type, season, or a free-text query. Returns matching tires with price in AED.",
  inputSchema: {
    brand: z.string().max(80).optional().describe("Brand slug, e.g. 'michelin'"),
    width: z.number().int().min(100).max(400).optional(),
    profile: z.number().int().min(20).max(90).optional(),
    rim: z.number().int().min(10).max(26).optional(),
    vehicle_type: z.enum(["passenger", "suv"]).optional(),
    season: z.enum(["summer", "all-season", "winter"]).optional(),
    q: z.string().max(120).optional().describe("Free-text search on tire name"),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input) => {
    const sb = admin();
    let q = sb.from("tires").select("slug, name, width, profile, rim, price_aed, in_stock, brand:brands(slug,name)");
    if (input.brand) {
      const { data: b } = await sb.from("brands").select("id").eq("slug", input.brand).maybeSingle();
      if (!b) return { content: [{ type: "text", text: "No tires found" }], structuredContent: { tires: [] } };
      q = q.eq("brand_id", b.id);
    }
    if (input.width) q = q.eq("width", input.width);
    if (input.profile) q = q.eq("profile", input.profile);
    if (input.rim) q = q.eq("rim", input.rim);
    if (input.vehicle_type) q = q.eq("vehicle_type", input.vehicle_type);
    if (input.season) q = q.eq("season", input.season);
    if (input.q) q = q.ilike("name", `%${input.q}%`);
    q = q.order("name").limit(input.limit ?? 20);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { tires: data ?? [] },
    };
  },
});
