import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function waLink(phoneRaw: string, text: string) {
  // wa.me expects digits only, including country code
  const phone = (phoneRaw || "").replace(/[^0-9]/g, "");
  const encoded = encodeURIComponent(text);
  if (!phone) return "#";
  return `https://wa.me/${phone}?text=${encoded}`;
}

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data, error } = await supabase
    .from("lead_latest_reco")
    .select(
      "lead_id,created_at,status,company,role,name,phone,email,district,budget_usd,bedrooms,timeline,top_project_code,top_score"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Leads (Admin)</h1>
            <p className="text-sm opacity-80">
              Leads capturados + top recomendacion (ultimo scoring).
            </p>
          </div>
          <form action="/api/logout" method="post">
            <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Cerrar sesion
            </button>
          </form>
        </header>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
            No se pudo cargar leads: {error.message}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="p-3">Fecha</th>
                <th className="p-3">Broker</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">Brief</th>
                <th className="p-3">Top recomendacion</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => {
                const msg = `Hola ${r.name}, soy del equipo DecideCasa. Segun tu brief, tu top recomendacion es ${
                  r.top_project_code || "(pendiente)"
                }. Te paso los detalles y opciones?`;
                const link = waLink(r.phone, msg);
                return (
                  <tr key={r.lead_id} className="border-t border-white/10">
                    <td className="p-3 opacity-80">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {r.company || "-"}
                      </div>
                      <div className="opacity-70">{r.role || ""}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="opacity-70">{r.email}</div>
                      <div className="opacity-70">{r.phone}</div>
                    </td>
                    <td className="p-3 opacity-80">
                      <div>Distrito: {r.district || "-"}</div>
                      <div>Presupuesto: {r.budget_usd ?? "-"}</div>
                      <div>Dorm: {r.bedrooms || "-"}</div>
                      <div>Horizonte: {r.timeline || "-"}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">
                        {r.top_project_code || "(sin scoring)"}
                      </div>
                      <div className="opacity-70">
                        Score: {r.top_score ?? "-"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 hover:bg-emerald-500/30"
                        >
                          Abrir WhatsApp
                        </a>
                        <form
                          action="/api/whatsapp"
                          method="post"
                          className="inline"
                        >
                          <input type="hidden" name="lead_id" value={r.lead_id} />
                          <button className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 hover:bg-white/10">
                            Enviar WhatsApp (Twilio)
                          </button>
                        </form>
                      </div>
                      <div className="mt-2 text-xs opacity-60">
                        Twilio requiere variables de entorno.
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
