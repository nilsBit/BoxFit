const sharp = require('sharp');
const path = require('path');

const ICON_SIZE = 1024;
const ASSETS = path.join(__dirname, '..', 'assets');

async function generateIcons() {
  // Main app icon - BOX FIT text with boxing glove
  const iconSvg = `
    <svg width="${ICON_SIZE}" height="${ICON_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1c1b1b"/>
          <stop offset="100%" style="stop-color:#131313"/>
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffb3b1"/>
          <stop offset="100%" style="stop-color:#ff535b"/>
        </linearGradient>
      </defs>
      <rect width="${ICON_SIZE}" height="${ICON_SIZE}" rx="220" fill="url(#bg)"/>
      <!-- Boxing glove shape -->
      <g transform="translate(512, 340)">
        <ellipse cx="0" cy="0" rx="180" ry="160" fill="#ff535b"/>
        <ellipse cx="-60" cy="-80" rx="80" ry="60" fill="#ff535b"/>
        <ellipse cx="80" cy="-60" rx="60" ry="50" fill="#ff535b"/>
        <rect x="-40" y="120" width="80" height="100" rx="20" fill="#ffb3b1"/>
        <ellipse cx="0" cy="0" rx="180" ry="160" fill="none" stroke="#ffb3b1" stroke-width="4" opacity="0.3"/>
        <line x1="-120" y1="20" x2="120" y2="20" stroke="#d4383f" stroke-width="6" stroke-linecap="round"/>
      </g>
      <text x="512" y="700" font-family="Arial Black, sans-serif" font-size="200" font-weight="900" fill="url(#accent)" text-anchor="middle" letter-spacing="-8">BOX</text>
      <text x="512" y="900" font-family="Arial Black, sans-serif" font-size="200" font-weight="900" fill="#e5e2e1" text-anchor="middle" letter-spacing="-8">FIT</text>
    </svg>`;

  await sharp(Buffer.from(iconSvg))
    .resize(ICON_SIZE, ICON_SIZE)
    .png()
    .toFile(path.join(ASSETS, 'icon.png'));
  console.log('Created icon.png');

  // Adaptive icon foreground (transparent background, content centered in safe zone)
  const adaptiveSvg = `
    <svg width="${ICON_SIZE}" height="${ICON_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="accent2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffb3b1"/>
          <stop offset="100%" style="stop-color:#ff535b"/>
        </linearGradient>
      </defs>
      <!-- Boxing glove shape -->
      <g transform="translate(512, 320)">
        <ellipse cx="0" cy="0" rx="150" ry="130" fill="#ff535b"/>
        <ellipse cx="-50" cy="-65" rx="65" ry="48" fill="#ff535b"/>
        <ellipse cx="65" cy="-48" rx="48" ry="40" fill="#ff535b"/>
        <rect x="-32" y="100" width="64" height="80" rx="16" fill="#ffb3b1"/>
        <ellipse cx="0" cy="0" rx="150" ry="130" fill="none" stroke="#ffb3b1" stroke-width="3" opacity="0.3"/>
        <line x1="-100" y1="16" x2="100" y2="16" stroke="#d4383f" stroke-width="5" stroke-linecap="round"/>
      </g>
      <text x="512" y="660" font-family="Arial Black, sans-serif" font-size="170" font-weight="900" fill="url(#accent2)" text-anchor="middle" letter-spacing="-6">BOX</text>
      <text x="512" y="830" font-family="Arial Black, sans-serif" font-size="170" font-weight="900" fill="#e5e2e1" text-anchor="middle" letter-spacing="-6">FIT</text>
    </svg>`;

  await sharp(Buffer.from(adaptiveSvg))
    .resize(ICON_SIZE, ICON_SIZE)
    .png()
    .toFile(path.join(ASSETS, 'adaptive-icon.png'));
  console.log('Created adaptive-icon.png');

  // Splash icon (smaller logo for splash screen)
  const splashSvg = `
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="accent3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffb3b1"/>
          <stop offset="100%" style="stop-color:#ff535b"/>
        </linearGradient>
      </defs>
      <!-- Boxing glove shape -->
      <g transform="translate(200, 110)">
        <ellipse cx="0" cy="0" rx="60" ry="52" fill="#ff535b"/>
        <ellipse cx="-20" cy="-26" rx="26" ry="19" fill="#ff535b"/>
        <ellipse cx="26" cy="-19" rx="19" ry="16" fill="#ff535b"/>
        <rect x="-13" y="40" width="26" height="32" rx="6" fill="#ffb3b1"/>
        <ellipse cx="0" cy="0" rx="60" ry="52" fill="none" stroke="#ffb3b1" stroke-width="1.5" opacity="0.3"/>
        <line x1="-40" y1="6" x2="40" y2="6" stroke="#d4383f" stroke-width="2" stroke-linecap="round"/>
      </g>
      <text x="200" y="240" font-family="Arial Black, sans-serif" font-size="90" font-weight="900" fill="url(#accent3)" text-anchor="middle" letter-spacing="-3">BOX</text>
      <text x="200" y="340" font-family="Arial Black, sans-serif" font-size="90" font-weight="900" fill="#e5e2e1" text-anchor="middle" letter-spacing="-3">FIT</text>
    </svg>`;

  await sharp(Buffer.from(splashSvg))
    .resize(400, 400)
    .png()
    .toFile(path.join(ASSETS, 'splash-icon.png'));
  console.log('Created splash-icon.png');

  // Favicon (small 48x48)
  await sharp(Buffer.from(iconSvg))
    .resize(48, 48)
    .png()
    .toFile(path.join(ASSETS, 'favicon.png'));
  console.log('Created favicon.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
