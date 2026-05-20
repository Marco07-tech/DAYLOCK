# Deployment Guide - fitforge

## Pre-Deployment Checklist

- [ ] Version updated in `package.json`
- [ ] All features tested
- [ ] No console errors
- [ ] App icons designed (192x192, 512x512)
- [ ] Splash screens created
- [ ] App description written
- [ ] Screenshots prepared
- [ ] Privacy policy URL ready
- [ ] Terms of service ready (optional)

---

## Deploy to iOS App Store

### Step 1: Prepare App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → New App
3. Fill in:
   - Platform: iOS
   - App Name: fitforge
   - Primary Language: English
   - Bundle ID: com.fitforge.app
   - SKU: (any unique ID)

### Step 2: Fill in App Information
1. Go to App Information section
2. Add description, keywords, support URL
3. Set age rating
4. Configure App Privacy

### Step 3: Create Build in Xcode

```bash
# Open iOS project
npm run open:ios
```

In Xcode:
1. Select "Generic iOS Device" target
2. Update build number: Product → Scheme → Edit Scheme → Build
3. Product → Archive
4. Click "Distribute App"
5. Choose "App Store Connect"
6. Follow signing & upload prompts

### Step 4: Submit for Review
1. Return to App Store Connect
2. Go to "App Review Information"
3. Fill contact info, demo account (if needed)
4. Accept agreements
5. Click "Submit for Review"

⏱️ **Wait time**: 24-48 hours for review

### Step 5: After Approval
- Once approved, click "Release Version"
- Choose "Manual Release" or "Automatic Release"
- App appears in App Store

---

## Deploy to Google Play Store

### Step 1: Create Google Play Account
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a developer account ($25 one-time fee)
3. Create a new app

### Step 2: Fill in App Details
1. **App name**: fitforge
2. **Short description**: Brief one-liner
3. **Full description**: Detailed features
4. **App category**: Health & Fitness
5. **Content rating**: Fill questionnaire
6. **Target audience**: Adults

### Step 3: Prepare Graphics
Required images:
- **App icon**: 512x512 PNG
- **Feature graphic**: 1024x500 PNG
- **Screenshots**: 5-8 (2-3 per device type)
  - Phone: 1080x1920px
  - Tablet: 1440x2560px

### Step 4: Create Signed Bundle

```bash
npm run open:android
```

In Android Studio:
1. Build → Generate Signed Bundle / APK
2. Select "Android App Bundle (Recommended)"
3. Create or select keystore:
   - Save keystore somewhere safe!
   - Key alias: fitforge
   - Validity: 50 years
4. Select Release variant
5. Click Finish
6. Wait for build to complete

Bundle location: `android/app/build/outputs/bundle/release/app-release.aab`

### Step 5: Upload to Google Play

1. In Google Play Console, go to "Release" → "Production"
2. Click "Edit Release"
3. Upload the signed bundle (.aab)
4. Add release notes
5. Click "Review" → "Start rollout"

⏱️ **Wait time**: 2-4 hours for review

### Step 6: Phased Rollout (Optional)

After initial review, you can:
- Start with 5-10% rollout
- Monitor for crashes
- Gradually increase to 100%
- Or go full rollout immediately

---

## Version Management

### Semantic Versioning

Use format: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes (1.0.0 → 2.0.0)
- **MINOR**: New features (1.0.0 → 1.1.0)
- **PATCH**: Bug fixes (1.0.0 → 1.0.1)

### Update Version

```json
// package.json
{
  "version": "1.0.1"
}
```

Also update in Xcode:
- General tab → Version

And Android (if needed):
- `android/app/build.gradle` → `versionCode` & `versionName`

---

## TestFlight & Beta Testing

### iOS TestFlight

1. Archive app as usual
2. Click "Distribute App" → "TestFlight internal only"
3. Add testers by email
4. Testers download TestFlight app and test
5. Collect feedback before App Store submission

### Android Internal Testing

1. Upload signed bundle to Play Console
2. Go to "Testing" → "Internal Testing"
3. Click "Create Release"
4. Upload the bundle
5. Add tester emails
6. Testers access via link from Google Play

---

## Common Deployment Issues

### iOS

**Issue: Build archive fails**
```bash
cd ios/App
rm -rf build
xcodebuild clean
cd ../..
npm run open:ios
```

**Issue: Signing certificate not valid**
- Renew certificate in Apple Developer account
- Update provisioning profile in Xcode

**Issue: App rejected by review**
- Common reasons: crashes, misleading description, policy violations
- Review Apple's guidelines
- Fix issues and resubmit

### Android

**Issue: Upload fails**
- Ensure version code is higher than previous release
- Check that bundle is properly signed
- Try uploading again after few minutes

**Issue: App crashes on device**
- Check Android Studio Logcat for errors
- Test on multiple Android versions (API 30+)
- Enable Android Device Monitor to debug

**Issue: Play Console won't accept APK**
- Use App Bundle (.aab) instead of APK
- Ensure minimum SDK is 21 or higher
- Check target SDK is current (API 33+)

---

## Monitoring Post-Launch

### iOS
- App Store Connect → Analytics
- View crashes, reviews, ratings

### Android
- Google Play Console → Analytics
- Google Play Console → Crashes & ANRs

### Actions to Take
1. **Crashes**: Fix immediately, submit hotfix
2. **Bad reviews**: Address feedback
3. **Performance**: Monitor trends
4. **Users**: Watch daily/weekly growth

---

## Release Checklist

### Before Every Release
- [ ] Increment version number
- [ ] Update CHANGELOG.md (if exists)
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Check all links work
- [ ] Verify no console errors
- [ ] Review app permissions needed
- [ ] Update screenshots if UI changed
- [ ] Write release notes

### After Submission
- [ ] Monitor for crashes
- [ ] Watch review queue
- [ ] Be ready for rejection feedback
- [ ] Plan next features

---

## App Store Guidelines to Know

### Apple App Store
- ✅ Must use App Store in-app purchases
- ✅ Must not direct users to alternative payment
- ✅ Must respect user privacy
- ❌ No "jailbreak" functionality
- ❌ No misleading information
- ❌ No excessive ads

### Google Play Store
- ✅ Similar privacy & functionality rules
- ✅ More lenient on design
- ✅ Supports multiple payment methods
- ❌ No malware or spyware
- ❌ No misleading descriptions
- ❌ Comply with local laws

---

## Performance Benchmarks

Target metrics for fitforge:
- **App size**: < 100 MB
- **Startup time**: < 2 seconds
- **Memory**: < 100 MB
- **Crash rate**: < 0.1%
- **Rating**: > 4.0 stars

Monitor via:
- **iOS**: App Store Connect Analytics
- **Android**: Google Play Console Analytics

---

## Continuous Deployment (Optional)

For automated releases:
1. Set up GitHub Actions
2. Auto-build on tagged releases
3. Upload to beta tracks automatically
4. Send notifications to team

Example workflow available upon request.

---

## Questions?

- 📖 [Apple App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- 📖 [Google Play Guidelines](https://play.google.com/about/play-developer-policy-center/)
- 🎓 [Capacitor Deployment Guide](https://capacitorjs.com/docs/deployment)
