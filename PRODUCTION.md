# Production deploy checklist (Calm Courage)

Ship for soft-launch / internal production only after the legal/privacy items below. Replace StoreKit/Play IAP before App Store review.

## 0. COPPA & privacy (required before deploy / store submission)

Insurance only helps after a lawsuit. Do these **before** deploying backend or submitting builds:

### Age gate
- [x] Neutral birth-year screen at launch (`/age-gate`) — asks “Enter your birth year,” not “Are you over 13?”
- [x] Under-13 path (`/under-13`) collects **no** names, emails, or persistent child identifiers
- [x] Adult clearance stored locally; under-13 birth years are **not** persisted

### Verifiable parental consent (VPC)
- [x] Child profile data cannot be created until Parent/Guardian Consent is recorded on the parent account
- [x] Sign-up requires Terms, Privacy Policy, and Parent/Guardian Consent (version + timestamps on `parents/{uid}`)
- [ ] Confirm legal review of consent copy in `src/constants/consent.ts` (version `CONSENT_VERSION`)

### Privacy Policy (store listings)
- [x] In-app Privacy Policy at `/privacy-policy` (also linked from age gate / under-13 / create account / settings)
- [ ] Host a public Privacy Policy page (HTTPS)
- [ ] Set `EXPO_PUBLIC_PRIVACY_POLICY_URL` in `.env` to that URL
- [ ] Paste the **same URL** into App Store Connect and Google Play Console listing fields
- [ ] Confirm the policy states: what you collect, how you use it, and how parents request deletion

Do **not** run Firebase deploy or EAS production submit until the hosted Privacy Policy URL is live and linked in store listings (for public release). Soft-launch / TestFlight internal testing may proceed with in-app policy only, but still complete the age gate + VPC checks above.

---

## 1. Firebase project

1. Copy `.firebaserc.example` → `.firebaserc` and set your real project id (repo may already have `.firebaserc` for `calm-courage`).
2. Enable **Blaze** (required for Cloud Functions).
3. Auth: Email/Password enabled. Add authorized domains for your app.
4. In Authentication → Templates → Password reset, confirm the action link can open the app via continue URL (`calm-courage://reset-password`).

## 2. Install & deploy backend

```bash
cd functions
npm install
cd ..
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes,storage,functions
# or: npm run firebase:deploy
```

Optional: copy `functions/.env.example` guidance into Firebase Console → Functions →
Environment variables. For soft-launch leave `ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT`
unset/true. Before public store release set it to `false` and implement receipt
verification in `functions/index.js`.

Optional content seed (Admin credentials required):

```bash
# After: gcloud auth application-default login
# or set GOOGLE_APPLICATION_CREDENTIALS to a service-account JSON
node scripts/seed-emotion-prompts.mjs
```

App also ships **local fallback** emotion prompts if Firestore docs are missing.

## 3. App env

Copy `.env.example` → `.env` and fill Firebase web config + support email + bundle ids + **privacy policy URL**.

`EXPO_PUBLIC_*` values are inlined at build time and `.env` is gitignored, so EAS never sees it. Cloud builds read these from the EAS environment instead. After changing `.env`:

```bash
npx eas-cli login
npx eas-cli init          # once, if extra.eas.projectId is missing from app config
npm run eas:env:sync      # pushes EXPO_PUBLIC_* to development/preview/production
```

`src/config/firebase.ts` throws on startup naming any missing variable, so a misconfigured build fails immediately instead of silently breaking every auth and Firestore call.

Critical: after rules deploy, subscription writes **must** go through Cloud Function `activateSubscription`. The app already uses `httpsCallable`.

## 4. Subscription behavior (backend)

Cloud Function `activateSubscription` grants entitlement after the client calls it:

- Soft-launch default: `ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT` is allowed unless set to `"false"`. The paywall can activate a trial without a store receipt.
- Before public App Store / Play release: implement receipt verification (`TODO(store)` in `functions/index.js`) and set `ALLOW_UNVERIFIED_SUBSCRIPTION_GRANT=false` on Functions.

Frontend note: the paywall still shows a simulated Face ID purchase sheet. That must be gated or replaced with StoreKit / Play Billing before store submission (App Store 3.1.1 / Play payments policy). Flag helper: `EXPO_PUBLIC_ENABLE_QA_PURCHASE` + `src/constants/featureFlags.ts` (`QA_PURCHASE_ENABLED`). Wire the paywall to that flag before shipping.

## 5. EAS / store build

1. `npx eas-cli login`
2. Run `npx eas-cli init` if this repo is not linked yet (writes `extra.eas.projectId` into app config). Push notifications also need this id.
3. `npm run eas:env:sync` so builds have Firebase config.
4. Confirm `ios.bundleIdentifier` / `android.package` match store listings and Firebase Auth settings.
5. Confirm store listings link to `EXPO_PUBLIC_PRIVACY_POLICY_URL`.
6. `npx eas-cli build --platform all --profile production`

## 6. Smoke test after deploy

- [ ] Cold start → age gate (birth year) before onboarding
- [ ] Under-13 birth year → blocked screen, no account forms
- [ ] Adult birth year → onboarding → sign up with all three consents
- [ ] Sign up → verify email → PIN → create child (blocked if consent missing)
- [ ] Privacy Policy opens in-app; hosted URL opens if env set
- [ ] Daily emotion → encouragement (fallback or seeded)
- [ ] Level 1 activity free; Level 2+ opens paywall
- [ ] Paywall → Cloud Function activates trial only on internal/QA builds; store builds must not fake IAP
- [ ] Forgot password email → deep link → `/reset-password` sets new password
- [ ] Contact Us creates `supportTickets` doc
- [ ] Delete child / delete account cascade

## Still after soft launch (not blockers for internal prod)

- Real Apple/Google IAP + receipt verify
- Push notification sender Cloud Function
- Social login (Google / Apple / Facebook)
- Phase 2 content + remaining challenge complete paths
- Stronger VPC methods if product expands beyond parent-mediated accounts (e.g. credit-card / ID verification)
