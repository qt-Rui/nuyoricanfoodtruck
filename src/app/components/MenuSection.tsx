"use client";

import { useState } from "react";
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

export default function MenuSection({ foods }: { foods: Food[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredFoods = foods.filter((food) => {
    const matchesQuery = `${food.name} ${food.description ?? ""}`
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesFilter =
      filter === "All" ||
      (filter === "On Truck" && food.isOnTruck) ||
      (filter === "Catering" && food.isForCatering);

    return matchesQuery && matchesFilter;
  });

  return (
    <>
      {/* Filter and Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            aria-label="Search menu"
            placeholder="Search menu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full sm:w-96 border border-gray-200 rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-sky-200 focus:outline-none"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 shadow-sm text-gray-700 focus:ring-2 focus:ring-rose-200 focus:outline-none"
          >
            <option>All</option>
            <option>On Truck</option>
            <option>Catering</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">{filteredFoods.length} items</div>
      </div>

      {/* Menu Section */}
      <section id="menu">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredFoods.map((food) => (
            <article
              key={food.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-md hover:shadow-lg transition overflow-hidden group"
            >
              <div className="relative aspect-[4/3] bg-gray-100">
                {food.imageUrl ? (
                  <Image
                    src={food.imageUrl}
                    alt={food.name}
                    fill
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    No image
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-rose-700">
                      {food.name}
                    </h3>
                    {food.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {food.description}
                      </p>
                    )}
                  </div>
                  <div className="text-rose-600 font-bold text-lg whitespace-nowrap">
                    ${food.price.toFixed(2)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {food.isOnTruck ? (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                      Available on Truck
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                      Not on Truck
                    </span>
                  )}

                  {food.isForCatering ? (
                    <span className="inline-flex items-center px-3 py-1 bg-sky-100 text-sky-800 text-xs rounded-full font-medium">
                      Catering Available
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">
                      Not for Catering
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
