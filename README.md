# DecideCasa (Borrador) — Landing B2B + Leads + Scoring + CRM/WhatsApp/Email

Este repo es un **MVP borrador** (rápido con código + DB) para:
- Landing enfocada a **brokers/inmobiliarias**
- Captura de leads con UTM
- Persistencia en **Supabase (Postgres)**
- Generación de recomendaciones **placeholder** (reemplazable por tu pipeline)
- Push opcional a **HubSpot**, notificación opcional por **Email (Resend)** y **WhatsApp (Twilio)**
- Tracking base con **PostHog** (front) + tabla `events` (server)

## 1) Stack
- Frontend: Next.js (App Router)
- DB/Auth: Supabase (Auth + Postgres). Insert de leads via Service Role (server).
- Tracking: PostHog (optional)

## 2) Setup rápido
1. Instala deps:
   ```bash
   npm install
   ```
2. Crea tu proyecto en Supabase y ejecuta el SQL:
   - Abre Supabase > SQL Editor > ejecuta `supabase/schema.sql`.
   - Para habilitar el dashboard Admin con auth + RLS basico: ejecuta `supabase/rls.sql`.
3. Variables de entorno:
   ```bash
   cp .env.example .env.local
   ```
   Llena:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` (solo server)
4. Corre:
   ```bash
   npm run dev
   ```
   Abre `http://localhost:3000`

## 2.1) Fix rápido si ves error al enviar el primer lead
Si te aparece un error tipo `String must contain at least 2 character(s)` es porque faltan datos obligatorios (ej. **Nombre**).
En la UI, el brief del comprador ahora está detrás de un botón **“Agregar brief (opcional)”** para que primero completes contacto.

## 2.2) Paso a paso para producción (Vercel + Supabase)
1. **Supabase (prod)**
   - Crea un proyecto (prod) separado del de dev.
   - Ejecuta `supabase/schema.sql` en SQL Editor.
   - Ejecuta `supabase/rls.sql` para habilitar dashboard Admin.
   - (Recomendado) Crea un **API Key** / Service role solo para server (ya existe por defecto).

2. **Deploy en Vercel**
   - Importa el repo en Vercel.
   - Setea variables en Vercel (Project Settings → Environment Variables):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - Opcionales (si activas integraciones):
       - `HUBSPOT_PRIVATE_APP_TOKEN`
       - `RESEND_API_KEY`
       - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
       - `POSTHOG_KEY`, `POSTHOG_HOST`

3. **Dominio + HTTPS**
   - Conecta tu dominio en Vercel.
   - Habilita redirección a HTTPS (Vercel lo hace por defecto).

4. **Entregabilidad y WhatsApp**
   - Email: configura dominio (SPF/DKIM) en Resend/SendGrid antes de mandar volumen.
   - WhatsApp: usa Twilio Sandbox para pruebas; para producción, número aprobado.

5. **Observabilidad mínima**
   - Activa Sentry (opcional) o revisa logs de Vercel.
   - Revisa tabla `events` en Supabase para errores (`hubspot_error`, etc.).

6. **Seguridad / RLS**
   - El dashboard `/admin` usa Supabase Auth (email/password) + RLS basico (solo authenticated puede leer).
   - Los inserts de leads siguen pasando por Service Role en `/api/lead`.

## 3) Endpoint principal
### `POST /api/lead`
Crea lead + snapshot de recomendaciones:
- Inserta en `leads`
- Inserta en `lead_recommendations` (jsonb)
- Log en `events`
- (Opcional) upsert a HubSpot
- (Opcional) email/whatsapp

Payload ejemplo:
```json
{
  "company": "Cygnus",
  "name": "Diego",
  "phone": "+51999999999",
  "email": "diego@empresa.com",
  "role": "broker",
  "district": "Jesus Maria",
  "budget_usd": "120000",
  "bedrooms": "2",
  "timeline": "31_90",
  "notes": "Busca buena conectividad",
  "utm": {"utm_source": "meta", "utm_campaign": "b2b_test"}
}
```

## 3.1) Dashboard Admin (Auth + Top recomendación + WhatsApp)
- URL: `.../admin`
- Login: `.../admin/login`

Para crear tu primer usuario admin:
1. Supabase → **Auth** → **Users** → **Add user** (email + password)
2. Entra a `/admin/login` con esas credenciales.

En el dashboard verás:
- Leads capturados
- **Top recomendación** (último scoring por lead)
- Botón **“Abrir WhatsApp”** (wa.me) con mensaje pre-llenado
- Botón **“Enviar WhatsApp (Twilio)”** si configuraste Twilio (opcional)

## 4) Flujo Lead → Score → CRM → WhatsApp/Email
1. Usuario deja datos (LeadForm)
2. `POST /api/lead`
3. Server:
   - Genera recomendaciones (`lib/scoring.ts`)
   - Guarda lead + snapshot
   - (Opcional) HubSpot: `lib/hubspot.ts`
   - (Opcional) Resend/Twilio: `lib/notifications.ts`

## 5) Eventos sugeridos (PostHog/GA4)
### Front (PostHog)
- `landing_view`
- `lead_form_started`
- `lead_form_submitted`
- `lead_form_success`
- `lead_form_error`

Props recomendadas:
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`
- `role`, `district`, `budget_usd`, `bedrooms`, `timeline`

### Server (tabla `events`)
- `lead_created`
- `hubspot_error`

## 6) Próximos pasos (tu V1)
- Reemplazar `generateRecommendations` por tu pipeline housing real.
- Implementar multi-tenant (tabla org + membership + RLS por org).
- Implementar deduplicación en HubSpot (buscar por email antes de crear).

## 7) Dashboard Admin
- URL: `/admin`
- Si no hay sesion, redirige a `/admin/login`.
- Muestra leads + top recomendacion y dos acciones:
  - **Abrir WhatsApp** (link wa.me)
  - **Enviar WhatsApp (Twilio)** si configuras variables de entorno.

---

### Nota de seguridad
Para este borrador, se usa `SUPABASE_SERVICE_ROLE_KEY` en el server. Nunca lo expongas al cliente.
