import { NextResponse } from "next/server";
import { mockAttendance } from "@/app/sis/mock-data";

export async function GET() {
  return NextResponse.json(mockAttendance);
}
