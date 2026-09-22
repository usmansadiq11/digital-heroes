"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Heart, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function redirectByRole() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Login succeeded, but user information could not be loaded.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (profile?.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your name.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        window.location.href = "/dashboard";
        return;
      }

      setMessage(
        "Account created. Check your email to confirm your account, then log in."
      );

      setLoading(false);
      return;
    }

    // LOGIN
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      await redirectByRole();
      return;
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-[-200px] right-[-150px] w-[500px] h-[500px] bg-[#c8f36a]/10 blur-[130px] rounded-full" />

      <div className="absolute bottom-[-250px] left-[-150px] w-[500px] h-[500px] bg-emerald-500/10 blur-[130px] rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        {/* LOGO */}
        <Link href="/" className="flex justify-center mb-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#c8f36a] flex items-center justify-center">
              <Heart className="w-5 h-5 text-black fill-black" />
            </div>

            <div>
              <div className="font-bold tracking-tight text-xl">
                DIGITAL<span className="text-[#c8f36a]">HEROES</span>
              </div>

              <div className="text-[9px] text-white/40 tracking-[0.25em]">
                PLAY • GIVE • WIN
              </div>
            </div>
          </div>
        </Link>

        {/* CARD */}
        <div className="border border-white/10 bg-white/[0.035] backdrop-blur-xl rounded-3xl p-8">
          <div className="text-center">
            <h1 className="text-3xl font-semibold">
              {mode === "login" ? "Welcome back." : "Become a Hero."}
            </h1>

            <p className="text-white/40 mt-2">
              {mode === "login"
                ? "Sign in to continue your journey."
                : "Join the community and make an impact."}
            </p>
          </div>

          {/* TABS */}
          <div className="grid grid-cols-2 bg-white/[0.04] rounded-xl p-1 mt-8">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
              className={`py-2.5 rounded-lg text-sm font-medium transition ${
                mode === "login"
                  ? "bg-[#c8f36a] text-black"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setMessage("");
              }}
              className={`py-2.5 rounded-lg text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-[#c8f36a] text-black"
                  : "text-white/40 hover:text-white"
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {mode === "signup" && (
              <div>
                <label className="text-sm text-white/60">
                  Full name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2 w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-[#c8f36a]/60 transition"
                />
              </div>
            )}

            <div>
              <label className="text-sm text-white/60">
                Email
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-[#c8f36a]/60 transition"
              />
            </div>

            <div>
              <label className="text-sm text-white/60">
                Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="mt-2 w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-[#c8f36a]/60 transition"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-xl border border-[#c8f36a]/20 bg-[#c8f36a]/10 px-4 py-3 text-sm text-[#c8f36a]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c8f36a] text-black rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-[#d8ff87] transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/25 mt-6">
          By continuing, you agree to the Digital Heroes terms.
        </p>
      </div>
    </main>
  );
}