"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Trophy,
  Heart,
  BarChart3,
  Shuffle,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [users, setUsers] = useState(0);
  const [charities, setCharities] = useState(0);
  const [draws, setDraws] = useState(0);
  const [winners, setWinners] = useState(0);

  useEffect(() => {
    loadAdmin();
  }, []);

  async function loadAdmin() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      window.location.href = "/dashboard";
      return;
    }

    setAuthorized(true);

    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: charityCount } = await supabase
      .from("charities")
      .select("*", { count: "exact", head: true });

    const { count: drawCount } = await supabase
      .from("draws")
      .select("*", { count: "exact", head: true });

    const { count: winnerCount } = await supabase
      .from("winners")
      .select("*", { count: "exact", head: true });

    setUsers(userCount ?? 0);
    setCharities(charityCount ?? 0);
    setDraws(drawCount ?? 0);
    setWinners(winnerCount ?? 0);

    setLoading(false);
  }

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    window.location.href = "/";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0d0c] text-white flex items-center justify-center">
        <div className="text-[#c8f36a]">
          Loading admin panel...
        </div>
      </main>
    );
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#c8f36a] flex items-center justify-center">
              <Shield className="w-5 h-5 text-black" />
            </div>

            <div>
              <div className="font-bold">
                DIGITAL<span className="text-[#c8f36a]">HEROES</span>
              </div>

              <div className="text-[9px] text-white/30 tracking-widest">
                ADMIN CONTROL
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-[#c8f36a] text-sm tracking-widest">
          ADMIN PANEL
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold mt-2">
          Full control.
        </h1>

        <p className="text-white/40 mt-2">
          Manage the Digital Heroes platform.
        </p>

        {/* STATS */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          <Stat
            icon={<Users />}
            label="Total users"
            value={users}
          />

          <Stat
            icon={<Heart />}
            label="Charities"
            value={charities}
          />

          <Stat
            icon={<Shuffle />}
            label="Draws"
            value={draws}
          />

          <Stat
            icon={<Trophy />}
            label="Winners"
            value={winners}
          />
        </div>

        {/* CONTROL SURFACES */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
          <AdminCard
            icon={<Users />}
            title="User management"
            description="View users, profiles, scores and subscriptions."
            href="/admin/users"
          />

          <AdminCard
            icon={<Shuffle />}
            title="Draw management"
            description="Simulate, configure and publish monthly draws."
            href="/admin/draw"
          />

          <AdminCard
            icon={<Heart />}
            title="Charity management"
            description="Add, edit and manage charity listings."
            href="/admin/charities"
          />

          <AdminCard
            icon={<Trophy />}
            title="Winner management"
            description="Verify winners and manage payout status."
            href="/admin/winners"
          />

          <AdminCard
            icon={<Heart />}
            title="Donation management"
            description="View independent charity donations and recorded contribution amounts."
            href="/admin/donations"
          />

          <AdminCard
  icon={<BarChart3 />}
  title="Reports & analytics"
  description="View platform statistics and prize information."
  href="/admin/reports"
/>
        </div>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-6">
      <div className="text-[#c8f36a]">{icon}</div>

      <p className="text-white/40 text-sm mt-5">
        {label}
      </p>

      <p className="text-3xl font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}

function AdminCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group border border-white/10 bg-white/[0.03] rounded-2xl p-7 hover:border-[#c8f36a]/30 hover:bg-white/[0.05] transition"
    >
      <div className="h-11 w-11 rounded-xl bg-[#c8f36a]/10 text-[#c8f36a] flex items-center justify-center">
        {icon}
      </div>

      <h2 className="text-xl font-semibold mt-7">
        {title}
      </h2>

      <p className="text-white/40 mt-2 leading-relaxed">
        {description}
      </p>

      <div className="text-[#c8f36a] text-sm flex items-center gap-2 mt-6">
        Open
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </div>
    </a>
  );
}