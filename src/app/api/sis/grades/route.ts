import { NextResponse } from "next/server";
import { mockGrades } from "@/app/sis/mock-data";

export async function GET() {
  return NextResponse.json(mockGrades);
}
