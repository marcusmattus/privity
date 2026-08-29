import { NextResponse } from "next/server";
import { ledger } from "@/lib/ledger";

export async function GET() {
  try {
    const ledgerHealth = await ledger("/health");
    return NextResponse.json({ app: "ok", ledger: ledgerHealth });
  } catch (err) {
    // Never render an unknown ledger state as healthy.
    return NextResponse.json(
      { app: "ok", ledger: "unreachable", error: String(err) },
      { status: 503 },
    );
  }
}
