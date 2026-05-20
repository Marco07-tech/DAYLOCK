# fitforge - Developer Quick Reference

## 📱 Your App is Now Mobile!

This quick reference card has everything you need to get started building, testing, and deploying your fitforge fitness app.

---

## 🚀 First Time? Start Here

```bash
# 1. Install everything
npm install

# 2. Pick your path
npm run open:ios          # 🍎 iOS (macOS only)
npm run open:android      # 🤖 Android (cross-platform)
npm run dev               # 🌐 Web preview

# 3. Click Play ▶ in Xcode or Android Studio
```

**Done!** Your app is running. 🎉

---

## 📖 Documentation Map

| Need | Read | Time |
|------|------|------|
| **Quick overview** | [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | 5 min |
| **5-min setup** | [QUICKSTART.md](./QUICKSTART.md) | 5 min |
| **How to build** | [BUILDING.md](./BUILDING.md) | 30 min |
| **App Store deploy** | [DEPLOYMENT.md](./DEPLOYMENT.md) | 45 min |
| **Full docs** | [README.md](./README.md) | 1 hour |
| **What changed** | [CHANGELOG.md](./CHANGELOG.md) | 10 min |

---

## 🛠️ Common Commands

```bash
# After editing www/index.html
npm run sync

# Open development tools
npm run open:ios
npm run open:android
npm run dev

# Clean slate
rm -rf node_modules
npm install
npm run sync
```

---

## 📁 Where to Edit

```
Edit here:              www/index.html
├─ HTML                 Lines 1-100
├─ CSS Styles          Lines 100-800
└─ JavaScript Logic    Lines 800-end
```

**Remember:** Run `npm run sync` after editing!

---

## 🔧 Project Structure at a Glance

```
fitforge/
├── www/                ← Your web app (EDIT THIS)
│   ├── index.html     
│   └── manifest.json  
├── ios/                ← Xcode project (AUTO-GENERATED)
├── android/            ← Android project (AUTO-GENERATED)
└── node_modules/       ← Dependencies (AUTO-GENERATED)
```

**Only edit `www/` folder. The rest are auto-generated.**

---

## 🎨 Customization Quick Guide

### Change App Colors

In `www/index.html`, find:
```css
:root {
  --accent: #b8ff57;      ← Primary color
  --bg: #0b0b0b;          ← Background
  --text: #f0f0f0;        ← Text color
}
```

### Change App Name

In `capacitor.config.json`:
```json
{
  "appName": "fitforge",      ← Change here
  "appId": "com.fitforge.app"
}
```

Then: `npm run sync`

### Add a Feature

1. Edit HTML in `www/index.html`
2. Add JavaScript logic
3. Run `npm run sync`
4. Test in iOS/Android

---

## ✅ Testing Checklist

**Before testing:**
- [ ] Ran `npm run sync`
- [ ] App is opened in Xcode/Android Studio
- [ ] Device/simulator is selected

**While testing:**
- [ ] All buttons work
- [ ] No console errors (check Xcode/Studio console)
- [ ] Animations are smooth
- [ ] Text is readable

**Before deploying:**
- [ ] Works on phone
- [ ] Works on tablet
- [ ] Works in portrait
- [ ] Works in landscape

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| App won't run | `npm run sync` |
| Changes don't appear | `npm run sync` again |
| Console errors | Check Xcode/Studio console |
| Build fails | `npm install && npm run sync` |
| Simulator won't start | Restart Android Studio |
| Xcode can't find files | Product → Clean Build Folder |

---

## 📊 Project Stats

```
Lines of Code: ~800 (HTML + CSS + JS)
Dependencies: 4 (Capacitor core + platforms)
Platforms: 2 (iOS + Android)
Documentation: 1,500+ lines
Setup Time: ~30 mins
Build Time: ~2-5 minutes
```

---

## 🎯 Development Workflow

```
┌─────────────────────────────────────┐
│  Edit www/index.html               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Run: npm run sync                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Run: npm run open:ios/android      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Click ▶ Play in Xcode/Studio      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  Test on device/simulator           │
└────────────┬────────────────────────┘
             │
             ▼ (Repeat!)
```

---

## 🚢 Deployment Path

```
                Development
                    ▼
              npm run sync
                    ▼
              Test on device
                    ▼
              Update version
                    ▼
         ┌──────────┴──────────┐
         ▼                     ▼
    App Store          Google Play Store
    (iOS)              (Android)
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

---

## 🔑 Key Files to Know

| File | Purpose | Edit? |
|------|---------|-------|
| `www/index.html` | App code | ✅ YES |
| `capacitor.config.json` | App config | ✅ YES (rarely) |
| `package.json` | Dependencies | ✅ YES (rarely) |
| `ios/App/App.xcworkspace` | Xcode project | ❌ NO |
| `android/app/` | Android project | ❌ NO |
| `.gitignore` | Version control | ✅ YES (optional) |

---

## 💡 Pro Tips

✅ Always run `npm run sync` after editing  
✅ Keep web/iOS/Android in sync  
✅ Test on real devices, not just simulator  
✅ Use browser DevTools: Right-click → Inspect (web only)  
✅ Check console for errors before deploying  
✅ Keep version numbers updated  
✅ Document changes in CHANGELOG.md  

---

## 🆘 Quick Help

**Can't see my changes?**
```bash
npm run sync
```

**Getting errors?**
Check console in Xcode or Android Studio

**Need more help?**
- [README.md](./README.md) - Full documentation
- [BUILDING.md](./BUILDING.md) - Build issues
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Publishing

**Still stuck?**
- [Capacitor Docs](https://capacitorjs.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)

---

## 🎓 Learning Path

**Week 1:**
- [ ] Understand project structure
- [ ] Build and run on simulator
- [ ] Make small CSS change
- [ ] Test on real device

**Week 2:**
- [ ] Modify app features
- [ ] Test on iOS and Android
- [ ] Review BUILDING.md
- [ ] Prepare for TestFlight/beta

**Week 3:**
- [ ] Polish UI/UX
- [ ] Prepare app store listings
- [ ] Create screenshots
- [ ] Review DEPLOYMENT.md

**Week 4:**
- [ ] Submit to TestFlight/beta
- [ ] Gather feedback
- [ ] Make final changes
- [ ] Submit to App Stores

---

## 🆚 Platform Differences

### iOS (Apple)
- **Requires:** macOS + Xcode
- **Device testing:** iPhone/iPad
- **Deployment:** App Store or TestFlight
- **Cost:** $99/year developer account
- **Review time:** 24-48 hours

### Android (Google)
- **Requires:** Android Studio (Windows/Mac/Linux)
- **Device testing:** Any Android phone/tablet
- **Deployment:** Google Play Store
- **Cost:** $25 one-time
- **Review time:** 2-4 hours

---

## 📞 Support Contacts

- **iOS Questions:** [Apple Developer Support](https://developer.apple.com/support/)
- **Android Questions:** [Android Developer Support](https://developer.android.com/support)
- **Capacitor Issues:** [Capacitor GitHub](https://github.com/ionic-team/capacitor/issues)

---

## Version

- **App Version:** 1.0.0
- **Capacitor Version:** 8.3.4
- **Last Updated:** May 20, 2026

---

## 📋 Bookmark These

- [Quick Start](./QUICKSTART.md) - 5 minutes to running app
- [Full README](./README.md) - Everything
- [Building Guide](./BUILDING.md) - Platform-specific
- [Deployment](./DEPLOYMENT.md) - App Store submission
- [Project Summary](./PROJECT_SUMMARY.md) - Overview

---

## 🎉 You're Ready!

Your app is set up and ready to build. Follow the [Quick Start](./QUICKSTART.md) guide and you'll be running your first native app in 5 minutes.

**Happy coding! 💪**

---

*Print this page for quick reference while developing!*
