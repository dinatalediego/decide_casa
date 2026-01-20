'use client';

import { useMemo, useState } from 'react';

type FormState = {
  company: string;
  name: string;
  phone: string;
  email: string;
  role: 'broker' | 'inmobiliaria' | 'otros';
  district: string;
  budget_usd: string;
  bedrooms: string;
  timeline: '0_30' | '31_90' | '90_plus';
  notes: string;
};

const DEFAULT_STATE: FormState = {
  company: '',
  name: '',
  phone: '',
  email: '',
  role: 'broker',
  district: 'Jesus Maria',
  budget_usd: '',
  bedrooms: '2',
  timeline: '31_90',
  notes: '',
};

function getUTMs() {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
  const utm: Record<string, string> = {};
  for (const k of keys) {
    const v = params.get(k);
    if (v) utm[k] = v;
  }
  return utm;
}

export default function LeadForm() {
  const [state, setState] = useState<FormState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState(false);

  const utms = useMemo(() => getUTMs(), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Simple client-side guardrails (avoid cryptic API errors)
    if ((state.name ?? '').trim().length < 2) {
      setLoading(false);
      setMessage('Completa tu nombre (mínimo 2 caracteres).');
      return;
    }
    if ((state.phone ?? '').trim().length < 6) {
      setLoading(false);
      setMessage('Completa tu WhatsApp (mínimo 6 caracteres).');
      return;
    }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...state, utm: utms }),
      });
      const json = await res.json();
      if (!res.ok) {
        // Prefer structured validation errors
        if (json?.error === 'VALIDATION_ERROR' && Array.isArray(json?.issues)) {
          const first = json.issues[0];
          throw new Error(first?.message ?? 'Revisa el formulario');
        }
        throw new Error(json?.error ?? 'Error');
      }
      setMessage(`Listo. Lead creado (#${json.lead_id}). Revisa tu email/CRM.`);
      setState(DEFAULT_STATE);
    } catch (err: any) {
      setMessage(err?.message ?? 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid" style={{ marginTop: 12 }}>
      <div className="small" style={{ marginBottom: 6 }}>
        <strong>Datos de contacto (obligatorio)</strong>
      </div>
      <div className="row row2">
        <div>
          <div className="label">Empresa</div>
          <input className="input" value={state.company} onChange={(e) => setState((s) => ({ ...s, company: e.target.value }))} placeholder="Ej: Cygnus / Broker independiente" />
        </div>
        <div>
          <div className="label">Rol</div>
          <select className="select" value={state.role} onChange={(e) => setState((s) => ({ ...s, role: e.target.value as FormState['role'] }))}>
            <option value="broker">Broker</option>
            <option value="inmobiliaria">Inmobiliaria</option>
            <option value="otros">Otros</option>
          </select>
        </div>
      </div>

      <div className="row row2">
        <div>
          <div className="label">Nombre</div>
          <input className="input" required value={state.name} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} placeholder="Tu nombre" />
        </div>
        <div>
          <div className="label">WhatsApp</div>
          <input className="input" required value={state.phone} onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))} placeholder="+51..." />
        </div>
      </div>

      <div>
        <div className="label">Email</div>
        <input className="input" type="email" required value={state.email} onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))} placeholder="correo@empresa.com" />
      </div>

      <hr />
      <button
        type="button"
        className="btn"
        style={{ opacity: 0.9 }}
        onClick={() => setShowBrief((v) => !v)}
      >
        {showBrief ? 'Ocultar brief (opcional)' : 'Agregar brief del comprador (opcional)'}
      </button>

      {showBrief ? (
        <div className="small">Este brief simula el lead del comprador final (ayuda a afinar recomendaciones).</div>
      ) : null}

      {showBrief ? (
        <>
          <div className="row row2">
            <div>
              <div className="label">Distrito objetivo</div>
              <input className="input" value={state.district} onChange={(e) => setState((s) => ({ ...s, district: e.target.value }))} />
            </div>
            <div>
              <div className="label">Presupuesto (USD)</div>
              <input className="input" inputMode="numeric" value={state.budget_usd} onChange={(e) => setState((s) => ({ ...s, budget_usd: e.target.value }))} placeholder="Ej: 120000" />
            </div>
          </div>

          <div className="row row2">
            <div>
              <div className="label">Dormitorios</div>
              <select className="select" value={state.bedrooms} onChange={(e) => setState((s) => ({ ...s, bedrooms: e.target.value }))}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4+">4+</option>
              </select>
            </div>
            <div>
              <div className="label">Horizonte de compra</div>
              <select className="select" value={state.timeline} onChange={(e) => setState((s) => ({ ...s, timeline: e.target.value as FormState['timeline'] }))}>
                <option value="0_30">0-30 días</option>
                <option value="31_90">31-90 días</option>
                <option value="90_plus">90+ días</option>
              </select>
            </div>
          </div>

          <div>
            <div className="label">Notas</div>
            <textarea className="textarea" rows={3} value={state.notes} onChange={(e) => setState((s) => ({ ...s, notes: e.target.value }))} placeholder="Ej: busca buena conectividad, financiar 80%, etc." />
          </div>
        </>
      ) : null}

      <button className="btn" disabled={loading} type="submit">
        {loading ? 'Enviando…' : 'Solicitar demo'}
      </button>

      {message ? <div className="small">{message}</div> : null}

      <div className="small">
        Al enviar aceptas ser contactado. Guardamos UTM para medir campañas.
      </div>
    </form>
  );
}
