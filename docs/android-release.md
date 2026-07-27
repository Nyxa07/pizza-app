# Android release

Pizza Maker targets Android 16 (API 36) through Capacitor 8. The Google Play
release artifact is a signed Android App Bundle (AAB). Device testing uses the
signed `devRelease` APK described in
[Development build for sideloading](#development-build-for-sideloading).

## Prerequisites

- Node.js 22 or newer.
- A full JDK 21 installation providing `keytool` and `jarsigner`.
- Android Studio 2025.2.1 or newer with Android SDK 36 installed.
- The existing upload-key JKS.
- A release `versionCode` greater than the highest code in every Google Play
  track.

Android 7 (API 24) is the minimum supported Android version.

## Choose the release version

Android and Google Play use two version values from
`android/app/build.gradle`:

```groovy
defaultConfig {
    versionCode 22
    versionName "2.0.3"
}
```

- `versionCode` is the internal integer used by Google Play to order releases.
  A newly uploaded AAB must use a code greater than every code already present
  in the production, open, closed and internal tracks.
- `versionName` is the version displayed to users.

Before building a new AAB:

1. Check the highest `versionCode` in every Google Play track.
2. Choose a greater, unused code. Skipping a number is harmless.
3. Update the visible project version:

   ```bash
   npm version 2.0.4 --no-git-tag-version
   ```

   This updates `package.json` and `package-lock.json`.

4. Update both Android values in `android/app/build.gradle`:

   ```groovy
   versionCode 23
   versionName "2.0.4"
   ```

The version in `package.json` is kept in sync for project consistency, but
Google Play reads the values generated from the Android Gradle configuration.
Do not edit a generated Android manifest.

Promoting the same AAB from internal testing to closed testing or production
does not require a version bump. Building and uploading a corrected AAB does:
increase `versionCode` again, even if `versionName` stays unchanged.

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

An AAB is not installed directly on a device: Google Play consumes it to
generate per-device APKs. To install a build on a phone, use
[Development build for sideloading](#development-build-for-sideloading), or
`make android-build` for the existing debug workflow.

## Development build for sideloading

The `devRelease` build type produces a signed APK meant for device testing
between developers. It is never uploaded to Google Play.

### Why a separate application ID

The app uses Play App Signing: the local JKS is the _upload_ key, and Google
replaces its signature with the app signing key before distribution. An APK
signed here therefore never matches the one installed from the Store. Installing
it over a Store build fails with `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, and
uninstalling first would discard the user's saved doughs.

`devRelease` sidesteps this by suffixing the application ID:

|                | Google Play          | `devRelease`             |
| -------------- | -------------------- | ------------------------ |
| Application ID | `com.pizzamaker.app` | `com.pizzamaker.app.dev` |
| Launcher name  | Pizza Maker          | Pizza Maker Dev          |
| Version name   | `2.0.3`              | `2.0.3-dev.<build>`      |

Both install side by side, each with its own storage. The name override lives in
`android/app/src/devRelease/res/values/strings.xml`, a build-type source set, so
the `release` build type is untouched.

### Build it locally

```bash
make android-apk-dev
```

The command reuses the release signing configuration from `.env`, builds the
Angular application, synchronizes the Capacitor project, runs
`assembleDevRelease` and verifies the signature with `apksigner`. The APK lands
in:

```text
android/app/build/outputs/apk/devRelease/
```

`versionCode` is not bumped: Android accepts reinstalling over an equal code,
and `ANDROID_DEV_BUILD_LABEL` already distinguishes builds through the version
name.

### Continuous integration

`.github/workflows/ci.yml` runs lint, unit tests and end-to-end tests on every
pull request. On a push to `main`, or on manual dispatch, it additionally builds
the APK through the same `make android-apk-dev` target and attaches it to a
GitHub prerelease tagged `dev-<run number>`. The repository is public, so the
asset downloads from a phone browser without authentication. Only the five most
recent `dev-*` releases are kept.

The workflow requires four repository secrets:

| Secret                           | Value                               |
| -------------------------------- | ----------------------------------- |
| `ANDROID_KEYSTORE_BASE64`        | `base64 -w0` of the upload keystore |
| `ANDROID_RELEASE_STORE_PASSWORD` | Same as `.env`                      |
| `ANDROID_RELEASE_KEY_ALIAS`      | Same as `.env`                      |
| `ANDROID_RELEASE_KEY_PASSWORD`   | Same as `.env`                      |

Never commit the keystore or any of these values. Note that this `docs/`
directory is the GitHub Pages source and is published publicly.

The workflow never contacts Google Play. Uploading and promoting a release stay
manual, as described below.

## Deploy through Google Play

The recommended release path is:

```text
Internal test → Closed test (beta) → Production
```

Open testing is optional when any Google Play user should be able to join the
beta. Upload and promotion remain manual.

### 1. Internal test

1. Open **Test and release → Testing → Internal testing**.
2. Create a release and upload
   `android/app/build/outputs/bundle/release/app-release.aab`.
3. Confirm that Play accepts:
   - package `com.pizzamaker.app`;
   - the upload-key signature;
   - the expected version code and name;
   - target SDK 36.
4. Publish the internal release and share its opt-in link with the internal
   testers.
5. Install the Play-generated build and perform the device smoke tests.

Use this track first because it provides the quickest validation that Google
Play accepts the real release artifact.

### 2. Closed test (beta)

1. Open **Testing → Closed testing** and create or select a track such as
   `beta`.
2. Configure testers using email lists or a Google Group.
3. Promote the tested internal release, or select its existing AAB from the app
   bundle library.
4. Publish the closed release and share the opt-in link.

Do not rebuild or bump the version merely to move the same artifact to the
closed track. A user enrolled in the internal test must leave it before joining
a closed or open test.

### 3. Production

1. Review the pre-launch report for crashes, ANRs and blocking visual
   regressions.
2. Confirm device coverage on API 24, API 35 and API 36, including an API 36
   phone and large-screen device.
3. Promote the same validated AAB to production.
4. Review the release notes, countries and rollout settings before publishing.

### Correct an uploaded build

An uploaded AAB cannot be overwritten with different content under the same
`versionCode`. If a correction is required:

1. increment `versionCode`;
2. update `versionName` when the user-visible version changes;
3. rebuild with `make android-bundle-release`;
4. upload the new AAB to the internal track and repeat validation.

## Release checklist

- [ ] The working tree contains only the intended release changes.
- [ ] `versionCode` is greater than the highest code in every Play track.
- [ ] `versionName`, `package.json` and `package-lock.json` are consistent.
- [ ] `make android-signing-report` matches the Play upload certificate.
- [ ] `make android-bundle-release` completes and verifies the signature.
- [ ] Google Play accepts the AAB on the internal track.
- [ ] Device and pre-launch validation pass.
- [ ] The tested AAB is promoted without rebuilding it.

Android release upload and production promotion are intentionally not
automated.
