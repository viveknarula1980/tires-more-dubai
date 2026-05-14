import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const getBrands = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getBrandBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const { data: brand, error } = await supabaseAdmin
      .from("brands")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return brand;
  });

const filterSchema = z.object({
  brand: z.string().max(80).optional(),
  width: z.number().int().min(100).max(400).optional(),
  profile: z.number().int().min(20).max(90).optional(),
  rim: z.number().int().min(10).max(26).optional(),
  vehicle_type: z.enum(["passenger", "suv"]).optional(),
  season: z.enum(["summer", "all-season", "winter"]).optional(),
  q: z.string().max(120).optional(),
  sort: z.enum(["featured", "price_asc", "price_desc", "name"]).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export const searchTires = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => filterSchema.parse(d ?? {}))
  .handler(async ({ data }) => {
    let q = supabaseAdmin
      .from("tires")
      .select("*, brand:brands(slug,name,logo_url)");
    if (data.brand) {
      const { data: b } = await supabaseAdmin.from("brands").select("id").eq("slug", data.brand).maybeSingle();
      if (b) q = q.eq("brand_id", b.id);
      else return [];
    }
    if (data.width) q = q.eq("width", data.width);
    if (data.profile) q = q.eq("profile", data.profile);
    if (data.rim) q = q.eq("rim", data.rim);
    if (data.vehicle_type) q = q.eq("vehicle_type", data.vehicle_type);
    if (data.season) q = q.eq("season", data.season);
    if (data.q) q = q.ilike("name", `%${data.q}%`);
    switch (data.sort) {
      case "price_asc": q = q.order("price_aed", { ascending: true }); break;
      case "price_desc": q = q.order("price_aed", { ascending: false }); break;
      case "name": q = q.order("name"); break;
      default: q = q.order("featured", { ascending: false }).order("name");
    }
    q = q.limit(data.limit ?? 60);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getTireBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { data: tire, error } = await supabaseAdmin
      .from("tires")
      .select("*, brand:brands(*)")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return tire;
  });

export const getFeaturedTires = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("tires")
    .select("*, brand:brands(slug,name,logo_url)")
    .eq("featured", true)
    .limit(8);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getVehicleMakes = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("vehicles")
    .select("make")
    .order("make");
  if (error) throw new Error(error.message);
  return Array.from(new Set((data ?? []).map((v) => v.make)));
});

export const getVehicleModels = createServerFn({ method: "GET" })
  .inputValidator((d: { make: string }) => z.object({ make: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("vehicles")
      .select("model")
      .eq("make", data.make)
      .order("model");
    if (error) throw new Error(error.message);
    return Array.from(new Set((rows ?? []).map((v) => v.model)));
  });

export const lookupVehicleSize = createServerFn({ method: "GET" })
  .inputValidator((d: { make: string; model: string; year: number }) =>
    z.object({
      make: z.string().min(1).max(80),
      model: z.string().min(1).max(80),
      year: z.number().int().min(1990).max(2030),
    }).parse(d)
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("vehicles")
      .select("*")
      .eq("make", data.make)
      .eq("model", data.model)
      .lte("year_from", data.year)
      .gte("year_to", data.year)
      .limit(1);
    if (error) throw new Error(error.message);
    return rows?.[0] ?? null;
  });
