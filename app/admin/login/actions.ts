"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { verifyAdminPassword } from "@/lib/adminPassword";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  if (!verifyAdminPassword(password)) {
    redirect(`/admin/login?next=${encodeURIComponent(next)}&error=1`);
  }

  const token = await createSessionToken();
  cookies().set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}
