SHELL := /usr/bin/env bash

.PHONY: android-build android-bundle-release android-livereload android-signing-report assets-generation ios-build serve web-build

android-build:
	ionic cap sync
	ionic cap build android

android-signing-report:
	./scripts/android-release.sh signing-report

android-bundle-release:
	./scripts/android-release.sh bundle

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
