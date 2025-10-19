export const runtime = "nodejs";
import { prisma } from "../../../../lib/prisma";
import { auth } from "../../../../auth";
import { NextResponse } from "next/server";

export async function GET() {
  const foods = await prisma.food.findMany();
  return NextResponse.json(foods);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }  

  const data = await req.json();
  const food = await prisma.food.create({ data });
  return NextResponse.json(food);
}