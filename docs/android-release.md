# Android release

Pizza Maker targets Android 16 (API 36) through Capacitor 8. The Google Play
release artifact is a signed Android App Bundle (AAB). Debug APKs remain the
artifact used for local installation and device testing.

## Prerequisites

- Node.js 22 or newer.
- A full JDK 21 installation providing `keytool` and `jarsigner`.
- Android Studio 2025.2.1 or newer with Android SDK 36 installed.
- The existing upload-key JKS.
- A release `versionCode` greater than the highest code in every Google Play
  track.

Android 7 (API 24) is the minimum supported Android version.

## Local signing configuration

Create the ignored local environment file:

```bash
cp .env.example .env
```

Fill all four settings:

```dotenv
ANDROID_RELEASE_STORE_FILE=android-key-store.jks
ANDROID_RELEASE_STORE_PASSWORD=
ANDROID_RELEASE_KEY_ALIAS=
ANDROID_RELEASE_KEY_PASSWORD=
```

The store path is relative to the repository root unless it is absolute.
Values follow shell assignment syntax, so quote passwords containing spaces or
shell-special characters. Never commit `.env`.

Gradle receives passwords only through environment variables. Missing values
stop release tasks and report setting names without printing their values.
Debug builds, web builds and tests do not require this file.

## Verify the upload key

```bash
make android-signing-report
```

Compare the reported SHA-256 fingerprint with **Certificate of the upload key**
in Google Play Console. It is expected to differ from **Certificate of the app
signing key** because Play App Signing applies Google's final signature.

Do not rotate or reset the upload key as part of this release. If the
fingerprint differs, first check the selected JKS and alias.

## Build the signed AAB

```bash
make android-bundle-release
```

The command:

1. builds the Angular application in production mode;
2. synchronizes the Android Capacitor project;
3. runs the Gradle `bundleRelease` task with the local upload key;
4. verifies the AAB signature with `jarsigner`;
5. prints the certificate embedded in the generated bundle.

The resulting file is:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

An AAB is not installed directly on a device. Keep using `make android-build`
for the existing local APK-oriented workflow.

## Google Play validation

1. Confirm that the configured `versionCode` is greater than every code already
   present in production, open, closed and internal tracks.
2. Upload the AAB manually to the internal test track.
3. Confirm that Play accepts `com.pizzamaker.app`, the upload-key signature,
   version code 20 and target SDK 36.
4. Review the pre-launch report for new crashes, ANRs and blocking visual
   regressions.
5. Promote manually only after device validation on API 24, API 35 and API 36,
   including an API 36 phone and large-screen device.

Android release upload and production promotion are intentionally not
automated.
