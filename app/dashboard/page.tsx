"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  LogOut,
  Trophy,
  Target,
  Gift,
  Plus,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Winner = {
  id: string;
  prize_amount: number;
  payment_status: string;
  draw_id: string;
};
type Subscription = {
  plan: string;
  status: string;
  renewal_date: string;
};
type Score = {
  id: string;
  score: number;
  score_date: string;
};

type Charity = {
  id: string;
  name: string;
  description: string | null;
};

export default function Dashboard() {
  const router = useRouter();
  
  const [winnings, setWinnings] = useState<Winner[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [drawsEntered, setDrawsEntered] = useState(0);
  const [email, setEmail] = useState("");
  const [scores, setScores] = useState<Score[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [contribution, setContribution] = useState(10);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationCharity, setDonationCharity] = useState("");
  const [donating, setDonating] = useState(false);
  const [score, setScore] = useState("");
  const [scoreDate, setScoreDate] = useState("");
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingScore, setSavingScore] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDashboard() {

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/auth";
    return;
  }

  setEmail(user.email ?? "");

const { data: subscriptionData, error: subscriptionError } =
  await supabase
    .from("subscriptions")
    .select("plan, status, renewal_date")
    .eq("user_id", user.id)
    .maybeSingle();

if (subscriptionError) {
  console.error("Subscription loading error:", subscriptionError);
}

let finalSubscription = subscriptionData;

if (
  subscriptionData &&
  subscriptionData.status === "active" &&
  subscriptionData.renewal_date
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewalDate = new Date(subscriptionData.renewal_date);
  renewalDate.setHours(0, 0, 0, 0);

  if (renewalDate < today) {
    const { error: lapseError } = await supabase
      .from("subscriptions")
      .update({
        status: "lapsed",
      })
      .eq("user_id", user.id);

    if (!lapseError) {
      finalSubscription = {
        ...subscriptionData,
        status: "lapsed",
      };
    }
  }
}

setSubscription(finalSubscription);

  const { data: scoreData, error: scoreError } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", user.id)
    .order("score_date", { ascending: false });

  if (!scoreError) {
    setScores(scoreData ?? []);
  }

  const { count: drawCount } = await supabase
    .from("draw_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  setDrawsEntered(drawCount ?? 0);

  const { data: charityData, error: charityError } = await supabase
    .from("charities")
    .select("id, name, description")
    .eq("active", true)
    .order("name");

  if (!charityError) {
    setCharities(charityData ?? []);
  }

  const { data: winnerData } = await supabase
    .from("winners")
    .select("id, prize_amount, payment_status, draw_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  setWinnings(winnerData ?? []);

  const { data: selection } = await supabase
    .from("charity_selections")
    .select("charity_id, contribution_percentage")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selection) {
    setSelectedCharity(selection.charity_id);
    setContribution(selection.contribution_percentage);
  }

  setLoading(false);
}
  useEffect(() => {
    loadDashboard();
  }, []);

  async function addScore() {
    setError("");
    setMessage("");

    const scoreNumber = Number(score);

    if (!scoreDate) {
      setError("Please select a score date.");
      return;
    }

    if (
      !Number.isInteger(scoreNumber) ||
      scoreNumber < 1 ||
      scoreNumber > 45
    ) {
      setError("Score must be between 1 and 45.");
      return;
    }

    setSavingScore(true);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    // Prevent duplicate score for same date
    const { data: existing } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .eq("score_date", scoreDate)
      .maybeSingle();

    if (existing) {
      setError(
        "A score already exists for this date. Please choose another date."
      );
      setSavingScore(false);
      return;
    }

    // Keep maximum 5 scores.
    // Delete the oldest before adding the new one.
    if (scores.length >= 5) {
      const oldest = [...scores].sort(
        (a, b) =>
          new Date(a.score_date).getTime() -
          new Date(b.score_date).getTime()
      )[0];

      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .eq("id", oldest.id);

      if (deleteError) {
        setError(deleteError.message);
        setSavingScore(false);
        return;
      }
    }

    const { error: insertError } = await supabase.from("scores").insert({
      user_id: user.id,
      score: scoreNumber,
      score_date: scoreDate,
    });

    if (insertError) {
      setError(insertError.message);
      setSavingScore(false);
      return;
    }

    setScore("");
    setScoreDate("");
    setMessage("Score added successfully.");

    await loadDashboard();

    setSavingScore(false);
  }

  async function deleteScore(id: string) {
    const supabase = createClient();

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Score deleted.");
    await loadDashboard();
  }
  async function updateScore() {
  setError("");
  setMessage("");

  const scoreNumber = Number(score);

  if (!editingScoreId) return;

  if (!scoreDate) {
    setError("Please select a score date.");
    return;
  }

  if (
    !Number.isInteger(scoreNumber) ||
    scoreNumber < 1 ||
    scoreNumber > 45
  ) {
    setError("Score must be between 1 and 45.");
    return;
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/auth";
    return;
  }

  const { data: existing } = await supabase
    .from("scores")
    .select("id")
    .eq("user_id", user.id)
    .eq("score_date", scoreDate)
    .neq("id", editingScoreId)
    .maybeSingle();

  if (existing) {
    setError("A score already exists for this date.");
    return;
  }

  const { error: updateError } = await supabase
    .from("scores")
    .update({
      score: scoreNumber,
      score_date: scoreDate,
    })
    .eq("id", editingScoreId)
    .eq("user_id", user.id);

  if (updateError) {
    setError(updateError.message);
    return;
  }

  setScore("");
  setScoreDate("");
  setEditingScoreId(null);
  setMessage("Score updated successfully.");

  await loadDashboard();
}

  async function saveCharity() {
    setError("");
    setMessage("");

    if (!selectedCharity) {
      setError("Please select a charity.");
      return;
    }

    if (contribution < 10) {
      setError("Minimum charity contribution is 10%.");
      return;
    }

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { error: upsertError } = await supabase
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

    if (upsertError) {
      setError(upsertError.message);
      return;
    }

    setMessage("Charity preference saved.");
  }
  async function makeDonation() {
  setError("");
  setMessage("");

  const amount = Number(donationAmount);

  if (!donationCharity) {
    setError("Please select a charity for your donation.");
    return;
  }

  if (!amount || amount <= 0) {
    setError("Please enter a valid donation amount.");
    return;
  }

  setDonating(true);

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/auth";
    return;
  }

  const { error: donationError } = await supabase
    .from("donations")
    .insert({
      user_id: user.id,
      charity_id: donationCharity,
      amount,
      status: "completed",
    });

  setDonating(false);

  if (donationError) {
    setError(donationError.message);
    return;
  }

  setDonationAmount("");
  setMessage(
    `Demo donation of ₹${amount.toFixed(2)} recorded successfully.`
  );
}
  async function uploadWinnerProof(winnerId: string, file: File) {
  setError("");
  setMessage("Uploading proof...");

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/auth";
    return;
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${winnerId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("winner-proofs")
    .upload(fileName, file);

  if (uploadError) {
    setError(uploadError.message);
    return;
  }

  const { data: publicUrlData } = supabase.storage
    .from("winner-proofs")
    .getPublicUrl(fileName);

  const proofUrl = publicUrlData.publicUrl;

  const { error: proofError } = await supabase
    .from("winner_proofs")
    .insert({
      winner_id: winnerId,
      proof_url: proofUrl,
      verification_status: "pending",
    });

  if (proofError) {
    setError(proofError.message);
    return;
  }

  setMessage("Winner proof uploaded successfully.");
  await loadDashboard();
}
async function cancelSubscription() {
  setError("");
  setMessage("");

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/auth";
    return;
  }

  const { error: cancelError } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
    })
    .eq("user_id", user.id);

  if (cancelError) {
    setError(cancelError.message);
    return;
  }

  setMessage("Subscription cancelled successfully.");
  await loadDashboard();
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
          Loading your dashboard...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white">
      {/* NAVBAR */}

      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#c8f36a] flex items-center justify-center">
              <Heart className="w-5 h-5 text-black fill-black" />
            </div>

            <div>
              <div className="font-bold">
                DIGITAL<span className="text-[#c8f36a]">HEROES</span>
              </div>

              <div className="text-[9px] text-white/30 tracking-widest">
                MEMBER AREA
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

      {/* CONTENT */}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <p className="text-[#c8f36a] text-sm tracking-widest">
          MEMBER DASHBOARD
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold mt-2">
          Welcome back 👋
        </h1>

        <p className="text-white/40 mt-2">{email}</p>

        {/* MESSAGES */}

        {message && (
          <div className="mt-6 border border-[#c8f36a]/20 bg-[#c8f36a]/10 text-[#c8f36a] rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 border border-red-500/20 bg-red-500/10 text-red-300 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* STATS */}

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-6">
            <Target className="text-[#c8f36a]" />

            <p className="text-white/40 text-sm mt-5">
              Latest scores
            </p>

            <p className="text-3xl font-semibold mt-1">
              {scores.length} / 5
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-6">
            <Gift className="text-[#c8f36a]" />

            <p className="text-white/40 text-sm mt-5">
              Draws entered
            </p>

            <p className="text-3xl font-semibold mt-1">
              {drawsEntered}
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-6">
            <Trophy className="text-[#c8f36a]" />

            <p className="text-white/40 text-sm mt-5">
              Total winnings
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-white/50">Subscription</p>

            {subscription ? (
            <>
            <div className="flex items-center gap-2 mt-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>

              <p className="text-xl font-semibold capitalize">
                {subscription.status}
              </p>
            </div>

            <p className="text-sm text-white/50 mt-2 capitalize">
            {subscription.plan} plan
            </p>

            <p className="text-sm text-white/50 mt-1">
                Renews on{" "}
                {new Date(subscription.renewal_date).toLocaleDateString()}
            </p>
            {subscription.status === "active" && (
  <button
    onClick={cancelSubscription}
    className="mt-4 text-sm text-red-400 border border-red-500/20 rounded-lg px-4 py-2 hover:bg-red-500/10"
  >
    Cancel subscription
  </button>
)}

{subscription.status === "lapsed" && (
  <button
    onClick={() => router.push("/subscribe")}
    className="mt-4 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
  >
    Renew subscription
  </button>
)}


            </>
            ) : (
            <>
            <p className="text-xl font-semibold mt-2">
            Not subscribed
            </p>

            <button
            onClick={() => router.push("/subscribe")}
            className="mt-4 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
            >
             Subscribe
            </button>
            </>
            )}
        </div>
            <p className="text-3xl font-semibold mt-1">
                ₹
                {winnings
                .reduce(
                    (total, winner) =>
                    total + Number(winner.prize_amount),
                    0
                    )
                .toFixed(2)}
            </p>
          </div>
        </div>
        {/* WINNINGS & PROOF */}

{winnings.length > 0 && (
  <div className="mt-5 border border-white/10 bg-white/[0.03] rounded-2xl p-7">
    <div className="flex items-center gap-3">
      <Trophy className="text-[#c8f36a]" />

      <div>
        <h2 className="text-xl font-semibold">
          Your winnings
        </h2>

        <p className="text-white/40 text-sm mt-1">
          Upload proof for any winning draw.
        </p>
      </div>
    </div>

    <div className="mt-6 space-y-3">
      {winnings.map((winner) => (
        <div
          key={winner.id}
          className="border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <p className="font-semibold">
              Prize: ₹{Number(winner.prize_amount).toFixed(2)}
            </p>

            <p className="text-sm text-white/40 mt-1 capitalize">
              Payment: {winner.payment_status}
            </p>
          </div>

          {winner.payment_status === "pending" && (
            <label className="cursor-pointer border border-[#c8f36a]/40 text-[#c8f36a] px-5 py-3 rounded-xl font-semibold hover:bg-[#c8f36a]/10 text-center">
              Upload proof

              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    uploadWinnerProof(winner.id, file);
                  }

                  e.currentTarget.value = "";
                }}
              />
            </label>
          )}
        </div>
      ))}
    </div>
  </div>
)}

        {/* MAIN PANELS */}

        <div className="grid lg:grid-cols-2 gap-5 mt-5">
          {/* SCORES */}

          <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-7">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Your golf scores
                </h2>

                <p className="text-white/40 mt-1 text-sm">
                  Latest five Stableford scores
                </p>
              </div>

              <Target className="text-[#c8f36a]" />
            </div>

            {/* INPUTS */}

            <div className="grid grid-cols-2 gap-3 mt-6">
              <input
                type="number"
                min="1"
                max="45"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Score 1–45"
                className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#c8f36a]/50"
              />

              <input
                type="date"
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
                className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#c8f36a]/50"
              />
            </div>

            <button
              onClick={editingScoreId ? updateScore : addScore}
              disabled={savingScore}
              className="mt-4 bg-[#c8f36a] text-black px-5 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />

          {editingScoreId
            ? "Update score"
            : savingScore
              ? "Adding..."
              : "Add score"}
            </button>

            {/* SCORE LIST */}

            <div className="mt-7 space-y-2">
              {scores.length === 0 && (
                <p className="text-white/30 text-sm">
                  No scores added yet.
                </p>
              )}

              {scores.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border border-white/10 rounded-xl px-4 py-3"
                >
                  <div>
                    <span className="text-xl font-semibold">
                      {item.score}
                    </span>

                    <span className="text-white/30 text-sm ml-3">
                      {item.score_date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
  <button
    onClick={() => {
      setEditingScoreId(item.id);
      setScore(String(item.score));
      setScoreDate(item.score_date);
      setError("");
      setMessage("");
    }}
    className="text-white/40 hover:text-[#c8f36a] text-sm"
  >
    Edit
  </button>

  <button
    onClick={() => deleteScore(item.id)}
    className="text-white/30 hover:text-red-400"
  >
    <Trash2 className="w-4 h-4" />
  </button>
</div>
                </div>
              ))}
            </div>
          </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
  <p className="text-sm text-white/50">Monthly Draw</p>

  <h3 className="text-xl font-semibold mt-2">
    Enter this month's draw
  </h3>

  <p className="text-sm text-white/50 mt-2">
    Your latest 5 Stableford scores will be used for the draw.
  </p>

  <button
    onClick={async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      if (!subscription || subscription.status !== "active") {
  router.push("/subscribe");
  return;
}

      const { data: latestDraw } = await supabase
        .from("draws")
        .select("id")
        .eq("status", "published")
        .order("draw_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestDraw) {
        alert("No active draw available.");
        return;
      }

      const { error } = await supabase
        .from("draw_entries")
        .upsert(
          {
            draw_id: latestDraw.id,
            user_id: user.id,
          },
          {
            onConflict: "draw_id,user_id",
          }
        );

      if (error) {
        alert(error.message);
        return;
      }

      alert("You have entered the draw!");

      window.location.reload();
    }}
    className="mt-5 rounded-xl bg-emerald-400 px-5 py-3 font-semibold text-black hover:bg-emerald-300"
  >
    Enter Draw
  </button>
</div>

          {/* CHARITY */}

          <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-7">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  Your charity
                </h2>

                <p className="text-white/40 mt-1 text-sm">
                  Choose where your contribution goes
                </p>
              </div>

              <Heart className="text-[#c8f36a]" />
            </div>

            {/* CHARITY LIST */}

            <div className="mt-6 space-y-3">
              {charities.length === 0 && (
                <p className="text-white/30 text-sm">
                  No charities available.
                </p>
              )}

              {charities.map((charity) => (
                <button
                  key={charity.id}
                  onClick={() =>
                    setSelectedCharity(charity.id)
                  }
                  className={`w-full text-left border rounded-xl p-4 transition ${
                    selectedCharity === charity.id
                      ? "border-[#c8f36a] bg-[#c8f36a]/10"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="font-semibold">
                    {charity.name}
                  </div>

                  <div className="text-white/40 text-sm mt-1">
                    {charity.description}
                  </div>
                </button>
              ))}
            </div>

            {/* CONTRIBUTION */}

            <div className="mt-6">
              <label className="text-sm text-white/50">
                Charity contribution: {contribution}%
              </label>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={contribution}
                onChange={(e) =>
                  setContribution(Number(e.target.value))
                }
                className="w-full mt-3 accent-[#c8f36a]"
              />
            </div>

            <button
              onClick={saveCharity}
              className="mt-5 border border-[#c8f36a]/40 text-[#c8f36a] px-5 py-3 rounded-xl font-semibold hover:bg-[#c8f36a]/10"
            >
              Save charity
            </button>
          </div>
          {/* INDEPENDENT DONATION */}

<div className="border border-white/10 bg-white/[0.03] rounded-2xl p-7">
  <div className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-xl bg-emerald-400/10 flex items-center justify-center">
      <Heart className="text-emerald-400" />
    </div>

    <div>
      <h2 className="text-xl font-semibold">
        Make an independent donation
      </h2>

      <p className="text-white/40 mt-1 text-sm">
        Support a charity outside your subscription contribution.
      </p>
    </div>
  </div>

  <div className="mt-6">
    <label className="text-sm text-white/50">
      Choose charity
    </label>

    <select
      value={donationCharity}
      onChange={(e) => setDonationCharity(e.target.value)}
      className="w-full mt-2 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-400/50"
    >
      <option value="" className="bg-[#0b0d0c]">
        Select a charity
      </option>

      {charities.map((charity) => (
        <option
          key={charity.id}
          value={charity.id}
          className="bg-[#0b0d0c]"
        >
          {charity.name}
        </option>
      ))}
    </select>
  </div>

  <div className="mt-4">
    <label className="text-sm text-white/50">
      Donation amount
    </label>

    <div className="relative mt-2">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
        ₹
      </span>

      <input
        type="number"
        min="1"
        step="1"
        value={donationAmount}
        onChange={(e) =>
          setDonationAmount(e.target.value)
        }
        placeholder="Enter amount"
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 pl-9 outline-none focus:border-emerald-400/50"
      />
    </div>
  </div>

  <div className="mt-5 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
    <p className="text-xs text-yellow-200/70 leading-5">
      Demo donation flow. Production deployment would connect
      this action to a payment provider.
    </p>
  </div>

  <button
    onClick={makeDonation}
    disabled={donating}
    className="w-full mt-5 rounded-xl bg-emerald-400 text-black py-3 font-semibold hover:bg-emerald-300 disabled:opacity-50 transition"
  >
    {donating
      ? "Processing..."
      : "Make Donation"}
  </button>
</div>
        </div>
      </div>
    </main>
  );
}