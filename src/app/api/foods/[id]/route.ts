export const runtime = "nodejs";
import { prisma } from "../../../../../lib/prisma";
import { NextResponse } from "next/server";

// DELETE a food item
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
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
    const { id } = await context.params;
    const data = await req.json();
    const { name, price, description, isOnTruck, isForCatering, imageUrl } = data;

    const updated = await prisma.food.update({
      where: { id },
      data: { name, price, description, isOnTruck, isForCatering, imageUrl },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating food:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
