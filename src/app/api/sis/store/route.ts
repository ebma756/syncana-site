import { NextResponse } from "next/server";
import { mockStore } from "@/app/sis/mock-data";

export async function GET() {
  return NextResponse.json(mockStore);
}
