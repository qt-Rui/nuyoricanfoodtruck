export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Image from "next/image";
import { prisma } from "../../lib/prisma";
import { getSiteSettings } from "../../lib/siteSettings";
import MenuSection from "./components/MenuSection";

export default async function Home() {
  const foods = await prisma.food.findMany({ orderBy: { createdAt: "desc" } });
  const { openDate, openHours, doorDashUrl } = await getSiteSettings();
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim();

  return (
    <main className="min-h-screen bg-white">
      <div className="h-2 w-full bg-gradient-to-r from-blue-800 via-white to-red-600" />

      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-72 w-[820px] -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute top-36 left-1/2 h-72 w-[820px] -translate-x-1/2 rounded-full bg-red-100/60 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.08)_1px,transparent_0)] [background-size:24px_24px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-red-600" />
              Authentic Puerto Rican Street Food
            </p>

            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] text-slate-900 md:text-6xl">
              Nuyorican Food Truck
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-700">
              Bold Puerto Rican flavors, made fresh daily. Check today&apos;s menu,
              see our hours, and order online.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#menu"
                className="inline-flex items-center justify-center rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-950"
              >
                View Menu
              </a>
              <a
                href="#find-us"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Find Us
              </a>
              <a
                href={doorDashUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-red-700"
              >
                Order on DoorDash
              </a>
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-6 py-3 font-semibold text-blue-900 shadow-sm transition hover:bg-blue-100"
                >
                  Instagram
                </a>
              ) : null}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Open Date
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">{openDate}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Open Hours
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">{openHours}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-800 via-white to-red-600" />
              <div className="bg-gradient-to-br from-blue-50 via-white to-red-50 p-6">
                <Image
                  src="/NuyoRican Food Truck Icon.png"
                  alt="Nuyorican Food Truck logo"
                  width={700}
                  height={450}
                  className="h-72 w-full object-contain md:h-80"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <section id="find-us" className="mb-12">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">Find Us</h2>
              <p className="mt-1 text-slate-600">The Nuyorican Kitchen</p>
            </div>
            <a
              href="https://www.google.com/maps?&q=The%20Nuyorican%20Kitchen"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-blue-700 bg-white px-5 py-2.5 text-sm font-semibold text-blue-800 shadow-sm transition hover:bg-blue-50"
            >
              Open in Google Maps
            </a>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3513.4490310937895!2d-82.71562252461032!3d28.284718899790445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88c29bd4dc20f77b%3A0x7e9c3dced870eb5c!2sThe%20Nuyorican%20Kitchen!5e0!3m2!1sen!2sus!4v1770925714430!5m2!1sen!2sus"
              className="h-[340px] w-full"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="The Nuyorican Kitchen map"
            />
          </div>
        </section>

        <section id="menu" className="scroll-mt-24">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900">Menu</h2>
            <p className="text-slate-600">
              Browse today&apos;s menu, catering options, and other available items.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-4 shadow-xl md:p-6">
            <MenuSection foods={foods} />
          </div>
        </section>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm text-slate-600">
            Copyright {new Date().getFullYear()}{" "}
            <span className="font-semibold text-blue-900">Nuyorican Food Truck</span>{" "}
            - Puerto Rican flavors made with love.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-xl border border-blue-900 bg-white px-6 py-3 font-semibold text-blue-900 shadow-sm transition hover:bg-blue-50"
            >
              Admin Login
            </a>
            <a
              href={doorDashUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-6 py-3 font-semibold text-red-700 shadow-sm transition hover:bg-red-100"
            >
              DoorDash
            </a>
            {instagramUrl ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Instagram
              </a>
            ) : null}
          </div>
        </div>
      </footer>
    </main>
  );
}
