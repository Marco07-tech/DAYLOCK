# Quick Start - fitforge Mobile App (Expo)

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
npm install -g expo-cli
```

### 2. Start Development Server
```bash
npm start
```

You'll see a menu. Press:

#### 🍎 iOS (macOS)
```
Press: i
```
- iOS simulator will open
- App builds and runs automatically

#### 🤖 Android
```
Press: a
```
- Android emulator will open
- App builds and runs automatically

#### 🌐 Web Preview
```
Press: w
```
- Opens in browser at http://localhost:19006

### 3. Make Changes
- Edit `App.js` for layout/features
- Edit `app.json` for app configuration
- Changes auto-refresh! (Fast Refresh enabled)

### 4. No Sync Needed
- Expo handles it automatically
- Just save and see changes instantly

---

## App Structure

```
fitforge/
├── App.js                    ← Main app component (EDIT THIS)
├── app.json                  ← Expo configuration
├── babel.config.js           ← Babel settings
├── eas.json                  ← EAS build config
├── package.json              ← Dependencies & scripts
├── index.js                  ← Entry point
├── assets/                   ← Icons, splash screens
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
└── node_modules/             ← Dependencies (auto-generated)
```

---

## Common Commands

```bash
# Development
npm start              # Start dev server
npm run ios            # Open iOS simulator
npm run android        # Open Android emulator
npm run web            # Open web preview

# Building for stores
npm run build:ios      # Build for App Store
npm run build:android  # Build for Google Play
npm run build:all      # Build for both

# Submit to stores
npm run submit:ios     # Submit to App Store
npm run submit:android # Submit to Google Play
```

---

## Next Steps

1. **Modify App**: Edit `www/index.html`
2. **Sync Changes**: Run `npm run sync`
3. **Test**: Run on device/emulator
4. **Deploy**: Follow [BUILDING.md](./BUILDING.md) for release builds

---

## Features

✅ **Dashboard** - Stats, calories, active time  
✅ **Planner** - Weekly workout schedule  
✅ **Pedometer** - Step tracking with ring  
✅ **Offline** - Works without internet  
✅ **Native** - iOS & Android apps  

---

## Need Help?

- 📖 Full docs: [README.md](./README.md)
- 🏗️ Build guide: [BUILDING.md](./BUILDING.md)
- 🔗 Capacitor: [capacitorjs.com](https://capacitorjs.com)

---

## Keyboard Shortcuts (iOS/Android Studio)

### Xcode
- `Cmd + R` - Run
- `Cmd + B` - Build
- `Cmd + Shift + K` - Clean
- `Cmd + K` - Clear console

### Android Studio
- `Shift + F10` - Run
- `Ctrl + F9` - Build
- `Ctrl + F5` - Debug

---

**Happy Coding! 💪**
