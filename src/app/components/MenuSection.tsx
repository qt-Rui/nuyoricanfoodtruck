"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface Food {
  id: string;
  name: string;
  price: number;
  description: string | null;
  isOnTruck: boolean;
  isForCatering: boolean;
  imageUrl?: string | null;
}

/**
 * Small blur placeholder (base64 SVG).
 * Keeps loading smooth for both real images and fallbacks.
 */
const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFlM2E4YSIvPjxzdG9wIG9mZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZGMyNjI2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ1cmwoI2cpIiBvcGFjaXR5PSIwLjY1Ii8+PC9zdmc+";

/**
 * Generates a nice Puerto Rican themed fallback SVG as a DATA URL.
 * This works as a normal <Image src="data:image/svg+xml;..."> source.
 */
function makeFoodPlaceholderDataUrl(name: string) {
  const safeName = (name || "Menu Item").slice(0, 28);
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e3a8a"/>
        <stop offset="55%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#dc2626"/>
      </linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="rgba(0,0,0,0.35)"/>
        <stop offset="70%" stop-color="rgba(0,0,0,0.05)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </linearGradient>
    </defs>

    <rect width="1200" height="900" fill="url(#bg)"/>
    <rect width="1200" height="900" fill="url(#shade)"/>

    <!-- subtle dots -->
    <g opacity="0.14" fill="#ffffff">
      ${Array.from({ length: 140 })
        .map((_, i) => {
          const x = (i * 83) % 1200;
          const y = (i * 47) % 900;
          return `<circle cx="${x}" cy="${y}" r="2" />`;
        })
        .join("")}
    </g>

    <!-- top stripe -->
    <rect x="0" y="0" width="1200" height="20" fill="#1e3a8a"/>
    <rect x="0" y="20" width="1200" height="20" fill="#ffffff"/>
    <rect x="0" y="40" width="1200" height="20" fill="#dc2626"/>

    <!-- icon circle -->
    <circle cx="600" cy="380" r="86" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" stroke-width="3"/>
    <text x="600" y="400" text-anchor="middle" font-size="64" font-family="Arial, sans-serif" fill="#ffffff">🍽️</text>

    <!-- name -->
    <text x="600" y="520" text-anchor="middle"
      font-size="54" font-family="Arial, sans-serif" font-weight="800" fill="#0b1220">
      ${escapeXml(safeName)}
    </text>

    <!-- brand -->
    <text x="600" y="585" text-anchor="middle"
      font-size="22" font-family="Arial, sans-serif" font-weight="700"
      fill="rgba(255,255,255,0.92)" letter-spacing="4">
      NUYORICAN KITCHEN
    </text>

    <text x="600" y="630" text-anchor="middle"
      font-size="18" font-family="Arial, sans-serif"
      fill="rgba(255,255,255,0.75)">
      Photo coming soon
    </text>
  </svg>`.trim();

  // URL-encode SVG for a data URL
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function escapeXml(str: string) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function FoodCard({ food }: { food: Food }) {
  const fallback = makeFoodPlaceholderDataUrl(food.name);
  const initialSrc = food.imageUrl?.trim() ? food.imageUrl.trim() : fallback;

  const [src, setSrc] = useState<string>(initialSrc);

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/80 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">
      {/* Flag stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-800 via-white to-red-600" />

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={src}
          alt={food.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          onError={() => {
            // if the remote URL fails, swap to the placeholder
            if (src !== fallback) setSrc(fallback);
          }}
        />

        {/* Price pill */}
        <div className="absolute right-3 top-3">
          <div className="rounded-full bg-blue-900/90 px-3 py-1 text-sm font-extrabold text-white shadow-sm ring-1 ring-white/30">
            ${food.price.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 truncate">
              {food.name}
            </h3>
            {food.description ? (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {food.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400">—</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {food.isOnTruck ? (
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-900">
              On Truck
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              Not on Truck
            </span>
          )}

          {food.isForCatering ? (
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
              Catering
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              No Catering
            </span>
          )}
        </div>
      </div>

      {/* subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -top-24 left-1/2 h-40 w-[420px] -translate-x-1/2 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute top-24 left-1/2 h-40 w-[420px] -translate-x-1/2 rounded-full bg-blue-200/40 blur-3xl" />
      </div>
    </article>
  );
}

export default function MenuSection({ foods }: { foods: Food[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const matchesQuery = (food: Food) =>
    `${food.name} ${food.description ?? ""}`.toLowerCase().includes(normalizedQuery);

  const { todaysMenu, cateringMenu, otherItems, totalShown } = useMemo(() => {
    const todaysMenu = foods.filter((f) => f.isOnTruck && matchesQuery(f));
    const cateringMenu = foods.filter((f) => !f.isOnTruck && f.isForCatering && matchesQuery(f));
    const otherItems = foods.filter((f) => !f.isOnTruck && !f.isForCatering && matchesQuery(f));

    return {
      todaysMenu,
      cateringMenu,
      otherItems,
      totalShown: todaysMenu.length + cateringMenu.length + otherItems.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foods, normalizedQuery]);

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-800" />
        <span className="h-2.5 w-2.5 rounded-full bg-white border border-slate-200" />
        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
      </div>
    </div>
  );

  const EmptyState = ({ label }: { label: string }) => (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
      No items in <span className="font-semibold text-slate-900">{label}</span>.
    </div>
  );

  const renderGrid = (items: Food[], emptyLabel: string) => {
    if (!items.length) return <EmptyState label={emptyLabel} />;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {items.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Search + count */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:max-w-lg">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
            ⌕
          </div>
          <input
            aria-label="Search menu"
            placeholder="Search menu (e.g., mofongo, tacos, empanadas)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 pl-11 pr-4 py-3 shadow-sm outline-none transition focus:ring-2 focus:ring-blue-200"
          />
          <div className="mt-2 h-1 w-36 rounded-full bg-gradient-to-r from-blue-800 via-white to-red-600" />
        </div>

        <div className="inline-flex items-center gap-2 self-start md:self-auto rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-800" />
          {totalShown} items shown
        </div>
      </div>

      <section className="space-y-14">
        <div>
          <SectionHeader title="Today’s Menu" subtitle="Available now — while supplies last." />
          {renderGrid(todaysMenu, "Today’s Menu")}
        </div>

        <div>
          <SectionHeader title="Available for Catering" subtitle="Great for parties, events, and office lunches." />
          {renderGrid(cateringMenu, "Catering")}
        </div>

        <div>
          <SectionHeader title="Other Items" subtitle="Not on today’s truck menu and not listed for catering." />
          {renderGrid(otherItems, "Other Items")}
        </div>
      </section>
    </>
  );
}
