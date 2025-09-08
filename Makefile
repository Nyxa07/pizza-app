android-build:
	ionic cap sync
	ionic cap build android

ios-build:
	ionic cap sync
	ionic cap build ios

web-build:
	npm run build:prod

serve:
	npm i
	ionic serve

assets-generation:
	npx @capacitor/assets generate --android --iconBackgroundColor '#eeeeee' --iconBackgroundColorDark '#222222' --splashBackgroundColor '#eeeeee' --splashBackgroundColorDark '#111111'
