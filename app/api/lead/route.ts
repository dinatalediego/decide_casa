import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRecommendations } from '@/lib/scoring';
import { upsertHubSpotContact } from '@/lib/hubspot';
import { sendEmailIfConfigured, sendWhatsAppIfConfigured } from '@/lib/notifications';
import { logEvent } from '@/lib/events';

const LeadSchema = z.object({
  company: z.string().optional().nullable(),
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  role: z.enum(['broker', 'inmobiliaria', 'otros']).default('broker'),
  district: z.string().optional().default('Jesus Maria'),
  budget_usd: z.string().optional().nullable(),
  bedrooms: z.string().optional().nullable(),
  timeline: z.enum(['0_30', '31_90', '90_plus']).optional().nullable(),
  notes: z.string().optional().nullable(),
  utm: z.record(z.string()).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = LeadSchema.parse(body);

    const sb = supabaseAdmin();

    const budgetNum = data.budget_usd ? Number(data.budget_usd) : null;
    const recommendations = generateRecommendations({
      district: data.district ?? 'Jesus Maria',
      budget_usd: Number.isFinite(budgetNum) ? budgetNum : null,
      bedrooms: data.bedrooms ?? null,
      timeline: data.timeline ?? null,
    });

    const { data: inserted, error } = await sb
      .from('leads')
      .insert({
        company: data.company ?? null,
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: data.role,
        district: data.district ?? null,
        budget_usd: Number.isFinite(budgetNum) ? budgetNum : null,
        bedrooms: data.bedrooms ?? null,
        timeline: data.timeline ?? null,
        notes: data.notes ?? null,
        utm: data.utm ?? null,
        source: 'landing',
        status: 'new',
      })
      .select('id')
      .single();

    if (error || !inserted?.id) {
      return NextResponse.json({ error: error?.message ?? 'DB insert failed' }, { status: 500 });
    }

    const lead_id = inserted.id as string;

    // store recommendations snapshot for this lead
    await sb.from('lead_recommendations').insert({
      lead_id,
      generated_at: new Date().toISOString(),
      recommendations,
      top_project_code: recommendations[0]?.project_code ?? null,
      top_score: recommendations[0]?.score ?? null,
    });

    await logEvent('lead_created', {
      lead_id,
      role: data.role,
      utm: data.utm ?? null,
    });

    // CRM (optional)
    try {
      await upsertHubSpotContact({
        email: data.email,
        firstname: data.name,
        phone: data.phone,
        company: data.company ?? null,
        role: data.role,
        lead_id,
        district: data.district ?? null,
        budget_usd: Number.isFinite(budgetNum) ? budgetNum : null,
        bedrooms: data.bedrooms ?? null,
        timeline: data.timeline ?? null,
        utm: data.utm ?? null,
      });
    } catch (e: any) {
      await logEvent('hubspot_error', { lead_id, message: e?.message ?? 'unknown' });
    }

    // notifications (optional)
    const summary = `DecideCasa • Lead #${lead_id}\n\nContacto: ${data.name} (${data.role})\nWhatsApp: ${data.phone}\nEmail: ${data.email}\n\nBrief (demo):\n- Distrito: ${data.district ?? ''}\n- Presupuesto USD: ${data.budget_usd ?? ''}\n- Dormitorios: ${data.bedrooms ?? ''}\n- Horizonte: ${data.timeline ?? ''}\n\nTop recomendación: ${recommendations[0]?.project_name ?? ''} (${recommendations[0]?.score ?? ''})\nRazones: ${(recommendations[0]?.reasons ?? []).join(' | ')}\n`;

    await Promise.allSettled([
      sendEmailIfConfigured({ toEmail: data.email, toPhone: data.phone, leadId: lead_id, summary }),
      sendWhatsAppIfConfigured({ toEmail: data.email, toPhone: data.phone, leadId: lead_id, summary }),
    ]);

    return NextResponse.json({ ok: true, lead_id });
  } catch (e: any) {
    // Make validation errors user-friendly
    if (e?.name === 'ZodError' && Array.isArray(e?.issues)) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          issues: e.issues.map((it: any) => ({ path: it.path?.join('.') ?? '', message: it.message })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: e?.message ?? 'Bad request' }, { status: 400 });
  }
}
