# Calm Courage

A parent-guided mobile app that helps children build emotional awareness and courage through daily check-ins, games, quests, and guided activities.

Built with **Expo (SDK 57)**, **React Native**, and **Firebase** (Auth, Firestore, Storage, Cloud Functions).

## Features

- COPPA-aware age gate and parent/guardian consent flows
- Parent accounts (email/password) with PIN-protected parent mode
- Child profiles, rewards (stars / gems / badges), and progress tracking
- Daily emotion check-in and encouragement prompts
- V1 activities: Choose Your Courage, Emotion Puzzle Match, Roleplay, Confidence Quests, Quest Board, Digital Workbook
- Soft-launch subscription entitlement via Cloud Functions (real App Store / Play Billing still pending)

## Prerequisites

- Node.js 20+
- npm
- [Expo Go](https://expo.dev/go) on a physical device, **or** Android Studio emulator / Xcode Simulator
- A Firebase project with Email/Password auth enabled (team members: ask for `.env` values)

> Prefer a **physical device** or an **EAS preview build** for QA. Some card assets are very large and can crash Expo Go on low-RAM emulators.

## Setup

1. Clone and install:

   ```bash
   git clone https://github.com/ductranphan/calm-courage.git
   cd calm-courage
   git checkout duc
   npm install
   npm run functions:install
   ```

2. Create your env file:

   ```bash
   cp .env.example .env
   ```

   Fill in the Firebase web config and related keys from Firebase Console → Project settings → Your apps → Web app. Never commit `.env`.

3. Start the app:

   ```bash
   npx expo start
   ```

   Or clear the Metro cache after dependency / env changes:

   ```bash
   npx expo start --clear
   ```

## Opening the app

After Metro starts, use any of these:

| Option | How |
|--------|-----|
| **Expo Go (phone)** | Scan the QR code with Expo Go (Android) or Camera (iOS) |
| **Android emulator** | Press `a` in the terminal |
| **iOS simulator** (macOS) | Press `i` in the terminal |
| **Web** | Press `w` (limited; not the primary target) |

Useful scripts:

```bash
npm start                 # expo start
npm run android           # expo run:android
npm run ios               # expo run:ios
npm run lint              # ESLint
```

## Project structure

```text
src/app/          Expo Router screens (file-based routes)
src/components/   Shared UI and providers
src/services/     Firebase / business logic
src/constants/    Activities, consent copy, etc.
src/utils/        Helpers (age gate, premium access, assets)
assets/           Images, fonts, game art
functions/        Cloud Functions (subscriptions)
```

## Backend (optional for local UI work)

Firestore rules, Storage rules, and Cloud Functions live in this repo and are deployed to Firebase project `calm-courage-co`.

```bash
npm run firebase:deploy
```

Only needed when rules or Functions change — not for everyday UI work.

## More docs

| Doc | Purpose |
|-----|---------|
| [HANDOVER.md](./HANDOVER.md) | Full status, outstanding work, and handoff notes |
| [PRODUCTION.md](./PRODUCTION.md) | Production / store deploy checklist and smoke tests |
| [.env.example](./.env.example) | Required environment variable names |

## Tech stack

- Expo Router, React Native, TypeScript
- Firebase Auth, Firestore, Storage, Callable Cloud Functions
- EAS Build profiles in `eas.json` (`development`, `preview`, `production`)

App IDs: `com.calmcourage.app` · URL scheme: `calm-courage`
