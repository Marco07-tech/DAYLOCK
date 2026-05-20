# FORGE Fitness Icons

This folder should contain the following PWA icons:

## Required Icons

- **icon-192.png** - 192x192 pixels
  - Used as app icon on Android devices
  - Used as the apple-touch-icon for iOS home screen

- **icon-512.png** - 512x512 pixels
  - Used as the primary PWA app icon
  - Used in app listings and splash screens

## Design Recommendations

Since FORGE uses a dark theme (#0b0b0b) with lime green accent (#b8ff57):

1. Use a square format (not rounded)
2. Include the lime green accent prominently
3. Ensure high contrast on dark backgrounds
4. Create variants without transparency for splash screens

## How to Generate Icons

### Option 1: Using a design tool
- Create your icon design in Figma, Adobe XD, or Photoshop
- Export at 192x192 and 512x512 resolutions
- Ensure both PNG files have transparency

### Option 2: Using an online tool
- Visit https://www.favicon-generator.org/ or similar PWA icon generators
- Upload a design or logo
- Generate multiple sizes
- Download the 192x192 and 512x512 versions

### Option 3: Quick placeholder
- For development/testing, create simple squares with the accent color
- Use a graphics tool or online editor to generate quick placeholders

## Placement

After creating the icons, place them in this directory:
- `d:\Fitness App\icons\icon-192.png`
- `d:\Fitness App\icons\icon-512.png`

The manifest.json and index.html already reference these files.
