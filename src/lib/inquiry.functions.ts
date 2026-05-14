import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const itemSchema = z.object({
  tire_id: z.string().uuid(),
  slug: z.string().max(120),
  name: z.string().max(200),
  price_aed: z.number().min(0).max(100000),
  quantity: z.number().int().min(1).max(20),
});

const inquirySchema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(25),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  area: z.string().trim().max(120).optional().or(z.literal("")),
  vehicle_make: z.string().trim().max(60).optional().or(z.literal("")),
  vehicle_model: z.string().trim().max(60).optional().or(z.literal("")),
  preferred_time: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(800).optional().or(z.literal("")),
  items: z.array(itemSchema).min(1).max(20),
});

export const submitInquiry = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inquirySchema.parse(d))
  .handler(async ({ data }) => {
    const total = data.items.reduce((s, i) => s + i.price_aed * i.quantity, 0);
    const { data: row, error } = await supabaseAdmin
      .from("inquiries")
      .insert({
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email || null,
        area: data.area || null,
        vehicle_make: data.vehicle_make || null,
        vehicle_model: data.vehicle_model || null,
        preferred_time: data.preferred_time || null,
        notes: data.notes || null,
        items: data.items,
        total_aed: total,
      })
      .select("reference, total_aed")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(25).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
