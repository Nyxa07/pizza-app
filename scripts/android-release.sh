#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly ENV_FILE="${PROJECT_ROOT}/.env"
readonly AAB_FILE="${PROJECT_ROOT}/android/app/build/outputs/bundle/release/app-release.aab"
readonly DEV_APK_DIR="${PROJECT_ROOT}/android/app/build/outputs/apk/devRelease"

print_usage() {
  printf 'Usage: %s <signing-report|bundle|apk>\n' "$0" >&2
}

require_command() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "${command_name}" >&2
    exit 1
  fi
}

load_signing_environment() {
  # Local runs read .env; CI exports the same settings directly, so a missing
  # file is only an error when it leaves a setting unset.
  if [[ -f "${ENV_FILE}" ]]; then
    set -a
    # The local file is intentionally shell-compatible so quoted passwords are
    # passed through unchanged and never placed in command-line arguments.
    # shellcheck disable=SC1090
    source "${ENV_FILE}"
    set +a
  fi

  : "${ANDROID_RELEASE_STORE_FILE:=}"
  : "${ANDROID_RELEASE_STORE_PASSWORD:=}"
  : "${ANDROID_RELEASE_KEY_ALIAS:=}"
  : "${ANDROID_RELEASE_KEY_PASSWORD:=}"

  local missing_settings=()
  [[ -n "${ANDROID_RELEASE_STORE_FILE}" ]] ||
    missing_settings+=('ANDROID_RELEASE_STORE_FILE')
  [[ -n "${ANDROID_RELEASE_STORE_PASSWORD}" ]] ||
    missing_settings+=('ANDROID_RELEASE_STORE_PASSWORD')
  [[ -n "${ANDROID_RELEASE_KEY_ALIAS}" ]] ||
    missing_settings+=('ANDROID_RELEASE_KEY_ALIAS')
  [[ -n "${ANDROID_RELEASE_KEY_PASSWORD}" ]] ||
    missing_settings+=('ANDROID_RELEASE_KEY_PASSWORD')

  if ((${#missing_settings[@]} > 0)); then
    if [[ ! -f "${ENV_FILE}" ]]; then
      printf 'Missing .env. Copy .env.example to .env and configure Android release\n' >&2
      printf 'signing, or export the settings directly as the CI workflow does.\n' >&2
    fi
    printf 'Missing Android release signing settings:' >&2
    printf ' %s' "${missing_settings[@]}" >&2
    printf '\n' >&2
    exit 1
  fi
}

resolve_store_file() {
  if [[ "${ANDROID_RELEASE_STORE_FILE}" = /* ]]; then
    RELEASE_STORE_FILE="${ANDROID_RELEASE_STORE_FILE}"
  else
    RELEASE_STORE_FILE="${PROJECT_ROOT}/${ANDROID_RELEASE_STORE_FILE}"
  fi

  if [[ ! -f "${RELEASE_STORE_FILE}" ]]; then
    printf 'Android release keystore not found: %s\n' "${RELEASE_STORE_FILE}" >&2
    exit 1
  fi
}

print_signing_report() {
  require_command keytool
  printf 'Configured upload-key certificate:\n'
  keytool \
    -list \
    -v \
    -keystore "${RELEASE_STORE_FILE}" \
    -alias "${ANDROID_RELEASE_KEY_ALIAS}" \
    -storepass:env ANDROID_RELEASE_STORE_PASSWORD
}

build_web_and_sync() {
  require_command npm
  require_command npx

  npm run build:prod
  npx cap sync android

  export GRADLE_USER_HOME="${GRADLE_USER_HOME:-${PROJECT_ROOT}/android/.gradle}"
}

run_gradle() {
  (
    cd "${PROJECT_ROOT}/android"
    ./gradlew "$@"
  )
}

build_bundle() {
  require_command jarsigner
  require_command keytool

  build_web_and_sync
  run_gradle bundleRelease

  if [[ ! -f "${AAB_FILE}" ]]; then
    printf 'Expected Android App Bundle was not generated: %s\n' "${AAB_FILE}" >&2
    exit 1
  fi

  jarsigner -verify "${AAB_FILE}"

  printf '\nGenerated bundle signer certificate:\n'
  keytool -printcert -jarfile "${AAB_FILE}"

  printf '\nAAB ready for the Google Play internal test track:\n%s\n' "${AAB_FILE}"
}

# APKs built for minSdk 24 may carry only a v2/v3 signature, which jarsigner
# reports as unsigned. apksigner understands every scheme, so prefer it.
find_apksigner() {
  local sdk_root="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
  if [[ -z "${sdk_root}" || ! -d "${sdk_root}/build-tools" ]]; then
    return 1
  fi

  local candidate
  while IFS= read -r candidate; do
    if [[ -x "${candidate}" ]]; then
      printf '%s\n' "${candidate}"
      return 0
    fi
  done < <(find "${sdk_root}/build-tools" -mindepth 2 -maxdepth 2 -name apksigner | sort -Vr)

  return 1
}

build_dev_apk() {
  build_web_and_sync
  run_gradle assembleDevRelease

  # The Android Gradle plugin derives the file name from the build type, so
  # match on the directory rather than hard-coding it.
  local apk_files=("${DEV_APK_DIR}"/*.apk)
  if ((${#apk_files[@]} != 1)) || [[ ! -f "${apk_files[0]}" ]]; then
    printf 'Expected exactly one development APK in %s\n' "${DEV_APK_DIR}" >&2
    exit 1
  fi

  local apk_file="${apk_files[0]}"
  local apksigner_path=''
  if apksigner_path="$(find_apksigner)"; then
    printf '\nGenerated APK signer certificate:\n'
    "${apksigner_path}" verify --print-certs "${apk_file}"
  else
    printf '\nSkipping signature check: apksigner not found in the Android SDK.\n' >&2
  fi

  printf '\nDevelopment APK ready to install on a device:\n%s\n' "${apk_file}"
}

if (($# != 1)); then
  print_usage
  exit 1
fi

load_signing_environment
resolve_store_file

case "$1" in
  signing-report)
    print_signing_report
    ;;
  bundle)
    build_bundle
    ;;
  apk)
    build_dev_apk
    ;;
  *)
    print_usage
    exit 1
    ;;
esac
