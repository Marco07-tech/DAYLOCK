# fitforge - Mobile Fitness App (Expo/React Native)

A powerful, native mobile fitness app built with Expo and React Native. Track workouts, plan your week, and monitor your steps with a sleek, dark theme UI.

## Features

- **Dashboard** - View daily stats (calories, active time, steps, streak)
- **Workout Planner** - Plan exercises for each day of the week with sets, reps, and weights
- **Pedometer** - Track daily steps with progress visualization
- **Offline Support** - Works without internet connection
- **Native Performance** - True native app on iOS and Android
- **Cross-Platform** - Single codebase for both platforms

## Prerequisites

### System Requirements
- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`

### For iOS Development
- macOS (Monterey or later)
- Xcode 13+ (for building)
- Apple Developer Account (for deployment)

### For Android Development
- Android Studio (for emulator/building)
- Java Development Kit (JDK) 11+
- Android SDK (API 30+)
- (Windows, Mac, or Linux supported)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install Expo CLI globally:
```bash
npm install -g expo-cli
```

## Development

### Start Development Server
```bash
npm start
```

Choose your platform:
- `i` - iOS simulator
- `a` - Android emulator  
- `w` - Web preview

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web Preview
```bash
npm run web
```
Opens at http://localhost:19006

### iOS Development

1. Open Xcode project:
```bash
npm run open:ios
```

2. In Xcode:
   - Select your development team in Signing & Capabilities
   - Select an iOS device or simulator
   - Press the Play button to build and run

3. For testing on physical device:
   - Connect your iPhone
   - Select it in Xcode
   - Build and run

### Android Development

1. Open Android Studio:
```bash
npm run open:android
```

2. In Android Studio:
   - Wait for Gradle to sync
   - Select an emulator or connected device
   - Click the Play button to build and run

3. For testing on physical device:
   - Enable Developer Mode on your Android phone
   - Connect via USB with USB debugging enabled
   - Build and run from Android Studio

## Building for Release

### iOS Release Build

1. In Xcode, change build configuration to Release
2. Select "Generic iOS Device" as target
3. Product → Archive
4. Distribute to App Store or TestFlight

Detailed guide: [Deploying to App Store](https://capacitorjs.com/docs/ios/deploying-to-app-store)

### Android Release Build

1. In Android Studio, go to Build → Generate Signed Bundle / APK
2. Select APK for Play Store or Bundle for Google Play Console
3. Sign with your keystore

Detailed guide: [Deploying to Google Play](https://capacitorjs.com/docs/android/deploying-to-google-play)

## Project Structure

```
fitforge/
├── www/                    # Web assets
│   ├── index.html         # Main app HTML
│   └── manifest.json      # PWA manifest
├── ios/                   # iOS native project
├── android/               # Android native project
├── capacitor.config.json  # Capacitor configuration
└── package.json           # Dependencies and scripts
```

## Configuration

Edit `capacitor.config.json` to customize:
- App name and ID
- Orientation preferences
- Plugin configurations
- Server URL for live reload

## Available Commands

```bash
npm run sync              # Sync web assets to native projects
npm run open:ios          # Open iOS project in Xcode
npm run open:android      # Open Android project in Android Studio
npm run build:ios         # Sync and open iOS project
npm run build:android     # Sync and open Android project
```

## Updating Native Code

When you modify the web app (in `www/`), run:
```bash
npm run sync
```

This copies updated assets to both iOS and Android projects.

## Plugins

Current plugins:
- @capacitor/core - Core framework
- @capacitor/ios - iOS platform support
- @capacitor/android - Android platform support

Additional plugins can be added:
```bash
npm install @capacitor/plugin-name
npm run sync
```

## Troubleshooting

### iOS Issues
- **Xcode build errors**: Clean build folder (Cmd+Shift+K) and rebuild
- **Pod install fails**: `cd ios/App && pod install && cd ../..`
- **Code signing**: Check Signing & Capabilities tab in Xcode

### Android Issues
- **Gradle sync fails**: Delete `.gradle` folder and resync
- **Device not detected**: Check `adb devices` and enable USB debugging
- **Emulator issues**: Try creating a new AVD in Android Studio

### General
- **Port conflicts**: Change port in `capacitor.config.json`
- **Asset loading fails**: Ensure `npm run sync` was run
- **Clear app data**: Reinstall app or clear cache in device settings

## Support & Documentation

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Capacitor iOS Guide](https://capacitorjs.com/docs/ios)
- [Capacitor Android Guide](https://capacitorjs.com/docs/android)
- [Capacitor Community Plugins](https://capacitorjs.com/docs/plugins)

## License

MIT

## Version

- **App Version**: 1.0.0
- **Package ID**: com.fitforge.app
