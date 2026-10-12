const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Regular Master SVG (512x512)
const regularSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#F97316" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.3" />
    </filter>
    <filter id="subtle" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.2" />
    </filter>
  </defs>

  <!-- Background Base with Squircle Corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Soft Ambient Glow -->
  <circle cx="160" cy="130" r="160" fill="#FFFFFF" fill-opacity="0.12" />

  <!-- Main Symbol Container with Shadow -->
  <g filter="url(#shadow)">
    <!-- Shopping Bag Handle -->
    <path
      d="M200 190 V145 C200 114 225 89 256 89 C287 89 312 114 312 145 V190"
      stroke="#FFFFFF"
      stroke-width="28"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Shopping Bag Body -->
    <rect
      x="136"
      y="180"
      width="240"
      height="224"
      rx="44"
      fill="#FFFFFF"
    />

    <!-- Subtle bag inner fold line / accent -->
    <path
      d="M136 240 Q256 264 376 240"
      stroke="#EFF6FF"
      stroke-width="8"
      fill="none"
    />

    <!-- Center Graduation Cap / Academic Monogram in Bag -->
    <!-- Cap Diamond -->
    <polygon
      points="256,236 330,270 256,304 182,270"
      fill="#2563EB"
    />

    <!-- Cap Base Arc -->
    <path
      d="M212 284 C212 316 300 316 300 284"
      fill="#1D4ED8"
    />

    <!-- Cap Tassel in Radiant Orange -->
    <path
      d="M330 270 L346 304 C348 316 340 326 332 326"
      stroke="url(#orangeGrad)"
      stroke-width="7"
      stroke-linecap="round"
      fill="none"
    />
    <circle cx="332" cy="328" r="7" fill="url(#orangeGrad)" />

    <!-- Radiant Orange Sparkle / Star at Top-Right of Bag -->
    <g transform="translate(340, 140)" filter="url(#subtle)">
      <path
        d="M28 0 C28 15 15 28 0 28 C15 28 28 41 28 56 C28 41 41 28 56 28 C41 28 28 15 28 0 Z"
        fill="url(#orangeGrad)"
      />
    </g>
  </g>
</svg>
`;

// 2. Maskable SVG (Full bleed background, 80% safe center area)
const maskableSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3B82F6" />
      <stop offset="50%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="orangeGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#F97316" />
    </linearGradient>
    <filter id="shadowMask" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Full Bleed Background without radius for Maskable -->
  <rect width="512" height="512" fill="url(#bgGradMask)" />
  <circle cx="160" cy="130" r="180" fill="#FFFFFF" fill-opacity="0.12" />

  <!-- Center Content scaled inside 72% safe zone -->
  <g transform="translate(64, 64) scale(0.75)" filter="url(#shadowMask)">
    <!-- Shopping Bag Handle -->
    <path
      d="M200 190 V145 C200 114 225 89 256 89 C287 89 312 114 312 145 V190"
      stroke="#FFFFFF"
      stroke-width="28"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Shopping Bag Body -->
    <rect
      x="136"
      y="180"
      width="240"
      height="224"
      rx="44"
      fill="#FFFFFF"
    />

    <!-- Cap Diamond -->
    <polygon
      points="256,236 330,270 256,304 182,270"
      fill="#2563EB"
    />

    <!-- Cap Base -->
    <path
      d="M212 284 C212 316 300 316 300 284"
      fill="#1D4ED8"
    />

    <!-- Cap Tassel -->
    <path
      d="M330 270 L346 304 C348 316 340 326 332 326"
      stroke="url(#orangeGradMask)"
      stroke-width="7"
      stroke-linecap="round"
      fill="none"
    />
    <circle cx="332" cy="328" r="7" fill="url(#orangeGradMask)" />

    <!-- Sparkle -->
    <g transform="translate(340, 140)">
      <path
        d="M28 0 C28 15 15 28 0 28 C15 28 28 41 28 56 C28 41 41 28 56 28 C41 28 28 15 28 0 Z"
        fill="url(#orangeGradMask)"
      />
    </g>
  </g>
</svg>
`;

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Save SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), regularSvg.trim());
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvg.trim());

  console.log('Saved icon.svg and icon-maskable.svg');

  const regularBuffer = Buffer.from(regularSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // Generate PNG files
  // 1. icon-192.png & icon-192x192.png
  await sharp(regularBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(regularBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192x192.png'));

  // 2. icon-512.png & icon-512x512.png
  await sharp(regularBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));
  await sharp(regularBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512x512.png'));

  // 3. Maskable PNGs
  await sharp(maskableBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'icon-maskable-192.png'));
  await sharp(maskableBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'icon-maskable-512.png'));

  // 4. Apple Touch Icon (180x180)
  await sharp(regularBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-icon.png'));
  await sharp(regularBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 5. Favicons 32x32 & 48x48
  await sharp(regularBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'icon-light-32x32.png'));
  await sharp(regularBuffer).resize(32, 32).png().toFile(path.join(publicDir, 'icon-dark-32x32.png'));
  await sharp(regularBuffer).resize(48, 48).png().toFile(path.join(publicDir, 'favicon.png'));

  console.log('All PWA and Apple touch icons generated successfully!');
}

run().catch(console.error);
