#!/usr/bin/env bash

set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly ENV_FILE="${PROJECT_ROOT}/.env"
readonly AAB_FILE="${PROJECT_ROOT}/android/app/build/outputs/bundle/release/app-release.aab"

print_usage() {
  printf 'Usage: %s <signing-report|bundle>\n' "$0" >&2
}

require_command() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    printf 'Required command not found: %s\n' "${command_name}" >&2
    exit 1
  fi
}

load_signing_environment() {
  if [[ ! -f "${ENV_FILE}" ]]; then
    printf 'Missing .env. Copy .env.example to .env and configure Android release signing.\n' >&2
    exit 1
  fi

  set -a
  # The local file is intentionally shell-compatible so quoted passwords are
  # passed through unchanged and never placed in command-line arguments.
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a

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

build_bundle() {
  require_command npm
  require_command npx
  require_command jarsigner
  require_command keytool

  npm run build:prod
  npx cap sync android

  export GRADLE_USER_HOME="${GRADLE_USER_HOME:-${PROJECT_ROOT}/android/.gradle}"
  (
    cd "${PROJECT_ROOT}/android"
    ./gradlew bundleRelease
  )

  if [[ ! -f "${AAB_FILE}" ]]; then
    printf 'Expected Android App Bundle was not generated: %s\n' "${AAB_FILE}" >&2
    exit 1
  fi

  jarsigner -verify "${AAB_FILE}"

  printf '\nGenerated bundle signer certificate:\n'
  keytool -printcert -jarfile "${AAB_FILE}"

  printf '\nAAB ready for the Google Play internal test track:\n%s\n' "${AAB_FILE}"
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
  *)
    print_usage
    exit 1
    ;;
esac
