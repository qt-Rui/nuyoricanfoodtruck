export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Image from "next/image";
import { prisma } from "../../lib/prisma";
import { getSiteSettings } from "../../lib/siteSettings";
import MenuSection from "./components/MenuSection";

export default async function Home() {
  const foods = await prisma.food.findMany({ orderBy: { createdAt: "desc" } });
  const { openDate, openHours, doorDashUrl } = await getSiteSettings();

  // ✅ Replace with your real Instagram URL/handle
  const instagramUrl = "https://www.instagram.com/YOUR_HANDLE_HERE/";

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Top ribbon */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-800 via-white to-red-600" />

      <div className="relative flex-grow">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-[900px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />
          <div className="absolute top-56 left-1/3 h-80 w-[900px] -translate-x-1/2 rounded-full bg-red-100/60 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(2,6,23,0.06)_1px,transparent_0)] [background-size:22px_22px]" />
        </div>

        <section className="relative max-w-7xl mx-auto px-6 py-10">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white/70 shadow-xl">
            {/* Flag-style background */}
            <div className="absolute inset-0">
              <div className="absolute inset-y-0 left-0 w-[55%] bg-blue-800" />
              <div className="absolute inset-y-0 right-0 w-[55%] bg-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/40 to-red-200/50" />
              <div className="absolute inset-y-0 left-0 w-[62%] [clip-path:polygon(0_0,72%_50%,0_100%,0_100%)] bg-blue-900/60" />
              <div className="absolute inset-0 opacity-[0.35]">
                <div className="absolute right-0 top-0 h-10 w-full bg-red-600" />
                <div className="absolute right-0 top-20 h-10 w-full bg-red-600" />
                <div className="absolute right-0 top-40 h-10 w-full bg-red-600" />
                <div className="absolute right-0 top-60 h-10 w-full bg-red-600" />
              </div>
            </div>

            {/* Contrast overlay for readability */}
            <div className="absolute inset-0">
              <div className="absolute inset-y-0 left-0 w-full lg:w-[62%] bg-slate-950/55" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-950/15 to-transparent" />
            </div>

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 p-8 md:p-10">
              {/* LEFT CONTENT */}
              <div className="lg:col-span-7 text-white relative">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-950/35 px-4 py-2 text-sm font-semibold ring-1 ring-white/30">
                  <span className="inline-block h-2 w-2 rounded-full bg-white" />
                  Puerto Rican Street Food • Fresh Daily
                </div>

                <h1 className="mt-6 text-5xl md:text-6xl font-extrabold leading-[1.05] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.65)]">
                  Nuyorican <span className="text-red-200">Food Truck</span>
                </h1>

                <p className="mt-5 text-lg text-white/95 max-w-2xl leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
                  Big island flavor, NYC soul. Explore today’s menu, check hours,
                  and find us at our kitchen location.
                </p>

                {/* Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="#menu"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 font-semibold text-blue-900 shadow-md hover:bg-blue-50 transition"
                  >
                    View Menu
                  </a>

                  <a
                    href="#find-us"
                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-red-700 transition"
                  >
                    Find Us
                  </a>

                  <a
                    href={doorDashUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white shadow-sm hover:bg-white/20 transition"
                  >
                    Order on DoorDash
                  </a>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 font-semibold text-white shadow-sm hover:bg-white/20 transition"
                  >
                    Follow on Instagram
                  </a>
                </div>

                {/* Info chips */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
                    <span className="text-xl">★</span>
                    <div>
                      <div className="text-xs text-white/70">Open Date</div>
                      <div className="font-semibold">{openDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20">
                    <span className="text-xl">⏰</span>
                    <div>
                      <div className="text-xs text-white/70">Hours</div>
                      <div className="font-semibold">{openHours}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-3xl bg-white/85 border border-white/50 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-red-50" />
                  <div className="relative p-6">
                    <div className="text-sm font-semibold text-slate-700">
                      Today’s Highlight
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm p-4">
                      <Image
                        src="/NuyoRican Food Truck Icon.png"
                        alt="Nuyorican Food Truck logo"
                        width={700}
                        height={450}
                        className="object-contain w-full h-64 md:h-72"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-2 w-full bg-gradient-to-r from-blue-800 via-white to-red-600" />
          </section>

          {/* FIND US */}
          <section id="find-us" className="mt-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
              Find Us
            </h2>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white/70 shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d7026.898385544341!2d-82.713048!3d28.284714!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c29bd4dc20f77b%3A0x7e9c3dced870eb5c!2sThe%20Nuyorican%20Kitchen!5e0!3m2!1sen!2sus!4v1770921340641!5m2!1sen!2sus"
                className="h-[340px] w-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </section>

          {/* MENU */}
          <section id="menu" className="mt-12 scroll-mt-24">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
              Today’s Menu
            </h2>

            <div className="rounded-[2rem] border border-slate-200 bg-white/75 shadow-xl p-4 md:p-6">
              <MenuSection foods={foods} />
            </div>
          </section>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white/80 py-10 text-center">
          <div className="text-slate-600 text-sm mb-5">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-blue-900">
              Nuyorican Food Truck
            </span>{" "}
            — Puerto Rican flavors, made with love
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-xl border border-blue-900 bg-white px-6 py-3 font-semibold text-blue-900 shadow-sm hover:bg-blue-50 transition"
            >
              Admin Login
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-6 py-3 font-semibold text-red-700 shadow-sm hover:bg-red-50 transition"
            >
              Instagram
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
