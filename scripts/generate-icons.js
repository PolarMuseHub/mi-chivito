import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputIcon = 'src/assets/icon.png';
const outputDir = 'public/icons';

async function generateIcons() {
  // Ensure the output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Read the local icon file
  const iconBuffer = await fs.readFile(inputIcon);

  for (const size of sizes) {
    // Regular icon (purpose: any)
    await sharp(iconBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));

    // Maskable icon with safe zone padding (purpose: maskable)
    const maskablePadding = Math.floor(size * 0.1); // 10% padding for safe zone
    await sharp(iconBuffer)
      .resize(size - (maskablePadding * 2), size - (maskablePadding * 2))
      .extend({
        top: maskablePadding,
        bottom: maskablePadding,
        left: maskablePadding,
        right: maskablePadding,
        background: { r: 4, g: 120, b: 87, alpha: 1 } // #047857 (emerald-700)
      })
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}-maskable.png`));
  }

  // Generate favicon sizes
  await sharp(iconBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, 'favicon-16x16.png'));

  await sharp(iconBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'favicon-32x32.png'));

  await sharp(iconBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));

  console.log('✅ All icons generated successfully!');
}

generateIcons().catch(console.error);