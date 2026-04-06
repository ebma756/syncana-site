import { NextResponse } from "next/server";
import { mockInvoices } from "@/app/sis/mock-data";

export async function GET() {
  return NextResponse.json(mockInvoices);
}
