// Throwaway dev tool: seeds one finished, publicly viewable star map so the
// new palette-driven Digital Page design can be inspected at /s/<slug>.
//
// Seed:   node --env-file=.env.local scripts/seed-example-starmap.mjs
// Remove: node --env-file=.env.local scripts/seed-example-starmap.mjs --cleanup

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const SLUG = "elif-ve-kaan-ornek";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} — set it before running this script (see .env.example).`);
  }
  return value;
}

const app = initializeApp({
  credential: cert({
    projectId: requireEnv("FIREBASE_PROJECT_ID"),
    clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

async function cleanup() {
  const ref = db.collection("starMaps").doc(SLUG);
  const entries = await ref.collection("entries").listDocuments();
  const batch = db.batch();
  for (const entry of entries) batch.delete(entry);
  batch.delete(ref);
  await batch.commit();
  console.log(`Removed starMaps/${SLUG} and its entries.`);
}

async function seed() {
  const now = Timestamp.now();
  const eventDate = new Date("2024-09-14T19:20:00.000Z");
  const ref = db.collection("starMaps").doc(SLUG);

  await ref.set({
    slug: SLUG,
    templateSlug: null,
    title: "Elif & Kaan",
    message: "Bana evet dediğin an, gökyüzü buydu.",
    eventDate: Timestamp.fromDate(eventDate),
    timezone: "Europe/Istanbul",
    latitude: 41.0082,
    longitude: 28.9784,
    locationName: "İstanbul",
    musicUrl: null,
    voiceNoteUrl: null,
    videoUrl: null,
    // Vivid, non-gravür palette so the new palette-driven accent system is visible.
    palette: "derin-mor",
    journalThemeId: null,
    isPublic: true,
    viewCount: 0,
    createdAt: now,
    updatedAt: now,
    seedMarker: true,
  });

  await ref.collection("entries").doc("initial").set({
    date: Timestamp.fromDate(eventDate),
    photoUrls: [],
    note: null,
    isInitial: true,
    createdAt: now,
  });

  await ref.collection("entries").doc("periodic-1").set({
    date: Timestamp.fromDate(new Date("2025-03-14T19:20:00.000Z")),
    photoUrls: [],
    note: "İlk yıl dönümümüze doğru güzel bir akşamdı.",
    isInitial: false,
    createdAt: now,
  });

  console.log(`Seeded starMaps/${SLUG} (palette: derin-mor).`);
  console.log(`View at: http://localhost:3000/s/${SLUG}`);
}

const shouldCleanup = process.argv.includes("--cleanup");
await (shouldCleanup ? cleanup() : seed());
