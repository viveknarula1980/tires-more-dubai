import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "lookup_vehicle_tire_size",
  title: "Lookup tire size for a vehicle",
  description: "Given a vehicle make, model and year, return the recommended OEM tire size.",
  inputSchema: {
    make: z.string().min(1).max(80),
    model: z.string().min(1).max(80),
    year: z.number().int().min(1990).max(2030),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ make, model, year }) => {
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await sb
      .from("vehicles")
      .select("*")
      .eq("make", make)
      .eq("model", model)
      .lte("year_from", year)
      .gte("year_to", year)
      .limit(1);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const row = data?.[0];
    if (!row) return { content: [{ type: "text", text: "No match for that vehicle" }] };
    return {
      content: [{ type: "text", text: JSON.stringify(row, null, 2) }],
      structuredContent: { vehicle: row },
    };
  },
});
