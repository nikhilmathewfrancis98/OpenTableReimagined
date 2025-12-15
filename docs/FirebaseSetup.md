# Firebase setup for React Native (Flovour food)

This document explains how to configure Firebase for this React Native project. You can choose the native SDKs (`@react-native-firebase`) or the Web SDK (`firebase`). The native SDKs are recommended.

1) Choose approach
  - Native: `@react-native-firebase/app`, `@react-native-firebase/auth`, `@react-native-firebase/firestore`.
    - Pros: better native integration, performance, recommended for production mobile apps.
    - Cons: requires native setup (files and Gradle/Pod changes).
  - Web SDK: `firebase` JS SDK.
    - Pros: easier to start (pure JS).
    - Cons: may need polyfills and can be less robust on native platforms.

2) Add config values
  - Copy `.env.example` to `.env` at repo root and fill the values from your Firebase console.
  - Alternatively, replace values directly in `src/firebase/config.ts` (not recommended for secrets).

3) Native SDK setup (recommended)
  - Android
    1. Download `google-services.json` from Firebase Console (Project Settings → General → Your apps) and place it at `android/app/google-services.json`.
    2. Ensure `android/build.gradle` has `classpath 'com.google.gms:google-services:4.3.14'` (or later) in `buildscript` dependencies.
    3. Ensure `android/app/build.gradle` applies the plugin at the bottom: `apply plugin: 'com.google.gms.google-services'`.

  - iOS
    1. Download `GoogleService-Info.plist` and add it to the Xcode project under `ios/` (drag into Xcode project, ensure it's added to app target).
    2. Run `pod install` in `ios/` after adding packages that require CocoaPods.

  - Install native modules (if not done):

```powershell
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
# then run
npx pod-install ios
```

  - Follow the official @react-native-firebase docs for any extra steps: https://rnfirebase.io/

  9) Using `react-native-config` (recommended for production env values)
    - Install the library:

  ```powershell
  npm install react-native-config
  # then install iOS pods
  npx pod-install ios
  ```

    - `react-native-config` exposes native build-time env variables to JS and is the recommended approach for production builds.
    - After installing, add your keys to an `.env` file in the project root (see `.env.example`) and do NOT commit it.
    - For Android you may need to follow additional steps in the library docs (update Gradle plugin, sync), see: https://github.com/luggit/react-native-config
    - For iOS ensure you run `pod install` and open the workspace in Xcode. The library's README lists any extra setup required per RN version.

    - Example usage in JS/TS: `import Config from 'react-native-config'; const apiKey = Config.FIREBASE_API_KEY;`

    10) CI and ProGuard notes
      - CI: Store sensitive files (Android `google-services.json`, iOS `GoogleService-Info.plist`, signing keys, and `.env` values) as encrypted artifacts or secrets in your CI provider. Do NOT commit these files to the repo.
        - Example: in GitHub Actions store the base64-encoded `google-services.json` as a secret and write it to `android/app/google-services.json` during the workflow before the build step.
      - Android ProGuard/R8: Keep Firebase classes to avoid runtime crashes when code is minified. Example rules are added to `android/app/proguard-rules.pro` in this repo.
      - iOS: Ensure you include any required frameworks in your Podfile and run `pod install` in CI.



4) Web SDK setup (alternate)
  - Install the JS SDK: `npm install firebase`.
  - Initialize in `src/firebase/index.ts` with `initializeApp(firebaseConfig)` from `firebase/app`.
  - Note: if you use the Web SDK in RN you may need polyfills for certain Node APIs; using the native SDK is usually simpler.

5) Initialize in the app
  - If using `@react-native-firebase`, native modules are automatically available after native setup. You can import functions from `@react-native-firebase/auth` and `@react-native-firebase/firestore` directly.
  - If using Web SDK, import `initializeApp` and initialize with the exported `firebaseConfig`.

6) Firestore rules
  - Copy `web-studio/firestore.rules` into your Firebase Console or deploy using the Firebase CLI: `firebase deploy --only firestore:rules`.

7) Testing
  - Android: `npx react-native run-android`
  - iOS (macOS): `npx react-native run-ios`
  - If you hit caching or bundling issues, start Metro with `--reset-cache`.

8) Security note
  - Do not commit secrets (API keys) to the repository. Use `.env` and ensure `.gitignore` contains `.env`.

If you want, I can update `src/firebase/index.ts` with a concrete initialization example for whichever approach you prefer (native or web). Tell me which approach to demonstrate and I'll patch the init file accordingly.
