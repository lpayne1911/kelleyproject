"use server";

import { createServiceClient } from "@/lib/supabase/server";

export type DealCheckState = {
  ok: boolean;
  message: string;
} | null;

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

function num(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number(v.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * Handles the public "Deal Check" intake: creates a lead + deal, uploads the
 * dealer quote to Storage, and records the document. Runs server-side with the
 * service-role key so the public form never needs write access to the DB.
 */
export async function submitDealCheck(
  _prev: DealCheckState,
  formData: FormData,
): Promise<DealCheckState> {
  const fullName = str(formData, "full_name");
  const email = str(formData, "email");

  if (!fullName || !email) {
    return { ok: false, message: "Name and email are required." };
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return {
      ok: false,
      message:
        "We couldn't reach our system. Please email us directly and we'll jump on it.",
    };
  }

  // 1) Lead
  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .insert({
      full_name: fullName,
      email,
      phone: str(formData, "phone"),
      source: str(formData, "source") ?? "deal_check_form",
      notes: str(formData, "notes"),
    })
    .select("id")
    .single();

  if (leadErr || !lead) {
    return { ok: false, message: "Something went wrong saving your details. Please try again." };
  }

  // 2) Deal
  const { data: deal, error: dealErr } = await supabase
    .from("deals")
    .insert({
      lead_id: lead.id,
      requested_package: "deal_check",
      stage: "quoted",
      vehicle_year: num(formData, "vehicle_year"),
      vehicle_make: str(formData, "vehicle_make"),
      vehicle_model: str(formData, "vehicle_model"),
      dealer_name: str(formData, "dealer_name"),
      out_the_door_price: num(formData, "out_the_door_price"),
      monthly_payment: num(formData, "monthly_payment"),
      apr: num(formData, "apr"),
      term_months: num(formData, "term_months"),
    })
    .select("id")
    .single();

  if (dealErr || !deal) {
    return { ok: false, message: "We saved your contact info but hit a snag on the deal details. We'll follow up." };
  }

  // 3) Quote document (optional)
  const file = formData.get("quote");
  if (file instanceof File && file.size > 0) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const path = `${deal.id}/${crypto.randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from("quote-documents")
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (!uploadErr) {
      await supabase.from("quote_documents").insert({
        deal_id: deal.id,
        storage_path: path,
        file_name: file.name,
        content_type: file.type || null,
        byte_size: file.size,
      });
    }
  }

  return {
    ok: true,
    message:
      "Got it. Your quote is in our queue — we'll review it and get back to you with a red / yellow / green within one business day.",
  };
}
