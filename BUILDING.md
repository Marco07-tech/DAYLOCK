# Building fitforge with Expo

## Quick Start

```bash
npm start              # Start dev server
npm run ios            # Build & run iOS
npm run android        # Build & run Android
npm run web            # Run web preview
```

## Full Development Setup

### iOS (macOS only)

**Prerequisites:**
- macOS Monterey (12.0)+
- Xcode 13.0+
- Node.js 16+
- Expo CLI: `npm install -g expo-cli`

**First build:**
```bash
npm install
npm run ios
```

This will:
1. Install dependencies
2. Start Expo Metro bundler
3. Open iOS simulator
4. Build and run the app

**Development:**
- Edit `App.js`
- Save file (Fast Refresh auto-reloads)
- See changes instantly!

**Testing on Device:**
1. Build provisioning profile
2. Run in simulator first to test
3. Then connect iPhone and run again

### Android

**Prerequisites:**
- Android Studio
- Java JDK 11+
- Android SDK (API 30+)
- Emulator or Android phone
- Node.js 16+
- Expo CLI: `npm install -g expo-cli`

**First build:**
```bash
npm install
npm run android
```

This will:
1. Install dependencies
2. Start Expo Metro bundler
3. Open Android emulator
4. Build and run the app

**Development:**
- Edit `App.js`
- Save file (Fast Refresh auto-reloads)
- See changes instantly!

**Testing on Device:**
1. Enable USB Debugging on Android phone
2. Connect phone via USB
3. Run `npm run android`
4. Select connected device

### Testing on Physical Device

1. Connect your iPhone via USB
2. Trust the computer when prompted on iPhone
3. In Xcode, select your device from the device dropdown
4. Press Run button

### Release Build (TestFlight)

1. In Xcode, change scheme to "App" (top dropdown)
2. Change build configuration to Release
3. Select "Generic iOS Device" as target
4. Go to Product → Archive
5. Click Distribute App
6. Choose "TestFlight and the App Store"
7. Follow prompts to submit to TestFlight

### Release Build (Direct IPA)

```bash
cd ios/App
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -derivedDataPath build \
  -archivePath build/App.xcarchive \
  archive

xcodebuild -exportArchive \
  -archivePath build/App.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build
```

### Common iOS Issues

**Issue: Pod install fails**
```bash
cd ios/App
rm Podfile.lock
pod install
cd ../..
```

**Issue: Code signing errors**
- In Xcode, go to Signing & Capabilities
- Select your team under Signing Certificate
- Ensure bundle ID is correct

**Issue: App crashes on launch**
- Check console output in Xcode (Cmd+Shift+C)
- Ensure www/ folder was synced with `npm run sync`

---

## Android Build Guide

### Prerequisites
- Android Studio 4.2 or later
- Java Development Kit (JDK) 11 or 17
- Android SDK (API 30+)
- Android Virtual Device (emulator) or physical device

### Setup

1. Open Android Studio project:
```bash
npm run open:android
```

2. Android Studio will auto-sync Gradle files
3. Download any required SDK components if prompted

### Development Build

1. Create or select an emulator (Tools → AVD Manager)
2. Start the emulator
3. In Android Studio, click Run button (▶)
4. Select your emulator/device
5. App will build and run

### Testing on Physical Device

1. Enable Developer Mode on Android phone:
   - Go to Settings → About phone
   - Tap Build Number 7 times
   - Go to Settings → Developer Options
   - Enable USB Debugging

2. Connect phone via USB

3. In Android Studio, select your device from device dropdown

4. Click Run button

### Release Build (Google Play)

#### Create Signed APK/Bundle

1. Go to Build → Generate Signed Bundle / APK
2. Select Android App Bundle (recommended for Play Store)
3. Click Next
4. Create new keystore or select existing one:
   ```
   Key alias: fitforge
   Password: [secure password]
   ```
5. Select Release build variant
6. Click Finish

#### Upload to Google Play

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app or select existing
3. Go to Release → Production
4. Upload the signed bundle
5. Fill in release notes and submit

### Manual Release Build

```bash
cd android
./gradlew bundleRelease
# or for APK:
./gradlew assembleRelease
cd ..
```

Output will be in:
- Bundle: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

### Common Android Issues

**Issue: Gradle sync fails**
```bash
cd android
./gradlew clean
cd ..
npm run sync
```

**Issue: Device not detected**
```bash
adb devices
# If not listed, check USB debugging is enabled
adb kill-server
adb start-server
```

**Issue: Build errors - Missing SDK**
- In Android Studio: Tools → SDK Manager
- Install required API levels (API 30+)

**Issue: App won't install on device**
```bash
adb uninstall com.fitforge.app
# Then rebuild and run
```

---

## Web/PWA Preview

For quick testing before building native:

```bash
# Open web version in browser
npm run dev
```

Visit `http://localhost:8080` (or shown port)

---

## Environment-Specific Builds

### Development Build
```bash
npm run sync
npm run open:ios  # or npm run open:android
```

### Production Build

Edit `capacitor.config.json`:
```json
{
  "server": {
    "url": "https://yourdomain.com",
    "cleartext": false
  }
}
```

Then rebuild.

---

## Size Optimization

### Reduce App Size

1. Minify JavaScript:
```bash
npm install -g terser
```

2. Optimize images (before placing in www/):
```bash
# Use tools like ImageOptim, TinyPNG, or ffmpeg
```

3. Remove unused dependencies:
```bash
npm audit
npm prune
```

### iOS Size
- Current: ~50-70 MB
- Check Xcode → Product → Analyze for unused code

### Android Size
- Current: ~40-60 MB (AAB), ~50-70 MB (APK)
- Use Android Studio Analyzer: Build → Analyze APK

---

## Deployment Checklist

### Pre-Release
- [ ] Update version in `package.json`
- [ ] Test on multiple devices
- [ ] Review app permissions
- [ ] Test all features
- [ ] Create release notes
- [ ] Update privacy policy (if needed)

### iOS Release
- [ ] Update version in Xcode
- [ ] Archive app
- [ ] Upload to TestFlight
- [ ] Test on TestFlight devices
- [ ] Submit to App Store

### Android Release
- [ ] Generate signed bundle
- [ ] Update version code in `android/app/build.gradle`
- [ ] Test on multiple Android versions
- [ ] Upload to Google Play Console
- [ ] Submit for review

---

## Testing

### Unit Testing
(Coming soon - add Jest)

### E2E Testing
(Coming soon - add Cypress)

### Manual Testing Checklist
- [ ] Dashboard loads correctly
- [ ] Tab navigation works
- [ ] Planner exercises can be added/edited
- [ ] Pedometer updates with button clicks
- [ ] Goal input updates ring
- [ ] Workout state persists
- [ ] All UI animations smooth
- [ ] No console errors

---

## Troubleshooting

### General
- Clear app cache: Settings → Apps → fitforge → Storage → Clear Cache
- Reinstall app: Uninstall and rebuild
- Check logs: `adb logcat` (Android) or Xcode console (iOS)

### Performance Issues
- Profile app: Android Studio Profiler or Xcode Instruments
- Check network requests in DevTools
- Verify large assets are optimized

### Update Issues
- If old version won't uninstall: `adb uninstall com.fitforge.app`
- Clear Android Studio cache: File → Invalidate Caches / Restart
- Restart emulator/device
