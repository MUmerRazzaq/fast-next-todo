import { auth } from "@/lib/auth";
import { sign } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }

  const token = sign(
    {
      sub: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    secret,
    { expiresIn: "1h" }
  );

  return NextResponse.json({ token });
}
