import { strict as assert } from "node:assert";
import { existsSync, readFileSync } from "node:fs";
import * as path from "node:path";

import { sanitizePlainText } from "../src/lib/security/sanitize";
import { checkRequiredEnv, securityHeaders } from "../src/lib/security/env";

const root = process.cwd();

assert.equal(sanitizePlainText('<img src=x onerror=alert(1)>Hello <b>Priest</b>'), 'Hello Priest');
assert.equal(sanitizePlainText('safe\ntext'), 'safe\ntext');

const envCheck = checkRequiredEnv({ DATABASE_URL: '', NEXTAUTH_SECRET: 'x' });
assert.equal(envCheck.ok, false);
assert(envCheck.missing.includes('DATABASE_URL'));

assert(securityHeaders.some((h) => h.key === 'X-Frame-Options' && h.value === 'DENY'));
assert(securityHeaders.some((h) => h.key === 'Content-Security-Policy' && h.value.includes("default-src 'self'")));

for (const file of [
  'public/manifest.json',
  'public/offline.html',
  'public/icons/icon-192.svg',
  'public/icons/icon-512.svg',
  'src/app/api/health/route.ts',
  'src/app/sitemap.ts',
  'src/app/robots.ts',
  'Dockerfile',
  'docker-compose.prod.yml',
  'nginx/default.conf',
  '.github/workflows/deploy.yml',
  'DEPLOY.md',
  'README.md',
]) {
  assert(existsSync(path.join(root, file)), `Missing ${file}`);
}

const manifest = JSON.parse(readFileSync(path.join(root, 'public/manifest.json'), 'utf8'));
assert.equal(manifest.name, 'PawPrint Sri Lanka');
assert.equal(manifest.theme_color, '#f59e0b');

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
assert(pkg.scripts['verify:all'].includes('verify:health'));
assert(pkg.scripts.analyze.includes('ANALYZE=true'));

console.log('Health, PWA, security, deployment verification checks passed');
