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
  description?: string;
  isOnTruck: boolean;
  isForCatering: boolean;
  imageUrl?: string;
}

interface SiteSettings {
  openDate: string;
  openHours: string;
  doorDashUrl: string;
}

export default function AdminPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    openDate: "",
    openHours: "",
    doorDashUrl: "",
  });
  const [newFood, setNewFood] = useState({
    name: "",
    price: "",
    description: "",
    isOnTruck: false,
    isForCatering: false,
    imageUrl: "",
  });
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [query, setQuery] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
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
        setFoods(data);
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

  const filteredFoods = foods.filter((f) =>
    `${f.name} ${f.description ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

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

  const handleAddFood = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFood,
          price: parseFloat(newFood.price),
        }),
      });
      setNewFood({
        name: "",
        price: "",
        description: "",
        isOnTruck: false,
        isForCatering: false,
        imageUrl: "",
      });
      fetchFoods();
    } catch (error) {
      console.error("Failed to add food:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetch(`/api/foods/${id}`, { method: "DELETE" });
      fetchFoods();
    } catch (error) {
      console.error("Failed to delete food:", error);
    }
  };

  /* const handleUpdate = async (food: Food) => {
    try {
      await fetch(`/api/foods/${food.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(food),
      });
      setEditingFood(null);
      fetchFoods();
    } catch (error) {
      console.error("Failed to update food:", error);
    }
  };*/

  // Upload image to Cloudinary via API route
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

      if (data.secure_url) {
        setNewFood((prev) => ({ ...prev, imageUrl: data.secure_url }));
        alert("Image uploaded successfully!");
      } else {
        alert("Failed to upload image.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error uploading image.");
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");


  if (status === "loading" || isLoading) {
    return (
      <div className="p-8 text-center text-gray-600">Loading...</div>
    );
  }

  if (!session) return null;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto relative">
      {/* Top-Centered View Website Button */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-sky-600 text-white px-6 py-2 rounded-full font-medium shadow-md hover:bg-sky-700 transition"
        >
          View Website
        </a>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 mt-12">
        <div>
          <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage menu items, pricing, and availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-700">{session.user?.email}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="mb-6 bg-white border rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold">Business Hours & DoorDash</h2>
        <p className="text-sm text-gray-500 mt-1">
          These values are shown on the website homepage.
        </p>

        <form onSubmit={handleSaveSiteSettings} className="mt-4 grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Open Date(s)</label>
            <input
              value={siteSettings.openDate}
              onChange={(e) =>
                setSiteSettings((prev) => ({ ...prev, openDate: e.target.value }))
              }
              placeholder="Friday - Sunday"
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">Open Time(s)</label>
            <input
              value={siteSettings.openHours}
              onChange={(e) =>
                setSiteSettings((prev) => ({ ...prev, openHours: e.target.value }))
              }
              placeholder="11:00 AM - 8:00 PM"
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600">DoorDash URL</label>
            <input
              type="url"
              value={siteSettings.doorDashUrl}
              onChange={(e) =>
                setSiteSettings((prev) => ({ ...prev, doorDashUrl: e.target.value }))
              }
              placeholder="https://www.doordash.com/"
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-70 cursor-pointer"
            >
              {isSavingSettings ? "Saving..." : "Save Hours"}
            </button>
            {settingsMessage && (
              <span className="text-sm text-gray-600">{settingsMessage}</span>
            )}
          </div>
        </form>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Add / Edit form */}
        <div className="lg:col-span-1 bg-white border rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">{editingFood ? "Edit Item" : "Add New Item"}</h2>
          <form onSubmit={handleAddFood} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600">Name</label>
              <input
                placeholder="Name"
                value={newFood.name}
                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Price</label>
              <input
                placeholder="Price"
                type="number"
                step="0.01"
                value={newFood.price}
                onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Upload Image</label>

              {/* hidden file input */}
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
                  className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded cursor-pointer"
                >
                  Choose File
                </button>
                <span className="text-sm text-gray-600">{selectedFileName || "No file chosen"}</span>
              </div>

              {newFood.imageUrl && (
                <div className="mt-2 relative w-32 h-20">
                  <Image
                    src={newFood.imageUrl}
                    alt="preview"
                    fill
                    className="object-cover rounded shadow-sm"
                  />
                </div>
              )}
            </div>


            <div>
              <label className="block text-sm text-gray-600">Description</label>
              <textarea
                placeholder="Short description"
                value={newFood.description}
                onChange={(e) => setNewFood({ ...newFood, description: e.target.value })}
                className="mt-1 w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFood.isOnTruck}
                  onChange={(e) => setNewFood({ ...newFood, isOnTruck: e.target.checked })}
                />
                <span>Available on Truck</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={newFood.isForCatering}
                  onChange={(e) => setNewFood({ ...newFood, isForCatering: e.target.checked })}
                />
                <span>For Catering</span>
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded hover:bg-rose-700 cursor-pointer">Add Item</button>
              <button
                type="button"
                onClick={() => {
                  setNewFood({ name: "", price: "", description: "", isOnTruck: false, isForCatering: false, imageUrl: "" });
                  setEditingFood(null);
                }}
                className="px-4 py-2 border rounded text-sm cursor-pointer"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Right: List */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <input
              placeholder="Search menu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-80 border rounded px-3 py-2"
            />
            <div className="ml-4 text-sm text-gray-600">{filteredFoods.length} items</div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">On Truck</th>
                  <th className="px-4 py-3">Catering</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFoods.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-500">No items found.</td>
                  </tr>
                ) : (
                  filteredFoods.map((food, idx) => (
                    <tr key={food.id} className={"border-t " + (idx % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                      <td className="px-4 py-3 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {food.imageUrl ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={food.imageUrl}
                                alt={food.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 14s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{food.name}</div>
                          <div className="text-xs text-gray-500">{food.description ?? "—"}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-rose-600 font-semibold">${food.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">{food.isOnTruck ? "✅" : "—"}</td>
                      <td className="px-4 py-3 text-center">{food.isForCatering ? "✅" : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setEditingFood(food)}
                            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M14 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(food.id)}
                            className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
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
        </div>
      </div>
    </div>
  );
}
