export const runtime = "nodejs";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../auth";
import { NextResponse } from "next/server";
import {
  deriveFoodCategories,
  type FoodCategory,
  getLegacyAvailabilityFromCategories,
  getPrimaryFoodCategory,
  normalizeFoodCategories,
} from "@/lib/foodCategory";

export async function GET() {
  const foods = await prisma.food.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(foods);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }  

  const data = await req.json();

  const name = String(data?.name ?? "").trim();
  const price = Number(data?.price);
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!Number.isFinite(price)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }

  const description = data?.description ? String(data.description) : null;
  const requestedCategories = normalizeFoodCategories(data?.categories);
  const categories = requestedCategories.length
    ? requestedCategories
    : deriveFoodCategories({
        name,
        description,
        categories: data?.categories,
        isOnTruck: Boolean(data?.isOnTruck),
        isForCatering: Boolean(data?.isForCatering),
      });
  const normalizedCategories: FoodCategory[] = categories.length
    ? categories
    : ["MAIN_DISHES"];
  const category = getPrimaryFoodCategory(normalizedCategories);
  const { isOnTruck, isForCatering } = getLegacyAvailabilityFromCategories(
    normalizedCategories
  );

  const food = await prisma.food.create({
    data: {
      name,
      price,
      description,
      category,
      categories: normalizedCategories,
      isOnTruck,
      isForCatering,
      imageUrl: data?.imageUrl ? String(data.imageUrl) : null,
    },
  });
  return NextResponse.json(food);
}
