import { NextResponse, type NextRequest } from "next/server";
import { ownerCookieName, verifyOwnerToken } from "@/lib/starmapOwnerToken";

const COOKIE_MAX_AGE_SECONDS = 10 * 365 * 24 * 60 * 60;

/**
 * One-time claim link handed to a page's creator (see lib/starmaps.ts's
 * createStarMap). Verifying the token here sets a long-lived cookie so the
 * owner's plain /s/{slug} bookmark keeps showing their edit controls,
 * without needing to keep the token in the URL forever.
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const token = request.nextUrl.searchParams.get("token") ?? undefined;
  const next = request.nextUrl.searchParams.get("next") ?? `/s/${slug}`;

  const response = NextResponse.redirect(new URL(next, request.url));

  const isValid = await verifyOwnerToken(slug, token);
  if (isValid && token) {
    response.cookies.set(ownerCookieName(slug), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: "/",
    });
  }

  return response;
}
