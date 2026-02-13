export const runtime = "nodejs";
import { prisma } from "../../../../../lib/prisma";
import { auth } from "../../../../../auth";
import { NextResponse } from "next/server";
import {
  deriveFoodCategories,
  type FoodCategory,
  getLegacyAvailabilityFromCategories,
  normalizeFoodCategories,
} from "@/lib/foodCategory";

// DELETE a food item
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    await prisma.food.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("Error deleting food:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

// UPDATE a food item
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const data = await req.json();
    const { name, price, description, imageUrl } = data;
    const cleanedName = String(name ?? "").trim();

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice)) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    if (!cleanedName) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const cleanedDescription = description ? String(description) : null;
    const requestedCategories = normalizeFoodCategories(data?.categories);
    const categories = requestedCategories.length
      ? requestedCategories
      : deriveFoodCategories({
        name: cleanedName,
        description: cleanedDescription,
        categories: data?.categories,
        isOnTruck: Boolean(data?.isOnTruck),
        isForCatering: Boolean(data?.isForCatering),
      });
    const normalizedCategories: FoodCategory[] = categories.length
      ? categories
      : ["MAIN_DISHES"];
    const { isOnTruck, isForCatering } = getLegacyAvailabilityFromCategories(
      normalizedCategories
    );

    const updated = await prisma.food.update({
      where: { id },
      data: {
        name: cleanedName,
        price: parsedPrice,
        description: cleanedDescription,
        categories: normalizedCategories,
        isOnTruck,
        isForCatering,
        imageUrl: imageUrl ? String(imageUrl) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating food:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
