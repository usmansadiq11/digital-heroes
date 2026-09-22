"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Users,
  CreditCard,
  Heart,
  Trophy,
  PoundSterling,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  users: number;
  activeSubscribers: number;
  charities: number;
  draws: number;
  winners: number;
  prizeMoney: number;
};

export default function AdminReportsPage() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    users: 0,
    activeSubscribers: 0,
    charities: 0,
    draws: 0,
    winners: 0,
    prizeMoney: 0,
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    await loadStats();
  }

  async function loadStats() {
    const supabase = createClient();

    const [
      usersResult,
      subscribersResult,
      charitiesResult,
      drawsResult,
      winnersResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),

      supabase
        .from("charities")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("draws")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("winners")
        .select("prize_amount"),
    ]);

    if (usersResult.error) {
      setMessage(usersResult.error.message);
    }

    if (subscribersResult.error) {
      setMessage(subscribersResult.error.message);
    }

    if (charitiesResult.error) {
      setMessage(charitiesResult.error.message);
    }

    if (drawsResult.error) {
      setMessage(drawsResult.error.message);
    }

    if (winnersResult.error) {
      setMessage(winnersResult.error.message);
    }

    const prizeMoney =
      winnersResult.data?.reduce(
        (total, winner) =>
          total + Number(winner.prize_amount || 0),
        0
      ) ?? 0;

    setStats({
      users: usersResult.count ?? 0,
      activeSubscribers: subscribersResult.count ?? 0,
      charities: charitiesResult.count ?? 0,
      draws: drawsResult.count ?? 0,
      winners: winnersResult.data?.length ?? 0,
      prizeMoney,
    });

    setLoading(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07130f] text-white flex items-center justify-center">
        Loading reports...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07130f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-white/60 hover:text-white"
          >
            <ArrowLeft size={18} />
            Admin Dashboard
          </button>

          <div className="flex items-center gap-2 text-emerald-400">
            <BarChart3 size={18} />
            <span className="font-semibold">
              Digital Heroes Admin
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="mb-10">
          <p className="text-emerald-400 uppercase tracking-[0.25em] text-sm">
            Administration
          </p>

          <h1 className="text-4xl font-semibold mt-3">
            Reports & Analytics
          </h1>

          <p className="text-white/50 mt-3">
            Overview of Digital Heroes platform activity.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-300">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

          <StatCard
            icon={<Users size={20} />}
            label="Total Users"
            value={stats.users}
          />

          <StatCard
            icon={<CreditCard size={20} />}
            label="Active Subscribers"
            value={stats.activeSubscribers}
          />

          <StatCard
            icon={<Heart size={20} />}
            label="Charities"
            value={stats.charities}
          />

          <StatCard
            icon={<BarChart3 size={20} />}
            label="Draws"
            value={stats.draws}
          />

          <StatCard
            icon={<Trophy size={20} />}
            label="Winners"
            value={stats.winners}
          />

          <StatCard
            icon={<PoundSterling size={20} />}
            label="Prize Money Awarded"
            value={`₹${stats.prizeMoney.toFixed(2)}`}
          />

        </div>

        {/* Summary */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7">
          <h2 className="text-xl font-semibold">
            Platform Summary
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-white/50">
                Subscriber conversion
              </span>

              <span>
                {stats.users > 0
                  ? `${(
                      (stats.activeSubscribers / stats.users) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-white/50">
                Average prize per winner
              </span>

              <span>
                ₹
                {stats.winners > 0
                  ? (
                      stats.prizeMoney / stats.winners
                    ).toFixed(2)
                  : "0.00"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/50">
                Average winners per draw
              </span>

              <span>
                {stats.draws > 0
                  ? (stats.winners / stats.draws).toFixed(1)
                  : "0.0"}
              </span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="h-10 w-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
        {icon}
      </div>

      <p className="text-sm text-white/50 mt-5">
        {label}
      </p>

      <p className="text-3xl font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}