import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Daraz Proxy API is Active and Running!" });
}
