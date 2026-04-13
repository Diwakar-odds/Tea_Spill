# Android App Icon Source

Place your final launcher image in this folder with this exact filename:

- `spill-wise-logo.png`

Use a real PNG export. Do not rename `.jpg` or `.webp` to `.png`.

Then run:

- `npm run mobile:icon`
- `npm run mobile:sync`

You can run these commands from the repository root or from the `android` folder.
If your image is in another location, run with `ICON_PATH`, for example:

- `ICON_PATH="C:\\Users\\rajat\\Downloads\\my-logo.png" npm run mobile:icon`

Windows PowerShell example:

- `$env:ICON_PATH="C:\\Users\\rajat\\Downloads\\my-logo.png"; npm run mobile:icon`

Windows CMD example:

- `set ICON_PATH=C:\\Users\\rajat\\Downloads\\my-logo.png && npm run mobile:icon`

After that, rebuild your APK in Android Studio.
