import fs from 'fs';
import path from 'path';
import { Resvg } from '@resvg/resvg-js';

const rootDir = process.cwd();
const symbolSvgPath = path.join(rootDir, 'src/assets/brand/folira-symbol.svg');
const publicDir = path.join(rootDir, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const svgBuffer = fs.readFileSync(symbolSvgPath);

// Copy SVG favicon
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgBuffer);
fs.writeFileSync(path.join(publicDir, 'folira-logo.svg'), svgBuffer);

function renderPng(svg: Buffer, width: number, height: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });
  const image = resvg.render();
  return image.asPng();
}

console.log('Generating PWA and favicon PNG assets...');

// Apple Touch Icon 180x180
const applePng = renderPng(svgBuffer, 180, 180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), applePng);

// PWA 192x192 & 512x512
const pwa192 = renderPng(svgBuffer, 192, 192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), pwa192);

const pwa512 = renderPng(svgBuffer, 512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), pwa512);

// Maskable PWA icons (with safe-zone padding)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#2F6B4F"/>
  <g transform="translate(64, 64) scale(0.75)">
    <rect width="512" height="512" rx="128" fill="#2F6B4F"/>
    <path d="M148 136C148 122.745 158.745 112 172 112H240V368C240 381.255 229.255 392 216 392H172C158.745 392 148 381.255 148 368V136Z" fill="#FFFDF8"/>
    <path d="M240 112H340C353.255 112 364 122.745 364 136V184C364 197.255 353.255 208 340 208H240V112Z" fill="#FFFDF8"/>
    <path d="M240 240H320C331.046 240 340 248.954 340 260V296L300 276L260 296V260C260 248.954 251.046 240 240 240Z" fill="#C89545"/>
    <path d="M364 136L316 184H364V136Z" fill="#DDEBE2" fill-opacity="0.6"/>
  </g>
</svg>
`;

const maskableBuffer = Buffer.from(maskableSvg);
const pwaMaskable192 = renderPng(maskableBuffer, 192, 192);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-192x192.png'), pwaMaskable192);

const pwaMaskable512 = renderPng(maskableBuffer, 512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);

// Open Graph 1200x630 Social Preview SVG
const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" fill="none">
  <rect width="1200" height="630" fill="#FAF8F5"/>
  <!-- Decorative background circles -->
  <circle cx="1100" cy="100" r="300" fill="#DDEBE2" fill-opacity="0.5"/>
  <circle cx="100" cy="550" r="250" fill="#F2E4CB" fill-opacity="0.4"/>
  
  <!-- Logo Symbol -->
  <g transform="translate(100, 160) scale(0.46875)">
    <rect width="512" height="512" rx="128" fill="#2F6B4F"/>
    <path d="M148 136C148 122.745 158.745 112 172 112H240V368C240 381.255 229.255 392 216 392H172C158.745 392 148 381.255 148 368V136Z" fill="#FFFDF8"/>
    <path d="M240 112H340C353.255 112 364 122.745 364 136V184C364 197.255 353.255 208 340 208H240V112Z" fill="#FFFDF8"/>
    <path d="M240 240H320C331.046 240 340 248.954 340 260V296L300 276L260 296V260C260 248.954 251.046 240 240 240Z" fill="#C89545"/>
    <path d="M364 136L316 184H364V136Z" fill="#DDEBE2" fill-opacity="0.6"/>
  </g>
  
  <!-- Text Content -->
  <text x="380" y="240" font-family="Literata, Georgia, serif" font-size="80" font-weight="700" fill="#252A27" letter-spacing="-2">Folira</text>
  <text x="380" y="310" font-family="Inter, sans-serif" font-size="36" font-weight="600" fill="#2F6B4F">Read anything. Even offline.</text>
  <text x="380" y="370" font-family="Inter, sans-serif" font-size="24" font-weight="400" fill="#6B7280">Your private personal library. Always within reach.</text>
</svg>
`;

const ogBuffer = Buffer.from(ogSvg);
fs.writeFileSync(path.join(publicDir, 'og-image.svg'), ogBuffer);
const ogPng = renderPng(ogBuffer, 1200, 630);
fs.writeFileSync(path.join(publicDir, 'og-image.png'), ogPng);

console.log('Brand asset generation complete!');
