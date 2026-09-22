"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Save,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

type Subscription = {
  user_id: string;
  plan: string;
  status: string;
  renewal_date: string;
};

type Score = {
  id: string;
  user_id: string;
  score: number;
  score_date: string;
};

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscriptions, setSubscriptions] = useState<
    Subscription[]
  >([]);
  const [scores, setScores] = useState<Score[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [editingScoreId, setEditingScoreId] = useState<string | null>(
    null
  );
  const [editingScore, setEditingScore] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [savingScore, setSavingScore] = useState(false);

  const [expandedUser, setExpandedUser] = useState<string | null>(
    null
  );

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

    await loadUsers();
  }

  async function loadUsers() {
    const supabase = createClient();

    const [
      { data: userData, error: userError },
      { data: subscriptionData, error: subscriptionError },
      { data: scoreData, error: scoreError },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false }),

      supabase
        .from("subscriptions")
        .select("user_id, plan, status, renewal_date"),

      supabase
        .from("scores")
        .select("id, user_id, score, score_date")
        .order("score_date", { ascending: false }),
    ]);

    if (userError) {
      setMessage(userError.message);
      setLoading(false);
      return;
    }

    if (subscriptionError) {
      setMessage(subscriptionError.message);
      setLoading(false);
      return;
    }

    if (scoreError) {
      setMessage(scoreError.message);
      setLoading(false);
      return;
    }

    setUsers(userData ?? []);
    setSubscriptions(subscriptionData ?? []);
    setScores(scoreData ?? []);

    setLoading(false);
  }

  function getSubscription(userId: string) {
    return subscriptions.find(
      (subscription) => subscription.user_id === userId
    );
  }

  function getUserScores(userId: string) {
    return scores
      .filter((score) => score.user_id === userId)
      .sort(
        (a, b) =>
          new Date(b.score_date).getTime() -
          new Date(a.score_date).getTime()
      );
  }

  function startEditingScore(score: Score) {
    setEditingScoreId(score.id);
    setEditingScore(String(score.score));
    setEditingDate(score.score_date);
    setMessage("");
  }

  function cancelEditingScore() {
    setEditingScoreId(null);
    setEditingScore("");
    setEditingDate("");
  }

  async function saveScore(scoreId: string, userId: string) {
    setMessage("");

    const scoreNumber = Number(editingScore);

    if (
      !Number.isInteger(scoreNumber) ||
      scoreNumber < 1 ||
      scoreNumber > 45
    ) {
      setMessage("Score must be a whole number between 1 and 45.");
      return;
    }

    if (!editingDate) {
      setMessage("Please select a score date.");
      return;
    }

    setSavingScore(true);

    const supabase = createClient();

    // Prevent duplicate date for this user.
    const { data: duplicateScore } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", userId)
      .eq("score_date", editingDate)
      .neq("id", scoreId)
      .maybeSingle();

    if (duplicateScore) {
      setMessage(
        "This user already has a score for that date."
      );
      setSavingScore(false);
      return;
    }

    const { error } = await supabase
      .from("scores")
      .update({
        score: scoreNumber,
        score_date: editingDate,
      })
      .eq("id", scoreId);

    if (error) {
      setMessage(error.message);
      setSavingScore(false);
      return;
    }

    setMessage("Golf score updated successfully.");

    cancelEditingScore();

    await loadUsers();

    setSavingScore(false);
  }

  async function deleteScore(scoreId: string) {
    const confirmed = window.confirm(
      "Delete this golf score?"
    );

    if (!confirmed) return;

    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", scoreId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Golf score deleted successfully.");

    await loadUsers();
  }

  async function changeRole(
    userId: string,
    currentRole: string
  ) {
    const newRole =
      currentRole === "admin" ? "user" : "admin";

    const confirmed = window.confirm(
      `Change this user's role to ${newRole}?`
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("User role updated successfully.");

    await loadUsers();
  }

  async function changeSubscription(
    userId: string,
    currentStatus: string
  ) {
    const newStatus =
      currentStatus === "active"
        ? "cancelled"
        : "active";

    const confirmed = window.confirm(
      `Change subscription status to ${newStatus}?`
    );

    if (!confirmed) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: newStatus })
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Subscription status updated successfully.");

    await loadUsers();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07130f] text-white flex items-center justify-center">
        Loading users...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07130f] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 text-white/60 hover:text-white"
          >
            <ArrowLeft size={18} />
            Admin Dashboard
          </button>

          <div className="flex items-center gap-2 text-emerald-400">
            <Users size={18} />

            <span className="font-semibold">
              Digital Heroes Admin
            </span>
          </div>
        </div>

        {/* TITLE */}

        <div className="mb-10">
          <p className="text-emerald-400 uppercase tracking-[0.25em] text-sm">
            Administration
          </p>

          <h1 className="text-4xl font-semibold mt-3">
            User Management
          </h1>

          <p className="text-white/50 mt-3">
            View users, subscriptions and golf scores.
          </p>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-300">
            {message}
          </div>
        )}

        {/* USERS */}

        <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">

          <div className="p-6 border-b border-white/10">
            <p className="text-white/50 text-sm">
              Total users
            </p>

            <p className="text-3xl font-semibold mt-1">
              {users.length}
            </p>
          </div>

          <div className="divide-y divide-white/10">

            {users.map((user) => {
              const subscription = getSubscription(user.id);
              const userScores = getUserScores(user.id);
              const isExpanded =
                expandedUser === user.id;

              return (
                <div key={user.id} className="p-6">

                  {/* USER HEADER */}

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    <div>
                      <p className="font-semibold text-lg">
                        {user.full_name || "Unnamed User"}
                      </p>

                      <p className="text-xs text-white/30 mt-2">
                        Joined{" "}
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      {/* ROLE */}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-400/10 text-purple-300"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {user.role}
                      </span>

                      {/* SUBSCRIPTION */}

                      {subscription ? (
                        <div className="flex items-center gap-2">

                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              subscription.status ===
                              "active"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-white/10 text-white/50"
                            }`}
                          >
                            {subscription.plan} ·{" "}
                            {subscription.status}
                          </span>

                          <button
                            onClick={() =>
                              changeSubscription(
                                user.id,
                                subscription.status
                              )
                            }
                            className="rounded-xl border border-white/10 px-3 py-2 text-xs hover:bg-white/10"
                          >
                            {subscription.status ===
                            "active"
                              ? "Cancel"
                              : "Activate"}
                          </button>

                        </div>
                      ) : (
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/30">
                          No subscription
                        </span>
                      )}

                      {/* SCORES */}

                      <button
                        onClick={() =>
                          setExpandedUser(
                            isExpanded
                              ? null
                              : user.id
                          )
                        }
                        className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-2 text-sm text-emerald-300 hover:bg-emerald-400/10"
                      >
                        {isExpanded
                          ? "Hide Scores"
                          : `View Scores (${userScores.length})`}
                      </button>

                      {/* ROLE */}

                      <button
                        onClick={() =>
                          changeRole(
                            user.id,
                            user.role
                          )
                        }
                        className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
                      >
                        Change Role
                      </button>

                    </div>
                  </div>

                  {/* SCORES PANEL */}

                  {isExpanded && (
                    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">

                      <div className="flex items-center justify-between mb-5">

                        <div>
                          <h3 className="font-semibold">
                            Golf Scores
                          </h3>

                          <p className="text-xs text-white/40 mt-1">
                            Latest 5 scores • Stableford
                            1–45
                          </p>
                        </div>

                        <span className="text-xs text-white/40">
                          {userScores.length}/5 scores
                        </span>

                      </div>

                      {userScores.length === 0 ? (
                        <div className="rounded-xl border border-white/10 p-6 text-center text-white/40">
                          No golf scores recorded.
                        </div>
                      ) : (
                        <div className="space-y-3">

                          {userScores.map((score) => {

                            const editing =
                              editingScoreId ===
                              score.id;

                            return (
                              <div
                                key={score.id}
                                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                              >

                                {editing ? (
                                  <div className="grid md:grid-cols-[120px_1fr_auto] gap-3 items-end">

                                    <div>
                                      <label className="text-xs text-white/40">
                                        Score
                                      </label>

                                      <input
                                        type="number"
                                        min="1"
                                        max="45"
                                        value={
                                          editingScore
                                        }
                                        onChange={(e) =>
                                          setEditingScore(
                                            e.target.value
                                          )
                                        }
                                        className="w-full mt-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-400/50"
                                      />
                                    </div>

                                    <div>
                                      <label className="text-xs text-white/40">
                                        Date
                                      </label>

                                      <input
                                        type="date"
                                        value={
                                          editingDate
                                        }
                                        onChange={(e) =>
                                          setEditingDate(
                                            e.target.value
                                          )
                                        }
                                        className="w-full mt-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-emerald-400/50"
                                      />
                                    </div>

                                    <div className="flex gap-2">

                                      <button
                                        onClick={() =>
                                          saveScore(
                                            score.id,
                                            user.id
                                          )
                                        }
                                        disabled={
                                          savingScore
                                        }
                                        className="rounded-lg bg-emerald-400 p-2 text-black hover:bg-emerald-300 disabled:opacity-50"
                                        title="Save score"
                                      >
                                        <Save
                                          size={16}
                                        />
                                      </button>

                                      <button
                                        onClick={
                                          cancelEditingScore
                                        }
                                        className="rounded-lg border border-white/10 p-2 text-white/60 hover:bg-white/10"
                                        title="Cancel"
                                      >
                                        <X size={16} />
                                      </button>

                                    </div>

                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-4">

                                    <div className="flex items-center gap-5">

                                      <div>
                                        <p className="text-2xl font-semibold text-emerald-300">
                                          {score.score}
                                        </p>

                                        <p className="text-xs text-white/40">
                                          Stableford
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-sm">
                                          {new Date(
                                            score.score_date
                                          ).toLocaleDateString()}
                                        </p>

                                        <p className="text-xs text-white/30">
                                          Score date
                                        </p>
                                      </div>

                                    </div>

                                    <div className="flex gap-2">

                                      <button
                                        onClick={() =>
                                          startEditingScore(
                                            score
                                          )
                                        }
                                        className="rounded-lg border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white"
                                        title="Edit score"
                                      >
                                        <Pencil
                                          size={16}
                                        />
                                      </button>

                                      <button
                                        onClick={() =>
                                          deleteScore(
                                            score.id
                                          )
                                        }
                                        className="rounded-lg border border-red-400/20 p-2 text-red-400 hover:bg-red-400/10"
                                        title="Delete score"
                                      >
                                        <Trash2
                                          size={16}
                                        />
                                      </button>

                                    </div>

                                  </div>
                                )}

                              </div>
                            );
                          })}

                        </div>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

            {users.length === 0 && (
              <div className="p-10 text-center text-white/50">
                No users found.
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}