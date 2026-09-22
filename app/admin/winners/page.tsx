"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Winner = {
  id: string;
  user_id: string;
  draw_id: string;
  match_type: number;
  prize_amount: number;
  payment_status: string;
  created_at: string;
};

type Proof = {
  id: string;
  winner_id: string;
  proof_url: string | null;
  verification_status: string;
  admin_notes: string | null;
};

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadWinners();
  }, []);

  async function loadWinners() {
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

    const { data: winnerData } = await supabase
      .from("winners")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: proofData } = await supabase
      .from("winner_proofs")
      .select("*")
      .order("created_at", { ascending: false });

    setWinners(winnerData ?? []);
    setProofs(proofData ?? []);
    setLoading(false);
  }

  function getProof(winnerId: string) {
    return proofs.find(
      (proof) => proof.winner_id === winnerId
    );
  }

async function addProof(winnerId: string, file: File) {
  const supabase = createClient();

  setMessage("Uploading proof...");

  const fileExt = file.name.split(".").pop();
  const fileName = `${winnerId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("winner-proofs")
    .upload(fileName, file);

  if (uploadError) {
    setMessage(uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("winner-proofs")
    .getPublicUrl(fileName);

  const proofUrl = publicUrlData.publicUrl;

  const { error } = await supabase
    .from("winner_proofs")
    .insert({
      winner_id: winnerId,
      proof_url: proofUrl,
      verification_status: "pending",
    });

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Proof uploaded successfully.");
  await loadWinners();
}
  async function updateVerification(
    proofId: string,
    status: "approved" | "rejected"
  ) {
    const supabase = createClient();

    const { error } = await supabase
      .from("winner_proofs")
      .update({
        verification_status: status,
      })
      .eq("id", proofId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      status === "approved"
        ? "Winner proof approved."
        : "Winner proof rejected."
    );

    await loadWinners();
  }

  async function markPaid(winnerId: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("winners")
      .update({
        payment_status: "paid",
      })
      .eq("id", winnerId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Winner marked as paid.");
    await loadWinners();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0b0d0c] text-white flex items-center justify-center">
        <p className="text-[#c8f36a]">
          Loading winners...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white">
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <div className="font-bold">
            DIGITAL
            <span className="text-[#c8f36a]">
              HEROES
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-[#c8f36a] text-sm tracking-widest">
          ADMIN
        </div>

        <h1 className="text-4xl font-semibold mt-2">
          Winner verification
        </h1>

        <p className="text-white/40 mt-2">
          Review winner proof and manage payouts.
        </p>

        {message && (
          <div className="mt-6 border border-[#c8f36a]/20 bg-[#c8f36a]/10 text-[#c8f36a] rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        {winners.length === 0 ? (
          <div className="mt-10 border border-white/10 rounded-2xl p-10 text-center">
            <Trophy className="mx-auto text-white/20 w-12 h-12" />

            <p className="text-white/40 mt-4">
              No winners have been calculated yet.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {winners.map((winner) => {
              const proof = getProof(winner.id);

              return (
                <div
                  key={winner.id}
                  className="border border-white/10 bg-white/[0.03] rounded-2xl p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <Trophy className="text-[#c8f36a]" />

                        <span className="text-xl font-semibold">
                          {winner.match_type}-number match
                        </span>
                      </div>

                      <p className="text-white/30 text-sm mt-2">
                        User: {winner.user_id.slice(0, 12)}...
                      </p>

                      <p className="text-[#c8f36a] text-2xl font-bold mt-3">
                        ₹{Number(winner.prize_amount).toFixed(2)}
                      </p>
                    </div>

                    <div className="text-sm">
                      <span className="text-white/40">
                        Payment:
                      </span>{" "}
                      <span
                        className={
                          winner.payment_status === "paid"
                            ? "text-[#c8f36a]"
                            : "text-yellow-400"
                        }
                      >
                        {winner.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* PROOF */}

                  <div className="border-t border-white/10 mt-6 pt-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/50">
                          Verification proof
                        </p>

                        {proof ? (
                          <div className="mt-2">
                            <span
                              className={`text-sm ${
                                proof.verification_status ===
                                "approved"
                                  ? "text-[#c8f36a]"
                                  : proof.verification_status ===
                                    "rejected"
                                  ? "text-red-400"
                                  : "text-yellow-400"
                              }`}
                            >
                              {proof.verification_status}
                            </span>

                            {proof.proof_url && (
                              <a
                                href={proof.proof_url}
                                target="_blank"
                                rel="noreferrer"
                                className="ml-4 text-white/50 hover:text-white inline-flex items-center gap-1"
                              >
                                Open proof
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-white/25 text-sm mt-2">
                            No proof uploaded.
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {!proof && (
                        <label className="border border-white/15 px-4 py-2 rounded-lg text-sm hover:bg-white/5 cursor-pointer">
                        Upload proof
                        <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                        addProof(winner.id, file);
                        }

                        e.currentTarget.value = "";
                        }}
                           />
                      </label>
                      )}
                        {proof &&
                          proof.verification_status ===
                            "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  updateVerification(
                                    proof.id,
                                    "approved"
                                  )
                                }
                                className="bg-[#c8f36a] text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Approve
                              </button>

                              <button
                                onClick={() =>
                                  updateVerification(
                                    proof.id,
                                    "rejected"
                                  )
                                }
                                className="border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}

                        {proof?.verification_status ===
                          "approved" &&
                          winner.payment_status !==
                            "paid" && (
                            <button
                              onClick={() =>
                                markPaid(winner.id)
                              }
                              className="border border-[#c8f36a]/30 text-[#c8f36a] px-4 py-2 rounded-lg text-sm"
                            >
                              Mark paid
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}