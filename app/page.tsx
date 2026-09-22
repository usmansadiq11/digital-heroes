"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Heart,
  Trophy,
  Target,
  Sparkles,
  ChevronDown,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const charities = [
  {
    name: "Green Earth Foundation",
    description: "Protecting nature and restoring our planet.",
    icon: "🌱",
  },
  {
    name: "Hope Children Foundation",
    description: "Creating better opportunities for children.",
    icon: "💛",
  },
  {
    name: "Clean Water Initiative",
    description: "Bringing clean water to communities.",
    icon: "💧",
  },
];

type SpotlightCharity = {
  id: string;
  name: string;
  description: string | null;
  impact_text: string | null;
};

export default function Home() {
  const router = useRouter();

  const [spotlightCharity, setSpotlightCharity] =
    useState<SpotlightCharity | null>(null);

  useEffect(() => {
    loadSpotlightCharity();
  }, []);

  async function loadSpotlightCharity() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("charities")
      .select("id,name,description,impact_text")
      .eq("is_spotlight", true)
      .eq("active", true)
      .maybeSingle();

    if (error) {
      console.error("Spotlight charity loading error:", error);
      return;
    }

    setSpotlightCharity(data);
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-white overflow-hidden">
      {/* NAVBAR */}

      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0b0d0c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#c8f36a] flex items-center justify-center">
              <Heart className="w-5 h-5 text-black fill-black" />
            </div>

            <div>
              <div className="font-bold tracking-tight text-lg">
                DIGITAL<span className="text-[#c8f36a]">HEROES</span>
              </div>

              <div className="text-[9px] text-white/40 tracking-[0.25em]">
                PLAY • GIVE • WIN
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
<a href="#how-it-works" className="hover:text-white transition">
  How it works
</a>
            <a href="#charities" className="hover:text-white transition">
              Charities
            </a>

            <a href="#draw" className="hover:text-white transition">
              The draw
            </a>
          </div>

          <button
            onClick={() => router.push("/auth")}
            className="bg-[#c8f36a] text-black px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#d8ff87] transition"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* HERO */}

      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-[#c8f36a]/10 blur-[140px] rounded-full" />

        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full" />

        <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 border border-[#c8f36a]/30 bg-[#c8f36a]/10 rounded-full px-4 py-2 text-xs text-[#c8f36a] mb-7">
              <Sparkles className="w-3.5 h-3.5" />
              EVERY MONTH, SOMETHING GOOD HAPPENS
            </div>

            <h1 className="text-5xl md:text-7xl font-semibold leading-[0.95] tracking-[-0.04em]">
              Play your game.
              <br />
              <span className="text-[#c8f36a]">
                Change a life.
              </span>
            </h1>

            <p className="mt-7 text-lg md:text-xl text-white/55 max-w-xl leading-relaxed">
              A new kind of golf community where your performance enters you
              into monthly rewards — while a part of your subscription goes
              directly to a charity you choose.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/auth")}
                className="group bg-[#c8f36a] text-black px-7 py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:bg-[#d8ff87] transition"
              >
                Become a member
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => {
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
                className="border border-white/10 px-7 py-4 rounded-full font-semibold flex items-center justify-center gap-2 text-white/70 hover:text-white hover:bg-white/5 transition"
              >
                See how it works
                <ChevronDown size={18} />
              </button>
            </div>

            <div className="mt-10 flex items-center gap-8 text-sm">
              <div>
                <div className="font-semibold text-white">
                  10%
                </div>
                <div className="text-white/40">
                  minimum to charity
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <div className="font-semibold text-white">
                  Monthly
                </div>
                <div className="text-white/40">
                  reward draws
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <div className="font-semibold text-white">
                  5
                </div>
                <div className="text-white/40">
                  latest scores
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT VISUAL */}

          <div className="relative hidden lg:block">
            <div className="relative aspect-square max-w-[560px] ml-auto">
              <div className="absolute inset-10 rounded-[40%] bg-[#c8f36a]/10 blur-3xl" />

              <div className="absolute inset-0 rounded-[40px] border border-white/10 bg-white/[0.03] backdrop-blur-sm rotate-3" />

              <div className="absolute inset-8 rounded-[35px] border border-white/10 bg-[#111513] p-8 shadow-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs text-white/40">
                      THIS MONTH'S DRAW
                    </div>

                    <div className="text-2xl font-semibold mt-2">
                      September Draw
                    </div>
                  </div>

                  <div className="bg-[#c8f36a]/10 text-[#c8f36a] px-3 py-1.5 rounded-full text-xs">
                    LIVE
                  </div>
                </div>

                <div className="flex gap-3 mt-12 justify-center">
                  {[7, 14, 21, 32, 41].map((number) => (
                    <div
                      key={number}
                      className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-lg font-semibold"
                    >
                      {number}
                    </div>
                  ))}
                </div>

                <div className="mt-12 bg-white/[0.04] border border-white/10 rounded-2xl p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">
                      Prize pool
                    </span>

                    <span className="text-[#c8f36a] font-semibold">
                      ₹24,850
                    </span>
                  </div>

                  <div className="h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div className="h-full w-[72%] bg-[#c8f36a] rounded-full" />
                  </div>

                  <div className="flex justify-between mt-3 text-xs text-white/35">
                    <span>72% funded</span>
                    <span>5-number jackpot</span>
                  </div>
                </div>

                <div className="absolute -bottom-7 -left-7 bg-[#c8f36a] text-black rounded-2xl p-5 shadow-xl">
                  <Heart className="w-6 h-6 fill-black" />

                  <div className="text-2xl font-bold mt-2">
                    ₹2,485
                  </div>

                  <div className="text-xs font-medium">
                    going to charity
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section
        id="how-it-works"
        className="py-28 border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl">
            <div className="text-[#c8f36a] text-sm font-semibold tracking-widest">
              HOW IT WORKS
            </div>

            <h2 className="text-4xl md:text-5xl font-semibold mt-4 tracking-tight">
              Three simple steps.
              <br />
              <span className="text-white/40">
                One bigger purpose.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-16">
            {[
              {
                number: "01",
                icon: Target,
                title: "Track your game",
                text: "Enter your latest five Stableford scores and keep your performance history up to date.",
              },
              {
                number: "02",
                icon: Heart,
                title: "Choose your cause",
                text: "Select a charity you care about and decide how much of your subscription goes toward it.",
              },
              {
                number: "03",
                icon: Trophy,
                title: "Play & win",
                text: "Your participation puts you into the monthly draw for a chance to win from the prize pool.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group border border-white/10 rounded-3xl p-8 bg-white/[0.025] hover:bg-white/[0.05] transition"
              >
                <div className="flex justify-between items-start">
                  <div className="h-12 w-12 rounded-2xl bg-[#c8f36a]/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-[#c8f36a]" />
                  </div>

                  <span className="text-white/20 font-mono">
                    {item.number}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mt-10">
                  {item.title}
                </h3>

                <p className="text-white/45 mt-3 leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHARITY SPOTLIGHT */}

      {spotlightCharity && (
        <section className="py-20 border-y border-white/10 bg-[#0d100e]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <div className="rounded-[32px] border border-[#c8f36a]/20 bg-[#c8f36a]/5 p-8 md:p-12 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-72 h-72 bg-[#c8f36a]/10 blur-[90px] rounded-full" />

              <div className="relative z-10 grid md:grid-cols-[1fr_auto] gap-10 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 text-[#c8f36a] text-sm font-semibold tracking-[0.2em] uppercase">
                    <Star size={16} fill="currentColor" />
                    Charity Spotlight
                  </div>

                  <h2 className="text-3xl md:text-5xl font-semibold mt-4">
                    {spotlightCharity.name}
                  </h2>

                  <p className="text-white/50 max-w-2xl mt-4 text-lg leading-relaxed">
                    {spotlightCharity.impact_text ||
                      spotlightCharity.description ||
                      "Making a positive difference through community support."}
                  </p>

                  <button
                    onClick={() => router.push("/charities")}
                    className="mt-7 bg-[#c8f36a] text-black px-6 py-3.5 rounded-full font-semibold hover:bg-[#d8ff87] transition inline-flex items-center gap-2"
                  >
                    View charity
                    <ArrowRight size={17} />
                  </button>
                </div>

                <div className="hidden md:flex h-28 w-28 rounded-3xl bg-[#c8f36a]/10 border border-[#c8f36a]/20 items-center justify-center">
                  <Heart
                    size={48}
                    className="text-[#c8f36a]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CHARITIES */}

      <section
        id="charities"
        className="py-28 bg-[#101311] border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
            <div>
              <div className="text-[#c8f36a] text-sm font-semibold tracking-widest">
                YOUR CHOICE MATTERS
              </div>

              <h2 className="text-4xl md:text-5xl font-semibold mt-4">
                Choose a cause.
              </h2>

              <p className="text-white/45 mt-4 max-w-xl">
                Every member chooses where a portion of their subscription
                makes an impact.
              </p>
            </div>

            <button
              onClick={() => router.push("/charities")}
              className="text-sm text-[#c8f36a] flex items-center gap-2 hover:text-[#d8ff87] transition"
            >
              Explore all charities
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {charities.map((charity) => (
              <div
                key={charity.name}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 hover:border-[#c8f36a]/30 transition"
              >
                <div className="text-4xl">
                  {charity.icon}
                </div>

                <h3 className="text-xl font-semibold mt-7">
                  {charity.name}
                </h3>

                <p className="text-white/40 mt-3 leading-relaxed">
                  {charity.description}
                </p>

                <button
                  onClick={() => router.push("/charities")}
                  className="mt-7 text-sm text-[#c8f36a] flex items-center gap-2 hover:text-[#d8ff87] transition"
                >
                  View charity
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRAW MECHANICS */}

      <section id="draw" className="mt-24">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[#c8f36a] uppercase tracking-[0.25em] text-sm">
            The monthly draw
          </p>

          <h2 className="text-3xl md:text-5xl font-semibold mt-3">
            Match more. Win more. Give more.
          </h2>

          <p className="text-white/50 mt-4 leading-7">
            Each month, subscribers enter a five-number draw.
            Match three or more numbers to qualify for a share of the prize pool.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-10">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="text-[#c8f36a] text-4xl font-bold">
              5
            </div>

            <p className="text-xl font-semibold mt-4">
              Number match
            </p>

            <p className="text-white/50 text-sm mt-2 leading-6">
              The jackpot tier receives 40% of the prize pool.
            </p>

            <div className="mt-5 text-xs uppercase tracking-widest text-[#c8f36a]">
              Jackpot · Rolls over
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="text-[#c8f36a] text-4xl font-bold">
              4
            </div>

            <p className="text-xl font-semibold mt-4">
              Number match
            </p>

            <p className="text-white/50 text-sm mt-2 leading-6">
              Winners share 35% of the prize pool equally.
            </p>

            <div className="mt-5 text-xs uppercase tracking-widest text-white/40">
              Shared equally
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <div className="text-[#c8f36a] text-4xl font-bold">
              3
            </div>

            <p className="text-xl font-semibold mt-4">
              Number match
            </p>

            <p className="text-white/50 text-sm mt-2 leading-6">
              Winners share 25% of the prize pool equally.
            </p>

            <div className="mt-5 text-xs uppercase tracking-widest text-white/40">
              Shared equally
            </div>
          </div>
        </div>

        <div className="mt-7 rounded-3xl border border-[#c8f36a]/20 bg-[#c8f36a]/5 p-6 text-center">
          <p className="font-semibold">
            No five-number winner?
          </p>

          <p className="text-sm text-white/50 mt-2">
            The jackpot carries forward to the next monthly draw.
          </p>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push("/draw")}
            className="bg-[#c8f36a] text-black px-7 py-3.5 rounded-full font-semibold hover:bg-[#d8ff87] transition"
          >
            Explore the draw
            <ArrowRight size={17} className="inline ml-2" />
          </button>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-[#c8f36a] flex items-center justify-center">
            <Heart className="w-8 h-8 text-black fill-black" />
          </div>

          <h2 className="text-5xl md:text-7xl font-semibold tracking-tight mt-8">
            Your game can do
            <br />
            <span className="text-[#c8f36a]">
              more.
            </span>
          </h2>

          <p className="text-white/45 max-w-xl mx-auto mt-6 text-lg">
            Join Digital Heroes and turn every month of play into an
            opportunity to win and give back.
          </p>

          <button
            onClick={() => router.push("/auth")}
            className="mt-9 bg-[#c8f36a] text-black px-8 py-4 rounded-full font-bold hover:bg-[#d8ff87] transition"
          >
            Start your journey
          </button>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row justify-between gap-4 text-sm text-white/30">
          <div>© 2026 Digital Heroes</div>

          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </main>
  );
}