import { NextResponse, type NextRequest } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-route";
import { sendWhatsAppIfConfigured } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const { supabase } = createRouteSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const leadId = String(form.get("lead_id") || "");
  if (!leadId) {
    return NextResponse.json({ error: "Missing lead_id" }, { status: 400 });
  }

  const { data: lead, error: leadErr } = await supabase
    .from("leads")
    .select("id,name,phone,email")
    .eq("id", leadId)
    .maybeSingle();

  if (leadErr || !lead) {
    return NextResponse.json(
      { error: "Lead not found" },
      { status: 404 }
    );
  }

  const { data: reco } = await supabase
    .from("lead_latest_reco")
    .select("top_project_code,top_score")
    .eq("lead_id", leadId)
    .maybeSingle();

  const summary = `Hola ${lead.name}, soy del equipo DecideCasa. Segun tu brief, tu top recomendacion es ${
    reco?.top_project_code || "(pendiente)"
  }. Te paso los detalles y opciones?`;

  await sendWhatsAppIfConfigured({
    toEmail: lead.email,
    toPhone: lead.phone,
    leadId,
    summary,
  });

  // Regresa al dashboard
  return NextResponse.redirect(new URL("/admin", request.url));
}
