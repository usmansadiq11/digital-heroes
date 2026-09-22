"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, IndianRupee } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Donation = {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  charity: {
    name: string;
  } | null;
};

export default function AdminDonationsPage() {
  const router = useRouter();

  const [donations, setDonations] = useState<Donation[]>([]);
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

    await loadDonations();
  }

  async function loadDonations() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("donations")
      .select(`
        id,
        amount,
        status,
        created_at,
        charity:charities (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const formatted = (data ?? []).map((donation: any) => ({
      ...donation,
      charity: Array.isArray(donation.charity)
        ? donation.charity[0] ?? null
        : donation.charity ?? null,
    }));

    setDonations(formatted);
    setLoading(false);
  }

  const total = donations.reduce(
    (sum, donation) => sum + Number(donation.amount),
    0
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07130f] text-white flex items-center justify-center">
        Loading donations...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07130f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-white/60 hover:text-white"
          >
            <ArrowLeft size={18} />
            Admin Dashboard
          </button>

          <div className="flex items-center gap-2 text-emerald-400">
            <Heart size={18} />
            <span className="font-semibold">
              Digital Heroes Admin
            </span>
          </div>
        </div>

        <div className="mb-10">
          <p className="text-emerald-400 uppercase tracking-[0.25em] text-sm">
            Administration
          </p>

          <h1 className="text-4xl font-semibold mt-3">
            Donation Management
          </h1>

          <p className="text-white/50 mt-3">
            View independent charity donations recorded on the platform.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-red-300">
            {message}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5 mb-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/50 text-sm">
              Total donations
            </p>

            <p className="text-3xl font-semibold mt-2">
              {donations.length}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-white/50 text-sm">
              Total recorded amount
            </p>

            <div className="flex items-center gap-1 mt-2">
              <IndianRupee size={24} />
              <p className="text-3xl font-semibold">
                {total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold">
              Donation History
            </h2>
          </div>

          <div className="divide-y divide-white/10">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="font-semibold">
                    {donation.charity?.name || "Unknown Charity"}
                  </p>

                  <p className="text-sm text-white/40 mt-1">
                    {new Date(
                      donation.created_at
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-5">
                  <span className="text-lg font-semibold">
                    ₹{Number(donation.amount).toFixed(2)}
                  </span>

                  <span className="rounded-full bg-emerald-400/10 text-emerald-300 px-3 py-1 text-xs">
                    {donation.status}
                  </span>
                </div>
              </div>
            ))}

            {donations.length === 0 && (
              <div className="p-10 text-center text-white/50">
                No donations recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}