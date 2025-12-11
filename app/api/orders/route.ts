// app/api/orders/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // TODO: 後でメール送信 or Supabase 保存に差し替える
  console.log("新しい注文:", {
    line1: body.line1,
    line2: body.line2,
    pngLength: body.pngDataUrl?.length ?? 0,
  });

  return NextResponse.json({ ok: true });
}
