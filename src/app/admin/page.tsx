"use client";

export const runtime = "nodejs";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Food {
  id: string;
  name: string;
  price: number;
  description: string | null;
  isOnTruck: boolean;
  isForCatering: boolean;
  imageUrl: string | null;
}

interface FoodForm {
  name: string;
  price: string;
  description: string;
  isOnTruck: boolean;
  isForCatering: boolean;
  imageUrl: string;
}

interface SiteSettings {
  openDate: string;
  openHours: string;
  doorDashUrl: string;
}

const emptyFoodForm: FoodForm = {
  name: "",
  price: "",
  description: "",
  isOnTruck: false,
  isForCatering: false,
  imageUrl: "",
};

export default function AdminPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodForm, setFoodForm] = useState<FoodForm>(emptyFoodForm);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    openDate: "",
    openHours: "",
    doorDashUrl: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingFood, setIsSavingFood] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [foodMessage, setFoodMessage] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [query, setQuery] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchFoods = async () => {
    try {
      const res = await fetch("/api/foods");
      if (res.ok) {
        const data = await res.json();
        setFoods(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch foods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch("/api/settings/hours");
      if (!res.ok) return;

      const data = await res.json();
      setSiteSettings({
        openDate: typeof data.openDate === "string" ? data.openDate : "",
        openHours: typeof data.openHours === "string" ? data.openHours : "",
        doorDashUrl:
          typeof data.doorDashUrl === "string" ? data.doorDashUrl : "",
      });
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchFoods();
      fetchSiteSettings();
    }
  }, [status]);

  const resetFoodForm = () => {
    setFoodForm(emptyFoodForm);
    setEditingFoodId(null);
    setSelectedFileName("");
  };

  const startEditingFood = (food: Food) => {
    setEditingFoodId(food.id);
    setFoodForm({
      name: food.name,
      price: String(food.price),
      description: food.description ?? "",
      isOnTruck: food.isOnTruck,
      isForCatering: food.isForCatering,
      imageUrl: food.imageUrl ?? "",
    });
    setSelectedFileName("");
    setFoodMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    setFoodMessage("");

    const parsedPrice = Number(foodForm.price);
    if (!foodForm.name.trim()) {
      setFoodMessage("Name is required.");
      return;
    }
    if (!Number.isFinite(parsedPrice)) {
      setFoodMessage("Please enter a valid price.");
      return;
    }

    setIsSavingFood(true);

    try {
      const endpoint = editingFoodId
        ? `/api/foods/${editingFoodId}`
        : "/api/foods";
      const method = editingFoodId ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...foodForm,
          name: foodForm.name.trim(),
          price: parsedPrice,
          description: foodForm.description.trim() || null,
          imageUrl: foodForm.imageUrl.trim() || null,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setFoodMessage(payload.error || payload.message || "Failed to save item.");
        return;
      }

      setFoodMessage(editingFoodId ? "Item updated." : "Item added.");
      resetFoodForm();
      await fetchFoods();
    } catch (error) {
      console.error("Failed to save food:", error);
      setFoodMessage("Could not save item. Please try again.");
    } finally {
      setIsSavingFood(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;

    try {
      const res = await fetch(`/api/foods/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setFoodMessage("Could not delete item.");
        return;
      }
      if (editingFoodId === id) {
        resetFoodForm();
      }
      await fetchFoods();
    } catch (error) {
      console.error("Failed to delete food:", error);
      setFoodMessage("Could not delete item.");
    }
  };

  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsMessage("");

    try {
      const res = await fetch("/api/settings/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      });

      if (!res.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await res.json();
      setSiteSettings({
        openDate: data.openDate,
        openHours: data.openHours,
        doorDashUrl: data.doorDashUrl,
      });
      setSettingsMessage("Hours and DoorDash link saved.");
    } catch (error) {
      console.error("Failed to save site settings:", error);
      setSettingsMessage("Could not save settings. Please try again.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.secure_url) {
        setFoodForm((prev) => ({ ...prev, imageUrl: data.secure_url }));
        setFoodMessage("Image uploaded.");
      } else {
        setFoodMessage("Image upload failed.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setFoodMessage("Image upload failed.");
    }
  };

  const filteredFoods = foods.filter((food) =>
    `${food.name} ${food.description ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  if (status === "loading" || isLoading) {
    return <div className="p-8 text-center text-gray-600">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">
              Manage menu items, hours, and links shown on the website.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-blue-700 bg-white px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm hover:bg-blue-50 transition"
            >
              View Website
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Business Hours and DoorDash</h2>
          <p className="mt-1 text-sm text-slate-600">
            These values appear on the homepage.
          </p>

          <form onSubmit={handleSaveSiteSettings} className="mt-4 grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Open Date(s)</label>
              <input
                value={siteSettings.openDate}
                onChange={(e) =>
                  setSiteSettings((prev) => ({ ...prev, openDate: e.target.value }))
                }
                placeholder="Friday - Sunday"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Open Time(s)</label>
              <input
                value={siteSettings.openHours}
                onChange={(e) =>
                  setSiteSettings((prev) => ({ ...prev, openHours: e.target.value }))
                }
                placeholder="11:00 AM - 8:00 PM"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">DoorDash URL</label>
              <input
                type="url"
                value={siteSettings.doorDashUrl}
                onChange={(e) =>
                  setSiteSettings((prev) => ({ ...prev, doorDashUrl: e.target.value }))
                }
                placeholder="https://www.doordash.com/"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
            </div>

            <div className="md:col-span-3 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-70"
              >
                {isSavingSettings ? "Saving..." : "Save Hours"}
              </button>
              {settingsMessage && <span className="text-sm text-slate-600">{settingsMessage}</span>}
            </div>
          </form>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              {editingFoodId ? "Edit Item" : "Add New Item"}
            </h2>

            <form onSubmit={handleSaveFood} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  placeholder="Name"
                  value={foodForm.name}
                  onChange={(e) =>
                    setFoodForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Price</label>
                <input
                  placeholder="Price"
                  type="number"
                  step="0.01"
                  value={foodForm.price}
                  onChange={(e) =>
                    setFoodForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Upload Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFileName(file.name);
                      handleImageUpload(file);
                    }
                  }}
                  className="hidden"
                  aria-hidden
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 transition"
                  >
                    Choose File
                  </button>
                  <span className="text-sm text-slate-600">
                    {selectedFileName || "No file chosen"}
                  </span>
                </div>

                {foodForm.imageUrl && (
                  <div className="mt-2 relative h-20 w-32 overflow-hidden rounded">
                    <Image
                      src={foodForm.imageUrl}
                      alt="preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  placeholder="Short description"
                  value={foodForm.description}
                  onChange={(e) =>
                    setFoodForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={foodForm.isOnTruck}
                    onChange={(e) =>
                      setFoodForm((prev) => ({ ...prev, isOnTruck: e.target.checked }))
                    }
                  />
                  <span>Available on Truck</span>
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={foodForm.isForCatering}
                    onChange={(e) =>
                      setFoodForm((prev) => ({ ...prev, isForCatering: e.target.checked }))
                    }
                  />
                  <span>For Catering</span>
                </label>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isSavingFood}
                  className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-70"
                >
                  {isSavingFood
                    ? "Saving..."
                    : editingFoodId
                    ? "Update Item"
                    : "Add Item"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    resetFoodForm();
                    setFoodMessage("");
                  }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  {editingFoodId ? "Cancel Edit" : "Reset"}
                </button>
              </div>

              {foodMessage && <p className="text-sm text-slate-600">{foodMessage}</p>}
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <input
                placeholder="Search menu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-80 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              />
              <div className="text-sm text-slate-600">
                {filteredFoods.length} items
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Item</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Price</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">On Truck</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Catering</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No items found.
                      </td>
                    </tr>
                  ) : (
                    filteredFoods.map((food, idx) => (
                      <tr
                        key={food.id}
                        className={`border-t ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/70"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex min-w-[260px] items-center gap-3">
                            <div className="relative h-14 w-14 overflow-hidden rounded bg-slate-100">
                              {food.imageUrl ? (
                                <Image
                                  src={food.imageUrl}
                                  alt={food.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                  No Image
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{food.name}</div>
                              <div className="text-xs text-slate-500">
                                {food.description || "-"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center font-semibold text-rose-700">
                          ${food.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {food.isOnTruck ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {food.isForCatering ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEditingFood(food)}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(food.id)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
