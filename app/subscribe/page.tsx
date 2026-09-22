"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Plan = "monthly" | "yearly";

export default function SubscribePage() {
  const router = useRouter();

  const [plan, setPlan] = useState<Plan>("monthly");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);

  const monthlyPrice = 10;
  const yearlyPrice = 100;

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
      }
    }

    checkUser();
  }, [router]);

  const price = plan === "monthly" ? monthlyPrice : yearlyPrice;

  function openCheckout() {
    setMessage("");
    setShowCheckout(true);
  }

  async function completeDemoPayment() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const renewalDate = new Date();

    if (plan === "monthly") {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    }

    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan,
          status: "active",
          renewal_date: renewalDate
            .toISOString()
            .split("T")[0],
        },
        {
          onConflict: "user_id",
        }
      );

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setShowCheckout(false);

    setMessage(
      `Payment successful. Your ${plan} subscription is now active.`
    );

    setTimeout(() => {
      router.push("/dashboard");
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-[#07130f] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-10 transition"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center">
              <Sparkles
                size={23}
                className="text-emerald-400"
              />
            </div>
          </div>

          <p className="text-emerald-400 uppercase tracking-[0.3em] text-sm mb-3">
            Digital Heroes
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold">
            Choose your subscription
          </h1>

          <p className="text-white/50 mt-4 max-w-xl mx-auto leading-7">
            Play your game, support a cause and participate
            in monthly draws.
          </p>
        </div>

        {/* PLANS */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* MONTHLY */}
          <button
            onClick={() => setPlan("monthly")}
            className={`text-left rounded-3xl border p-7 transition ${
              plan === "monthly"
                ? "border-emerald-400 bg-emerald-400/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-white/50 text-sm tracking-wider">
                MONTHLY
              </p>

              {plan === "monthly" && (
                <div className="h-6 w-6 rounded-full bg-emerald-400 flex items-center justify-center">
                  <Check
                    size={14}
                    className="text-black"
                  />
                </div>
              )}
            </div>

            <div className="flex items-end gap-2 mt-3">
              <span className="text-4xl font-semibold">
                ₹10
              </span>

              <span className="text-white/40 mb-1">
                / month
              </span>
            </div>

            <p className="text-white/50 mt-5">
              Flexible monthly participation.
            </p>
          </button>

          {/* YEARLY */}
          <button
            onClick={() => setPlan("yearly")}
            className={`text-left rounded-3xl border p-7 transition ${
              plan === "yearly"
                ? "border-emerald-400 bg-emerald-400/10"
                : "border-white/10 bg-white/5 hover:bg-white/10"
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-white/50 text-sm tracking-wider">
                YEARLY
              </p>

              {plan === "yearly" && (
                <div className="h-6 w-6 rounded-full bg-emerald-400 flex items-center justify-center">
                  <Check
                    size={14}
                    className="text-black"
                  />
                </div>
              )}
            </div>

            <div className="flex items-end gap-2 mt-3">
              <span className="text-4xl font-semibold">
                ₹100
              </span>

              <span className="text-white/40 mb-1">
                / year
              </span>
            </div>

            <p className="text-white/50 mt-5">
              One subscription for the entire year.
            </p>
          </button>
        </div>

        {/* CHECKOUT BUTTON */}
        <div className="max-w-3xl mx-auto mt-8">
          <button
            onClick={openCheckout}
            className="w-full rounded-2xl bg-emerald-400 text-black py-4 font-semibold hover:bg-emerald-300 transition flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />

            Continue with{" "}
            {plan === "monthly" ? "Monthly" : "Yearly"}
          </button>

          {message && (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-center text-emerald-300">
              {message}
            </div>
          )}
        </div>

        {/* FEATURES */}
        <div className="max-w-3xl mx-auto mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            "Monthly draws",
            "Track scores",
            "Support charity",
            "Prize eligibility",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/70"
            >
              {item}
            </div>
          ))}
        </div>

        {/* TRUST */}
        <div className="max-w-3xl mx-auto mt-8 flex items-center justify-center gap-2 text-xs text-white/30">
          <ShieldCheck size={15} />
          Secure subscription experience
        </div>
      </div>

      {/* DEMO CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0b1712] p-7 shadow-2xl">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400">
                  Checkout
                </p>

                <h2 className="text-2xl font-semibold mt-2">
                  {plan === "monthly"
                    ? "Monthly Hero"
                    : "Yearly Hero"}
                </h2>
              </div>

              <button
                onClick={() => setShowCheckout(false)}
                className="text-white/40 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* ORDER */}
            <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex justify-between">
                <span className="text-white/50">
                  {plan === "monthly"
                    ? "Monthly subscription"
                    : "Yearly subscription"}
                </span>

                <span className="font-semibold">
                  ₹{price}
                </span>
              </div>

              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
                <span className="text-white/50">
                  Total
                </span>

                <span className="text-xl font-semibold text-emerald-400">
                  ₹{price}
                </span>
              </div>
            </div>

            {/* DEMO NOTICE */}
            <div className="mt-5 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-4">
              <p className="text-sm text-yellow-200/80 leading-6">
                Demo checkout for the assignment.
                Production payment processing can be
                connected to Stripe or another payment
                provider.
              </p>
            </div>

            {/* COMPLETE */}
            <button
              onClick={completeDemoPayment}
              disabled={loading}
              className="w-full mt-6 rounded-2xl bg-emerald-400 text-black py-4 font-semibold hover:bg-emerald-300 disabled:opacity-50 transition"
            >
              {loading
                ? "Processing..."
                : `Complete Demo Payment • ₹${price}`}
            </button>

            <button
              onClick={() => setShowCheckout(false)}
              disabled={loading}
              className="w-full mt-3 rounded-2xl border border-white/10 bg-white/5 py-3 text-white/60 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}