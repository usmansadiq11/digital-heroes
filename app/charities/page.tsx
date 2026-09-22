"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Heart,
  ArrowLeft,
  ExternalLink,
  MapPin,
  X,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Charity = {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  impact_text: string | null;
};

export default function CharitiesPage() {
  const router = useRouter();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [viewingCharity, setViewingCharity] = useState<Charity | null>(null);

  const [contribution, setContribution] = useState(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadCharities();
    loadSelection();
  }, []);

  async function loadCharities() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("charities")
      .select(
        "id, name, description, website, location, impact_text"
      )
      .eq("active", true)
      .order("name");

    if (error) {
      console.error(
        "Charity loading error:",
        JSON.stringify(error, null, 2)
      );

      setMessage(
        `${error.message || "Unknown error"} | ${error.code || ""} | ${
          error.details || ""
        }`
      );
    }

    if (!error) {
      setCharities(data ?? []);
    }

    setLoading(false);
  }

  async function loadSelection() {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserLoggedIn(false);
      return;
    }

    setUserLoggedIn(true);

    const { data } = await supabase
      .from("charity_selections")
      .select("charity_id, contribution_percentage")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setSelectedCharity(data.charity_id);
      setContribution(data.contribution_percentage);
    }
  }

  async function saveSelection() {
    if (!selectedCharity) {
      setMessage("Please select a charity first.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase
      .from("charity_selections")
      .upsert(
        {
          user_id: user.id,
          charity_id: selectedCharity,
          contribution_percentage: contribution,
        },
        {
          onConflict: "user_id",
        }
      );

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Charity selection saved successfully.");
  }

  const filteredCharities = charities.filter((charity) => {
    const query = search.toLowerCase().trim();

    return (
      charity.name.toLowerCase().includes(query) ||
      (charity.description ?? "").toLowerCase().includes(query) ||
      (charity.location ?? "").toLowerCase().includes(query) ||
      (charity.impact_text ?? "").toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07130f] text-white flex items-center justify-center">
        <div className="text-white/50">
          Loading charities...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07130f] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() =>
              router.push(userLoggedIn ? "/dashboard" : "/")
            }
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            {userLoggedIn ? "Dashboard" : "Home"}
          </button>

          <div className="flex items-center gap-2 text-emerald-400">
            <Heart size={18} />
            <span className="font-semibold">
              Digital Heroes
            </span>
          </div>
        </div>

        {/* HERO */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-emerald-400 uppercase tracking-[0.25em] text-sm">
            <Sparkles size={15} />
            Make an impact
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold mt-3">
            Discover charities
            <br />
            <span className="text-emerald-400">
              making an impact
            </span>
          </h1>

          <p className="text-white/50 max-w-2xl mt-5 leading-7">
            Explore the causes supported by Digital Heroes.
            Members can choose a charity and direct part of
            their subscription contribution towards the cause
            they care about.
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative max-w-xl mb-10">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charities, causes or locations..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 outline-none focus:border-emerald-400/50 transition"
          />
        </div>

        {/* CHARITY GRID */}
        <div className="grid md:grid-cols-2 gap-5">
          {filteredCharities.map((charity) => {
            const selected =
              selectedCharity === charity.id;

            return (
              <div
                key={charity.id}
                className={`rounded-3xl border p-6 transition ${
                  selected
                    ? "border-emerald-400/50 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/[0.07]"
                }`}
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xl font-semibold">
                      {charity.name}
                    </p>

                    {charity.location && (
                      <div className="flex items-center gap-1.5 text-white/35 text-sm mt-2">
                        <MapPin size={14} />
                        {charity.location}
                      </div>
                    )}
                  </div>

                  {selected && (
                    <div className="h-7 w-7 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
                      <div className="h-2.5 w-2.5 rounded-full bg-black" />
                    </div>
                  )}
                </div>

                {/* DESCRIPTION */}
                <p className="text-white/50 text-sm mt-5 leading-6">
                  {charity.description ||
                    "Supporting communities and creating positive change."}
                </p>

                {/* IMPACT */}
                <div className="mt-5 rounded-2xl bg-black/20 border border-white/5 p-4">
                  <p className="text-xs uppercase tracking-widest text-emerald-400/70">
                    Impact
                  </p>

                  <p className="text-sm text-white/55 mt-2 leading-6">
                    {charity.impact_text ||
                      charity.description ||
                      "Creating positive change through community support."}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <button
                    onClick={() =>
                      setViewingCharity(charity)
                    }
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
                  >
                    View profile
                  </button>

                  {userLoggedIn && (
                    <button
                      onClick={() =>
                        setSelectedCharity(charity.id)
                      }
                      className={`flex-1 rounded-xl py-3 text-sm font-semibold transition ${
                        selected
                          ? "bg-emerald-400 text-black"
                          : "bg-white/10 text-white hover:bg-white/15"
                      }`}
                    >
                      {selected
                        ? "Selected"
                        : "Choose charity"}
                    </button>
                  )}

                  {!userLoggedIn && (
                    <button
                      onClick={() => router.push("/auth")}
                      className="flex-1 rounded-xl bg-emerald-400 text-black py-3 text-sm font-semibold hover:bg-emerald-300 transition"
                    >
                      Become a member
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY */}
        {filteredCharities.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
            No charities found.
          </div>
        )}

        {/* IMPACT MESSAGE */}
        <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-400/10 flex items-center justify-center shrink-0">
              <Heart
                className="text-emerald-400"
                size={20}
              />
            </div>

            <div>
              <p className="font-semibold">
                Every choice creates impact
              </p>

              <p className="text-sm text-white/50 mt-2 leading-6">
                Your selected charity receives the
                contribution percentage you choose. You can
                update your charity preference whenever you
                want.
              </p>
            </div>
          </div>
        </div>

        {/* MEMBER CONTRIBUTION */}
        {userLoggedIn && (
          <div className="mt-10 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-sm text-white/50">
              Your charity contribution
            </p>

            <div className="flex items-end justify-between mt-3">
              <h2 className="text-2xl font-semibold">
                {contribution}%
              </h2>

              <span className="text-sm text-white/40">
                Minimum 10%
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={contribution}
              onChange={(e) =>
                setContribution(Number(e.target.value))
              }
              className="w-full mt-6 accent-emerald-400"
            />

            <div className="flex justify-between text-xs text-white/30 mt-2">
              <span>10%</span>
              <span>100%</span>
            </div>

            <button
              onClick={saveSelection}
              disabled={saving}
              className="w-full mt-7 rounded-2xl bg-emerald-400 py-4 font-semibold text-black hover:bg-emerald-300 disabled:opacity-50 transition"
            >
              {saving
                ? "Saving..."
                : "Save Charity Choice"}
            </button>

            {message && (
              <p className="text-center text-emerald-300 text-sm mt-4">
                {message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* PROFILE MODAL */}
      {viewingCharity && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6"
          onClick={() => setViewingCharity(null)}
        >
          <div
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b1712] p-7 md:p-9 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="flex items-start justify-between gap-5">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-5">
                  <Heart
                    size={22}
                    className="text-emerald-400"
                  />
                </div>

                <h2 className="text-3xl font-semibold">
                  {viewingCharity.name}
                </h2>

                {viewingCharity.location && (
                  <div className="flex items-center gap-2 text-white/40 text-sm mt-3">
                    <MapPin size={15} />
                    {viewingCharity.location}
                  </div>
                )}
              </div>

              <button
                onClick={() => setViewingCharity(null)}
                className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <X size={19} />
              </button>
            </div>

            {/* DESCRIPTION */}
            <div className="mt-8">
              <p className="text-xs uppercase tracking-widest text-emerald-400/70">
                About this charity
              </p>

              <p className="text-white/60 leading-7 mt-3">
                {viewingCharity.description ||
                  "This charity is working to create positive change and support communities."}
              </p>
            </div>

            {/* IMPACT */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs uppercase tracking-widest text-emerald-400/70">
                Their impact
              </p>

              <p className="text-white/60 leading-7 mt-3">
                {viewingCharity.impact_text ||
                  viewingCharity.description ||
                  "Supporting meaningful causes and creating positive community impact."}
              </p>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              {viewingCharity.website && (
                <a
                  href={viewingCharity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
                >
                  Visit website
                  <ExternalLink size={15} />
                </a>
              )}

              {userLoggedIn && (
                <button
                  onClick={() => {
                    setSelectedCharity(viewingCharity.id);
                    setViewingCharity(null);
                  }}
                  className="flex-1 rounded-xl bg-emerald-400 text-black py-3.5 text-sm font-semibold hover:bg-emerald-300 transition"
                >
                  Choose this charity
                </button>
              )}

              {!userLoggedIn && (
                <button
                  onClick={() => router.push("/auth")}
                  className="flex-1 rounded-xl bg-emerald-400 text-black py-3.5 text-sm font-semibold hover:bg-emerald-300 transition"
                >
                  Become a member
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}