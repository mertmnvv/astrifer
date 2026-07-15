// Throwaway dev tool for manually verifying the admin order-detail page
// (app/admin/(panel)/orders/[id]/page.tsx) against real Firestore data —
// checkout never writes real orders yet (payment isn't wired up), so
// without this the `orders` collection is empty.
//
// Seed: node --env-file=.env.local scripts/seed-orders.mjs
// Clean up the docs this script created: node --env-file=.env.local scripts/seed-orders.mjs --cleanup

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const ORDER_IDS = ["seed-order-digital", "seed-order-journal", "seed-order-bundle"];
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

  const openingDate = Timestamp.fromDate(new Date("2027-06-21T00:00:00.000Z"));
  const letterText = "Bu satırları okuduğunda aradan yıllar geçmiş olacak — o geceki gökyüzü hâlâ orada, tıpkı bizim gibi.";

  const orders = [
    {
      id: "seed-order-digital",
      starMapSlug: STAR_MAP_SLUG,
      customerEmail: "test-digital@example.com",
      customerName: "Test Müşteri — Dijital",
      productType: "digital",
      priceAmount: 299,
      totalAmount: 299,
      items: [{ productType: "digital", label: "Dijital Sayfa", price: 299, starMapSlug: STAR_MAP_SLUG }],
      printFilePaths: null,
      printPdfPath: null,
      printFileRenderedAt: null,
      letterInsertPrintPath: null,
      journalLetterText: null,
      journalLetterOpeningDate: null,
    },
    {
      id: "seed-order-journal",
      starMapSlug: STAR_MAP_SLUG,
      customerEmail: "test-journal@example.com",
      customerName: "Test Müşteri — Defter",
      productType: "journal",
      priceAmount: 2400,
      totalAmount: 2400,
      items: [
        {
          productType: "journal",
          label: "Deri Defter",
          price: 2400,
          starMapSlug: STAR_MAP_SLUG,
          journalLetterText: letterText,
          journalLetterOpeningDate: "2027-06-21",
        },
      ],
      printFilePaths: null,
      printPdfPath: null,
      printFileRenderedAt: null,
      letterInsertPrintPath: null,
      journalLetterText: letterText,
      journalLetterOpeningDate: openingDate,
    },
    {
      id: "seed-order-bundle",
      starMapSlug: STAR_MAP_SLUG,
      customerEmail: "test-bundle@example.com",
      customerName: "Test Müşteri — Paket",
      productType: "bundle",
      priceAmount: 2699,
      totalAmount: 2699,
      items: [
        { productType: "digital", label: "Dijital Sayfa", price: 299, starMapSlug: STAR_MAP_SLUG },
        {
          productType: "journal",
          label: "Deri Defter",
          price: 2400,
          starMapSlug: STAR_MAP_SLUG,
          journalLetterText: letterText,
          journalLetterOpeningDate: "2027-06-21",
        },
      ],
      printFilePaths: null,
      printPdfPath: null,
      printFileRenderedAt: null,
      letterInsertPrintPath: null,
      journalLetterText: letterText,
      journalLetterOpeningDate: openingDate,
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
      createdAt: now,
      updatedAt: now,
    });
  }
  await batch.commit();
  console.log(`Seeded ${orders.length} test orders: ${ORDER_IDS.join(", ")}`);
}

const shouldCleanup = process.argv.includes("--cleanup");
await (shouldCleanup ? cleanup() : seed());
