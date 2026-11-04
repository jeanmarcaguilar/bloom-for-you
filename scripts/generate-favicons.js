const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="petal-grad" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FCE7F0"/>
      <stop offset="70%" stop-color="#F472B6"/>
      <stop offset="100%" stop-color="#DB2777"/>
    </radialGradient>
    <radialGradient id="center-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </radialGradient>
    <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFF5F8"/>
      <stop offset="100%" stop-color="#FFE4EC"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#9D174D" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background circle for contrast on dark and light browser tabs -->
  <circle cx="32" cy="32" r="30" fill="url(#bg-grad)" stroke="#FBCFE8" stroke-width="1.5"/>
  <!-- Petals -->
  <g transform="translate(32 32)" filter="url(#shadow)">
    <g fill="url(#petal-grad)" stroke="#BE185D" stroke-width="0.8">
      <ellipse cy="-14" rx="8" ry="13.5"/>
      <ellipse cy="-14" rx="8" ry="13.5" transform="rotate(72)"/>
      <ellipse cy="-14" rx="8" ry="13.5" transform="rotate(144)"/>
      <ellipse cy="-14" rx="8" ry="13.5" transform="rotate(216)"/>
      <ellipse cy="-14" rx="8" ry="13.5" transform="rotate(288)"/>
    </g>
    <!-- Flower Center -->
    <circle r="6.5" fill="url(#center-grad)" stroke="#CA8A04" stroke-width="0.8"/>
    <circle r="3" fill="#FEF9C3" opacity="0.8"/>
  </g>
</svg>`;

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  const appDir = path.join(__dirname, '..', 'app');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write clean SVG to public and app
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf8');
  console.log('Written icon.svg to public and app');

  const svgBuffer = Buffer.from(svgContent);

  // 2. Generate PNGs using Sharp
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 }
  ];

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // 3. Generate favicon.ico (ICO header containing 32x32 PNG)
  const png32Buffer = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  
  // ICO header: 6 bytes ICONDIR + 16 bytes ICONDIRENTRY + image data
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // image type 1 = ICO
  header.writeUInt16LE(1, 4); // number of images

  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0); // width
  entry.writeUInt8(32, 1); // height
  entry.writeUInt8(0, 2);  // color palette (0 = no palette)
  entry.writeUInt8(0, 3);  // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png32Buffer.length, 8); // image size in bytes
  entry.writeUInt32LE(22, 12); // image data offset (6 + 16 = 22)

  const icoBuffer = Buffer.concat([header, entry, png32Buffer]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico in public and app');

  // 4. Generate site.webmanifest
  const manifest = {
    name: "Bloom for You",
    short_name: "Bloom",
    description: "Send and view personalized digital flower bouquets",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF7F8",
    theme_color: "#E5658C",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  };
  fs.writeFileSync(path.join(publicDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log('Generated site.webmanifest');
}

run().catch(console.error);

