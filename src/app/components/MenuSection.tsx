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

const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMzAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJnIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzFlM2E4YSIvPjxzdG9wIG9mZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjZmZmZmZmIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZGMyNjI2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ1cmwoI2cpIiBvcGFjaXR5PSIwLjY1Ii8+PC9zdmc+";

const buildFallbackImage = (name: string) => {
  const safeName = escapeXml((name || "Menu Item").slice(0, 28));
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1e3a8a"/>
        <stop offset="55%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#dc2626"/>
      </linearGradient>
    </defs>

    <rect width="1200" height="900" fill="url(#bg)"/>
    <rect x="0" y="0" width="1200" height="20" fill="#1e3a8a"/>
    <rect x="0" y="20" width="1200" height="20" fill="#ffffff"/>
    <rect x="0" y="40" width="1200" height="20" fill="#dc2626"/>

    <rect x="300" y="250" width="600" height="380" rx="24" fill="rgba(255,255,255,0.25)" />
    <text x="600" y="430" text-anchor="middle" font-size="72" font-family="Arial, sans-serif" font-weight="700" fill="#0f172a">
      ${safeName}
    </text>
    <text x="600" y="500" text-anchor="middle" font-size="28" font-family="Arial, sans-serif" fill="#ffffff">
      Photo coming soon
    </text>
  </svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

function FoodCard({ food }: { food: Food }) {
  const fallback = buildFallbackImage(food.name);
  const [src, setSrc] = useState(food.imageUrl?.trim() ? food.imageUrl : fallback);

  return (
    <article className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/85 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-800 via-white to-red-600" />

      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={src || fallback}
          alt={food.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          onError={() => {
            if (src !== fallback) setSrc(fallback);
          }}
        />

        <div className="absolute right-3 top-3 rounded-full bg-blue-900/90 px-3 py-1 text-sm font-extrabold text-white shadow-sm ring-1 ring-white/30">
          ${food.price.toFixed(2)}
        </div>
      </div>

      <div className="p-5">
        <h3 className="truncate text-lg font-extrabold text-slate-900 md:text-xl">
          {food.name}
        </h3>
        <p className="mt-1 min-h-10 text-sm text-slate-600">
          {food.description || "No description yet."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              food.isOnTruck
                ? "border border-red-200 bg-red-50 text-red-900"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {food.isOnTruck ? "On Truck" : "Not on Truck"}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              food.isForCatering
                ? "border border-blue-200 bg-blue-50 text-blue-900"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {food.isForCatering ? "Catering" : "No Catering"}
          </span>
        </div>
      </div>
    </article>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 md:text-3xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-800" />
        <span className="h-2.5 w-2.5 rounded-full border border-slate-200 bg-white" />
        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600">
      No items in <span className="font-semibold text-slate-900">{label}</span>.
    </div>
  );
}

export default function MenuSection({ foods }: { foods: Food[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const { todaysMenu, cateringMenu, otherItems, totalShown } = useMemo(() => {
    const matchesQuery = (food: Food) =>
      `${food.name} ${food.description ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery);

    const todaysMenu = foods.filter((food) => food.isOnTruck && matchesQuery(food));
    const cateringMenu = foods.filter(
      (food) => !food.isOnTruck && food.isForCatering && matchesQuery(food)
    );
    const otherItems = foods.filter(
      (food) => !food.isOnTruck && !food.isForCatering && matchesQuery(food)
    );

    return {
      todaysMenu,
      cateringMenu,
      otherItems,
      totalShown: todaysMenu.length + cateringMenu.length + otherItems.length,
    };
  }, [foods, normalizedQuery]);

  const renderGrid = (items: Food[], label: string) => {
    if (!items.length) {
      return <EmptyState label={label} />;
    }

    return (
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((food) => (
          <FoodCard key={food.id} food={food} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-lg">
          <label htmlFor="menu-search" className="mb-2 block text-sm font-semibold text-slate-700">
            Search Menu
          </label>
          <input
            id="menu-search"
            aria-label="Search menu"
            placeholder="Search menu (for example: mofongo, tacos, empanadas)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm outline-none transition focus:ring-2 focus:ring-blue-200"
          />
          <div className="mt-2 h-1 w-36 rounded-full bg-gradient-to-r from-blue-800 via-white to-red-600" />
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm md:self-auto">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-800" />
          {totalShown} items shown
        </div>
      </div>

      <section className="space-y-14">
        <div>
          <SectionHeader
            title="Today's Menu"
            subtitle="Available now while supplies last."
          />
          {renderGrid(todaysMenu, "Today's Menu")}
        </div>

        <div>
          <SectionHeader
            title="Available for Catering"
            subtitle="Great for parties, events, and office lunches."
          />
          {renderGrid(cateringMenu, "Available for Catering")}
        </div>

        <div>
          <SectionHeader
            title="Other Items"
            subtitle="Not on today's truck menu and not listed for catering."
          />
          {renderGrid(otherItems, "Other Items")}
        </div>
      </section>
    </>
  );
}
