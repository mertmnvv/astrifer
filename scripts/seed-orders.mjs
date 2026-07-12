// Throwaway dev tool for manually verifying the admin order-detail page
// (app/admin/(panel)/orders/[id]/page.tsx) against real Firestore data —
// checkout never writes real orders yet (payment isn't wired up), so
// without this the `orders` collection is empty.
//
// Seed: node --env-file=.env.local scripts/seed-orders.mjs
// Clean up the docs this script created: node --env-file=.env.local scripts/seed-orders.mjs --cleanup

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const ORDER_IDS = ["seed-order-digital", "seed-order-poster", "seed-order-journal"];
const STAR_MAP_SLUG = "ornek";

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
  const batch = db.batch();
  for (const id of ORDER_IDS) {
    batch.delete(db.collection("orders").doc(id));
  }

  const starMapRef = db.collection("starMaps").doc(STAR_MAP_SLUG);
  const starMapSnapshot = await starMapRef.get();
  if (starMapSnapshot.exists && starMapSnapshot.data()?.seedMarker === true) {
    batch.delete(starMapRef);
  }

  await batch.commit();
  console.log(`Removed ${ORDER_IDS.length} seeded orders (and the seeded star map, if this script created it).`);
}

async function seed() {
  const now = Timestamp.now();

  const starMapRef = db.collection("starMaps").doc(STAR_MAP_SLUG);
  const starMapSnapshot = await starMapRef.get();
  if (!starMapSnapshot.exists) {
    await starMapRef.set({
      slug: STAR_MAP_SLUG,
      templateSlug: null,
      title: "Elif & Kaan",
      message: "Bana evet dediğin an, gökyüzü buydu.",
      eventDate: Timestamp.fromDate(new Date("2024-06-21T18:45:00.000Z")),
      timezone: "Europe/Istanbul",
      latitude: 41.0082,
      longitude: 28.9784,
      locationName: "İstanbul",
      musicUrl: null,
      photoUrls: [],
      voiceNoteUrl: null,
      palette: null,
      isPublic: true,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      seedMarker: true,
    });
    console.log(`Seeded starMaps/${STAR_MAP_SLUG} (marked seedMarker: true so --cleanup can remove it).`);
  } else {
    console.log(`starMaps/${STAR_MAP_SLUG} already exists — leaving it as-is.`);
  }

  const orders = [
    {
      id: "seed-order-digital",
      starMapSlug: STAR_MAP_SLUG,
      customerEmail: "test-digital@example.com",
      customerName: "Test Müşteri — Dijital",
      productType: "digital",
      size: null,
      frameOption: null,
      priceAmount: 299,
    },
    {
      id: "seed-order-poster",
      starMapSlug: STAR_MAP_SLUG,
      customerEmail: "test-poster@example.com",
      customerName: "Test Müşteri — Poster",
      productType: "framed_poster",
      size: "50x50",
      frameOption: "black",
      priceAmount: 1335,
    },
    {
      id: "seed-order-journal",
      starMapSlug: STAR_MAP_SLUG,
      customerEmail: "test-journal@example.com",
      customerName: "Test Müşteri — Defter",
      productType: "journal",
      size: null,
      frameOption: null,
      priceAmount: 2400,
    },
  ];

  const batch = db.batch();
  for (const order of orders) {
    const { id, ...data } = order;
    batch.set(db.collection("orders").doc(id), {
      ...data,
      currency: "TRY",
      status: "paid",
      iyzicoPaymentId: null,
      iyzicoConversationId: null,
      shippingAddress: null,
      trackingNumber: null,
      printFilePath: null,
      printFileRenderedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }
  await batch.commit();
  console.log(`Seeded ${orders.length} test orders: ${ORDER_IDS.join(", ")}`);
}

const shouldCleanup = process.argv.includes("--cleanup");
await (shouldCleanup ? cleanup() : seed());
