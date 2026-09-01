/**
 * Seeds emotionPrompts/{id} documents into Firestore.
 *
 * Prerequisites:
 *   1. Copy .firebaserc.example → .firebaserc and set your project id
 *   2. firebase login  (or GOOGLE_APPLICATION_CREDENTIALS service account)
 *   3. npm run functions:install
 *
 * Run from repo root:
 *   npm run seed:emotion-prompts
 */

const fs = require("fs");
const path = require("path");
const Module = require("module");

const functionsNodeModules = path.join(
  __dirname,
  "..",
  "functions",
  "node_modules",
);

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolveWithFunctions(
  request,
  parent,
  isMain,
  options,
) {
  if (
    request === "firebase-admin" ||
    request.startsWith("firebase-admin/")
  ) {
    try {
      return require.resolve(request, {
        paths: [functionsNodeModules],
      });
    } catch {
      // fall through
    }
  }

  return originalResolve.call(this, request, parent, isMain, options);
};

async function main() {
  let initializeApp;
  let getFirestore;
  let cert;
  let applicationDefault;

  try {
    ({ initializeApp, cert, applicationDefault } = require(
      "firebase-admin/app",
    ));
    ({ getFirestore } = require("firebase-admin/firestore"));
  } catch {
    console.error(
      "firebase-admin not found. Run: npm run functions:install",
    );
    process.exit(1);
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

  const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (credentialPath && fs.existsSync(credentialPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(credentialPath, "utf8"),
    );
    initializeApp({
      credential: cert(serviceAccount),
      projectId: projectId || serviceAccount.project_id,
    });
  } else {
    initializeApp({
      credential: applicationDefault(),
      ...(projectId ? { projectId } : {}),
    });
  }

  const promptsPath = path.join(
    __dirname,
    "..",
    "data",
    "emotionPrompts.json",
  );
  const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf8"));
  const db = getFirestore();

  const ids = Object.keys(prompts);
  console.log(`Seeding ${ids.length} emotion prompts...`);

  for (const id of ids) {
    await db.collection("emotionPrompts").doc(id).set(prompts[id], {
      merge: true,
    });
    console.log(`  ✓ emotionPrompts/${id}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error("Seed failed:", error.message || error);
  process.exit(1);
});
