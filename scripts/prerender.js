import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");

const ROUTES_TO_PRERENDER = [
  "/",
  "/features",
  "/pricing",
  "/solutions/courses-bootcamps",
  "/solutions/ngos",
  "/solutions/professional-bodies",
  "/solutions/corporate-training",
  "/solutions/schools-universities",
  "/blog",
  "/blog/how-to-verify-a-certificate-online",
  "/blog/how-to-add-certificate-to-linkedin",
  "/contact",
  "/legal",
];

async function prerender() {
  console.log("🚀 Starting Static Pre-Rendering (SSG) for Marketing Routes...");

  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("❌ Error: dist/index.html does not exist. Run 'vite build' first.");
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(templatePath, "utf-8");

  // 1. Prepare clean template: remove any existing root content & dynamic tags
  let cleanTemplate = baseTemplate.replace(/<div id="root">[\s\S]*?<\/div>/i, '<div id="root"></div>');

  // Remove existing title, meta (description, keywords, robots, og, twitter), canonical, and JSON-LD scripts
  cleanTemplate = cleanTemplate
    .replace(/<title[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+[^>]*?(?:name|property)=["'](description|keywords|robots|og:[^"']+|twitter:[^"'])["'][^>]*\/?>/gis, '')
    .replace(/<link\s+[^>]*?rel=["']canonical["'][^>]*\/?>/gis, '')
    .replace(/<script\s+[^>]*?type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gis, '');

  // Create a Vite dev server in middleware mode to load the SSR module with JSX & CSS support
  const vite = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: "custom",
  });

  try {
    const { render } = await vite.ssrLoadModule("/src/entry-server.jsx");

    for (const route of ROUTES_TO_PRERENDER) {
      console.log(`  Rendering route: ${route}`);
      const { html, helmet } = render(route);

      let pageHtml = cleanTemplate;

      // Inject rendered markup into the root div
      pageHtml = pageHtml.replace('<div id="root"></div>', `<div id="root">${html}</div>`);

      // Inject route-specific Helmet metadata into head if available
      if (helmet) {
        const helmetTitle = helmet.title ? helmet.title.toString() : "";
        const helmetMeta = helmet.meta ? helmet.meta.toString() : "";
        const helmetLink = helmet.link ? helmet.link.toString() : "";
        const helmetScript = helmet.script ? helmet.script.toString() : "";

        const headTags = [helmetTitle, helmetMeta, helmetLink, helmetScript]
          .filter(Boolean)
          .join("\n    ");

        pageHtml = pageHtml.replace("</head>", `    ${headTags}\n  </head>`);
      }

      // Determine output file path
      let outPath;
      if (route === "/") {
        outPath = path.join(distDir, "index.html");
      } else {
        const routeDir = path.join(distDir, ...route.split("/").filter(Boolean));
        fs.mkdirSync(routeDir, { recursive: true });
        outPath = path.join(routeDir, "index.html");
      }

      fs.writeFileSync(outPath, pageHtml, "utf-8");
      console.log(`  ✓ Generated: ${path.relative(rootDir, outPath)}`);
    }

    console.log("🎉 Static Pre-Rendering successfully generated all marketing routes!");
  } catch (err) {
    console.error("❌ Pre-rendering failed:", err);
    process.exit(1);
  } finally {
    await vite.close();
  }
}

prerender();
