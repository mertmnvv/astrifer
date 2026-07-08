import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Service-account Admin SDK client: bypasses Firestore/Storage security
 * rules entirely. Only import this from trusted server code (Server
 * Components, Route Handlers) — never from a Client Component, and never
 * hand a long-lived URL for the private `starmaps-print/` prefix back to
 * the browser. Mint short-lived signed URLs on demand instead.
 */
function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel env vars can't hold real newlines, so the PEM key is stored
      // with literal "\n" sequences that need to be unescaped here.
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export function getDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getBucket() {
  return getStorage(getAdminApp()).bucket();
}
