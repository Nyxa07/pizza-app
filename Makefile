android:
	ionic cap sync
	ionic cap build android

ios:
	ionic cap sync
	ionic cap build ios

web:
	npm run build:prod

serve:
	ionic serve