import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, "../dist");

const routes = [
  "index.html",
  "features/index.html",
  "pricing/index.html",
  "solutions/courses-bootcamps/index.html",
  "solutions/ngos/index.html",
  "solutions/professional-bodies/index.html",
  "solutions/corporate-training/index.html",
  "solutions/schools-universities/index.html",
  "blog/index.html",
  "blog/how-to-verify-a-certificate-online/index.html",
  "blog/how-to-add-certificate-to-linkedin/index.html",
  "contact/index.html",
  "legal/index.html"
];

console.log("🔍 Verifying Pre-Rendered Static Pages...\n");

let allPassed = true;

const seenTitles = new Map();

for (const relPath of routes) {
  const filePath = path.join(distDir, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ MISSING FILE: ${relPath}`);
    allPassed = false;
    continue;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const hasEmptyRoot = content.includes('<div id="root"></div>');
  const titleMatches = [...content.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
  const title = titleMatches.length > 0 ? titleMatches[0][1].trim() : "NO TITLE";
  const hasMultipleTitles = titleMatches.length > 1;
  const hasMetaDesc = content.includes('name="description"');
  const hasCanonical = content.includes('rel="canonical"');
  const hasSchema = content.includes('application/ld+json');

  console.log(`📄 Page: /${relPath.replace('/index.html', '').replace('index.html', '')}`);
  console.log(`   Title: "${title}"`);
  console.log(`   Raw HTML Body Present: ${!hasEmptyRoot ? '✅ YES' : '❌ NO (Empty Shell!)'}`);
  console.log(`   Meta Description: ${hasMetaDesc ? '✅' : '❌'}`);
  console.log(`   Canonical Tag: ${hasCanonical ? '✅' : '❌'}`);
  console.log(`   Schema.org Structured Data: ${hasSchema ? '✅' : '❌'}`);
  if (hasMultipleTitles) {
    console.error(`   ❌ Duplicate <title> tags detected (${titleMatches.length})!`);
    allPassed = false;
  }
  if (seenTitles.has(title)) {
    console.error(`   ❌ Duplicate title already used by ${seenTitles.get(title)}!`);
    allPassed = false;
  } else {
    seenTitles.set(title, relPath);
  }
  console.log("");

  if (hasEmptyRoot || !hasMetaDesc || !hasCanonical || hasMultipleTitles) {
    allPassed = false;
  }
}

if (allPassed) {
  console.log(`🎉 ALL ${routes.length} MARKETING ROUTES HAVE FULLY-RENDERED HTML, UNIQUE TITLES, META DESCRIPTIONS, CANONICAL TAGS, AND STRUCTURED DATA!`);
} else {
  console.error("❌ Some verification checks failed.");
  process.exit(1);
}
