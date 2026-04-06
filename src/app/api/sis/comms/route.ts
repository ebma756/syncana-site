import { NextResponse } from "next/server";
import { mockComms } from "@/app/sis/mock-data";

export async function GET() {
  return NextResponse.json(mockComms);
}
