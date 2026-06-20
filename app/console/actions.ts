"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// ---------- auth ----------

export async function loginToConsole(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/console");
  const next = nextRaw.startsWith("/console") ? nextRaw : "/console";

  if (!process.env.CONSOLE_PASSWORD || password !== process.env.CONSOLE_PASSWORD) {
    redirect(`/console/login?error=1&next=${encodeURIComponent(next)}`);
  }

  cookies().set("da_console", process.env.CONSOLE_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });

  redirect(next);
}

export async function logoutFromConsole() {
  cookies().delete("da_console");
  redirect("/console/login");
}

// ---------- review editing ----------

async function ensureReview(
  supabase: SupabaseClient,
  dealId: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("deal_id", dealId)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("reviews")
    .insert({ deal_id: dealId })
    .select("id")
    .single();

  if (error || !created) throw new Error("Could not create review");
  return created.id as string;
}

function numOrNull(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").replace(/[$,]/g, "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function addFinding(formData: FormData) {
  const dealId = String(formData.get("deal_id") ?? "");
  const category = String(formData.get("category") ?? "other");
  const severity = String(formData.get("severity") ?? "yellow");
  const label = String(formData.get("label") ?? "").trim();
  if (!dealId || !label) return;

  const supabase = createServiceClient();
  const reviewId = await ensureReview(supabase, dealId);

  await supabase.from("findings").insert({
    review_id: reviewId,
    category,
    severity,
    label,
    detail: String(formData.get("detail") ?? "").trim() || null,
    estimated_cost: numOrNull(formData, "estimated_cost"),
  });

  await supabase.from("deals").update({ stage: "in_review" }).eq("id", dealId);
  revalidatePath(`/console/deals/${dealId}`);
}

export async function deleteFinding(formData: FormData) {
  const dealId = String(formData.get("deal_id") ?? "");
  const findingId = String(formData.get("finding_id") ?? "");
  if (!findingId) return;

  const supabase = createServiceClient();
  await supabase.from("findings").delete().eq("id", findingId);
  revalidatePath(`/console/deals/${dealId}`);
}

export async function publishReview(formData: FormData) {
  const dealId = String(formData.get("deal_id") ?? "");
  const verdict = String(formData.get("verdict") ?? "");
  if (!dealId || !verdict) return;

  const supabase = createServiceClient();
  const reviewId = await ensureReview(supabase, dealId);

  await supabase
    .from("reviews")
    .update({
      verdict,
      summary: String(formData.get("summary") ?? "").trim() || null,
      reviewer: String(formData.get("reviewer") ?? "").trim() || null,
      published_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  await supabase.from("deals").update({ stage: "delivered" }).eq("id", dealId);
  revalidatePath(`/console/deals/${dealId}`);
  revalidatePath("/console");
}
