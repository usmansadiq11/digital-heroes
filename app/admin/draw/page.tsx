"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Shuffle,
  CheckCircle,
  Trophy,
  Calculator,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  generateDrawNumbers,
} from "@/lib/draw";
import {
  countMatches,
  getMatchType,
  calculateIndividualPrize,
} from "@/lib/winners";

type Draw = {
  id: string;
  draw_date: string;
  number_1: number;
  number_2: number;
  number_3: number;
  number_4: number;
  number_5: number;
  prize_pool: number;
  status: string;
};

type WinnerPreview = {
  userId: string;
  matchType: 3 | 4 | 5;
  prize: number;
};

export default function DrawAdminPage() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [prizePool, setPrizePool] = useState("1000");
  const [rollover, setRollover] = useState(0);
  const [drawMode, setDrawMode] = useState<"random" | "algorithmic">("random");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [latestDraw, setLatestDraw] =
    useState<Draw | null>(null);

  const [winnerPreview, setWinnerPreview] =
    useState<WinnerPreview[]>([]);

  useEffect(() => {
    loadLatestDraw();
  }, []);

  async function loadLatestDraw() {
    const supabase = createClient();

    const { data } = await supabase
      .from("draws")
      .select("*")
      .eq("status", "published")
      .order("draw_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setLatestDraw(data);

      setNumbers([
        data.number_1,
        data.number_2,
        data.number_3,
        data.number_4,
        data.number_5,
      ]);
    }
  }

 async function simulateDraw() {
  setMessage("");
  setWinnerPreview([]);

  if (drawMode === "random") {
    setNumbers(generateDrawNumbers());
    return;
  }

  const supabase = createClient();

  const { data: scores, error } = await supabase
    .from("scores")
    .select("score");

  if (error) {
    setMessage(error.message);
    return;
  }

  if (!scores || scores.length === 0) {
    setNumbers(generateDrawNumbers());
    setMessage(
      "No score history found. Generated a random draw instead."
    );
    return;
  }

  const frequency: Record<number, number> = {};

  for (let number = 1; number <= 45; number++) {
    frequency[number] = 0;
  }

  for (const item of scores) {
    const score = Number(item.score);

    if (score >= 1 && score <= 45) {
      frequency[score]++;
    }
  }

  const weightedNumbers: number[] = [];

  for (let number = 1; number <= 45; number++) {
    const weight = frequency[number] + 1;

    for (let i = 0; i < weight; i++) {
      weightedNumbers.push(number);
    }
  }

  const selected = new Set<number>();

  while (selected.size < 5) {
    const randomIndex = Math.floor(
      Math.random() * weightedNumbers.length
    );

    selected.add(weightedNumbers[randomIndex]);
  }

  setNumbers(Array.from(selected).sort((a, b) => a - b));
}

  async function publishDraw() {
    if (numbers.length !== 5) {
      setMessage("Generate the draw first.");
      return;
    }

const basePool = Number(prizePool);

if (!Number.isFinite(basePool) || basePool < 0) {
  setMessage("Enter a valid prize pool.");
  return;
}

const supabase = createClient();

const { data: previousDraw } = await supabase
  .from("draws")
  .select("rollover_amount")
  .eq("status", "published")
  .order("draw_date", { ascending: false })
  .limit(1)
  .maybeSingle();

const previousRollover = Number(
  previousDraw?.rollover_amount ?? 0
);

const pool = basePool + previousRollover;


    setLoading(true);
    setMessage("");

    

    const { data, error } = await supabase
      .from("draws")
      .insert({
        draw_date: new Date()
          .toISOString()
          .split("T")[0],

        draw_type: "drawMode",

        number_1: numbers[0],
        number_2: numbers[1],
        number_3: numbers[2],
        number_4: numbers[3],
        number_5: numbers[4],

        status: "published",

        prize_pool: pool,
      })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setLatestDraw(data);

    setMessage("Draw published successfully.");

    setLoading(false);
  }

  async function calculateWinners() {
    if (!latestDraw) {
      setMessage("Publish a draw first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setWinnerPreview([]);

    const supabase = createClient();

    /*
      Find active subscribers.
    */

    const { data: subscriptions, error: subError } =
      await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("status", "active");

    if (subError) {
      setMessage(subError.message);
      setLoading(false);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      setMessage(
        "No active subscribers found."
      );

      setLoading(false);
      return;
    }

    const drawNumbers = [
      latestDraw.number_1,
      latestDraw.number_2,
      latestDraw.number_3,
      latestDraw.number_4,
      latestDraw.number_5,
    ];

    const candidates: {
      userId: string;
      matchType: 3 | 4 | 5;
    }[] = [];

    /*
      Check each subscriber's scores.
    */

    for (const subscription of subscriptions) {
      const { data: scores } = await supabase
        .from("scores")
        .select("score")
        .eq("user_id", subscription.user_id)
        .order("score_date", {
          ascending: false,
        })
        .limit(5);

      if (!scores || scores.length < 5) {
        continue;
      }

      const userNumbers = scores.map(
        (item) => item.score
      );

      const matches = countMatches(
        userNumbers,
        drawNumbers
      );

      const matchType = getMatchType(matches);

      if (matchType) {
        candidates.push({
          userId: subscription.user_id,
          matchType,
        });
      }
    }

    /*
      Count winners in each tier.
    */

    const fiveCount = candidates.filter(
      (winner) => winner.matchType === 5
    ).length;
    const currentPool = Number(latestDraw.prize_pool);

    let jackpotRollover = 0;

    if (fiveCount === 0) {
    jackpotRollover = Number(
    (currentPool * 0.40).toFixed(2)
    );

    setRollover(jackpotRollover);
    } else {
    setRollover(0);
    }

    await supabase
    .from("draws")
    .update({
      rollover_amount: jackpotRollover,
    })
    .eq("id", latestDraw.id);
    const fourCount = candidates.filter(
      (winner) => winner.matchType === 4
    ).length;

    const threeCount = candidates.filter(
      (winner) => winner.matchType === 3
    ).length;

    /*
      Calculate each winner's prize.
    */

    const preview = candidates.map((winner) => {
      let count = 0;

      if (winner.matchType === 5) {
        count = fiveCount;
      }

      if (winner.matchType === 4) {
        count = fourCount;
      }

      if (winner.matchType === 3) {
        count = threeCount;
      }

      return {
        userId: winner.userId,
        matchType: winner.matchType,
        prize: calculateIndividualPrize(
          Number(latestDraw.prize_pool),
          winner.matchType,
          count
        ),
      };
    });

    setWinnerPreview(preview);

    /*
      Remove old winners for this draw
      before inserting fresh results.
    */

    await supabase
      .from("winners")
      .delete()
      .eq("draw_id", latestDraw.id);

    if (preview.length > 0) {
      const rows = preview.map((winner) => ({
        draw_id: latestDraw.id,
        user_id: winner.userId,
        match_type: winner.matchType,
        prize_amount: winner.prize,
        payment_status: "pending",
      }));

      const { error: winnerError } =
        await supabase
          .from("winners")
          .insert(rows);

      if (winnerError) {
        setMessage(winnerError.message);
        setLoading(false);
        return;
      }
    }

    setMessage(
      preview.length > 0
        ? `${preview.length} winner(s) calculated.`
        : "No winners found for this draw."
    );

    setLoading(false);
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

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-[#c8f36a] text-sm tracking-widest">
          ADMIN
        </div>

        <h1 className="text-4xl font-semibold mt-2">
          Draw management
        </h1>

        <p className="text-white/40 mt-2">
          Simulate, publish and calculate the
          monthly draw.
        </p>

        {/* DRAW CARD */}

        <div className="mt-10 border border-white/10 bg-white/[0.03] rounded-3xl p-8">
          <div className="text-sm text-white/40">
            DRAW NUMBERS
          </div>

          <div className="flex gap-4 mt-8 flex-wrap">
            {numbers.length === 0 ? (
              <p className="text-white/30">
                No draw generated yet.
              </p>
            ) : (
              numbers.map((number) => (
                <div
                  key={number}
                  className="w-16 h-16 rounded-full bg-[#c8f36a] text-black flex items-center justify-center text-xl font-bold"
                >
                  {number}
                </div>
              ))
            )}
          </div>
          {/* DRAW MODE */}

<div className="mt-8 max-w-sm">
  <label className="text-sm text-white/50">
    Draw method
  </label>

  <select
    value={drawMode}
    onChange={(e) =>
      setDrawMode(
        e.target.value as "random" | "algorithmic"
      )
    }
    className="mt-2 w-full bg-[#111513] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#c8f36a]/50"
  >
    <option value="random">
      Random
    </option>

    <option value="algorithmic">
      Algorithmic — weighted by score frequency
    </option>
  </select>

  <p className="text-xs text-white/30 mt-2">
    {drawMode === "random"
      ? "Numbers are selected randomly from 1–45."
      : "Numbers that appear more frequently in score history receive greater selection weight."}
  </p>
</div>

          {/* PRIZE POOL */}

          <div className="mt-8 max-w-sm">
            <label className="text-sm text-white/50">
              Prize pool (₹)
            </label>

            <input
              type="number"
              min="0"
              value={prizePool}
              onChange={(e) =>
                setPrizePool(e.target.value)
              }
              className="mt-2 w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-[#c8f36a]/50"
            />
            {rollover > 0 && (
            <div className="mt-3 text-sm text-[#c8f36a]">
            Jackpot rollover: ₹{rollover.toFixed(2)}
            </div>
            )}
          </div>

          {/* ACTIONS */}

          <div className="flex gap-3 mt-8 flex-wrap">
            <button
              onClick={simulateDraw}
              className="bg-[#c8f36a] text-black px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
            >
             <Shuffle className="w-4 h-4" />
Simulate {drawMode === "random" ? "random" : "algorithmic"} draw
            </button>

            <button
              onClick={publishDraw}
              disabled={loading}
              className="border border-white/15 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/5 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Publish result
            </button>

            <button
              onClick={calculateWinners}
              disabled={loading || !latestDraw}
              className="border border-[#c8f36a]/40 text-[#c8f36a] px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#c8f36a]/10 disabled:opacity-40"
            >
              <Calculator className="w-4 h-4" />
              Calculate winners
            </button>
          </div>

          {message && (
            <div className="mt-6 text-[#c8f36a]">
              {message}
            </div>
          )}
        </div>

        {/* PRIZE TIERS */}

        <div className="grid md:grid-cols-3 gap-4 mt-5">
          <div className="border border-white/10 rounded-2xl p-6">
            <div className="text-white/40 text-sm">
              5-number match
            </div>

            <div className="text-2xl font-semibold mt-2">
              40%
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl p-6">
            <div className="text-white/40 text-sm">
              4-number match
            </div>

            <div className="text-2xl font-semibold mt-2">
              35%
            </div>
          </div>

          <div className="border border-white/10 rounded-2xl p-6">
            <div className="text-white/40 text-sm">
              3-number match
            </div>

            <div className="text-2xl font-semibold mt-2">
              25%
            </div>
          </div>
        </div>

        {/* WINNER PREVIEW */}

        {winnerPreview.length > 0 && (
          <div className="mt-8 border border-white/10 rounded-3xl p-8">
            <div className="flex items-center gap-3">
              <Trophy className="text-[#c8f36a]" />

              <h2 className="text-xl font-semibold">
                Winners
              </h2>
            </div>

            <div className="mt-6 space-y-3">
              {winnerPreview.map((winner) => (
                <div
                  key={winner.userId}
                  className="flex items-center justify-between border border-white/10 rounded-xl p-4"
                >
                  <div>
                    <div className="font-semibold">
                      {winner.matchType}-number match
                    </div>

                    <div className="text-xs text-white/30 mt-1">
                      User: {winner.userId.slice(0, 8)}...
                    </div>
                  </div>

                  <div className="text-[#c8f36a] font-bold">
                    ₹{winner.prize.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}