"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Heart,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Charity = {
  id: string;
  name: string;
  description: string | null;
  is_spotlight: boolean;
};

export default function AdminCharitiesPage() {
  const router = useRouter();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
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

    await loadCharities();
  }

  async function loadCharities() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("charities")
      .select(
        "id,name,description,website,location,impact_text,is_spotlight"
      )
      .order("name");

    if (error) {
      setMessage(error.message);
    } else {
      setCharities(data ?? []);
    }

    setLoading(false);
  }

  async function addCharity() {
    if (!name.trim()) {
      setMessage("Please enter a charity name.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.from("charities").insert({
      name: name.trim(),
      description: description.trim() || null,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setName("");
    setDescription("");

    await loadCharities();

    setMessage("Charity added successfully.");
    setSaving(false);
  }

  async function deleteCharity(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this charity?"
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("charities")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Charity deleted successfully.");

    await loadCharities();
  }

  async function toggleSpotlight(
    charityId: string,
    currentlySpotlight: boolean
  ) {
    setMessage("");

    const supabase = createClient();

    // If this charity is already the spotlight,
    // remove it from spotlight.
    if (currentlySpotlight) {
      const { error } = await supabase
        .from("charities")
        .update({ is_spotlight: false })
        .eq("id", charityId);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Charity removed from spotlight.");
      await loadCharities();
      return;
    }

    // Remove spotlight from all charities first.
    const { error: clearError } = await supabase
      .from("charities")
      .update({ is_spotlight: false })
      .eq("is_spotlight", true);

    if (clearError) {
      setMessage(clearError.message);
      return;
    }

    // Set the selected charity as spotlight.
    const { error: spotlightError } = await supabase
      .from("charities")
      .update({ is_spotlight: true })
      .eq("id", charityId);

    if (spotlightError) {
      setMessage(spotlightError.message);
      return;
    }

    setMessage("Charity spotlight updated successfully.");

    await loadCharities();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07130f] text-white flex items-center justify-center">
        Loading...
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
            <Heart size={18} />
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
            Charity Management
          </h1>

          <p className="text-white/50 mt-3">
            Add and manage charities available to Digital Heroes users.
          </p>
        </div>

        {/* Add Charity */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-xl bg-emerald-400/10 p-2">
              <Plus className="text-emerald-400" size={20} />
            </div>

            <h2 className="text-xl font-semibold">
              Add Charity
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm text-white/50">
                Charity name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter charity name"
                className="w-full mt-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-emerald-400/50"
              />
            </div>

            <div>
              <label className="text-sm text-white/50">
                Description
              </label>

              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                className="w-full mt-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-emerald-400/50"
              />
            </div>
          </div>

          <button
            onClick={addCharity}
            disabled={saving}
            className="mt-6 rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black hover:bg-emerald-300 disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Charity"}
          </button>

          {message && (
            <p className="mt-4 text-sm text-emerald-300">
              {message}
            </p>
          )}
        </div>

        {/* Charity List */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold">
              All Charities
            </h2>

            <span className="text-sm text-white/40">
              {charities.length} charities
            </span>
          </div>

          <div className="space-y-4">
            {charities.map((charity) => (
              <div
                key={charity.id}
                className={`flex flex-col md:flex-row md:items-center md:justify-between gap-5 rounded-2xl border p-5 ${
                  charity.is_spotlight
                    ? "border-[#c8f36a]/40 bg-[#c8f36a]/5"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">
                      {charity.name}
                    </h3>

                    {charity.is_spotlight && (
                      <span className="flex items-center gap-1 rounded-full bg-[#c8f36a]/10 px-3 py-1 text-xs text-[#c8f36a]">
                        <Star size={12} />
                        Spotlight
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-white/50 mt-1">
                    {charity.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      toggleSpotlight(
                        charity.id,
                        charity.is_spotlight
                      )
                    }
                    className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                      charity.is_spotlight
                        ? "border-[#c8f36a]/30 bg-[#c8f36a]/10 text-[#c8f36a]"
                        : "border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Star size={16} />

                    {charity.is_spotlight
                      ? "Remove Spotlight"
                      : "Set Spotlight"}
                  </button>

                  <button
                    onClick={() => deleteCharity(charity.id)}
                    className="shrink-0 rounded-xl border border-red-400/20 p-3 text-red-400 hover:bg-red-400/10"
                    title="Delete charity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            {charities.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
                No charities available.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}