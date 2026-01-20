import axios from 'axios';

export type HubSpotLeadPayload = {
  email: string;
  firstname: string;
  phone: string;
  company?: string | null;
  role?: string | null;
  lead_id: string;
  district?: string | null;
  budget_usd?: number | null;
  bedrooms?: string | null;
  timeline?: string | null;
  utm?: Record<string, string> | null;
};

const HUBSPOT_BASE = 'https://api.hubapi.com';

export async function upsertHubSpotContact(payload: HubSpotLeadPayload): Promise<void> {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) return; // optional

  // HubSpot v3 CRM contacts: create or update by email
  await axios.post(
    `${HUBSPOT_BASE}/crm/v3/objects/contacts`,
    {
      properties: {
        email: payload.email,
        firstname: payload.firstname,
        phone: payload.phone,
        company: payload.company ?? '',
        decidecasa_role: payload.role ?? '',
        decidecasa_lead_id: payload.lead_id,
        decidecasa_district: payload.district ?? '',
        decidecasa_budget_usd: payload.budget_usd ?? '',
        decidecasa_bedrooms: payload.bedrooms ?? '',
        decidecasa_timeline: payload.timeline ?? '',
        decidecasa_utm_source: payload.utm?.utm_source ?? '',
        decidecasa_utm_medium: payload.utm?.utm_medium ?? '',
        decidecasa_utm_campaign: payload.utm?.utm_campaign ?? '',
        decidecasa_utm_content: payload.utm?.utm_content ?? '',
        decidecasa_utm_term: payload.utm?.utm_term ?? '',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}
