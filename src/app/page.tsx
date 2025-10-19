export const runtime = "nodejs";

import Image from "next/image";
import { prisma } from "../../lib/prisma";
import MenuSection from "./components/MenuSection";

export default async function Home() {
  const foods = await prisma.food.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-rose-50 via-sky-50 to-white">
      <section className="flex-grow max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="flex flex-col-reverse lg:flex-row items-center gap-10 mb-16">
          <div className="flex-1">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-rose-700 drop-shadow-sm">
              Nuyorican Food Truck
            </h1>
            <p className="mt-6 text-lg text-gray-700 max-w-2xl leading-relaxed">
              Bringing authentic Puerto Rican flavors to the streets — fresh,
              vibrant, and made with love. Explore today’s menu and see what’s
              cooking!
            </p>
          </div>

          <div className="flex-1 w-full lg:w-1/2 flex justify-center">
            <div className="rounded-3xl overflow-hidden shadow-xl bg-gradient-to-b from-rose-50 via-sky-50 to-white">
              <Image
                src="/NuyoRican Food Truck Icon.png"
                alt="Nuyorican Food Truck logo"
                width={600}
                height={400}
                className="object-contain w-full h-80 lg:h-96 bg-transparent"
                priority
              />
            </div>

          </div>
        </div>
        <MenuSection foods={foods} />
      </section>

      {/* Footer stays the same */}
      <footer className="bg-white border-t border-gray-200 py-8 text-center">
        <div className="text-gray-600 text-sm mb-4">
          © {new Date().getFullYear()} Nuyorican Food Truck — Authentic Puerto Rican Flavors
        </div>
        <a
          href="/auth/signin"
          className="inline-block border border-rose-400 text-rose-600 px-6 py-3 rounded-xl font-medium hover:bg-rose-50 transition"
        >
          Admin Login
        </a>
      </footer>
    </main>
  );
}
