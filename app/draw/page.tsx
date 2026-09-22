"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trophy, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Draw = {
  id: string;
  draw_date: string;
  numbers: number[];
  prize_pool: number;
  status: string;
};

export default function DrawPage() {
  const router = useRouter();
  const [draw, setDraw] = useState<Draw | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDraw() {
      const supabase = createClient();

      const { data } = await supabase
        .from("draws")
        .select("id, draw_date, numbers, prize_pool, status")
        .eq("status", "published")
        .order("draw_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      setDraw(data);
      setLoading(false);
    }

    loadDraw();
  }, []);

  return (
    <main className="min-h-screen bg-[#07130f] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-white/60 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          Home
        </button>

        <div className="text-center mt-16">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-[#c8f36a] flex items-center justify-center">
            <Trophy className="text-black" size={26} />
          </div>

          <p className="text-[#c8f36a] uppercase tracking-[0.25em] text-sm mt-6">
            Monthly draw
          </p>

          <h1 className="text-4xl md:text-6xl font-semibold mt-3">
            Your chance to win and give back.
          </h1>

          <p className="text-white/50 max-w-2xl mx-auto mt-5 leading-7">
            Match three, four or five numbers to qualify for a share
            of the monthly prize pool.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-white/50 mt-16">
            Loading latest draw...
          </div>
        ) : draw ? (
          <div className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-8 text-center">

            <p className="text-white/40 text-sm uppercase tracking-widest">
              Latest published draw
            </p>

            <div className="flex justify-center gap-3 mt-6 flex-wrap">
              {draw.numbers.map((number) => (
                <div
                  key={number}
                  className="h-14 w-14 rounded-full bg-[#c8f36a] text-black flex items-center justify-center text-xl font-bold"
                >
                  {number}
                </div>
              ))}
            </div>

            <p className="text-3xl font-semibold mt-8">
              ₹{Number(draw.prize_pool).toFixed(2)}
            </p>

            <p className="text-white/40 text-sm mt-2">
              Prize pool
            </p>
          </div>
        ) : (
          <div className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-xl font-semibold">
              No draw has been published yet.
            </p>

            <p className="text-white/40 mt-2">
              The next monthly draw will appear here.
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-5 mt-10">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-4xl font-bold text-[#c8f36a]">5</p>
            <h2 className="text-xl font-semibold mt-4">
              Match 5
            </h2>
            <p className="text-white/50 text-sm mt-2 leading-6">
              40% of the prize pool goes to the jackpot.
            </p>
            <p className="text-xs text-[#c8f36a] uppercase tracking-widest mt-5">
              Jackpot rollover
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-4xl font-bold text-[#c8f36a]">4</p>
            <h2 className="text-xl font-semibold mt-4">
              Match 4
            </h2>
            <p className="text-white/50 text-sm mt-2 leading-6">
              35% of the prize pool is shared equally.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-4xl font-bold text-[#c8f36a]">3</p>
            <h2 className="text-xl font-semibold mt-4">
              Match 3
            </h2>
            <p className="text-white/50 text-sm mt-2 leading-6">
              25% of the prize pool is shared equally.
            </p>
          </div>

        </div>

        <div className="mt-10 rounded-3xl border border-[#c8f36a]/20 bg-[#c8f36a]/5 p-7 flex items-start gap-4">
          <Heart className="text-[#c8f36a] shrink-0 mt-1" size={22} />

          <div>
            <p className="font-semibold">
              More than a draw
            </p>

            <p className="text-white/50 text-sm mt-2 leading-6">
              Your membership also supports the charity you choose.
              Part of the platform's story is giving back while you participate.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={() => router.push("/auth")}
            className="bg-[#c8f36a] text-black px-7 py-3.5 rounded-full font-semibold hover:bg-[#d8ff87] transition"
          >
            Become a member
          </button>
        </div>

      </div>
    </main>
  );
}