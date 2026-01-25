import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const distrito = searchParams.get("distrito") ?? "jesus-maria";
  const budget = searchParams.get("budget") ?? "<=120k";
  const dorms = searchParams.get("dorms") ?? "2";

  const segmentKey = `${distrito}|${budget}|${dorms}d`;

  // 1) último snapshot disponible
  const latest = await supabase
    .from("reco_cache")
    .select("as_of_date")
    .order("as_of_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest.error || !latest.data) {
    return NextResponse.json({ error: "No hay cache aún" }, { status: 500 });
  }

  const asOf = latest.data.as_of_date;

  // 2) payload cacheado
  const { data, error } = await supabase
    .from("reco_cache")
    .select("payload, as_of_date, segment_key")
    .eq("as_of_date", asOf)
    .eq("segment_key", segmentKey)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    as_of_date: asOf,
    segment_key: segmentKey,
    items: data?.payload ?? [],
  });
}
