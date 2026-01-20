"use client";

import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const supabase = createBrowserSupabaseClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
        });
        if (err) throw err;
        setMessage(
          "Cuenta creada. Si tu proyecto requiere verificación de email, revisa tu bandeja."
        );
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (err) throw err;
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError(err?.message ?? "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Admin DecideCasa</h1>
          <p className="text-sm opacity-80">
            Acceso para ver leads y recomendaciones.
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm border border-white/10 ${
              mode === "signin" ? "bg-white/10" : "bg-transparent"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-xl px-3 py-2 text-sm border border-white/10 ${
              mode === "signup" ? "bg-white/10" : "bg-transparent"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm opacity-80">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
              placeholder="tu@empresa.com"
            />
          </label>
          <label className="block">
            <span className="text-sm opacity-80">Contraseña</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
              className="mt-1 w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
              placeholder="••••••"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500/90 hover:bg-indigo-500 px-4 py-2 font-medium disabled:opacity-60"
          >
            {loading
              ? "Procesando..."
              : mode === "signup"
              ? "Crear cuenta"
              : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-xs opacity-70">
          Tip: en Supabase &gt; Auth &gt; Users puedes crear el primer usuario admin.
        </p>
      </div>
    </main>
  );
}
