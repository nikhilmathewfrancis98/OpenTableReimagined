# Porting Plan — web-studio → React Native

Last updated: 2025-12-14

Purpose
- Provide a prioritized, file-by-file port plan to convert the `web-studio` Next.js app (Firebase + hooks + UI + LLM tooling) into React Native equivalents.
- Include exact RN replacement paths, adaptation notes, and effort estimates (Low/Medium/High with hour ranges).

High-level priorities
1. Core Firebase services + auth flows (provider, init, sign-in, state) — needed for any screens to work.
2. Firestore realtime hooks and error plumbing (use-collection, use-doc, error-emitter, FirestorePermissionError).
3. Authentication screens (Login, Signup) — hook into auth helpers from (1).
4. Key app UI components (PostCard, BottomNav, FirebaseErrorListener, Icons) used by primary flows.
5. Utility hooks and libs (use-toast, use-mobile, lib/utils).
6. Remaining UI primitives (ui/* folder) — port lower priority controls progressively or replace with RN UI kit.

Effort estimation legend
- Low: 0.5–2 hours — small, straightforward adaptation (JS→RN props, small API changes).
- Medium: 2–6 hours — requires API differences adaptation, some layout/design work.
- High: 6–20+ hours — involves heavy UI rewrite, platform-specific setup, or server work.

File-by-file prioritized plan

Section A — Firebase & Auth (Top priority)
- web-studio/src/firebase/config.ts
  - RN replacement: `src/firebase/config.ts` (exists)
  - Notes: Move secrets to `.env`/`react-native-config`; ensure no server secrets included.
  - Effort: Low (0.5–1h) — confirm env wiring and remove hard-coded keys.

- web-studio/src/firebase/index.ts
  - RN replacement: `src/firebase/index.ts` (exists)
  - Notes: Prefer `@react-native-firebase/*`. Provide fallback to web SDK. Ensure static requires for native modules.
  - Effort: Low (1–2h) — verify initialization and exports.

- web-studio/src/firebase/provider.tsx
  - RN replacement: `src/firebase/provider.tsx` (exists)
  - Notes: Keep provider responsibility to state/services only. Centralize navigation in `App.tsx`. Ensure hooks `useFirebase`, `useUser` are available.
  - Effort: Medium (2–4h) — wire types, confirm listener cleanup and app startup behavior.

- web-studio/src/firebase/non-blocking-login.tsx
  - RN replacement: `src/firebase/non-blocking-login.ts` (exists, ported)
  - Notes: Provide both awaitable `signIn` and fire-and-forget `initiateEmailSignIn` functions.
  - Effort: Low (1–2h) — confirm API parity with RN firebase SDK.

Section B — Firestore hooks & error tooling (High priority)
- web-studio/src/firebase/firestore/use-collection.tsx
  - RN replacement: `src/firebase/firestore/use-collection.ts` (ported)
  - Notes: Use `firestore().collection(path).onSnapshot(...)`. Emit permission errors via `errorEmitter` and use `FirestorePermissionError`.
  - Effort: Medium (2–4h) — test with real data and rule-denied cases.

- web-studio/src/firebase/firestore/use-doc.tsx
  - RN replacement: `src/firebase/firestore/use-doc.ts` (ported)
  - Notes: Similar to collection; ensure snapshot.exists handling across RN SDK versions.
  - Effort: Medium (2–3h).

- web-studio/src/firebase/error-emitter.ts
  - RN replacement: `src/firebase/error-emitter.ts` (exists)
  - Notes: Keep singleton emitter. Use simple typed emitter in RN.
  - Effort: Low (0.5–1h).

- web-studio/src/firebase/errors.ts
  - RN replacement: `src/firebase/errors.ts` (exists: RN-safe simplified FirestorePermissionError)
  - Notes: Do not capture server-only auth tokens on client. Keep LLM payloads server-side.
  - Effort: Low (1h).

Section C — App screens & UX (High priority)
- web-studio/src/app/login/page.tsx -> RN `src/screens/LoginScreen.tsx` (exists)
  - Notes: Convert form to RN `TextInput`, hook into `signIn` or `initiateEmailSignIn`. Add error toast and `useUser` redirect.
  - Effort: Medium (3–6h) depending on form complexity and validation.

- web-studio/src/app/(main)/feed/page.tsx -> RN `src/screens/HomeScreen.tsx` / Feed screen
  - Notes: Use `useCollection('posts')` and `PostCard` component.
  - Effort: Medium (4–8h) to wire and style.

Section D — Core UI components (Medium→High)
- web-studio/src/components/post-card.tsx -> `src/components/post-card.tsx` (already ported)
  - Notes: Validate images & touch handlers; integrate with native share/links.
  - Effort: Medium (3–5h) to polish.

- web-studio/src/components/bottom-nav.tsx -> `src/components/bottom-nav.tsx` (RN bottom-tabs integration)
  - Notes: Implement using `@react-navigation/bottom-tabs` with appropriate icons.
  - Effort: Medium (2–4h).

- web-studio/src/components/FirebaseErrorListener.tsx -> `src/components/FirebaseErrorListener.tsx` (RN version exists)
  - Notes: Wire to `errorEmitter` and call a server endpoint to analyze permission errors (server timing). Show toast locally.
  - Effort: Low→Medium (1–3h).

- web-studio/src/components/icons.tsx -> `src/components/icons.tsx` (port icons to `react-native-svg` or `react-native-vector-icons`)
  - Effort: Low (1–2h) per major icon set.

Section E — UI primitives (Large scope)
- web-studio/src/components/ui/* (accordion, button, input, dialog, toast, etc.)
  - RN replacements: create `src/components/ui/` RN equivalents or use a UI library (React Native Paper, UI Kitten, or Tailwind RN).
  - Notes: Prioritize `button`, `input`, `toast`, `modal`, `avatar` first. Larger components like `table`, `chart`, `calendar` can be postponed or replaced with native modules.
  - Effort: High (per component 2–12h) — estimate ~80–200h to fully port entire `ui/` folder depending on fidelity.

Section F — Server pieces & LLM (Gemini) (Separate, server-side)
- web-studio/src/firebase/server-config.ts (admin) and any server LLM integration
  - RN: Keep server-side. Implement cloud functions or a small Node/Express endpoint to accept error payloads and call LLM securely.
  - Effort: Medium (4–12h) to implement server endpoint, auth, and LLM integration securely.

Risk & security notes
- Never include server LLM or admin keys in the RN client. All LLM calls must be proxied through your server with proper auth. The `FirestorePermissionError` payload is useful to send server-side for analysis.
- The web `initializeApp()` behavior (automatic hosting init) cannot be relied on in RN — ensure native files or explicit config are present.
- Gradle and native dependency issues (e.g., `jcenter()` or old transitive libs) must be resolved (we already discussed masked-view replacement).

Recommended immediate execution plan (what I'll do / can do next)
1. Produce this port plan (done).
2. Stabilize core RN Firebase: make sure `@react-native-firebase/app`, `auth`, `firestore` are installed and the `src/firebase` code is wired (I already ported hooks and helpers). Test with native files (user supplies `google-services.json`/`GoogleService-Info.plist`). — Effort: 1–2 days integration and verification.
3. Wire `LoginScreen` and `Home/Feed` to use the new hooks and ported `PostCard`. — Effort: 1–3 days.
4. Replace or implement top UI primitives (`button`, `input`, `toast`, `modal`) and port high-priority components. — Effort: 1–2 weeks depending on desired fidelity.
5. Implement server-side LLM endpoint for permission-error analysis and connect `FirebaseErrorListener` to call it. — Effort: 1–3 days.

What I can execute now (I will proceed if you confirm)
- A: Re-run TypeScript checks and fix any immediate compile errors (we did tsc earlier and found a stray file; I can delete/relocate it if you approve).
- B: Wire `LoginScreen` to the new `signIn` / `initiateEmailSignIn` functions and add basic UI and validation.
- C: Replace `@react-native-community/masked-view` with `@react-native-masked-view/masked-view` in `package.json` and update imports to unblock Gradle 9 issues.

Next step (pick one)
- Reply with which action to take next: `A` (finish cleanup & tsc), `B` (implement LoginScreen wiring), or `C` (replace masked-view in package.json and update imports). I will execute your choice and report results.

---
Document generated by assistant during porting session.
