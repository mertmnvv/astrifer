// One-time seed: writes the 5 default templates (mirrors lib/templates.ts's
// FALLBACK_TEMPLATES) into the Firestore `templates` collection, doc id =
// slug. Run with: npm run seed:firebase
//
// Needs FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
// in the environment (e.g. `node --env-file=.env.local scripts/seed-firestore.mjs`
// on Node 20.6+, or export them yourself first).

import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

const TEMPLATES = [
  {
    slug: "dogum",
    name: "Doğum",
    category: "dogum",
    description: "Bir hayatın başladığı anın gökyüzü.",
    defaultMessage: "Sen doğduğunda gökyüzü tam olarak böyleydi.",
    sortOrder: 0,
  },
  {
    slug: "yildonumu",
    name: "Yıldönümü",
    category: "yildonumu",
    description: "Birlikte geçirdiğiniz o özel anın haritası.",
    defaultMessage: "O gece gökyüzü buydu.",
    sortOrder: 1,
  },
  {
    slug: "teklif",
    name: "Evlilik Teklifi",
    category: "teklif",
    description: "Evet dediği anın gökyüzü.",
    defaultMessage: "Bana evet dediğin an, gökyüzü buydu.",
    sortOrder: 2,
  },
  {
    slug: "mezuniyet",
    name: "Mezuniyet",
    category: "mezuniyet",
    description: "Bir başarının kutlandığı anın haritası.",
    defaultMessage: "Bu anın gökyüzü, senin başarının izi.",
    sortOrder: 3,
  },
  {
    slug: "anma",
    name: "Anma",
    category: "anma",
    description: "Anılmaya değer bir anın gökyüzü.",
    defaultMessage: "Seni sonsuza dek bu gökyüzünde taşıyoruz.",
    sortOrder: 4,
  },
];

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
const now = Timestamp.now();
const batch = db.batch();

for (const template of TEMPLATES) {
  const ref = db.collection("templates").doc(template.slug);
  batch.set(ref, { ...template, isActive: true, createdAt: now });
}

await batch.commit();
console.log(`Seeded ${TEMPLATES.length} templates into Firestore.`);
