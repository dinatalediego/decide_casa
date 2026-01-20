import { supabaseAdmin } from './supabase';

export async function logEvent(name: string, props: Record<string, any>) {
  try {
    const sb = supabaseAdmin();
    await sb.from('events').insert({
      name,
      props,
      ts_utc: new Date().toISOString(),
    });
  } catch {
    // non-blocking
  }
}
