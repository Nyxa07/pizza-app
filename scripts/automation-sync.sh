#!/usr/bin/env bash
# Clone or update the shared agent-automation workflows into ./.automation.
# The directory is a standalone clone of its own repository, ignored by this
# checkout: updating it never produces a commit here.
#   AUTOMATION_REPO  git remote to clone from (default: the Nyxa07 repository)
#   AUTOMATION_REF   branch to track (default: main)
# Usage: automation-sync.sh {clone|update}
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="$ROOT/.automation"
REPO="${AUTOMATION_REPO:-git@github.com:Nyxa07/automation-workflows.git}"
REF="${AUTOMATION_REF:-main}"

err()  { printf 'error: %s\n' "$*" >&2; }
warn() { printf 'warning: %s\n' "$*" >&2; }
info() { printf '%s\n' "$*"; }

is_clone() { [[ -d "$TARGET/.git" ]]; }

# A pre-existing non-clone directory (typically the hand-copied workflows this
# script replaces) is never deleted implicitly: the caller decides its fate.
assert_target_is_clone_or_absent() {
  if [[ -e "$TARGET" ]] && ! is_clone; then
    err "'$TARGET' exists but is not a git clone."
    err "move or remove it first, then re-run: rm -rf '$TARGET'"
    exit 1
  fi
}

warn_on_unexpected_remote() {
  local actual
  actual="$(git -C "$TARGET" remote get-url origin 2>/dev/null || true)"
  if [[ -n "$actual" && "$actual" != "$REPO" ]]; then
    warn "origin is '$actual', expected '$REPO' (set AUTOMATION_REPO to silence)."
  fi
}

assert_clean_worktree() {
  local dirty
  dirty="$(git -C "$TARGET" status --porcelain)"
  [[ -z "$dirty" ]] && return 0
  err "'$TARGET' has local changes; commit, stash or discard them first:"
  printf '%s\n' "$dirty" >&2
  exit 1
}

assert_on_ref() {
  local branch
  branch="$(git -C "$TARGET" branch --show-current)"
  [[ "$branch" == "$REF" ]] && return 0
  err "'$TARGET' is on branch '${branch:-(detached HEAD)}', expected '$REF'."
  err "switch it back, or track another branch with: AUTOMATION_REF=<branch> make automation-update"
  exit 1
}

# Reinstall only when the dependency set actually moved, so a workflows-only
# pull stays instant. `before` empty means "always install" (fresh clone).
install_dependencies_if_needed() {
  local before="${1:-}"
  if [[ -n "$before" && -d "$TARGET/node_modules" ]] &&
     git -C "$TARGET" diff --quiet "$before" HEAD -- package.json package-lock.json; then
    return 0
  fi
  info "npm ci: $TARGET..."
  ( cd "$TARGET" && npm ci 2>&1 | sed 's/^/[automation] /' )
}

print_summary() {
  local head
  head="$(git -C "$TARGET" log -1 --format='%h %ad %s' --date=short)"
  info ""
  info "automation workflows ready:"
  info "  path:   $TARGET"
  info "  branch: $REF"
  info "  head:   $head"
}

do_clone() {
  if is_clone; then
    info "skip: '$TARGET' is already a clone (use 'make automation-update' to pull)."
    warn_on_unexpected_remote
    print_summary
    return 0
  fi
  assert_target_is_clone_or_absent
  info "clone: $REPO ($REF) -> $TARGET"
  git clone --branch "$REF" "$REPO" "$TARGET"
  install_dependencies_if_needed
  print_summary
}

do_update() {
  if ! is_clone; then
    assert_target_is_clone_or_absent
    info "'$TARGET' is missing; cloning instead."
    do_clone
    return 0
  fi
  warn_on_unexpected_remote
  assert_clean_worktree
  assert_on_ref
  local before
  before="$(git -C "$TARGET" rev-parse HEAD)"
  info "pull: origin/$REF -> $TARGET"
  git -C "$TARGET" pull --ff-only origin "$REF"
  install_dependencies_if_needed "$before"
  if [[ "$before" == "$(git -C "$TARGET" rev-parse HEAD)" ]]; then
    info "already up to date."
  fi
  print_summary
}

main() {
  case "${1:-}" in
    clone)  do_clone ;;
    update) do_update ;;
    *)
      err "usage: $(basename "$0") {clone|update}"
      exit 1
      ;;
  esac
}

main "$@"
