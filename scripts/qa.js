const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'public');
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const issues = [];

for (const file of htmlFiles) {
  const full = path.join(root, file);
  const html = fs.readFileSync(full, 'utf8');

  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) issues.push(`${file}: duplicate id "${id}"`);
    seen.add(id);
  }

  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)) {
    const raw = match[1];
    if (!raw || /^(?:https?:|mailto:|tel:|#|\/_vercel\/)/.test(raw)) continue;
    const local = raw.split('#')[0].split('?')[0];
    if (!local) continue;
    const target = path.join(root, local);
    if (!fs.existsSync(target)) issues.push(`${file}: missing local asset/link ${raw}`);
  }
}

if (issues.length) {
  console.error('QA failed:');
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exit(1);
}

console.log(`QA passed: ${htmlFiles.length} HTML pages checked; no duplicate IDs or missing local links/assets found.`);
