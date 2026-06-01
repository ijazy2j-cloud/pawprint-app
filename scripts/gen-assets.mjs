// One-time asset generator: brand paw favicons + 1200x630 OG share image.
// Run with: node scripts/gen-assets.mjs   (uses the already-installed `sharp`)
import sharp from "sharp";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const icons = join(pub, "icons");
const appDir = join(root, "src", "app");
mkdirSync(icons, { recursive: true });

// --- PawPrint paw mark (brand amber/earth on cream) -------------------------
const pawGroup = (fill) => `
  <g fill="${fill}">
    <ellipse cx="160" cy="226" rx="40" ry="52"/>
    <ellipse cx="224" cy="184" rx="38" ry="54"/>
    <ellipse cx="288" cy="184" rx="38" ry="54"/>
    <ellipse cx="352" cy="226" rx="40" ry="52"/>
    <path d="M256 248c-60 0-108 41-108 94 0 39 31 61 66 61 23 0 31-11 42-11s19 11 42 11c35 0 66-22 66-61 0-53-48-94-108-94z"/>
  </g>`;

const bgDefs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#D97706"/>
      <stop offset="1" stop-color="#B45309"/>
    </linearGradient>
  </defs>`;

// Rounded tile — for browser tab / favicon.
const rounded = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${bgDefs}<rect width="512" height="512" rx="116" fill="url(#bg)"/>${pawGroup("#FBF6EC")}</svg>`;
// Full-bleed square — for PWA / Apple / maskable (no transparent corners).
const square = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${bgDefs}<rect width="512" height="512" fill="url(#bg)"/>${pawGroup("#FBF6EC")}</svg>`;

// Served from /public (referenced via metadata.icons). Kept out of app/ so it
// doesn't add a generated metadata route to the build.
writeFileSync(join(pub, "icon.svg"), rounded);

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();

// --- ICO (PNG-embedded, 16 + 32) --------------------------------------------
function buildIco(images) {
  const count = images.length;
  const header = Buffer.alloc(6 + count * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(count, 4);
  let offset = header.length;
  const body = [];
  images.forEach((img, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(img.size >= 256 ? 0 : img.size, e); // width
    header.writeUInt8(img.size >= 256 ? 0 : img.size, e + 1); // height
    header.writeUInt8(0, e + 2); // palette
    header.writeUInt8(0, e + 3); // reserved
    header.writeUInt16LE(1, e + 4); // planes
    header.writeUInt16LE(32, e + 6); // bpp
    header.writeUInt32LE(img.data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += img.data.length;
    body.push(img.data);
  });
  return Buffer.concat([header, ...body]);
}

const out = [
  png(square, 192).then((d) => writeFileSync(join(icons, "icon-192.png"), d)),
  png(square, 512).then((d) => writeFileSync(join(icons, "icon-512.png"), d)),
  png(square, 512).then((d) => writeFileSync(join(icons, "maskable-512.png"), d)),
  png(square, 180).then((d) => writeFileSync(join(pub, "apple-touch-icon.png"), d)),
  png(rounded, 16).then((d) => writeFileSync(join(icons, "icon-16.png"), d)),
  png(rounded, 32).then((d) => writeFileSync(join(icons, "icon-32.png"), d)),
  Promise.all([png(rounded, 16), png(rounded, 32)]).then(([d16, d32]) => {
    const ico = buildIco([{ size: 16, data: d16 }, { size: 32, data: d32 }]);
    // app/favicon.ico is the auto-served route (already part of the build).
    writeFileSync(join(appDir, "favicon.ico"), ico);
  }),
];

// --- 1200x630 Open Graph share image ----------------------------------------
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="ogbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#241712"/>
      <stop offset="0.55" stop-color="#7A3D0B"/>
      <stop offset="1" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="disc" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#D97706"/>
      <stop offset="1" stop-color="#92400E"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#ogbg)"/>
  <g transform="translate(980,470) scale(1.7)" opacity="0.06"><g transform="translate(-256,-256)">${pawGroup("#FBF6EC")}</g></g>
  <rect x="60" y="60" width="1080" height="510" rx="36" fill="none" stroke="#FBF6EC" stroke-opacity="0.16" stroke-width="2"/>
  <g transform="translate(120,205)">
    <circle cx="115" cy="115" r="130" fill="url(#disc)"/>
    <circle cx="115" cy="115" r="130" fill="none" stroke="#FBF6EC" stroke-opacity="0.35" stroke-width="3"/>
    <g transform="translate(-21,-21) scale(0.53)">${pawGroup("#FBF6EC")}</g>
  </g>
  <g transform="translate(430,168)">
    <text x="0" y="0" font-family="Segoe UI, Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="6" fill="#FCD49B">FREE • NON-COMMERCIAL • SRI LANKA</text>
    <text x="-3" y="86" font-family="Georgia, 'Times New Roman', serif" font-size="98" font-weight="700" fill="#FBF6EC">PawPrint</text>
    <text x="-3" y="180" font-family="Georgia, 'Times New Roman', serif" font-size="98" font-weight="700" fill="#F6B864">Sri Lanka</text>
    <text x="0" y="246" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#FBF6EC" fill-opacity="0.92">Report, rescue, reunite, and rehome dogs</text>
    <text x="0" y="288" font-family="Segoe UI, Arial, sans-serif" font-size="30" fill="#FBF6EC" fill-opacity="0.92">and cats across Sri Lanka.</text>
    <text x="0" y="350" font-family="Segoe UI, Arial, sans-serif" font-size="24" font-weight="700" fill="#FCD49B">pawprint-app.netlify.app</text>
  </g>
</svg>`;

out.push(sharp(Buffer.from(og)).png().toBuffer().then((d) => writeFileSync(join(pub, "og-image.png"), d)));

await Promise.all(out);
console.log("Assets generated: favicon.ico, icon.svg, icons/*.png, apple-touch-icon.png, og-image.png");
