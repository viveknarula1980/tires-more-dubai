import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const getRimBrands = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("rim_brands")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

const filterSchema = z.object({
  brand: z.string().max(80).optional(),
  diameter: z.number().int().min(13).max(30).optional(),
  width: z.number().min(5).max(15).optional(),
  offset_min: z.number().int().min(-100).max(100).optional(),
  offset_max: z.number().int().min(-100).max(100).optional(),
  finish: z.string().max(40).optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(["featured", "name", "diameter_asc", "diameter_desc"]).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const searchRims = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => filterSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("rims")
      .select("*, brand:rim_brands(slug,name,logo_url)");

    if (data.brand) {
      const { data: b } = await supabaseAdmin
        .from("rim_brands").select("id").eq("slug", data.brand).maybeSingle();
      if (b) q = q.eq("brand_id", b.id);
      else return [];
    }
    if (data.diameter) q = q.eq("diameter", data.diameter);
    if (data.width) q = q.eq("width", data.width);
    if (data.offset_min !== undefined) q = q.gte("offset_mm", data.offset_min);
    if (data.offset_max !== undefined) q = q.lte("offset_mm", data.offset_max);
    if (data.finish) q = q.ilike("color", `%${data.finish}%`);
    if (data.q) q = q.ilike("name", `%${data.q}%`);

    switch (data.sort) {
      case "diameter_asc": q = q.order("diameter", { ascending: true }); break;
      case "diameter_desc": q = q.order("diameter", { ascending: false }); break;
      case "name": q = q.order("name"); break;
      default: q = q.order("featured", { ascending: false }).order("name");
    }
    q = q.limit(data.limit ?? 80);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getRimBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: rim, error } = await supabaseAdmin
      .from("rims")
      .select("*, brand:rim_brands(*)")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return rim;
  });

const quoteSchema = z.object({
  rim_slug: z.string().min(1).max(120),
  rim_name: z.string().min(1).max(200),
  customer_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(25),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  vehicle: z.string().trim().max(120).optional().or(z.literal("")),
  quantity: z.number().int().min(1).max(20).optional(),
  message: z.string().trim().max(800).optional().or(z.literal("")),
});

export const requestRimQuote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => quoteSchema.parse(d))
  .handler(async ({ data }) => {
    const body = [
      `RIM QUOTE REQUEST`,
      `Rim: ${data.rim_name} (${data.rim_slug})`,
      data.quantity ? `Qty: ${data.quantity}` : null,
      data.vehicle ? `Vehicle: ${data.vehicle}` : null,
      data.message ? `\nMessage:\n${data.message}` : null,
    ].filter(Boolean).join("\n");

    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.customer_name,
      email: data.email || `${data.phone}@phone.local`,
      phone: data.phone,
      message: body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
