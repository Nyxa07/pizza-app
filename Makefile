SHELL := /usr/bin/env bash

.PHONY: android-apk-dev android-build android-bundle-release android-livereload android-signing-report assets-generation automation-clone automation-update ios-build serve web-build

android-build:
	ionic cap sync
	ionic cap build android

android-signing-report:
	./scripts/android-release.sh signing-report

android-bundle-release:
	./scripts/android-release.sh bundle

android-apk-dev:
	./scripts/android-release.sh apk

ios-build:
	ionic cap sync
	ionic cap build ios

web-build:
	npm run build:prod

serve:
	npm i
	npm run start

assets-generation:
	npx @capacitor/assets generate --android --iconBackgroundColor '#eeeeee' --iconBackgroundColorDark '#222222' --splashBackgroundColor '#eeeeee' --splashBackgroundColorDark '#111111'

android-livereload:
	ionic capacitor run android -l --external

# .automation is a standalone clone of the agent-automation workflows,
# ignored by this checkout: updating it never produces a commit here.
automation-clone:
	./scripts/automation-sync.sh clone

automation-update:
	./scripts/automation-sync.sh update
