import { NextResponse, type NextRequest } from "next/server";
import { createRouteSupabaseClient } from "@/lib/supabase-route";

export async function POST(request: NextRequest) {
  const { supabase } = createRouteSupabaseClient(request);
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
