import { NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { password } = await req.json().catch(() => ({ password: "" }));

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD is not configured in Vercel Environment Variables." },
        { status: 500 }
      );
    }

    if (!process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: "ADMIN_SECRET is not configured in Vercel Environment Variables." },
        { status: 500 }
      );
    }

    if (typeof password !== "string" || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const token = await createSessionToken();
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });
    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Login server error." },
      { status: 500 }
    );
  }
}
