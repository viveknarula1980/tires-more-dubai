import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const userId = (context as { userId?: string }).userId;
    if (!userId) throw new Error("Unauthorized");
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Forbidden: admin role required");
    return next();
  });

export type PricingRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  size: string;
  shopPrice: number;
  sourcePrice: number | null;
  diff: number | null;
  discountPct: number | null;
  inStock: boolean;
};

export const getPricingComparison = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("tires")
      .select(
        "id, slug, name, width, profile, rim, price_aed, original_price_aed, in_stock, brand:brands(name, slug)"
      )
      .order("name");
    if (error) throw new Error(error.message);

    const rows: PricingRow[] = (data ?? []).map((t) => {
      const shop = Number(t.price_aed);
      const src = t.original_price_aed != null ? Number(t.original_price_aed) : null;
      const diff = src != null ? shop - src : null;
      const discountPct = src != null && src > 0 ? ((src - shop) / src) * 100 : null;
      const brand = (t.brand ?? { name: "", slug: "" }) as { name: string; slug: string };
      return {
        id: t.id,
        slug: t.slug,
        name: t.name,
        brand: brand.name,
        brandSlug: brand.slug,
        size: `${t.width}/${t.profile} R${t.rim}`,
        shopPrice: shop,
        sourcePrice: src,
        diff,
        discountPct,
        inStock: t.in_stock,
      };
    });

    return { rows };
  });
